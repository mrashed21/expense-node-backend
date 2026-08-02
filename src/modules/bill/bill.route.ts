import { checkAuth } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { BillController } from "./bill.controller";

const router = Router();
router.use(checkAuth());

router.post("/", BillController.createBill);
router.get("/", BillController.getBills);
router.patch("/:id/pay", BillController.payBill);
router.delete("/:id", BillController.deleteBill);

export const billRoutes = router;
