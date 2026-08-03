import ApiError from "@/helpers/api-error";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { Transaction } from "../transaction/transaction.model";
import { TransactionType } from "../transaction/transaction.interface";
import { Account } from "../account/account.model";
import { Transfer } from "./transfer.model";

export const TransferService = {
  createTransfer: async (userId: string, payload: any) => {
    const {
      from_account_id,
      to_account_id,
      amount,
      fee = 0,
      date,
      notes,
    } = payload;

    if (from_account_id === to_account_id) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Source and destination accounts must be different.",
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const fromAccount = await Account.findOne({
        _id: from_account_id,
        user_id: userId,
        is_deleted: false,
      }).session(session);
      const toAccount = await Account.findOne({
        _id: to_account_id,
        user_id: userId,
        is_deleted: false,
      }).session(session);

      if (!fromAccount || !toAccount) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "One or both accounts were not found.",
        );
      }

      const totalDeduction = amount + fee;
      if (fromAccount.current_balance < totalDeduction) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Insufficient funds in source account.",
        );
      }

      const createdTransfers = await Transfer.create(
        [
          {
            user_id: userId,
            from_account_id,
            to_account_id,
            amount,
            fee,
            date: date || new Date(),
            notes,
          },
        ],
        { session }
      );
      const transfer = createdTransfers[0];

      if (fee > 0) {
        await Transaction.create(
          [
            {
              user_id: userId,
              account_id: from_account_id,
              type: TransactionType.EXPENSE,
              amount: fee,
              date: date || new Date(),
              notes: `Transfer Fee: ${notes || "No notes"}`,
            },
          ],
          { session }
        );
      }

      fromAccount.current_balance -= totalDeduction;
      toAccount.current_balance += amount;

      await fromAccount.save({ session });
      await toAccount.save({ session });

      await session.commitTransaction();
      session.endSession();

      return transfer;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  getTransfers: async (userId: string) => {
    return Transfer.find({ user_id: userId })
      .populate("from_account_id", "name type color icon")
      .populate("to_account_id", "name type color icon")
      .sort({ date: -1, createdAt: -1 })
      .lean();
  },
};
