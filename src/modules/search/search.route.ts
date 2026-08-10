import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware";
import { SearchController } from "./search.controller";

const router = Router();

router.get("/", auth, SearchController.globalSearch);

export const SearchRoutes = router;
