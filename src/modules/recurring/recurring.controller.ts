import catchAsync from "@/helpers/catch-async";
import { RecurringService } from "./recurring.service";

export const RecurringController = {
  create: catchAsync(async (req, res) => {
    const data = await RecurringService.create(req.user!._id, req.body);
    res.status(201).json({
      success: true,
      message: "Recurring item created successfully",
      data,
    });
  }),

  getAll: catchAsync(async (req, res) => {
    const data = await RecurringService.getAll(req.user!._id);
    res.status(200).json({
      success: true,
      message: "Recurring items fetched successfully",
      data,
    });
  }),

  update: catchAsync(async (req, res) => {
    const data = await RecurringService.update(
      req.user!._id,
      req.params.id as string,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "Recurring item updated successfully",
      data,
    });
  }),

  delete: catchAsync(async (req, res) => {
    await RecurringService.delete(req.user!._id, req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Recurring item deleted successfully",
      data: null,
    });
  }),

  toggleStatus: catchAsync(async (req, res) => {
    const data = await RecurringService.toggleStatus(
      req.user!._id,
      req.params.id as string,
    );
    res.status(200).json({
      success: true,
      message: `Recurring item ${data.status} successfully`,
      data,
    });
  }),
};
