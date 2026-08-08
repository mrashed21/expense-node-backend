import ApiError from "../../helpers/api-error";
import httpStatus from "http-status";
import { Asset } from "./asset.model";

export const AssetService = {
  createAsset: async (userId: string, payload: any) => {
    return Asset.create({
      ...payload,
      user_id: userId,
    });
  },

  getAssets: async (
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
      filter.name = { $regex: query.search, $options: "i" };
    }

    const total = await Asset.countDocuments(filter);
    const assets = await Asset.find(filter)
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
      },
      data: assets,
    };
  },

  getAssetById: async (userId: string, assetId: string) => {
    const asset = await Asset.findOne({
      _id: assetId,
      user_id: userId,
      is_deleted: false,
    }).lean();
    if (!asset) {
      throw new ApiError(httpStatus.NOT_FOUND, "Asset not found.");
    }
    return asset;
  },

  updateAsset: async (userId: string, assetId: string, payload: any) => {
    const asset = await Asset.findOneAndUpdate(
      { _id: assetId, user_id: userId, is_deleted: false },
      payload,
      { new: true },
    );
    if (!asset) {
      throw new ApiError(httpStatus.NOT_FOUND, "Asset not found.");
    }
    return asset;
  },

  deleteAsset: async (userId: string, assetId: string) => {
    const asset = await Asset.findOneAndUpdate(
      { _id: assetId, user_id: userId, is_deleted: false },
      { is_deleted: true },
      { new: true },
    );
    if (!asset) {
      throw new ApiError(httpStatus.NOT_FOUND, "Asset not found.");
    }
    return true;
  },

  restoreAsset: async (userId: string, assetId: string) => {
    const asset = await Asset.findOneAndUpdate(
      { _id: assetId, user_id: userId, is_deleted: true },
      { is_deleted: false },
      { new: true },
    );
    if (!asset) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Asset not found or already restored.",
      );
    }
    return asset;
  },
};
