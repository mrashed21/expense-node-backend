import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { DpsFdrController } from "./dps-fdr.controller";
import { createDpsFdrSchema, updateDpsFdrSchema } from "./dps-fdr.validation";

const router = Router();
router.use(auth);
router.get("/", DpsFdrController.list);
router.post("/", validateRequest(createDpsFdrSchema), DpsFdrController.create);
router.patch("/:id", validateRequest(updateDpsFdrSchema), DpsFdrController.update);
router.post("/:id/pay", DpsFdrController.pay);
router.post("/:id/close", DpsFdrController.close);
export const dpsFdrRoutes = router;
