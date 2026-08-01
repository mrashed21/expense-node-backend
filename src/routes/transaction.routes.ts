import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";
import { checkAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { transactionSchema } from "../validators/financial.validator";

const router = Router();

router.use(checkAuth());

router.post("/", validateRequest(transactionSchema), TransactionController.createTransaction);
router.get("/", TransactionController.getTransactions);
router.delete("/:id", TransactionController.deleteTransaction);

export const transactionRoutes = router;
