import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { accountRoutes } from "../modules/account/account.route";
import { categoryRoutes } from "../modules/category/category.route";
import { transactionRoutes } from "../modules/transaction/transaction.route";
import { transferRoutes } from "../modules/transfer/transfer.route";
import { budgetRoutes } from "../modules/budget/budget.route";
import { goalRoutes } from "../modules/goal/goal.route";
import { billRoutes } from "../modules/bill/bill.route";
import { notificationRoutes } from "../modules/notification/notification.route";

const router = Router();

const apiRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/users", route: userRoutes },
  { path: "/accounts", route: accountRoutes },
  { path: "/categories", route: categoryRoutes },
  { path: "/transactions", route: transactionRoutes },
  { path: "/transfers", route: transferRoutes },
  { path: "/budgets", route: budgetRoutes },
  { path: "/goals", route: goalRoutes },
  { path: "/bills", route: billRoutes },
  { path: "/notifications", route: notificationRoutes },
];

apiRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
