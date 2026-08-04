import { Router } from "express";
import { SearchController } from "./search.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", SearchController.globalSearch);

export const SearchRoutes = router;
