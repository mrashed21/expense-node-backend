import { z } from "zod";
import { CategoryType } from "./category.interface";

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required"),
    type: z.nativeEnum(CategoryType),
    parent_id: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
  }),
});
