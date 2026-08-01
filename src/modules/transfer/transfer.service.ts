import httpStatus from "http-status";
import ApiError from "../../helpers/api-error";
import { Transfer } from "./transfer.model";
import { Account } from "../account/account.model";

export const TransferService = {
  createTransfer: async (userId: string, payload: any) => {
    const { from_account_id, to_account_id, amount, fee = 0, date, notes } = payload;

    if (from_account_id === to_account_id) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Source and destination accounts must be different.");
    }

    const fromAccount = await Account.findOne({ _id: from_account_id, user_id: userId, is_deleted: false });
    const toAccount = await Account.findOne({ _id: to_account_id, user_id: userId, is_deleted: false });

    if (!fromAccount || !toAccount) {
      throw new ApiError(httpStatus.NOT_FOUND, "One or both accounts were not found.");
    }

    const totalDeduction = amount + fee;
    if (fromAccount.current_balance < totalDeduction) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient funds in source account.");
    }

    const transfer = await Transfer.create({
      user_id: userId,
      from_account_id,
      to_account_id,
      amount,
      fee,
      date: date || new Date(),
      notes,
    });

    fromAccount.current_balance -= totalDeduction;
    toAccount.current_balance += amount;

    await fromAccount.save();
    await toAccount.save();

    return transfer;
  },

  getTransfers: async (userId: string) => {
    return Transfer.find({ user_id: userId })
      .populate("from_account_id", "name type color icon")
      .populate("to_account_id", "name type color icon")
      .sort({ date: -1, createdAt: -1 });
  },
};
