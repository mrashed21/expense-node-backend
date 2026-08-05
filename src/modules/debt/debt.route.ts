import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { DebtController } from "./debt.controller";
import {
  addPaymentSchema,
  createDebtSchema,
  updateDebtSchema,
} from "./debt.validation";

const router = Router();

router.post(
  "/",
  auth,
  validateRequest(createDebtSchema),
  DebtController.createDebt,
);

router.get("/", auth, DebtController.getDebts);

router.get("/:id", auth, DebtController.getDebtById);

router.patch(
  "/:id",
  auth,
  validateRequest(updateDebtSchema),
  DebtController.updateDebt,
);

router.delete("/:id", auth, DebtController.deleteDebt);

router.post(
  "/:id/payments",
  auth,
  validateRequest(addPaymentSchema),
  DebtController.addPayment,
);

export const debtRoutes = router;
