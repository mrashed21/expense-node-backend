import httpStatus from "http-status";
import ApiError from "../helpers/api-error";
import { Transaction } from "../models/transaction.model";
import { Account } from "../models/account.model";
import { TransactionType } from "../interfaces/financial.interface";

export const TransactionService = {
  createTransaction: async (userId: string, payload: any) => {
    const { account_id, type, amount } = payload;

    const account = await Account.findOne({ _id: account_id, user_id: userId, is_deleted: false });
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, "Account not found.");
    }

    const transaction = await Transaction.create({
      ...payload,
      user_id: userId,
    });

    // Update account balance
    let balanceDelta = 0;
    if (type === TransactionType.INCOME || type === TransactionType.REFUND || type === TransactionType.OPENING_BALANCE) {
      balanceDelta = amount;
    } else if (type === TransactionType.EXPENSE) {
      balanceDelta = -amount;
    } else if (type === TransactionType.ADJUSTMENT) {
      account.current_balance = amount;
      await account.save();
      return transaction;
    }

    account.current_balance += balanceDelta;
    await account.save();

    return transaction;
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
    }
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
      filter.$or = [
        { notes: { $regex: query.search, $options: "i" } },
        { location: { $regex: query.search, $options: "i" } },
        { reference_number: { $regex: query.search, $options: "i" } },
        { tags: { $in: [new RegExp(query.search, "i")] } },
      ];
    }

    // Date range filters
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
    } else if (query.dateRange === "custom" && query.startDate && query.endDate) {
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
      .limit(limit);

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

  deleteTransaction: async (userId: string, transactionId: string) => {
    const transaction = await Transaction.findOne({ _id: transactionId, user_id: userId, is_deleted: false });
    if (!transaction) {
      throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found.");
    }

    transaction.is_deleted = true;
    await transaction.save();

    // Reverse account balance effect
    const account = await Account.findById(transaction.account_id);
    if (account) {
      if (transaction.type === TransactionType.INCOME || transaction.type === TransactionType.REFUND) {
        account.current_balance -= transaction.amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        account.current_balance += transaction.amount;
      }
      await account.save();
    }

    return true;
  },
};
