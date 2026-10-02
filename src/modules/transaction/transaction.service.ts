import httpStatus from "http-status";
import mongoose from "mongoose";
import ApiError from "../../helpers/api-error";
import { Account } from "../account/account.model";
import { Budget } from "../budget/budget.model";
import { createAndEmitNotification } from "../notification/notification.helper";
import { Notification } from "../notification/notification.model";
import { TransactionType } from "./transaction.interface";
import { Transaction } from "./transaction.model";

const checkBudgetAndNotify = async (userId: string, categoryId: string) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budget = await Budget.findOne({
      user_id: userId,
      category_id: categoryId,
      month_year: currentMonth,
    });

    if (!budget) return;

    const startOfMonth = new Date(`${currentMonth}-01T00:00:00.000Z`);
    const spentResult = await Transaction.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          category_id: new mongoose.Types.ObjectId(categoryId),
          type: TransactionType.EXPENSE,
          is_deleted: false,
          date: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalSpent = spentResult[0]?.total ?? 0;
    const percentage = Math.round((totalSpent / budget.amount) * 100);

    if (percentage < budget.warning_threshold) return;

    const alreadyAlerted = await Notification.exists({
      user_id: userId,
      type: "budget_alert",
      createdAt: { $gte: startOfMonth },
      message: { $regex: `${percentage}%` },
    });

    if (alreadyAlerted) return;

    if (percentage >= 100) {
      await createAndEmitNotification(userId, {
        title: "Budget Exceeded!",
        message: `You have exceeded your budget for this category (${percentage}% used).`,
        type: "budget_alert",
        category: "budget",
      });
    } else {
      await createAndEmitNotification(userId, {
        title: "Budget Warning",
        message: `You have used ${percentage}% of your budget for this category.`,
        type: "budget_alert",
        category: "budget",
      });
    }
  } catch (e) {
    console.error("[BudgetAlert] Failed to check budget:", e);
  }
};

export const TransactionService = {
  createTransaction: async (
    userId: string,
    payload: any,
    externalSession?: mongoose.ClientSession,
  ) => {
    const { account_id, type, amount } = payload;

    const session = externalSession || (await mongoose.startSession());
    if (!externalSession) {
      session.startTransaction();
    }

    try {
      const account = await Account.findOne({
        _id: account_id,
        user_id: userId,
        is_deleted: false,
      }).session(session);
      if (!account) {
        throw new ApiError(httpStatus.NOT_FOUND, "Account not found.");
      }

      const created = await Transaction.create(
        [
          {
            ...payload,
            user_id: userId,
          },
        ],
        { session },
      );
      const transaction = created[0];

      let balanceDelta = 0;
      if (
        type === TransactionType.INCOME ||
        type === TransactionType.REFUND ||
        type === TransactionType.OPENING_BALANCE ||
        type === TransactionType.LOAN
      ) {
        balanceDelta = amount;
      } else if (type === TransactionType.EXPENSE) {
        balanceDelta = -amount;
      } else if (type === TransactionType.ADJUSTMENT) {
        account.current_balance = amount;
        await account.save({ session });
        if (!externalSession) {
          await session.commitTransaction();
          session.endSession();
        }
        return transaction;
      }

      account.current_balance += balanceDelta;
      await account.save({ session });

      if (!externalSession) {
        await session.commitTransaction();
        session.endSession();
      }

      if (type === TransactionType.EXPENSE && payload.category_id) {
        await checkBudgetAndNotify(userId, payload.category_id);
      }

      return transaction;
    } catch (error) {
      if (!externalSession) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  },

  getTransactions: async (
    userId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      dateRange?: string;
      startDate?: string;
      endDate?: string;
      type?: string;
      accountId?: string;
      categoryId?: string;
    },
  ) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: any = { user_id: userId, is_deleted: false };

    if (query.type && query.type !== "all") {
      filter.type = query.type;
    }

    if (query.accountId) {
      filter.account_id = query.accountId;
    }

    if (query.categoryId) {
      filter.category_id = query.categoryId;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const now = new Date();
    if (query.dateRange === "today") {
      const start = new Date(now.setHours(0, 0, 0, 0));
      filter.date = { $gte: start };
    } else if (query.dateRange === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const start = new Date(yesterday.setHours(0, 0, 0, 0));
      const end = new Date(yesterday.setHours(23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    } else if (query.dateRange === "last7days") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      filter.date = { $gte: start };
    } else if (query.dateRange === "last30days") {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      filter.date = { $gte: start };
    } else if (query.dateRange === "thisMonth") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      filter.date = { $gte: start };
    } else if (query.dateRange === "thisYear") {
      const start = new Date(now.getFullYear(), 0, 1);
      filter.date = { $gte: start };
    } else if (
      query.dateRange === "custom" &&
      query.startDate &&
      query.endDate
    ) {
      filter.date = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate("account_id", "name type color icon")
      .populate("category_id", "name type icon color")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: transactions,
    };
  },

  restoreTransaction: async (userId: string, transactionId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tx = await Transaction.findOneAndUpdate(
        { _id: transactionId, user_id: userId, is_deleted: true },
        { $set: { is_deleted: false } },
        { new: true, session },
      );
      if (!tx)
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Transaction not found or already restored",
        );

      const multiplier = tx.type === TransactionType.EXPENSE ? -1 : 1;
      await Account.findByIdAndUpdate(
        tx.account_id,
        {
          $inc: { current_balance: tx.amount * multiplier },
        },
        { session },
      );

      await session.commitTransaction();
      session.endSession();
      return tx;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  bulkRestoreTransactions: async (userId: string, transactionIds: string[]) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transactions = await Transaction.find({
        _id: { $in: transactionIds },
        user_id: userId,
        is_deleted: true,
      }).session(session);

      if (transactions.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return { restoredCount: 0 };
      }

      await Transaction.updateMany(
        { _id: { $in: transactionIds }, user_id: userId, is_deleted: true },
        { $set: { is_deleted: false } },
        { session },
      );

      const accountBalanceChanges = new Map<string, number>();
      for (const tx of transactions) {
        const multiplier = tx.type === TransactionType.EXPENSE ? -1 : 1;
        const change = tx.amount * multiplier;
        const accId = tx.account_id.toString();
        accountBalanceChanges.set(
          accId,
          (accountBalanceChanges.get(accId) || 0) + change,
        );
      }

      const bulkAccountOps = Array.from(accountBalanceChanges.entries()).map(
        ([accId, change]) => ({
          updateOne: {
            filter: { _id: accId },
            update: { $inc: { current_balance: change } },
          },
        }),
      );

      if (bulkAccountOps.length > 0) {
        await Account.bulkWrite(bulkAccountOps, { session });
      }

      await session.commitTransaction();
      session.endSession();
      return { restoredCount: transactions.length };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  bulkDeleteTransactions: async (userId: string, transactionIds: string[]) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transactions = await Transaction.find({
        _id: { $in: transactionIds },
        user_id: userId,
        is_deleted: false,
      }).session(session);

      if (transactions.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return { deletedCount: 0 };
      }

      await Transaction.updateMany(
        { _id: { $in: transactionIds }, user_id: userId, is_deleted: false },
        { $set: { is_deleted: true } },
        { session },
      );

      const accountBalanceChanges = new Map<string, number>();
      for (const tx of transactions) {
        const multiplier = tx.type === TransactionType.EXPENSE ? 1 : -1;
        const change = tx.amount * multiplier;
        const accId = tx.account_id.toString();
        accountBalanceChanges.set(
          accId,
          (accountBalanceChanges.get(accId) || 0) + change,
        );
      }

      const bulkAccountOps = Array.from(accountBalanceChanges.entries()).map(
        ([accId, change]) => ({
          updateOne: {
            filter: { _id: accId },
            update: { $inc: { current_balance: change } },
          },
        }),
      );

      if (bulkAccountOps.length > 0) {
        await Account.bulkWrite(bulkAccountOps, { session });
      }

      await session.commitTransaction();
      session.endSession();
      return { deletedCount: transactions.length };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  deleteTransaction: async (userId: string, transactionId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transaction = await Transaction.findOne({
        _id: transactionId,
        user_id: userId,
        is_deleted: false,
      }).session(session);
      if (!transaction) {
        throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found.");
      }

      transaction.is_deleted = true;
      await transaction.save({ session });

      const account = await Account.findById(transaction.account_id).session(
        session,
      );
      if (account) {
        if (
          transaction.type === TransactionType.INCOME ||
          transaction.type === TransactionType.REFUND ||
          transaction.type === TransactionType.OPENING_BALANCE ||
          transaction.type === TransactionType.LOAN
        ) {
          account.current_balance -= transaction.amount;
        } else if (transaction.type === TransactionType.EXPENSE) {
          account.current_balance += transaction.amount;
        }
        await account.save({ session });
      }

      await session.commitTransaction();
      session.endSession();
      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  getTransactionById: async (userId: string, transactionId: string) => {
    const tx = await Transaction.findOne({
      _id: transactionId,
      user_id: userId,
      is_deleted: false,
    })
      .populate("account_id", "name type color icon")
      .populate("category_id", "name type icon color")
      .lean();
    if (!tx) throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found.");
    return tx;
  },

  updateTransaction: async (
    userId: string,
    transactionId: string,
    payload: any,
  ) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const oldTx = await Transaction.findOne({
        _id: transactionId,
        user_id: userId,
        is_deleted: false,
      }).session(session);

      if (!oldTx) {
        throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found.");
      }

      const amountChanged =
        payload.amount !== undefined && payload.amount !== oldTx.amount;
      const typeChanged =
        payload.type !== undefined && payload.type !== oldTx.type;
      const accountChanged =
        payload.account_id !== undefined &&
        payload.account_id.toString() !== oldTx.account_id.toString();

      if (amountChanged || typeChanged || accountChanged) {
        const oldAccount = await Account.findById(oldTx.account_id).session(
          session,
        );
        if (oldAccount) {
          if (
            oldTx.type === TransactionType.INCOME ||
            oldTx.type === TransactionType.REFUND ||
            oldTx.type === TransactionType.OPENING_BALANCE ||
            oldTx.type === TransactionType.LOAN
          ) {
            oldAccount.current_balance -= oldTx.amount;
          } else if (oldTx.type === TransactionType.EXPENSE) {
            oldAccount.current_balance += oldTx.amount;
          }
          await oldAccount.save({ session });
        }

        const newAccountId = payload.account_id || oldTx.account_id;
        const newType = payload.type || oldTx.type;
        const newAmount =
          payload.amount !== undefined ? payload.amount : oldTx.amount;

        const newAccount =
          await Account.findById(newAccountId).session(session);
        if (newAccount) {
          if (
            newType === TransactionType.INCOME ||
            newType === TransactionType.REFUND ||
            newType === TransactionType.OPENING_BALANCE ||
            newType === TransactionType.LOAN
          ) {
            newAccount.current_balance += newAmount;
          } else if (newType === TransactionType.EXPENSE) {
            newAccount.current_balance -= newAmount;
          } else if (newType === TransactionType.ADJUSTMENT) {
            newAccount.current_balance = newAmount;
          }
          await newAccount.save({ session });
        }
      }

      Object.assign(oldTx, payload);
      await oldTx.save({ session });

      await session.commitTransaction();
      session.endSession();

      return oldTx;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  bulkEditTransactions: async (
    userId: string,
    transactionIds: string[],
    payload: any,
  ) => {
    const affectsBalance =
      payload.amount !== undefined ||
      payload.type !== undefined ||
      payload.account_id !== undefined;

    if (!affectsBalance) {
      const result = await Transaction.updateMany(
        { _id: { $in: transactionIds }, user_id: userId, is_deleted: false },
        { $set: payload },
      );
      return { updatedCount: result.modifiedCount };
    }

    let updatedCount = 0;
    for (const id of transactionIds) {
      try {
        await TransactionService.updateTransaction(userId, id, payload);
        updatedCount++;
      } catch (e) {}
    }
    return { updatedCount };
  },
};
