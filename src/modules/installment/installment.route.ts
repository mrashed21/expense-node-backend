import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { InstallmentController } from "./installment.controller";
import {
  addInstallmentPaymentSchema,
  createInstallmentSchema,
  updateInstallmentSchema,
} from "./installment.validation";

const router = Router();

router.post(
  "/",
  auth,
  validateRequest(createInstallmentSchema),
  InstallmentController.createInstallment,
);

router.get("/", auth, InstallmentController.getInstallments);

router.get("/:id", auth, InstallmentController.getInstallmentById);

router.patch(
  "/:id",
  auth,
  validateRequest(updateInstallmentSchema),
  InstallmentController.updateInstallment,
);

router.delete("/:id", auth, InstallmentController.deleteInstallment);

router.post(
  "/:id/payments",
  auth,
  validateRequest(addInstallmentPaymentSchema),
  InstallmentController.addPayment,
);

export const installmentRoutes = router;
