import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { checkAuth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { transactionSchema } from "./transaction.validation";

const router = Router();

router.use(checkAuth());

router.post("/", validateRequest(transactionSchema), TransactionController.createTransaction);
router.get("/", TransactionController.getTransactions);
router.delete("/:id", TransactionController.deleteTransaction);

export const transactionRoutes = router;
