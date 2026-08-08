import { auth } from "../../middlewares/auth.middleware";
import { Router } from "express";
import { SearchController } from "./search.controller";

const router = Router();

router.get("/", auth, SearchController.globalSearch);

export const SearchRoutes = router;
