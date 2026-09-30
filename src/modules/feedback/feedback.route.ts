import { Router } from "express";
import { checkAdminAuth, checkAuth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { FeedbackController } from "./feedback.controller";
import {
  createFeedbackSchema,
  replyFeedbackSchema,
} from "./feedback.validation";

const router = Router();

router.post(
  "/",
  checkAuth(),
  validateRequest(createFeedbackSchema),
  FeedbackController.createFeedback,
);

router.get("/my-feedbacks", checkAuth(), FeedbackController.getMyFeedbacks);
router.delete("/:id", checkAuth(), FeedbackController.deleteFeedback);

router.get("/admin", checkAdminAuth(), FeedbackController.getAdminFeedbacks);

router.patch(
  "/admin/:id/review",
  checkAdminAuth(),
  FeedbackController.markAsReviewed,
);

router.patch(
  "/admin/:id/reply",
  checkAdminAuth(),
  validateRequest(replyFeedbackSchema),
  FeedbackController.replyToFeedback,
);

export const FeedbackRoutes = router;
