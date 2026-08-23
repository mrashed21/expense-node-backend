import httpStatus from "http-status";
import mongoose from "mongoose";
import ApiError from "../../helpers/api-error";
import { Account } from "../account/account.model";
import { TransactionType } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { Borrower } from "./borrower.model";
import { LoanRepayment } from "./loan-repayment.model";
import { ILoan, LoanStatus } from "./loan.interface";
import { Loan } from "./loan.model";

export const deriveLoanStatus = (loan: any): LoanStatus => {
  if (loan.status === LoanStatus.CANCELLED) return LoanStatus.CANCELLED;
  if (loan.status === LoanStatus.WRITTEN_OFF) return LoanStatus.WRITTEN_OFF;
  if (loan.outstanding_amount <= 0) return LoanStatus.PAID;

  if (
    loan.expected_return_date &&
    new Date(loan.expected_return_date).getTime() < Date.now() &&
    loan.outstanding_amount > 0
  ) {
    return LoanStatus.OVERDUE;
  }

  if (loan.recovered_amount > 0 && loan.outstanding_amount > 0) {
    return LoanStatus.PARTIALLY_PAID;
  }

  return LoanStatus.ACTIVE;
};

export const LoanService = {
  createLoan: async (userId: string, payload: any) => {
    const {
      borrower_name,
      borrower_id,
      principal_amount,
      source_account_id,
      lent_date,
      expected_return_date,
      notes,
    } = payload;

    const sourceAccount = await Account.findOne({
      _id: source_account_id,
      user_id: userId,
      is_deleted: false,
    });

    if (!sourceAccount) {
      throw new ApiError(httpStatus.NOT_FOUND, "Source account not found.");
    }

    if (sourceAccount.current_balance < principal_amount) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Insufficient balance in ${sourceAccount.name}. Available: ${sourceAccount.current_balance}, Required: ${principal_amount}`,
      );
    }

    // Resolve or create Borrower
    let resolvedBorrowerId = borrower_id;
    if (!resolvedBorrowerId) {
      let existingBorrower = await Borrower.findOne({
        user_id: userId,
        name: { $regex: new RegExp(`^${borrower_name.trim()}$`, "i") },
        is_deleted: false,
      });

      if (!existingBorrower) {
        existingBorrower = await Borrower.create({
          user_id: userId,
          name: borrower_name.trim(),
        });
      }
      resolvedBorrowerId = existingBorrower._id;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Deduct amount from source account
      sourceAccount.current_balance -= principal_amount;
      await sourceAccount.save({ session });

      // 2. Create Loan record
      const createdLoans = await Loan.create(
        [
          {
            user_id: userId,
            borrower_id: resolvedBorrowerId,
            borrower_name: borrower_name.trim(),
            principal_amount,
            recovered_amount: 0,
            outstanding_amount: principal_amount,
            source_account_id,
            source_account_name: sourceAccount.name,
            lent_date: lent_date ? new Date(lent_date) : new Date(),
            expected_return_date: expected_return_date
              ? new Date(expected_return_date)
              : undefined,
            notes,
            status: LoanStatus.ACTIVE,
          },
        ],
        { session },
      );
      const loan = createdLoans[0];

      // 3. Create Audit Transaction
      await Transaction.create(
        [
          {
            user_id: userId,
            account_id: source_account_id,
            type: TransactionType.LENDING,
            amount: principal_amount,
            date: lent_date ? new Date(lent_date) : new Date(),
            notes: `Lent to ${borrower_name.trim()}${notes ? `: ${notes}` : ""}`,
            payment_method: sourceAccount.type || "Cash",
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return loan;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  getLoans: async (
    userId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      borrowerId?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const baseFilter: any = { user_id: userId, is_deleted: false };

    if (query.borrowerId) {
      baseFilter.borrower_id = query.borrowerId;
    }

    if (query.search) {
      baseFilter.$or = [
        { borrower_name: { $regex: query.search, $options: "i" } },
        { notes: { $regex: query.search, $options: "i" } },
      ];
    }

    if (query.dateFrom || query.dateTo) {
      baseFilter.lent_date = {};
      if (query.dateFrom) {
        baseFilter.lent_date.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        baseFilter.lent_date.$lte = new Date(query.dateTo);
      }
    }

    const filter = { ...baseFilter };

    const now = new Date();
    if (query.status && query.status !== "ALL") {
      const statusUpper = query.status.toUpperCase();
      if (statusUpper === LoanStatus.OVERDUE) {
        filter.status = {
          $nin: [LoanStatus.CANCELLED, LoanStatus.WRITTEN_OFF, LoanStatus.PAID],
        };
        filter.outstanding_amount = { $gt: 0 };
        filter.expected_return_date = { $lt: now };
      } else if (statusUpper === LoanStatus.ACTIVE) {
        filter.status = LoanStatus.ACTIVE;
        filter.recovered_amount = 0;
        filter.outstanding_amount = { $gt: 0 };
        filter.$and = [
          ...(filter.$and || []),
          {
            $or: [
              { expected_return_date: null },
              { expected_return_date: { $exists: false } },
              { expected_return_date: { $gte: now } },
            ],
          },
        ];
      } else if (statusUpper === LoanStatus.PARTIALLY_PAID) {
        filter.status = LoanStatus.PARTIALLY_PAID;
        filter.outstanding_amount = { $gt: 0 };
        filter.recovered_amount = { $gt: 0 };
        filter.$and = [
          ...(filter.$and || []),
          {
            $or: [
              { expected_return_date: null },
              { expected_return_date: { $exists: false } },
              { expected_return_date: { $gte: now } },
            ],
          },
        ];
      } else {
        filter.status = statusUpper;
      }
    }

    const total = await Loan.countDocuments(filter);

    const loans = await Loan.find(filter)
      .populate("source_account_id", "name type color icon currency")
      .populate("borrower_id", "name phone email")
      .sort({ lent_date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Attach derived status
    const computedLoans = loans.map((loan) => ({
      ...loan,
      display_status: deriveLoanStatus(loan),
    }));

    // Calculate overall metrics for summary
    const allUserLoans = await Loan.find(baseFilter).lean();

    let totalLent = 0;
    let totalRecovered = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;
    let totalWrittenOff = 0;
    let activeLoansCount = 0;

    allUserLoans.forEach((l) => {
      if (l.status !== LoanStatus.CANCELLED) {
        totalLent += l.principal_amount || 0;
        totalRecovered += l.recovered_amount || 0;
        totalOutstanding += l.outstanding_amount || 0;
        totalWrittenOff += l.write_off_amount || 0;

        const derived = deriveLoanStatus(l);
        if (derived === LoanStatus.OVERDUE) {
          totalOverdue += l.outstanding_amount || 0;
        }
        if (
          derived === LoanStatus.ACTIVE ||
          derived === LoanStatus.PARTIALLY_PAID ||
          derived === LoanStatus.OVERDUE
        ) {
          activeLoansCount++;
        }
      }
    });

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        summary: {
          totalLent,
          totalRecovered,
          totalOutstanding,
          totalOverdue,
          totalWrittenOff,
          activeLoansCount,
          totalLoansCount: allUserLoans.filter(
            (l) => l.status !== LoanStatus.CANCELLED,
          ).length,
        },
      },
      data: computedLoans,
    };
  },

  getLoanSummary: async (userId: string) => {
    const allUserLoans = await Loan.find({
      user_id: userId,
      is_deleted: false,
    }).lean();

    let totalLent = 0;
    let totalRecovered = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;
    let totalWrittenOff = 0;
    let activeLoansCount = 0;

    allUserLoans.forEach((l) => {
      if (l.status !== LoanStatus.CANCELLED) {
        totalLent += l.principal_amount || 0;
        totalRecovered += l.recovered_amount || 0;
        totalOutstanding += l.outstanding_amount || 0;
        totalWrittenOff += l.write_off_amount || 0;

        const derived = deriveLoanStatus(l);
        if (derived === LoanStatus.OVERDUE) {
          totalOverdue += l.outstanding_amount || 0;
        }
        if (
          derived === LoanStatus.ACTIVE ||
          derived === LoanStatus.PARTIALLY_PAID ||
          derived === LoanStatus.OVERDUE
        ) {
          activeLoansCount++;
        }
      }
    });

    return {
      totalLent,
      totalRecovered,
      totalOutstanding,
      totalOverdue,
      totalWrittenOff,
      activeLoansCount,
      totalLoansCount: allUserLoans.filter(
        (l) => l.status !== LoanStatus.CANCELLED,
      ).length,
    };
  },

  getLoanById: async (userId: string, loanId: string) => {
    const loan = await Loan.findOne({
      _id: loanId,
      user_id: userId,
      is_deleted: false,
    })
      .populate("source_account_id", "name type color icon currency current_balance")
      .populate("borrower_id", "name phone email address note")
      .lean();

    if (!loan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Loan not found.");
    }

    const repayments = await LoanRepayment.find({
      loan_id: loanId,
      user_id: userId,
      is_reversed: false,
    })
      .populate("account_id", "name type color icon currency")
      .sort({ payment_date: -1, createdAt: -1 })
      .lean();

    return {
      ...loan,
      display_status: deriveLoanStatus(loan),
      repayments,
    };
  },

  updateLoan: async (userId: string, loanId: string, payload: Partial<ILoan>) => {
    const allowedUpdates: any = {};
    if (payload.expected_return_date !== undefined) {
      allowedUpdates.expected_return_date = payload.expected_return_date
        ? new Date(payload.expected_return_date)
        : null;
    }
    if (payload.notes !== undefined) {
      allowedUpdates.notes = payload.notes;
    }

    const loan = await Loan.findOneAndUpdate(
      { _id: loanId, user_id: userId, is_deleted: false },
      { $set: allowedUpdates },
      { new: true },
    )
      .populate("source_account_id", "name type color icon currency")
      .populate("borrower_id", "name phone email address note");

    if (!loan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Loan not found.");
    }

    return loan;
  },

  cancelLoan: async (userId: string, loanId: string, payload?: { reason?: string }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const loan = await Loan.findOne({
        _id: loanId,
        user_id: userId,
        is_deleted: false,
      }).session(session);

      if (!loan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Loan not found.");
      }

      if (loan.status === LoanStatus.CANCELLED) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Loan is already cancelled.",
        );
      }

      const activeRepaymentsCount = await LoanRepayment.countDocuments({
        loan_id: loanId,
        user_id: userId,
        is_reversed: false,
      }).session(session);

      if (activeRepaymentsCount > 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Cannot cancel loan with existing repayments. Please reverse repayments first.",
        );
      }

      // Restore principal amount to source account
      const sourceAccount = await Account.findOne({
        _id: loan.source_account_id,
        user_id: userId,
      }).session(session);

      if (sourceAccount) {
        sourceAccount.current_balance += loan.principal_amount;
        await sourceAccount.save({ session });
      }

      loan.status = LoanStatus.CANCELLED;
      loan.outstanding_amount = 0;
      if (payload?.reason) {
        loan.notes = `${loan.notes ? `${loan.notes} | ` : ""}Cancelled: ${payload.reason}`;
      }
      await loan.save({ session });

      await session.commitTransaction();
      session.endSession();

      return loan;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  writeOffLoan: async (
    userId: string,
    loanId: string,
    payload?: { reason?: string },
  ) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const loan = await Loan.findOne({
        _id: loanId,
        user_id: userId,
        is_deleted: false,
      }).session(session);

      if (!loan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Loan not found.");
      }

      if (loan.status === LoanStatus.CANCELLED) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Cannot write off a cancelled loan.",
        );
      }

      if (loan.outstanding_amount <= 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Loan has no remaining outstanding balance to write off.",
        );
      }

      loan.write_off_amount = loan.outstanding_amount;
      loan.outstanding_amount = 0;
      loan.status = LoanStatus.WRITTEN_OFF;
      loan.write_off_reason = payload?.reason || "Loan written off";
      loan.write_off_date = new Date();

      await loan.save({ session });

      await session.commitTransaction();
      session.endSession();

      return loan;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  deleteLoan: async (userId: string, loanId: string) => {
    const loan = await Loan.findOne({
      _id: loanId,
      user_id: userId,
      is_deleted: false,
    });

    if (!loan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Loan not found.");
    }

    if (loan.status !== LoanStatus.CANCELLED && loan.status !== LoanStatus.PAID) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Active loans cannot be deleted directly. Please cancel or write off first.",
      );
    }

    loan.is_deleted = true;
    await loan.save();

    return loan;
  },

  addRepayment: async (userId: string, loanId: string, payload: any) => {
    const { amount, account_id, payment_method, payment_date, notes } = payload;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const loan = await Loan.findOne({
        _id: loanId,
        user_id: userId,
        is_deleted: false,
      }).session(session);

      if (!loan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Loan not found.");
      }

      if (loan.status === LoanStatus.CANCELLED) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Cannot add repayment to a cancelled loan.",
        );
      }

      if (loan.status === LoanStatus.WRITTEN_OFF) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Cannot add repayment to a written off loan.",
        );
      }

      if (loan.outstanding_amount <= 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "This loan has already been fully paid.",
        );
      }

      if (amount <= 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Repayment amount must be greater than zero.",
        );
      }

      if (amount > loan.outstanding_amount) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Repayment amount (${amount}) exceeds outstanding loan balance (${loan.outstanding_amount}).`,
        );
      }

      const receivingAccount = await Account.findOne({
        _id: account_id,
        user_id: userId,
        is_deleted: false,
      }).session(session);

      if (!receivingAccount) {
        throw new ApiError(httpStatus.NOT_FOUND, "Receiving account not found.");
      }

      // 1. Create Repayment record
      const repayments = await LoanRepayment.create(
        [
          {
            loan_id: loanId,
            user_id: userId,
            amount,
            payment_date: payment_date ? new Date(payment_date) : new Date(),
            payment_method: payment_method || receivingAccount.type || "Cash",
            account_id,
            notes,
          },
        ],
        { session },
      );
      const repayment = repayments[0];

      // 2. Increase receiving account balance
      receivingAccount.current_balance += amount;
      await receivingAccount.save({ session });

      // 3. Update Loan remaining and status
      loan.recovered_amount += amount;
      loan.outstanding_amount -= amount;

      if (loan.outstanding_amount <= 0) {
        loan.status = LoanStatus.PAID;
      } else {
        loan.status = LoanStatus.PARTIALLY_PAID;
      }

      await loan.save({ session });

      // 4. Create Audit Transaction
      await Transaction.create(
        [
          {
            user_id: userId,
            account_id,
            type: TransactionType.LOAN_REPAYMENT,
            amount,
            date: payment_date ? new Date(payment_date) : new Date(),
            notes: `Loan Repayment from ${loan.borrower_name}${notes ? `: ${notes}` : ""}`,
            payment_method: payment_method || receivingAccount.type || "Cash",
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return repayment;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  reverseRepayment: async (
    userId: string,
    loanId: string,
    repaymentId: string,
  ) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const repayment = await LoanRepayment.findOne({
        _id: repaymentId,
        loan_id: loanId,
        user_id: userId,
        is_reversed: false,
      }).session(session);

      if (!repayment) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Repayment not found or already reversed.",
        );
      }

      const loan = await Loan.findOne({
        _id: loanId,
        user_id: userId,
        is_deleted: false,
      }).session(session);

      if (!loan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Loan not found.");
      }

      const account = await Account.findOne({
        _id: repayment.account_id,
        user_id: userId,
      }).session(session);

      if (account) {
        account.current_balance -= repayment.amount;
        await account.save({ session });
      }

      // Mark repayment as reversed
      repayment.is_reversed = true;
      await repayment.save({ session });

      // Restore loan balances
      loan.recovered_amount = Math.max(
        0,
        loan.recovered_amount - repayment.amount,
      );
      loan.outstanding_amount += repayment.amount;

      if (loan.recovered_amount === 0) {
        loan.status = LoanStatus.ACTIVE;
      } else {
        loan.status = LoanStatus.PARTIALLY_PAID;
      }

      await loan.save({ session });

      await session.commitTransaction();
      session.endSession();

      return repayment;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  getBorrowers: async (userId: string) => {
    const borrowers = await Borrower.find({
      user_id: userId,
      is_deleted: false,
    })
      .sort({ name: 1 })
      .lean();

    const loans = await Loan.find({
      user_id: userId,
      is_deleted: false,
    }).lean();

    const borrowerStats = new Map<
      string,
      {
        totalBorrowed: number;
        totalRecovered: number;
        outstandingAmount: number;
        loansCount: number;
        activeLoansCount: number;
      }
    >();

    loans.forEach((l) => {
      if (l.status !== LoanStatus.CANCELLED) {
        const bId = l.borrower_id?.toString() || l.borrower_name;
        const current = borrowerStats.get(bId) || {
          totalBorrowed: 0,
          totalRecovered: 0,
          outstandingAmount: 0,
          loansCount: 0,
          activeLoansCount: 0,
        };

        current.totalBorrowed += l.principal_amount || 0;
        current.totalRecovered += l.recovered_amount || 0;
        current.outstandingAmount += l.outstanding_amount || 0;
        current.loansCount += 1;

        const derived = deriveLoanStatus(l);
        if (
          derived === LoanStatus.ACTIVE ||
          derived === LoanStatus.PARTIALLY_PAID ||
          derived === LoanStatus.OVERDUE
        ) {
          current.activeLoansCount += 1;
        }

        borrowerStats.set(bId, current);
      }
    });

    const result = borrowers.map((b) => {
      const stats = borrowerStats.get(b._id.toString()) || {
        totalBorrowed: 0,
        totalRecovered: 0,
        outstandingAmount: 0,
        loansCount: 0,
        activeLoansCount: 0,
      };
      return {
        ...b,
        ...stats,
      };
    });

    return result;
  },

  createBorrower: async (userId: string, payload: any) => {
    const existing = await Borrower.findOne({
      user_id: userId,
      name: { $regex: new RegExp(`^${payload.name.trim()}$`, "i") },
      is_deleted: false,
    });

    if (existing) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "A borrower with this name already exists.",
      );
    }

    return Borrower.create({
      user_id: userId,
      name: payload.name.trim(),
      phone: payload.phone?.trim(),
      email: payload.email?.trim(),
      address: payload.address?.trim(),
      note: payload.note?.trim(),
    });
  },

  updateBorrower: async (
    userId: string,
    borrowerId: string,
    payload: any,
  ) => {
    const borrower = await Borrower.findOneAndUpdate(
      { _id: borrowerId, user_id: userId, is_deleted: false },
      { $set: payload },
      { new: true },
    );

    if (!borrower) {
      throw new ApiError(httpStatus.NOT_FOUND, "Borrower not found.");
    }

    return borrower;
  },

  getBorrowerById: async (userId: string, borrowerId: string) => {
    const borrower = await Borrower.findOne({
      _id: borrowerId,
      user_id: userId,
      is_deleted: false,
    }).lean();

    if (!borrower) {
      throw new ApiError(httpStatus.NOT_FOUND, "Borrower not found.");
    }

    const loans = await Loan.find({
      user_id: userId,
      borrower_id: borrowerId,
      is_deleted: false,
    })
      .populate("source_account_id", "name type color icon currency")
      .sort({ lent_date: -1 })
      .lean();

    let totalBorrowed = 0;
    let totalRecovered = 0;
    let outstandingAmount = 0;

    loans.forEach((l) => {
      if (l.status !== LoanStatus.CANCELLED) {
        totalBorrowed += l.principal_amount || 0;
        totalRecovered += l.recovered_amount || 0;
        outstandingAmount += l.outstanding_amount || 0;
      }
    });

    return {
      ...borrower,
      totalBorrowed,
      totalRecovered,
      outstandingAmount,
      loansCount: loans.length,
      loans: loans.map((l) => ({
        ...l,
        display_status: deriveLoanStatus(l),
      })),
    };
  },
};
