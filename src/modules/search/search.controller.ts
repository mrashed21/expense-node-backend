import catchAsync from "@/helpers/catch-async";
import { SearchService } from "./search.service";

export const SearchController = {
  globalSearch: catchAsync(async (req, res) => {
    const query = (req.query.q as string) || "";
    
    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        message: "Search query too short",
        data: [],
      });
    }

    const data = await SearchService.globalSearch(req.user!._id, query);
    
    res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      data,
    });
  }),
};
