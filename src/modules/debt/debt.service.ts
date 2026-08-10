import httpStatus from "http-status";
import mongoose from "mongoose";
import ApiError from "../../helpers/api-error";
import { DebtPayment } from "./debt-payment.model";
import { DebtStatus, DebtType, IDebt } from "./debt.interface";
import { Debt } from "./debt.model";

const calculateDynamicDebt = (debt: any) => {
  let accruedInterest = 0;
  if (debt.interest_rate && debt.interest_rate > 0) {
    const msInYear = 1000 * 60 * 60 * 24 * 365;
    const timeInYears =
      (Date.now() - new Date(debt.createdAt).getTime()) / msInYear;
    accruedInterest =
      debt.amount * (debt.interest_rate / 100) * Math.max(0, timeInYears);
  }

  const trueRemaining = Math.max(0, debt.remaining_amount + accruedInterest);

  let derivedStatus = debt.status;
  if (trueRemaining <= 0) {
    derivedStatus = DebtStatus.PAID;
  } else if (debt.remaining_amount < debt.amount || accruedInterest > 0) {
    derivedStatus = DebtStatus.PARTIAL;
  }

  return {
    ...debt,
    accrued_interest: accruedInterest,
    true_remaining_amount: trueRemaining,
    derived_status: derivedStatus,
  };
};

export const DebtService = {
  createDebt: async (userId: string, payload: Partial<IDebt>) => {
    return Debt.create({
      user_id: userId,
      person_name: payload.person_name,
      type: payload.type,
      amount: payload.amount,
      remaining_amount: payload.amount,
      interest_rate: payload.interest_rate,
      due_date: payload.due_date,
      notes: payload.notes,
      status: DebtStatus.PENDING,
    });
  },

  getDebts: async (
    userId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
    },
  ) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: any = { user_id: userId, is_deleted: false };

    if (query.type && query.type !== "all") {
      filter.type = query.type;
    }

    if (query.search) {
      filter.person_name = { $regex: query.search, $options: "i" };
    }

    const total = await Debt.countDocuments(filter);

    const allDebts = await Debt.find(filter).lean();
    let totalLent = 0;
    let totalBorrowed = 0;

    allDebts.forEach((d) => {
      const computed = calculateDynamicDebt(d);
      if (computed.derived_status !== DebtStatus.PAID) {
        if (d.type === DebtType.LENT) {
          totalLent += computed.true_remaining_amount;
        } else {
          totalBorrowed += computed.true_remaining_amount;
        }
      }
    });
    const netDebt = totalLent - totalBorrowed;

    const debts = await Debt.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const computedDebts = debts.map(calculateDynamicDebt);

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        metrics: {
          totalLent,
          totalBorrowed,
          netDebt,
        },
      },
      data: computedDebts,
    };
  },

  getDebtById: async (userId: string, debtId: string) => {
    const debt = await Debt.findOne({
      _id: debtId,
      user_id: userId,
      is_deleted: false,
    }).lean();

    if (!debt) {
      throw new ApiError(httpStatus.NOT_FOUND, "Debt not found");
    }

    const computedDebt = calculateDynamicDebt(debt);

    const payments = await DebtPayment.find({ debt_id: debtId })
      .sort({ date: -1 })
      .lean();

    return { ...computedDebt, payments };
  },

  updateDebt: async (
    userId: string,
    debtId: string,
    payload: Partial<IDebt>,
  ) => {
    const debt = await Debt.findOneAndUpdate(
      { _id: debtId, user_id: userId, is_deleted: false },
      { $set: payload },
      { new: true },
    );
    if (!debt) {
      throw new ApiError(httpStatus.NOT_FOUND, "Debt not found");
    }
    return debt;
  },

  deleteDebt: async (userId: string, debtId: string) => {
    const debt = await Debt.findOneAndUpdate(
      { _id: debtId, user_id: userId, is_deleted: false },
      { $set: { is_deleted: true } },
      { new: true },
    );
    if (!debt) {
      throw new ApiError(httpStatus.NOT_FOUND, "Debt not found");
    }
    return debt;
  },

  addPayment: async (userId: string, debtId: string, payload: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const debt = await Debt.findOne({
        _id: debtId,
        user_id: userId,
        is_deleted: false,
      }).session(session);
      if (!debt) {
        throw new ApiError(httpStatus.NOT_FOUND, "Debt not found");
      }

      const payment = await DebtPayment.create(
        [
          {
            debt_id: debtId,
            user_id: userId,
            amount: payload.amount,
            date: payload.date ? new Date(payload.date) : new Date(),
            notes: payload.notes,
          },
        ],
        { session },
      );

      debt.remaining_amount = debt.remaining_amount - payload.amount;

      const computed = calculateDynamicDebt(debt.toObject());
      debt.status = computed.derived_status;

      await debt.save({ session });
      await session.commitTransaction();
      session.endSession();

      return payment[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },
};
