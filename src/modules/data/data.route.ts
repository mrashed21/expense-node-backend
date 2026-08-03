import { checkAuth } from "@/middlewares/auth.middleware";
import { UserRole } from "@/modules/user/user.interface";
import { Router } from "express";
import { DataController } from "./data.controller";

const router = Router();
router.use(checkAuth(UserRole.USER));

router.get("/search", DataController.searchData);
router.get("/backup", DataController.exportBackup);
router.post("/restore", DataController.restoreBackup);

export const dataRoutes = router;
