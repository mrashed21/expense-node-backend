import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rating: z
      .number({
        required_error: "Rating is required",
      })
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot be more than 5"),
    comment: z
      .string({
        required_error: "Comment is required",
      })
      .min(3, "Comment must be at least 3 characters"),
  }),
});
