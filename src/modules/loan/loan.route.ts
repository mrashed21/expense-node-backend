import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { LoanController } from "./loan.controller";
import {
  cancelLoanSchema,
  createBorrowerSchema,
  createLoanSchema,
  createRepaymentSchema,
  updateBorrowerSchema,
  updateLoanSchema,
  writeOffLoanSchema,
} from "./loan.validation";

const router = Router();

// Borrower Routes (placed before /:id parameter to avoid route conflicts)
router.get("/borrowers", auth, LoanController.getBorrowers);
router.post(
  "/borrowers",
  auth,
  validateRequest(createBorrowerSchema),
  LoanController.createBorrower,
);
router.get("/borrowers/:borrowerId", auth, LoanController.getBorrowerById);
router.patch(
  "/borrowers/:borrowerId",
  auth,
  validateRequest(updateBorrowerSchema),
  LoanController.updateBorrower,
);

// Summary Route
router.get("/summary", auth, LoanController.getLoanSummary);

// Base Loan CRUD
router.post(
  "/",
  auth,
  validateRequest(createLoanSchema),
  LoanController.createLoan,
);
router.get("/", auth, LoanController.getLoans);
router.get("/:id", auth, LoanController.getLoanById);
router.patch(
  "/:id",
  auth,
  validateRequest(updateLoanSchema),
  LoanController.updateLoan,
);
router.patch(
  "/:id/cancel",
  auth,
  validateRequest(cancelLoanSchema),
  LoanController.cancelLoan,
);
router.patch(
  "/:id/write-off",
  auth,
  validateRequest(writeOffLoanSchema),
  LoanController.writeOffLoan,
);
router.delete("/:id", auth, LoanController.deleteLoan);

// Repayment Routes
router.post(
  "/:id/repayments",
  auth,
  validateRequest(createRepaymentSchema),
  LoanController.addRepayment,
);
router.delete(
  "/:loanId/repayments/:repaymentId",
  auth,
  LoanController.reverseRepayment,
);

export const loanRoutes = router;
