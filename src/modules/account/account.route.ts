import { Router } from "express";

import { checkAuth } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import { AccountController } from "./account.controller";
import { accountSchema } from "./account.validation";

const router = Router();

router.use(checkAuth());

router.post(
  "/",
  validateRequest(accountSchema),
  AccountController.createAccount,
);
router.get("/", AccountController.getUserAccounts);
router.get("/:id", AccountController.getAccountById);
router.patch("/:id", AccountController.updateAccount);
router.delete("/:id", AccountController.deleteAccount);

export const accountRoutes = router;
