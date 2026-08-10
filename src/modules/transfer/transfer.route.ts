import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { TransferController } from "./transfer.controller";
import { transferSchema } from "./transfer.validation";

const router = Router();

router.use(checkAuth());

router.post(
  "/",
  validateRequest(transferSchema),
  TransferController.createTransfer,
);
router.get("/", TransferController.getTransfers);

export const transferRoutes = router;
