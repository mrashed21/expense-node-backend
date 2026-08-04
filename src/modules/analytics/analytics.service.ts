import { Account } from "@/modules/account/account.model";
import { Bill } from "@/modules/bill/bill.model";
import { Budget } from "@/modules/budget/budget.model";
import { Goal } from "@/modules/goal/goal.model";
import { TransactionType } from "@/modules/transaction/transaction.interface";
import { Transaction } from "@/modules/transaction/transaction.model";
import { NetWorthService } from "@/modules/net-worth/net-worth.service";
import mongoose from "mongoose";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // 1 = Sun, 7 = Sat in MongoDB

export const AnalyticsService = {
  getSummary: async (userId: string) => {
    const uid = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;
    const currentMonth = now.toISOString().slice(0, 7); // "YYYY-MM"

    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const startOfLastYear = new Date(`${lastYear}-01-01T00:00:00.000Z`);
    const endOfLastYear = new Date(`${lastYear}-12-31T23:59:59.999Z`);
    const startOfMonth = new Date(`${currentMonth}-01T00:00:00.000Z`);

    // ── 1. Aggregation: Current Year Stats ──────────────────────────────────
    const currentYearAgg = await Transaction.aggregate([
      { $match: { user_id: uid, is_deleted: false, date: { $gte: startOfYear } } },
      {
        $facet: {
          monthly: [
            {
              $group: {
                _id: { $month: "$date" },
                income: { $sum: { $cond: [{ $in: ["$type", [TransactionType.INCOME, "refund"]] }, "$amount", 0] } },
                expense: { $sum: { $cond: [{ $eq: ["$type", TransactionType.EXPENSE] }, "$amount", 0] } },
              },
            },
          ],
          heatmap: [
            { $match: { type: TransactionType.EXPENSE } },
            {
              $group: {
                _id: { $dayOfWeek: "$date" }, // 1 (Sun) to 7 (Sat)
                amount: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
          ],
          yearlyTotals: [
            {
              $group: {
                _id: null,
                income: { $sum: { $cond: [{ $in: ["$type", [TransactionType.INCOME, "refund"]] }, "$amount", 0] } },
                expense: { $sum: { $cond: [{ $eq: ["$type", TransactionType.EXPENSE] }, "$amount", 0] } },
              },
            },
          ],
        },
      },
    ]);

    // ── 2. Aggregation: Last Year Totals ──────────────────────────────────
    const lastYearAgg = await Transaction.aggregate([
      { $match: { user_id: uid, is_deleted: false, date: { $gte: startOfLastYear, $lte: endOfLastYear } } },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $in: ["$type", [TransactionType.INCOME, "refund"]] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $eq: ["$type", TransactionType.EXPENSE] }, "$amount", 0] } },
        },
      },
    ]);

    // ── 3. Aggregation: Current Month Stats ──────────────────────────────────
    const currentMonthAgg = await Transaction.aggregate([
      { $match: { user_id: uid, is_deleted: false, date: { $gte: startOfMonth } } },
      {
        $facet: {
          daily: [
            {
              $group: {
                _id: { $dayOfMonth: "$date" },
                income: { $sum: { $cond: [{ $in: ["$type", [TransactionType.INCOME, "refund"]] }, "$amount", 0] } },
                expense: { $sum: { $cond: [{ $eq: ["$type", TransactionType.EXPENSE] }, "$amount", 0] } },
              },
            },
          ],
          categoryBreakdown: [
            { $match: { type: TransactionType.EXPENSE } },
            {
              $group: {
                _id: "$category_id",
                expense: { $sum: "$amount" },
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "category",
              },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                name: { $ifNull: ["$category.name", "Uncategorized"] },
                color: { $ifNull: ["$category.color", "#94A3B8"] },
                expense: 1,
                income: { $literal: 0 },
              },
            },
            { $sort: { expense: -1 } },
            { $limit: 10 },
          ],
          budgetSpent: [
            { $match: { type: TransactionType.EXPENSE } },
            {
              $group: {
                _id: "$category_id",
                total: { $sum: "$amount" },
              },
            },
          ],
        },
      },
    ]);

    // ── Extract Aggregation Results ──────────────────────────────────────────
    const cyData = currentYearAgg[0] || { monthly: [], heatmap: [], yearlyTotals: [] };
    const cyTotals = cyData.yearlyTotals[0] || { income: 0, expense: 0 };
    const lyTotals = lastYearAgg[0] || { income: 0, expense: 0 };
    
    const cmData = currentMonthAgg[0] || { daily: [], categoryBreakdown: [], budgetSpent: [] };

    // ── Format: Monthly Comparison ──────────────────────────────────────────
    const monthlyMap: Record<number, { income: number; expense: number }> = {};
    for (let i = 1; i <= 12; i++) monthlyMap[i] = { income: 0, expense: 0 };
    cyData.monthly.forEach((m: any) => {
      monthlyMap[m._id] = { income: m.income, expense: m.expense };
    });

    const monthlyComparison = MONTH_NAMES.map((month, i) => {
      const data = monthlyMap[i + 1];
      return {
        month,
        income: Math.round(data.income * 100) / 100,
        expense: Math.round(data.expense * 100) / 100,
        net: Math.round((data.income - data.expense) * 100) / 100,
      };
    });

    // ── Format: Yearly Comparison ──────────────────────────────────────────
    const yearlyComparison = {
      currentYear,
      lastYear,
      currentYearIncome: Math.round(cyTotals.income * 100) / 100,
      lastYearIncome: Math.round(lyTotals.income * 100) / 100,
      currentYearExpense: Math.round(cyTotals.expense * 100) / 100,
      lastYearExpense: Math.round(lyTotals.expense * 100) / 100,
    };

    // ── Format: Spending Heatmap ──────────────────────────────────────────
    const dowMap: Record<number, { amount: number; count: number }> = {};
    for (let i = 1; i <= 7; i++) dowMap[i] = { amount: 0, count: 0 };
    cyData.heatmap.forEach((h: any) => {
      dowMap[h._id] = { amount: h.amount, count: h.count };
    });

    const spendingHeatmap = DAY_NAMES.map((day, i) => {
      // MongoDB $dayOfWeek: 1 (Sun) to 7 (Sat). Our array is 0-indexed.
      const data = dowMap[i + 1];
      return {
        day,
        amount: Math.round(data.amount * 100) / 100,
        count: data.count,
      };
    });

    // ── Format: Daily Spending ──────────────────────────────────────────
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyMap: Record<number, { income: number; expense: number }> = {};
    for (let d = 1; d <= daysInMonth; d++) dailyMap[d] = { income: 0, expense: 0 };
    
    cmData.daily.forEach((d: any) => {
      dailyMap[d._id] = { income: d.income, expense: d.expense };
    });

    const dailySpending = Object.entries(dailyMap).map(([date, vals]) => ({
      date,
      expense: Math.round(vals.expense * 100) / 100,
      income: Math.round(vals.income * 100) / 100,
    }));

    // ── Format: Category Breakdown ──────────────────────────────────────────
    const categoryBreakdown = cmData.categoryBreakdown.map((c: any) => ({
      ...c,
      expense: Math.round(c.expense * 100) / 100,
    }));

    // ── Format: Budget Analytics ──────────────────────────────────────────
    const budgets = await Budget.find({ user_id: uid, month_year: currentMonth })
      .populate("category_id", "name color")
      .lean();

    const budgetSpentMap = new Map(
      cmData.budgetSpent.map((r: any) => [r._id?.toString(), r.total])
    );

    const budgetAnalytics = budgets.map((b: any) => {
      const spent = budgetSpentMap.get(b.category_id._id.toString()) ?? 0;
      const pct = Math.round((spent / b.amount) * 100);
      return {
        categoryName: b.category_id.name,
        color: b.category_id.color || "#6366F1",
        budgeted: b.amount,
        spent: Math.round(spent * 100) / 100,
        percentage: Math.min(pct, 100),
        isExceeded: pct > 100,
      };
    });

    // ── Format: Goal Analytics ────────────────────────────────────────────
    const goals = await Goal.find({ user_id: uid }).lean();
    const goalAnalytics = goals.map((g) => ({
      title: g.title,
      category: g.category,
      current: g.current_amount,
      target: g.target_amount,
      percentage: Math.min(100, Math.round((g.current_amount / g.target_amount) * 100)),
      status: g.status,
    }));

    // ── Format: KPI & Net Worth Data ──────────────────────────────────────
    const currentNetWorthData = await NetWorthService.calculateCurrentNetWorth(userId);
    const netWorthHistory = await NetWorthService.getNetWorthHistory(userId, { days: 90 });
    
    const totalIncomeYear = Math.round(cyTotals.income * 100) / 100;
    const totalExpenseYear = Math.round(cyTotals.expense * 100) / 100;
    const netSavings = Math.round((cyTotals.income - cyTotals.expense) * 100) / 100;
    const savingsRate = cyTotals.income > 0 ? Math.round((netSavings / cyTotals.income) * 100) : 0;
    
    const assetDistribution = [
      { name: "Cash", value: currentNetWorthData.breakdown.assets.cash, color: "#10B981" },
      { name: "Physical Assets", value: currentNetWorthData.breakdown.assets.physical_assets, color: "#8B5CF6" },
      { name: "Investments", value: currentNetWorthData.breakdown.assets.investments, color: "#3B82F6" },
      { name: "Money Lent", value: currentNetWorthData.breakdown.assets.money_lent, color: "#F59E0B" }
    ].filter(a => a.value > 0);

    const liabilityDistribution = [
      { name: "Money Borrowed", value: currentNetWorthData.breakdown.liabilities.money_borrowed, color: "#EF4444" },
      { name: "Remaining EMIs", value: currentNetWorthData.breakdown.liabilities.emi_remaining, color: "#F97316" }
    ].filter(a => a.value > 0);

    const netWorthTrend = netWorthHistory.map((h: any) => {
      const d = new Date(h.date);
      return {
        date: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
        netWorth: h.net_worth
      };
    });

    // ── Format: Cash Flow Forecast (Next 30 Days) ─────────────────────────
    const forecast: Array<{ date: string; projectedBalance: number }> = [];
    let projectedBalance = netWorth;
    
    const upcomingBills = await Bill.find({
      user_id: uid,
      status: "unpaid",
      due_date: { $gte: now },
    }).lean();

    const billMap = new Map<string, number>();
    for (const b of upcomingBills) {
      if (!b.due_date) continue;
      const d = new Date(b.due_date);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      billMap.set(key, (billMap.get(key) || 0) + (b.amount || 0));
    }

    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dStr = `${d.getMonth() + 1}/${d.getDate()}`;
      
      const dailyBills = billMap.get(dStr) || 0;
      projectedBalance -= dailyBills;
      
      forecast.push({
        date: dStr,
        projectedBalance: Math.round(projectedBalance * 100) / 100,
      });
    }

    return {
      monthlyComparison,
      yearlyComparison,
      spendingHeatmap,
      dailySpending,
      categoryBreakdown,
      budgetAnalytics,
      goalAnalytics,
      cashFlowForecast: forecast,
      assetDistribution,
      liabilityDistribution,
      netWorthTrend,
      kpi: {
        totalIncomeYear,
        totalExpenseYear,
        netSavings,
        savingsRate,
        netWorth: currentNetWorthData.net_worth,
      },
    };
  },
};
