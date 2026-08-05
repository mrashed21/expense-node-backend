export interface IAnalyticsSummary {
  /** Monthly income/expense for the current year (12 rows) */
  monthlyComparison: Array<{
    month: string;
    income: number;
    expense: number;
    net: number;
  }>;
  /** Yearly totals: current year vs last year */
  yearlyComparison: {
    currentYear: number;
    lastYear: number;
    currentYearIncome: number;
    lastYearIncome: number;
    currentYearExpense: number;
    lastYearExpense: number;
  };
  /** Day-of-week spending heatmap (0=Sun..6=Sat) */
  spendingHeatmap: Array<{ day: string; amount: number; count: number }>;
  /** Daily spending for current month */
  dailySpending: Array<{ date: string; expense: number; income: number }>;
  /** Category breakdown for the current month */
  categoryBreakdown: Array<{
    name: string;
    color: string;
    expense: number;
    income: number;
  }>;
  /** Budget analytics: this month's budget vs spent per category */
  budgetAnalytics: Array<{
    categoryName: string;
    color: string;
    budgeted: number;
    spent: number;
    percentage: number;
    isExceeded: boolean;
  }>;
  /** Goal analytics */
  goalAnalytics: Array<{
    title: string;
    category: string;
    current: number;
    target: number;
    percentage: number;
    status: string;
  }>;
  /** Cash Flow Forecast for next 30 days */
  cashFlowForecast: Array<{ date: string; projectedBalance: number }>;
  /** Top KPIs */
  kpi: {
    totalIncomeYear: number;
    totalExpenseYear: number;
    netSavings: number;
    savingsRate: number;
    netWorth: number;
  };
  /** Asset Distribution */
  assetDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  /** Liability Distribution */
  liabilityDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  /** Net Worth Trend */
  netWorthTrend: Array<{
    date: string;
    netWorth: number;
  }>;
}
