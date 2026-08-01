import { Router } from "express";
import { BillController } from "../controllers/bill.controller";
import { checkAuth } from "../middlewares/auth.middleware";

const router = Router();
router.use(checkAuth());

router.post("/", BillController.createBill);
router.get("/", BillController.getBills);
router.patch("/:id/pay", BillController.payBill);
router.delete("/:id", BillController.deleteBill);

export const billRoutes = router;
