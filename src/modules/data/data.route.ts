import { authGuard } from "@/middlewares/auth";
import { UserRole } from "@/modules/user/user.interface";
import express from "express";
import { DataController } from "./data.controller";

const router = express.Router();

router.get(
  "/backup",
  authGuard(UserRole.USER),
  DataController.exportBackup
);

router.post(
  "/restore",
  authGuard(UserRole.USER),
  DataController.restoreBackup
);

export const dataRoutes = router;
