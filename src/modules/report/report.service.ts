import { NetWorthService } from "@/modules/net-worth/net-worth.service";
import { TransactionType } from "@/modules/transaction/transaction.interface";
import { Transaction } from "@/modules/transaction/transaction.model";
import mongoose from "mongoose";

export const ReportService = {
  /**
   * Generates a formal Balance Sheet (Assets = Liabilities + Equity)
   * We will use the NetWorthService as the core engine, as it already calculates
   * exactly what we need for the snapshot.
   */
  generateBalanceSheet: async (userId: string) => {
    const netWorthData = await NetWorthService.calculateCurrentNetWorth(userId);

    // Balance Sheet formalizes Equity = Assets - Liabilities
    // In personal finance, Equity is simply the Net Worth.
    const assets = netWorthData.breakdown.assets;
    const liabilities = netWorthData.breakdown.liabilities;

    return {
      date: new Date(),
      assets: {
        currentAssets: {
          cash: assets.cash,
        },
        nonCurrentAssets: {
          investments: assets.investments,
          physical_assets: assets.physical_assets,
          money_lent: assets.money_lent,
        },
        totalAssets: netWorthData.total_assets,
      },
      liabilities: {
        currentLiabilities: {
          emi_remaining: liabilities.emi_remaining,
        },
        longTermLiabilities: {
          money_borrowed: liabilities.money_borrowed,
        },
        totalLiabilities: netWorthData.total_liabilities,
      },
      equity: {
        retainedEarnings: netWorthData.net_worth,
        totalEquity: netWorthData.net_worth,
      },
      // Verification: Assets should equal Liabilities + Equity
      isBalanced:
        netWorthData.total_assets ===
        netWorthData.total_liabilities + netWorthData.net_worth,
    };
  },

  /**
   * Generates a Cash Flow statement over a specific period.
   * Operations: Income (Salary, Business, etc)
   * Investing: Buying/Selling Assets or Investments
   * Financing: Borrowing Money or Paying Debt
   */
  generateCashFlowReport: async (
    userId: string,
    startDate: Date,
    endDate: Date,
  ) => {
    const uid = new mongoose.Types.ObjectId(userId);

    const transactions = await Transaction.aggregate([
      {
        $match: {
          user_id: uid,
          is_deleted: false,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { type: "$type", category: "$category.name" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const cashFlow = {
      operatingActivities: {
        inflows: [] as any[],
        outflows: [] as any[],
        netCash: 0,
      },
      // Optional enhancements for investing/financing could be parsed from categories,
      // but for V1 we will group into generic Income/Expense.
    };

    let totalIn = 0;
    let totalOut = 0;

    transactions.forEach((tx) => {
      const type = tx._id.type;
      const cat = tx._id.category || "Uncategorized";
      const amount = tx.total;

      if (type === TransactionType.INCOME || type === "refund") {
        cashFlow.operatingActivities.inflows.push({ category: cat, amount });
        totalIn += amount;
      } else if (type === TransactionType.EXPENSE) {
        cashFlow.operatingActivities.outflows.push({ category: cat, amount });
        totalOut += amount;
      }
    });

    cashFlow.operatingActivities.netCash = totalIn - totalOut;

    return {
      period: { start: startDate, end: endDate },
      cashFlow,
      summary: {
        totalInflows: totalIn,
        totalOutflows: totalOut,
        netCashFlow: totalIn - totalOut,
      },
    };
  },

  /**
   * Generates a simplistic Tax Report by identifying "taxable" vs "non-taxable" income
   * and "deductible" expenses.
   */
  generateTaxReport: async (userId: string, year: number) => {
    const uid = new mongoose.Types.ObjectId(userId);
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const transactions = await Transaction.aggregate([
      {
        $match: {
          user_id: uid,
          is_deleted: false,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    ]);

    let taxableIncome = 0;
    let nonTaxableIncome = 0;
    let deductibleExpenses = 0;
    let otherExpenses = 0;

    // For a real-world app, categories would have an `isTaxDeductible` boolean.
    // For V1, we'll do simplistic string matching or treat all income as taxable.
    transactions.forEach((tx) => {
      const amount = tx.amount;
      if (tx.type === TransactionType.INCOME) {
        taxableIncome += amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        const catName = (tx.category?.name || "").toLowerCase();
        if (
          catName.includes("tax") ||
          catName.includes("health") ||
          catName.includes("education") ||
          catName.includes("donation")
        ) {
          deductibleExpenses += amount;
        } else {
          otherExpenses += amount;
        }
      }
    });

    return {
      financialYear: year,
      income: {
        taxable: taxableIncome,
        nonTaxable: nonTaxableIncome,
        total: taxableIncome + nonTaxableIncome,
      },
      deductions: {
        eligibleDeductions: deductibleExpenses,
      },
      estimatedTaxableAmount: Math.max(0, taxableIncome - deductibleExpenses),
    };
  },
};
