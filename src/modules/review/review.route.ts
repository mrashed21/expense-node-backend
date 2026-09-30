import { Router } from "express";
import { checkAdminAuth, checkAuth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { ReviewController } from "./review.controller";
import { createReviewSchema } from "./review.validation";

const router = Router();

router.post(
  "/",
  checkAuth(),
  validateRequest(createReviewSchema),
  ReviewController.createReview,
);

router.get("/my-reviews", checkAuth(), ReviewController.getMyReviews);
router.delete("/:id", checkAuth(), ReviewController.deleteReview);

// Public — approved reviews for landing page
router.get("/", ReviewController.getApprovedReviews);

// Admin routes
router.get("/admin", checkAdminAuth(), ReviewController.getAdminReviews);
router.patch(
  "/admin/:id/approve",
  checkAdminAuth(),
  ReviewController.approveReview,
);
router.patch(
  "/admin/:id/reject",
  checkAdminAuth(),
  ReviewController.rejectReview,
);
router.delete(
  "/admin/:id",
  checkAdminAuth(),
  ReviewController.adminDeleteReview,
);

export const ReviewRoutes = router;
