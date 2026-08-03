import ApiError from "@/helpers/api-error";
import httpStatus from "http-status";
import { Types } from "mongoose";
import { CategoryType } from "./category.interface";
import { Category } from "./category.model";

const DEFAULT_CATEGORIES = [
  {
    name: "Food",
    type: CategoryType.EXPENSE,
    icon: "Utensils",
    color: "#EF4444",
  },
  {
    name: "Shopping",
    type: CategoryType.EXPENSE,
    icon: "ShoppingBag",
    color: "#F59E0B",
  },
  {
    name: "Medicine",
    type: CategoryType.EXPENSE,
    icon: "Pill",
    color: "#10B981",
  },
  {
    name: "Transport",
    type: CategoryType.EXPENSE,
    icon: "Car",
    color: "#3B82F6",
  },
  {
    name: "Travel",
    type: CategoryType.EXPENSE,
    icon: "Plane",
    color: "#6366F1",
  },
  {
    name: "Education",
    type: CategoryType.EXPENSE,
    icon: "GraduationCap",
    color: "#8B5CF6",
  },
  {
    name: "Bills",
    type: CategoryType.EXPENSE,
    icon: "FileText",
    color: "#EC4899",
  },
  {
    name: "Entertainment",
    type: CategoryType.EXPENSE,
    icon: "Film",
    color: "#F43F5E",
  },
  { name: "Gift", type: CategoryType.EXPENSE, icon: "Gift", color: "#D97706" },
  {
    name: "Family",
    type: CategoryType.EXPENSE,
    icon: "Users",
    color: "#14B8A6",
  },
  {
    name: "Investment",
    type: CategoryType.EXPENSE,
    icon: "TrendingUp",
    color: "#06B6D4",
  },
  {
    name: "Business",
    type: CategoryType.EXPENSE,
    icon: "Briefcase",
    color: "#64748B",
  },
  {
    name: "Salary",
    type: CategoryType.INCOME,
    icon: "DollarSign",
    color: "#22C55E",
  },
  {
    name: "Freelance",
    type: CategoryType.INCOME,
    icon: "Laptop",
    color: "#0EA5E9",
  },
  {
    name: "Others",
    type: CategoryType.EXPENSE,
    icon: "Grid",
    color: "#94A3B8",
  },
];

export const CategoryService = {
  getUserCategories: async (userId: string) => {
    let categories = await Category.find({
      user_id: userId,
      is_deleted: false,
    }).sort({ name: 1 }).lean();

    if (categories.length === 0) {
      const defaults = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        user_id: new Types.ObjectId(userId),
        is_default: true,
      }));
      const docs = await Category.insertMany(defaults);
      categories = docs.map(d => d.toObject()) as any;
    }

    return categories;
  },

  createCategory: async (userId: string, payload: any) => {
    return Category.create({
      ...payload,
      user_id: new Types.ObjectId(userId),
      is_default: false,
    });
  },

  updateCategory: async (userId: string, categoryId: string, payload: any) => {
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, user_id: userId, is_deleted: false },
      payload,
      { new: true },
    );
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
    }
    return category;
  },

  deleteCategory: async (userId: string, categoryId: string) => {
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, user_id: userId, is_deleted: false },
      { is_deleted: true },
      { new: true },
    );
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
    }
    return true;
  },
};
