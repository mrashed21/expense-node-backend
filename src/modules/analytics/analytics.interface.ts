export interface IAnalyticsSummary {
  monthlyComparison: Array<{
    month: string;
    income: number;
    expense: number;
    net: number;
  }>;

  yearlyComparison: {
    currentYear: number;
    lastYear: number;
    currentYearIncome: number;
    lastYearIncome: number;
    currentYearExpense: number;
    lastYearExpense: number;
  };

  spendingHeatmap: Array<{ day: string; amount: number; count: number }>;

  dailySpending: Array<{ date: string; expense: number; income: number }>;

  categoryBreakdown: Array<{
    name: string;
    color: string;
    expense: number;
    income: number;
  }>;
  budgetAnalytics: Array<{
    categoryName: string;
    color: string;
    budgeted: number;
    spent: number;
    percentage: number;
    isExceeded: boolean;
  }>;
  goalAnalytics: Array<{
    title: string;
    category: string;
    current: number;
    target: number;
    percentage: number;
    status: string;
  }>;
  cashFlowForecast: Array<{ date: string; projectedBalance: number }>;

  kpi: {
    totalIncomeYear: number;
    totalExpenseYear: number;
    netSavings: number;
    savingsRate: number;
    netWorth: number;
  };
  assetDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  liabilityDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  netWorthTrend: Array<{
    date: string;
    netWorth: number;
  }>;
}
