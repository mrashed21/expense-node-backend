import httpStatus from "http-status";
import mongoose from "mongoose";
import ApiError from "../../helpers/api-error";
import { TransactionType } from "../transaction/transaction.interface";
import { TransactionService } from "../transaction/transaction.service";
import { Bill } from "./bill.model";

export const BillService = {
  createBill: async (userId: string, payload: any) => {
    return Bill.create({
      ...payload,
      user_id: userId,
    });
  },

  getBills: async (userId: string) => {
    return Bill.find({ user_id: userId }).sort({ due_date: 1 }).lean();
  },

  payBill: async (
    userId: string,
    billId: string,
    accountId: string,
    categoryId?: string,
  ) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bill = await Bill.findOne({ _id: billId, user_id: userId }).session(
        session,
      );
      if (!bill) {
        throw new ApiError(httpStatus.NOT_FOUND, "Bill not found.");
      }

      if (bill.status === "paid") {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Bill is already marked as paid.",
        );
      }

      await TransactionService.createTransaction(
        userId,
        {
          account_id: accountId,
          category_id: categoryId,
          type: TransactionType.EXPENSE,
          amount: bill.amount,
          notes: `Bill Paid: ${bill.title} (${bill.type})`,
          date: new Date(),
        },
        session,
      );

      bill.status = "paid";
      await bill.save({ session });

      await session.commitTransaction();
      session.endSession();

      return bill;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  deleteBill: async (userId: string, billId: string) => {
    const bill = await Bill.findOneAndDelete({ _id: billId, user_id: userId });
    if (!bill) {
      throw new ApiError(httpStatus.NOT_FOUND, "Bill not found.");
    }
    return true;
  },
};
