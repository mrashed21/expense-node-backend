import { z } from "zod";

export const createFeedbackSchema = z.object({
  body: z.object({
    subject: z.string({
      required_error: "Subject is required",
    }),
    message: z.string({
      required_error: "Message is required",
    }),
  }),
});

export const replyFeedbackSchema = z.object({
  body: z.object({
    admin_reply: z.string({
      required_error: "Reply message is required",
    }).min(1, "Reply message cannot be empty"),
  }),
});
