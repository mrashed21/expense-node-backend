import ApiError from "@/helpers/api-error";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { Account } from "../account/account.model";
import { Bill } from "../bill/bill.model";
import { Budget } from "../budget/budget.model";
import { Category } from "../category/category.model";
import { Goal } from "../goal/goal.model";
import { Transaction } from "../transaction/transaction.model";
import { Transfer } from "../transfer/transfer.model";

export const DataService = {
  exportData: async (userId: string) => {
    // Parallelize the queries to fetch all user data
    const [
      accounts,
      bills,
      budgets,
      categories,
      goals,
      transactions,
      transfers,
    ] = await Promise.all([
      Account.find({ user_id: userId, is_deleted: false }).lean(),
      Bill.find({ user_id: userId }).lean(),
      Budget.find({ user_id: userId }).lean(),
      Category.find({ user_id: userId, is_deleted: false }).lean(),
      Goal.find({ user_id: userId }).lean(),
      Transaction.find({ user_id: userId, is_deleted: false }).lean(),
      Transfer.find({ user_id: userId }).lean(),
    ]);

    return {
      metadata: {
        version: "1.0",
        exportedAt: new Date().toISOString(),
      },
      data: {
        accounts,
        bills,
        budgets,
        categories,
        goals,
        transactions,
        transfers,
      },
    };
  },

  restoreData: async (userId: string, backupPayload: any) => {
    if (!backupPayload || !backupPayload.data) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid backup payload format");
    }

    const {
      accounts = [],
      bills = [],
      budgets = [],
      categories = [],
      goals = [],
      transactions = [],
      transfers = [],
    } = backupPayload.data;

    // Helper to sanitize documents and force user_id securely
    const sanitizeDocs = (docs: any[]) => {
      return docs.map((doc) => {
        const { _id, ...rest } = doc;
        return {
          ...rest,
          _id: _id ? new mongoose.Types.ObjectId(_id) : new mongoose.Types.ObjectId(),
          user_id: userId, // CRITICAL: Prevent injecting into other users' accounts
        };
      });
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Wipe existing data for this user
      await Account.deleteMany({ user_id: userId }, { session });
      await Bill.deleteMany({ user_id: userId }, { session });
      await Budget.deleteMany({ user_id: userId }, { session });
      await Category.deleteMany({ user_id: userId }, { session });
      await Goal.deleteMany({ user_id: userId }, { session });
      await Transaction.deleteMany({ user_id: userId }, { session });
      await Transfer.deleteMany({ user_id: userId }, { session });

      // 2. Insert the restored data
      if (accounts.length > 0) await Account.insertMany(sanitizeDocs(accounts), { session });
      if (bills.length > 0) await Bill.insertMany(sanitizeDocs(bills), { session });
      if (budgets.length > 0) await Budget.insertMany(sanitizeDocs(budgets), { session });
      if (categories.length > 0) await Category.insertMany(sanitizeDocs(categories), { session });
      if (goals.length > 0) await Goal.insertMany(sanitizeDocs(goals), { session });
      if (transactions.length > 0) await Transaction.insertMany(sanitizeDocs(transactions), { session });
      if (transfers.length > 0) await Transfer.insertMany(sanitizeDocs(transfers), { session });

      await session.commitTransaction();
      session.endSession();

      return { success: true, message: "Data restored successfully" };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to restore data. Transaction rolled back.");
    }
  },
};
