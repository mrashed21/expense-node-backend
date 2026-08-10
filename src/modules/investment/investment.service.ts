import httpStatus from "http-status";
import ApiError from "../../helpers/api-error";
import { Investment } from "./investment.model";

export const InvestmentService = {
  createInvestment: async (userId: string, payload: any) => {
    return Investment.create({
      ...payload,
      user_id: userId,
    });
  },

  getInvestments: async (
    userId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
    },
  ) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: any = { user_id: userId, is_deleted: false };

    if (query.type && query.type !== "all") {
      filter.type = query.type;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { symbol: { $regex: query.search, $options: "i" } },
      ];
    }

    const total = await Investment.countDocuments(filter);

    const allInvestments = await Investment.find(filter).lean();
    let totalInvested = 0;
    let totalCurrentValue = 0;

    allInvestments.forEach((inv) => {
      totalInvested += inv.purchase_price * inv.quantity;
      totalCurrentValue += inv.current_price * inv.quantity;
    });
    const totalPnL = totalCurrentValue - totalInvested;

    const investments = await Investment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        metrics: {
          totalInvested,
          totalCurrentValue,
          totalPnL,
        },
      },
      data: investments,
    };
  },

  getInvestmentById: async (userId: string, investmentId: string) => {
    const investment = await Investment.findOne({
      _id: investmentId,
      user_id: userId,
      is_deleted: false,
    }).lean();
    if (!investment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Investment not found.");
    }
    return investment;
  },

  updateInvestment: async (
    userId: string,
    investmentId: string,
    payload: any,
  ) => {
    const investment = await Investment.findOneAndUpdate(
      { _id: investmentId, user_id: userId, is_deleted: false },
      payload,
      { new: true },
    );
    if (!investment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Investment not found.");
    }
    return investment;
  },

  deleteInvestment: async (userId: string, investmentId: string) => {
    const investment = await Investment.findOneAndUpdate(
      { _id: investmentId, user_id: userId, is_deleted: false },
      { is_deleted: true },
      { new: true },
    );
    if (!investment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Investment not found.");
    }
    return true;
  },

  restoreInvestment: async (userId: string, investmentId: string) => {
    const investment = await Investment.findOneAndUpdate(
      { _id: investmentId, user_id: userId, is_deleted: true },
      { is_deleted: false },
      { new: true },
    );
    if (!investment) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Investment not found or already restored.",
      );
    }
    return investment;
  },
};
