import catchAsync from "../../helpers/catch-async";
import { ReportService } from "./report.service";

export const ReportController = {
  getBalanceSheet: catchAsync(async (req, res) => {
    const data = await ReportService.generateBalanceSheet(req.user!._id);
    res.status(200).json({
      success: true,
      message: "Balance sheet generated successfully",
      data,
    });
  }),

  getCashFlowReport: catchAsync(async (req, res) => {
    const now = new Date();
    const startStr = req.query.startDate as string;
    const endStr = req.query.endDate as string;

    const startDate = startStr
      ? new Date(startStr)
      : new Date(`${now.getFullYear()}-01-01`);
    const endDate = endStr
      ? new Date(endStr)
      : new Date(`${now.getFullYear()}-12-31T23:59:59.999Z`);

    const data = await ReportService.generateCashFlowReport(
      req.user!._id,
      startDate,
      endDate,
    );
    res.status(200).json({
      success: true,
      message: "Cash flow report generated successfully",
      data,
    });
  }),

  getTaxReport: catchAsync(async (req, res) => {
    const year = req.query.year
      ? parseInt(req.query.year as string, 10)
      : new Date().getFullYear();
    const data = await ReportService.generateTaxReport(req.user!._id, year);
    res.status(200).json({
      success: true,
      message: "Tax report generated successfully",
      data,
    });
  }),
};
