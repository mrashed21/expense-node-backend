import { validateRequest } from "@/middlewares/validate-request.middleware";
import { checkAuth } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { BillController } from "./bill.controller";
import { createBillSchema, payBillSchema } from "./bill.validation";

const router = Router();
router.use(checkAuth());

router.post("/", validateRequest(createBillSchema), BillController.createBill);
router.get("/", BillController.getBills);
router.patch("/:id/pay", validateRequest(payBillSchema), BillController.payBill);
router.delete("/:id", BillController.deleteBill);

export const billRoutes = router;
