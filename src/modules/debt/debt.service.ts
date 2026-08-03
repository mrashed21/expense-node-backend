import ApiError from "@/helpers/api-error";
import httpStatus from "http-status";
import { DebtStatus, IDebt } from "./debt.interface";
import { Debt } from "./debt.model";

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

  getDebts: async (userId: string) => {
    return Debt.find({ user_id: userId, is_deleted: false })
      .sort({ createdAt: -1 })
      .lean();
  },

  updateDebt: async (userId: string, debtId: string, payload: Partial<IDebt>) => {
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
};
