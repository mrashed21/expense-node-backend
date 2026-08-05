import { Schema, model } from "mongoose";
import { CategoryType, ICategoryDocument } from "./category.interface";

const categorySchema = new Schema<ICategoryDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
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
      default: "#4F46E5",
    },
    is_tax_deductible: {
      type: Boolean,
      default: false,
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

categorySchema.index({ type: 1, is_deleted: 1, is_default: 1 });
categorySchema.index(
  { user_id: 1, name: 1, type: 1 },
  { unique: true, partialFilterExpression: { is_deleted: false, user_id: { $type: "objectId" } } }
);

export const Category = model<ICategoryDocument>("Category", categorySchema);
