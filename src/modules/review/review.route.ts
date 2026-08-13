import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { ReviewController } from "./review.controller";
import { createReviewSchema } from "./review.validation";

const router = Router();

router.post(
  "/",
  checkAuth(),
  validateRequest(createReviewSchema),
  ReviewController.createReview
);

router.get("/my-reviews", checkAuth(), ReviewController.getMyReviews);
router.delete("/:id", checkAuth(), ReviewController.deleteReview);

router.get("/", ReviewController.getApprovedReviews);

export const ReviewRoutes = router;
