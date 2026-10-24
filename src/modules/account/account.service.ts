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
    const allowedFields = [
      "name",
      "type",
      "opening_balance",
      "current_balance",
      "color",
      "icon",
      "description",
    ];
    const updateData = Object.fromEntries(
      Object.entries(payload).filter(([key]) => allowedFields.includes(key)),
    );

    const account = await Account.findOneAndUpdate(
      { _id: accountId, user_id: userId, is_deleted: false },
      updateData,
      { new: true, runValidators: true },
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
