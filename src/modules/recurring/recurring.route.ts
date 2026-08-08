import { auth } from "../../middlewares/auth.middleware";
import { Router } from "express";
import { RecurringController } from "./recurring.controller";

const router = Router();

router.post("/", auth, RecurringController.create);
router.get("/", auth, RecurringController.getAll);
router.patch("/:id", auth, RecurringController.update);
router.patch("/:id/toggle", auth, RecurringController.toggleStatus);
router.delete("/:id", auth, RecurringController.delete);

export const RecurringRoutes = router;
