import ApiError from "../../helpers/api-error";
import httpStatus from "http-status";
import { ISavedFilter } from "./saved-filter.interface";
import { SavedFilter } from "./saved-filter.model";

export const SavedFilterService = {
  createFilter: async (userId: string, payload: Partial<ISavedFilter>) => {
    return SavedFilter.create({
      user_id: userId,
      name: payload.name,
      type: payload.type,
      filter_payload: payload.filter_payload,
    });
  },

  getFilters: async (userId: string, type?: string) => {
    const query: any = { user_id: userId };
    if (type) query.type = type;
    return SavedFilter.find(query).sort({ createdAt: -1 }).lean();
  },

  deleteFilter: async (userId: string, filterId: string) => {
    const deleted = await SavedFilter.findOneAndDelete({ _id: filterId, user_id: userId });
    if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, "Filter not found");
    return deleted;
  },
};
