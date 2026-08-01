import httpStatus from "http-status";
import ApiError from "../helpers/api-error";
import { Budget } from "../models/budget.model";
import { Transaction } from "../models/transaction.model";
import { TransactionType } from "../interfaces/financial.interface";

export const BudgetService = {
  createBudget: async (userId: string, payload: any) => {
    const monthYear = payload.month_year || new Date().toISOString().slice(0, 7); // e.g. "2026-08"

    const existing = await Budget.findOne({
      user_id: userId,
      category_id: payload.category_id,
      month_year: monthYear,
    });

    if (existing) {
      existing.amount = payload.amount;
      existing.warning_threshold = payload.warning_threshold || existing.warning_threshold;
      await existing.save();
      return existing;
    }

    const budget = await Budget.create({
      ...payload,
      user_id: userId,
      month_year: monthYear,
    });
    return budget;
  },

  getBudgets: async (userId: string, monthYear?: string) => {
    const currentMonth = monthYear || new Date().toISOString().slice(0, 7);

    const budgets = await Budget.find({ user_id: userId, month_year: currentMonth })
      .populate("category_id", "name color icon type");

    // Calculate actual spent amount for each budget category in this month
    const startOfMonth = new Date(`${currentMonth}-01T00:00:00.000Z`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

    const budgetsWithAnalytics = await Promise.all(
      budgets.map(async (b) => {
        const spentResult = await Transaction.aggregate([
          {
            $match: {
              user_id: b.user_id,
              category_id: b.category_id._id,
              type: TransactionType.EXPENSE,
              is_deleted: false,
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: "$amount" },
            },
          },
        ]);

        const totalSpent = spentResult[0]?.totalSpent || 0;
        const percentage = Math.min(100, Math.round((totalSpent / b.amount) * 100));

        return {
          ...b.toObject(),
          spent_amount: totalSpent,
          remaining_amount: Math.max(0, b.amount - totalSpent),
          percentage,
          is_warning: percentage >= b.warning_threshold,
        };
      })
    );

    return budgetsWithAnalytics;
  },

  deleteBudget: async (userId: string, budgetId: string) => {
    const budget = await Budget.findOneAndDelete({ _id: budgetId, user_id: userId });
    if (!budget) {
      throw new ApiError(httpStatus.NOT_FOUND, "Budget rule not found.");
    }
    return true;
  },
};
