import ApiError from "../../helpers/api-error";
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
      $or: [
        { user_id: userId, is_deleted: false },
        { is_default: true, is_deleted: false },
      ],
    })
      .sort({ name: 1 })
      .lean();

    const globalCategories = categories.filter((c) => c.is_default);

    if (globalCategories.length === 0) {
      const defaults = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        is_default: true,
      }));
      const docs = await Category.insertMany(defaults);
      const newGlobalCategories = docs.map((d) => d.toObject()) as any;
      categories = [...categories, ...newGlobalCategories];
      // Sort again after merging
      categories.sort((a, b) => a.name.localeCompare(b.name));
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

  updateCategory: async (user: any, categoryId: string, payload: any) => {
    const category = await Category.findOne({
      _id: categoryId,
      is_deleted: false,
    });
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
    }

    if (category.is_default && user.user_role !== "admin") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Only admins can edit global categories.",
      );
    }

    if (
      !category.is_default &&
      category.user_id?.toString() !== user._id.toString()
    ) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to edit this category.",
      );
    }

    Object.assign(category, payload);
    await category.save();
    return category;
  },

  deleteCategory: async (user: any, categoryId: string) => {
    const category = await Category.findOne({
      _id: categoryId,
      is_deleted: false,
    });
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
    }

    if (category.is_default && user.user_role !== "admin") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Only admins can delete global categories.",
      );
    }

    if (
      !category.is_default &&
      category.user_id?.toString() !== user._id.toString()
    ) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to delete this category.",
      );
    }

    category.is_deleted = true;
    await category.save();
    return true;
  },
};
