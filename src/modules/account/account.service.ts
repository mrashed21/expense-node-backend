import httpStatus from "http-status";

import ApiError from "../../helpers/api-error";
import { Account } from "./account.model";

export const AccountService = {
  createAccount: async (userId: string, payload: any) => {
    const openingBalance = payload.opening_balance || 0;
    const newAccount = await Account.create({
      ...payload,
      user_id: userId,
      current_balance: openingBalance,
    });
    return newAccount;
  },

  getUserAccounts: async (userId: string) => {
    return Account.find({ user_id: userId, is_deleted: false })
      .sort({ createdAt: -1 })
      .lean();
  },

  getAccountById: async (userId: string, accountId: string) => {
    const account = await Account.findOne({
      _id: accountId,
      user_id: userId,
      is_deleted: false,
    }).lean();
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, "Account not found.");
    }
    return account;
  },

  updateAccount: async (userId: string, accountId: string, payload: any) => {
    const account = await Account.findOneAndUpdate(
      { _id: accountId, user_id: userId, is_deleted: false },
      payload,
      { new: true },
    );
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, "Account not found.");
    }
    return account;
  },

  deleteAccount: async (userId: string, accountId: string) => {
    const account = await Account.findOneAndUpdate(
      { _id: accountId, user_id: userId, is_deleted: false },
      { is_deleted: true, status: "archived" },
      { new: true },
    );
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, "Account not found.");
    }
    return true;
  },
};
