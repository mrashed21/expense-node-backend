import { TransactionType } from "@/modules/transaction/transaction.interface";
import { Transaction } from "@/modules/transaction/transaction.model";
import mongoose from "mongoose";
import { Account } from "./account.model";

export const CreditStatementService = {
  /**
   * Generates a credit card statement for a specific billing cycle.
   */
  generateStatement: async (
    userId: string,
    accountId: string,
    startDate: Date,
    endDate: Date,
  ) => {
    const uid = new mongoose.Types.ObjectId(userId);
    const accId = new mongoose.Types.ObjectId(accountId);

    const account = await Account.findOne({ _id: accId, user_id: uid, is_deleted: false });
    if (!account || !account.is_credit) {
      throw new Error("Invalid credit account");
    }

    const [totals] = await Transaction.aggregate([
      {
        $match: {
          user_id: uid,
          account_id: accId,
          is_deleted: false,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ["$type", TransactionType.EXPENSE] }, "$amount", 0],
            },
          },
          totalPayments: {
            $sum: {
              $cond: [
                { $in: ["$type", [TransactionType.INCOME, TransactionType.REFUND]] },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const totalSpent = totals?.totalSpent || 0;
    const totalPayments = totals?.totalPayments || 0;

    const previousBalance = account.current_balance; // Simplification for current state
    const newBalance = previousBalance + totalSpent - totalPayments;

    return {
      accountName: account.name,
      currency: account.currency,
      statementPeriod: { start: startDate, end: endDate },
      previousBalance,
      totalSpent,
      totalPayments,
      newBalance,
      transactions,
    };
  },
};
