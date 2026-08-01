import { Router } from "express";
import { AccountController } from "../controllers/account.controller";
import { checkAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { accountSchema } from "../validators/financial.validator";

const router = Router();

router.use(checkAuth());

router.post("/", validateRequest(accountSchema), AccountController.createAccount);
router.get("/", AccountController.getUserAccounts);
router.get("/:id", AccountController.getAccountById);
router.patch("/:id", AccountController.updateAccount);
router.delete("/:id", AccountController.deleteAccount);

export const accountRoutes = router;
