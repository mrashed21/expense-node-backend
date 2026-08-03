import { checkAuth } from "@/middlewares/auth.middleware";
import { UserRole } from "@/modules/user/user.interface";
import { Router } from "express";
import { DebtController } from "./debt.controller";

const router = Router();
router.use(checkAuth(UserRole.USER));

router.post("/", DebtController.createDebt);
router.get("/", DebtController.getDebts);
router.patch("/:id", DebtController.updateDebt);
router.delete("/:id", DebtController.deleteDebt);

export const debtRoutes = router;
