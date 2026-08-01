import { Router } from "express";
import { TransferController } from "../controllers/transfer.controller";
import { checkAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { transferSchema } from "../validators/financial.validator";

const router = Router();

router.use(checkAuth());

router.post("/", validateRequest(transferSchema), TransferController.createTransfer);
router.get("/", TransferController.getTransfers);

export const transferRoutes = router;
