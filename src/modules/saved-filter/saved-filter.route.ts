import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { UserRole } from "../../modules/user/user.interface";
import { SavedFilterController } from "./saved-filter.controller";

const router = Router();
router.use(checkAuth(UserRole.USER));

router.post("/", SavedFilterController.createFilter);
router.get("/", SavedFilterController.getFilters);
router.delete("/:id", SavedFilterController.deleteFilter);

export const savedFilterRoutes = router;
