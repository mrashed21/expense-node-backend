import { Router } from "express";
import { SearchController } from "./search.controller";
import { auth } from "@/middlewares/auth.middleware";

const router = Router();

router.get("/", auth, SearchController.globalSearch);

export const SearchRoutes = router;
