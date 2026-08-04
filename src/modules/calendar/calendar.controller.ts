import catchAsync from "@/helpers/catch-async";
import { CalendarService } from "./calendar.service";

export const CalendarController = {
  getEvents: catchAsync(async (req, res) => {
    // If no dates provided, default to current month
    const now = new Date();
    const startStr = req.query.startDate as string;
    const endStr = req.query.endDate as string;
    
    // Default to first day of current month
    const startDate = startStr ? new Date(startStr) : new Date(now.getFullYear(), now.getMonth(), 1);
    // Default to last day of current month
    const endDate = endStr ? new Date(endStr) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const data = await CalendarService.getEvents(req.user!._id, startDate, endDate);
    
    res.status(200).json({
      success: true,
      message: "Calendar events fetched successfully",
      data,
    });
  }),
};
