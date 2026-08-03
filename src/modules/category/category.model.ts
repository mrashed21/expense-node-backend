import { Schema, model } from "mongoose";
import { CategoryType, ICategoryDocument } from "./category.interface";

const categorySchema = new Schema<ICategoryDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parent_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(CategoryType),
      required: true,
    },
    icon: {
      type: String,
      default: "Grid",
    },
    color: {
      type: String,
      default: "#6366F1",
    },
    is_default: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

categorySchema.index({ user_id: 1, type: 1, is_deleted: 1 });
categorySchema.index(
  { user_id: 1, name: 1, type: 1 },
  { unique: true, partialFilterExpression: { is_deleted: false } }
);

export const Category = model<ICategoryDocument>("Category", categorySchema);
