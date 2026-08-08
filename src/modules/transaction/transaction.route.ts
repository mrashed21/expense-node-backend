import { checkAuth } from "../../middlewares/auth.middleware";
import { Router } from "express";
import { TransactionController } from "./transaction.controller";

const router = Router();

router.use(checkAuth());

router.post("/", TransactionController.createTransaction);
router.get("/", TransactionController.getTransactions);
router.post("/bulk-delete", TransactionController.bulkDeleteTransactions);
router.patch("/bulk-edit", TransactionController.bulkEditTransactions);
router.post("/bulk-restore", TransactionController.bulkRestoreTransactions);
router.get("/:id", TransactionController.getTransactionById);
router.patch("/:id", TransactionController.updateTransaction);
router.delete("/:id", TransactionController.deleteTransaction);
router.post("/:id/restore", TransactionController.restoreTransaction);

export const transactionRoutes = router;
