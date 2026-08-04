import { Router } from "express";
import { RecurringController } from "./recurring.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", RecurringController.create);
router.get("/", RecurringController.getAll);
router.patch("/:id", RecurringController.update);
router.patch("/:id/toggle", RecurringController.toggleStatus);
router.delete("/:id", RecurringController.delete);

export const RecurringRoutes = router;
