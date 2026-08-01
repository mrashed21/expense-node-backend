import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { checkAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { categorySchema } from "../validators/financial.validator";

const router = Router();

router.use(checkAuth());

router.get("/", CategoryController.getUserCategories);
router.post("/", validateRequest(categorySchema), CategoryController.createCategory);
router.patch("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

export const categoryRoutes = router;
