import httpStatus from "http-status";
import ApiError from "../../helpers/api-error";
import { Bill } from "./bill.model";
import { TransactionService } from "../transaction/transaction.service";
import { TransactionType } from "../transaction/transaction.interface";

export const BillService = {
  createBill: async (userId: string, payload: any) => {
    return Bill.create({
      ...payload,
      user_id: userId,
    });
  },

  getBills: async (userId: string) => {
    return Bill.find({ user_id: userId }).sort({ due_date: 1 });
  },

  payBill: async (userId: string, billId: string, accountId: string) => {
    const bill = await Bill.findOne({ _id: billId, user_id: userId });
    if (!bill) {
      throw new ApiError(httpStatus.NOT_FOUND, "Bill not found.");
    }

    if (bill.status === "paid") {
      throw new ApiError(httpStatus.BAD_REQUEST, "Bill is already marked as paid.");
    }

    await TransactionService.createTransaction(userId, {
      account_id: accountId,
      type: TransactionType.EXPENSE,
      amount: bill.amount,
      notes: `Bill Paid: ${bill.title} (${bill.type})`,
      date: new Date(),
    });

    bill.status = "paid";
    await bill.save();

    return bill;
  },

  deleteBill: async (userId: string, billId: string) => {
    const bill = await Bill.findOneAndDelete({ _id: billId, user_id: userId });
    if (!bill) {
      throw new ApiError(httpStatus.NOT_FOUND, "Bill not found.");
    }
    return true;
  },
};
