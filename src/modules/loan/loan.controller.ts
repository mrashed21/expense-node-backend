import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { LoanService } from "./loan.service";

export const LoanController = {
  createLoan: catchAsync(async (req: Request, res: Response) => {
    const loan = await LoanService.createLoan(req.user!._id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Loan created and account balance updated successfully.",
      data: loan,
    });
  }),

  getLoans: catchAsync(async (req: Request, res: Response) => {
    const result = await LoanService.getLoans(req.user!._id, req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      meta: result.meta as any,
      data: result.data,
    });
  }),

  getLoanSummary: catchAsync(async (req: Request, res: Response) => {
    const summary = await LoanService.getLoanSummary(req.user!._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: summary,
    });
  }),

  getLoanById: catchAsync(async (req: Request, res: Response) => {
    const loan = await LoanService.getLoanById(
      req.user!._id,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: loan,
    });
  }),

  updateLoan: catchAsync(async (req: Request, res: Response) => {
    const loan = await LoanService.updateLoan(
      req.user!._id,
      req.params.id as string,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Loan updated successfully.",
      data: loan,
    });
  }),

  cancelLoan: catchAsync(async (req: Request, res: Response) => {
    const loan = await LoanService.cancelLoan(
      req.user!._id,
      req.params.id as string,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Loan cancelled and account balance restored successfully.",
      data: loan,
    });
  }),

  writeOffLoan: catchAsync(async (req: Request, res: Response) => {
    const loan = await LoanService.writeOffLoan(
      req.user!._id,
      req.params.id as string,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Loan written off successfully.",
      data: loan,
    });
  }),

  deleteLoan: catchAsync(async (req: Request, res: Response) => {
    await LoanService.deleteLoan(req.user!._id, req.params.id as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Loan deleted successfully.",
    });
  }),

  addRepayment: catchAsync(async (req: Request, res: Response) => {
    const repayment = await LoanService.addRepayment(
      req.user!._id,
      req.params.id as string,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Repayment recorded and account balance credited successfully.",
      data: repayment,
    });
  }),

  reverseRepayment: catchAsync(async (req: Request, res: Response) => {
    const repayment = await LoanService.reverseRepayment(
      req.user!._id,
      req.params.loanId as string,
      req.params.repaymentId as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Repayment reversed and account balance debited successfully.",
      data: repayment,
    });
  }),

  getBorrowers: catchAsync(async (req: Request, res: Response) => {
    const borrowers = await LoanService.getBorrowers(req.user!._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: borrowers,
    });
  }),

  createBorrower: catchAsync(async (req: Request, res: Response) => {
    const borrower = await LoanService.createBorrower(req.user!._id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Borrower created successfully.",
      data: borrower,
    });
  }),

  updateBorrower: catchAsync(async (req: Request, res: Response) => {
    const borrower = await LoanService.updateBorrower(
      req.user!._id,
      req.params.borrowerId as string,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Borrower updated successfully.",
      data: borrower,
    });
  }),

  getBorrowerById: catchAsync(async (req: Request, res: Response) => {
    const borrower = await LoanService.getBorrowerById(
      req.user!._id,
      req.params.borrowerId as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: borrower,
    });
  }),
};
