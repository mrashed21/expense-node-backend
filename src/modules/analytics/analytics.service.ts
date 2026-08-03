import { Account } from "@/modules/account/account.model";
import { Bill } from "@/modules/bill/bill.model";
import { Budget } from "@/modules/budget/budget.model";
import { Goal } from "@/modules/goal/goal.model";
import { TransactionType } from "@/modules/transaction/transaction.interface";
import { Transaction } from "@/modules/transaction/transaction.model";
import mongoose from "mongoose";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const AnalyticsService = {
  getSummary: async (userId: string) => {
    const uid = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;
    const currentMonth = now.toISOString().slice(0, 7); // "YYYY-MM"

    // ── 1. All transactions for the current year ──────────────────────────
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const startOfLastYear = new Date(`${lastYear}-01-01T00:00:00.000Z`);
    const endOfLastYear = new Date(`${lastYear}-12-31T23:59:59.999Z`);

    const [thisYearTxns, lastYearTxns] = await Promise.all([
      Transaction.find({
        user_id: uid,
        is_deleted: false,
        date: { $gte: startOfYear },
      }).lean(),
      Transaction.find({
        user_id: uid,
        is_deleted: false,
        date: { $gte: startOfLastYear, $lte: endOfLastYear },
      }).lean(),
    ]);

    // ── 2. Monthly comparison ──────────────────────────────────────────────
    const monthlyMap: Record<number, { income: number; expense: number }> = {};
    for (let i = 0; i < 12; i++) monthlyMap[i] = { income: 0, expense: 0 };

    for (const tx of thisYearTxns) {
      const m = new Date(tx.date).getMonth();
      if (tx.type === TransactionType.INCOME || tx.type === "refund") {
        monthlyMap[m].income += tx.amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        monthlyMap[m].expense += tx.amount;
      }
    }

    const monthlyComparison = MONTH_NAMES.map((month, i) => ({
      month,
      income: Math.round(monthlyMap[i].income * 100) / 100,
      expense: Math.round(monthlyMap[i].expense * 100) / 100,
      net: Math.round((monthlyMap[i].income - monthlyMap[i].expense) * 100) / 100,
    }));

    // ── 3. Yearly comparison ──────────────────────────────────────────────
    const aggYear = (txns: any[]) =>
      txns.reduce(
        (acc, tx) => {
          if (tx.type === TransactionType.INCOME || tx.type === "refund")
            acc.income += tx.amount;
          else if (tx.type === TransactionType.EXPENSE)
            acc.expense += tx.amount;
          return acc;
        },
        { income: 0, expense: 0 },
      );

    const cyAgg = aggYear(thisYearTxns);
    const lyAgg = aggYear(lastYearTxns);

    const yearlyComparison = {
      currentYear,
      lastYear,
      currentYearIncome: Math.round(cyAgg.income * 100) / 100,
      lastYearIncome: Math.round(lyAgg.income * 100) / 100,
      currentYearExpense: Math.round(cyAgg.expense * 100) / 100,
      lastYearExpense: Math.round(lyAgg.expense * 100) / 100,
    };

    // ── 4. Day-of-week heatmap (all-time for current year) ────────────────
    const dowMap: Record<number, { amount: number; count: number }> = {};
    for (let i = 0; i < 7; i++) dowMap[i] = { amount: 0, count: 0 };

    for (const tx of thisYearTxns) {
      if (tx.type === TransactionType.EXPENSE) {
        const dow = new Date(tx.date).getDay();
        dowMap[dow].amount += tx.amount;
        dowMap[dow].count += 1;
      }
    }

    const spendingHeatmap = DAY_NAMES.map((day, i) => ({
      day,
      amount: Math.round(dowMap[i].amount * 100) / 100,
      count: dowMap[i].count,
    }));

    // ── 5. Daily spending for current month ──────────────────────────────
    const startOfMonth = new Date(`${currentMonth}-01T00:00:00.000Z`);
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();

    const dailyMap: Record<string, { expense: number; income: number }> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${d}`;
      dailyMap[key] = { expense: 0, income: 0 };
    }

    for (const tx of thisYearTxns) {
      const d = new Date(tx.date);
      if (d < startOfMonth) continue;
      const key = `${d.getDate()}`;
      if (tx.type === TransactionType.EXPENSE) dailyMap[key].expense += tx.amount;
      else if (tx.type === TransactionType.INCOME || tx.type === "refund")
        dailyMap[key].income += tx.amount;
    }

    const dailySpending = Object.entries(dailyMap).map(([date, vals]) => ({
      date,
      expense: Math.round(vals.expense * 100) / 100,
      income: Math.round(vals.income * 100) / 100,
    }));

    // ── 6. Category breakdown (current month expenses) ────────────────────
    const monthTxns = thisYearTxns.filter(
      (tx) =>
        tx.type === TransactionType.EXPENSE &&
        new Date(tx.date) >= startOfMonth,
    );

    const catMap: Record<string, { name: string; color: string; expense: number; income: number }> = {};
    for (const tx of monthTxns) {
      const catId = tx.category_id?.toString() || "uncategorized";
      if (!catMap[catId]) {
        catMap[catId] = {
          name: "Uncategorized",
          color: "#94A3B8",
          expense: 0,
          income: 0,
        };
      }
      catMap[catId].expense += tx.amount;
    }

    // Populate category names via populate on a thin query
    const categoryBreakdownRaw = await Transaction.find({
      user_id: uid,
      is_deleted: false,
      type: TransactionType.EXPENSE,
      date: { $gte: startOfMonth },
    })
      .populate("category_id", "name color")
      .lean();

    const catMapPopulated: Record<string, { name: string; color: string; expense: number }> = {};
    for (const tx of categoryBreakdownRaw) {
      const cat = tx.category_id as any;
      const key = cat?._id?.toString() || "uncategorized";
      if (!catMapPopulated[key]) {
        catMapPopulated[key] = {
          name: cat?.name || "Uncategorized",
          color: cat?.color || "#94A3B8",
          expense: 0,
        };
      }
      catMapPopulated[key].expense += tx.amount;
    }

    const categoryBreakdown = Object.values(catMapPopulated)
      .map((c) => ({ ...c, income: 0, expense: Math.round(c.expense * 100) / 100 }))
      .sort((a, b) => b.expense - a.expense)
      .slice(0, 10);

    // ── 7. Budget analytics ────────────────────────────────────────────────
    const budgets = await Budget.find({
      user_id: uid,
      month_year: currentMonth,
    })
      .populate("category_id", "name color")
      .lean();

    const budgetSpentResult = await Transaction.aggregate([
      {
        $match: {
          user_id: uid,
          is_deleted: false,
          type: TransactionType.EXPENSE,
          date: { $gte: startOfMonth },
        },
      },
      { $group: { _id: "$category_id", total: { $sum: "$amount" } } },
    ]);

    const budgetSpentMap = new Map(
      budgetSpentResult.map((r) => [r._id.toString(), r.total]),
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

    // ── 8. Goal analytics ─────────────────────────────────────────────────
    const goals = await Goal.find({ user_id: uid }).lean();

    const goalAnalytics = goals.map((g) => ({
      title: g.title,
      category: g.category,
      current: g.current_amount,
      target: g.target_amount,
      percentage: Math.min(
        100,
        Math.round((g.current_amount / g.target_amount) * 100),
      ),
      status: g.status,
    }));

    // ── 9. KPI ─────────────────────────────────────────────────────────────
    const accounts = await Account.find({ user_id: uid }).lean();
    const netWorth = accounts.reduce((s, a) => s + (a.current_balance || 0), 0);
    const totalIncomeYear = Math.round(cyAgg.income * 100) / 100;
    const totalExpenseYear = Math.round(cyAgg.expense * 100) / 100;
    const netSavings = Math.round((cyAgg.income - cyAgg.expense) * 100) / 100;
    const savingsRate =
      cyAgg.income > 0
        ? Math.round((netSavings / cyAgg.income) * 100)
        : 0;

    // ── 10. Cash Flow Forecast (Next 30 Days) ──────────────────────────────
    const forecast: Array<{ date: string; projectedBalance: number }> = [];
    let projectedBalance = netWorth;
    
    // Find upcoming pending bills
    const upcomingBills = await Bill.find({
      user_id: uid,
      status: "pending",
      due_date: { $gte: now },
    }).lean();

    // Group bills by date string "MM/DD" for O(1) lookup
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
      
      // Deduct any bills due on this day
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
      kpi: {
        totalIncomeYear,
        totalExpenseYear,
        netSavings,
        savingsRate,
        netWorth: Math.round(netWorth * 100) / 100,
      },
    };
  },
};
