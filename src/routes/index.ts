import { accountRoutes } from "@/modules/account/account.route";
import { adminAuthRoutes } from "@/modules/admin/admin-auth.route";
import { adminRoutes } from "@/modules/admin/admin.route";
import { analyticsRoutes } from "@/modules/analytics/analytics.route";
import { AssetRoutes } from "@/modules/asset/asset.route";
import { authRoutes } from "@/modules/auth/auth.route";
import { billRoutes } from "@/modules/bill/bill.route";
import { budgetRoutes } from "@/modules/budget/budget.route";
import { categoryRoutes } from "@/modules/category/category.route";
import { dataRoutes } from "@/modules/data/data.route";
import { debtRoutes } from "@/modules/debt/debt.route";
import { goalRoutes } from "@/modules/goal/goal.route";
import { installmentRoutes } from "@/modules/installment/installment.route";
import { InvestmentRoutes } from "@/modules/investment/investment.route";
import { netWorthRoutes } from "@/modules/net-worth/net-worth.route";
import { notificationRoutes } from "@/modules/notification/notification.route";
import { savedFilterRoutes } from "@/modules/saved-filter/saved-filter.route";
import { transactionRoutes } from "@/modules/transaction/transaction.route";
import { transferRoutes } from "@/modules/transfer/transfer.route";
import { userRoutes } from "@/modules/user/user.route";
import { Router } from "express";

const router = Router();

const apiRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/admin/auth", route: adminAuthRoutes },
  { path: "/users", route: userRoutes },
  { path: "/accounts", route: accountRoutes },
  { path: "/categories", route: categoryRoutes },
  { path: "/transactions", route: transactionRoutes },
  { path: "/transfers", route: transferRoutes },
  { path: "/budgets", route: budgetRoutes },
  { path: "/goals", route: goalRoutes },
  { path: "/bills", route: billRoutes },
  { path: "/debts", route: debtRoutes },
  { path: "/saved-filters", route: savedFilterRoutes },
  { path: "/data", route: dataRoutes },
  { path: "/notifications", route: notificationRoutes },
  { path: "/analytics", route: analyticsRoutes },
  { path: "/admin", route: adminRoutes },
  { path: "/assets", route: AssetRoutes },
  { path: "/investments", route: InvestmentRoutes },
  { path: "/installments", route: installmentRoutes },
  { path: "/net-worth", route: netWorthRoutes },
];

apiRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
