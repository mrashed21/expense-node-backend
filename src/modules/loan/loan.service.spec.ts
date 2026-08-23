import mongoose from "mongoose";
import { Account } from "../account/account.model";
import { TransactionType } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { Borrower } from "./borrower.model";
import { LoanRepayment } from "./loan-repayment.model";
import { LoanStatus } from "./loan.interface";
import { Loan } from "./loan.model";
import { LoanService } from "./loan.service";

jest.mock("./loan.model");
jest.mock("./loan-repayment.model");
jest.mock("./borrower.model");
jest.mock("../account/account.model");
jest.mock("../transaction/transaction.model");

jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  return {
    ...actualMongoose,
    startSession: jest.fn().mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    }),
  };
});

describe("LoanService", () => {
  let sessionMock: any;
  const mockUserId = "user_123";

  beforeEach(() => {
    jest.clearAllMocks();
    sessionMock = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    (mongoose.startSession as jest.Mock).mockResolvedValue(sessionMock);
  });

  describe("createLoan", () => {
    it("should deduct principal amount from source account and create loan", async () => {
      const mockAccount = {
        _id: "acc_cash",
        name: "Cash",
        type: "Cash",
        current_balance: 50000,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockBorrower = {
        _id: "borrower_rahim",
        name: "Rahim",
      };

      const mockCreatedLoan = {
        _id: "loan_1",
        user_id: mockUserId,
        borrower_name: "Rahim",
        principal_amount: 10000,
        outstanding_amount: 10000,
        status: LoanStatus.ACTIVE,
      };

      (Account.findOne as jest.Mock).mockResolvedValue(mockAccount);
      (Borrower.findOne as jest.Mock).mockResolvedValue(mockBorrower);
      (Loan.create as jest.Mock).mockResolvedValue([mockCreatedLoan]);
      (Transaction.create as jest.Mock).mockResolvedValue([{}]);

      const result = await LoanService.createLoan(mockUserId, {
        borrower_name: "Rahim",
        principal_amount: 10000,
        source_account_id: "acc_cash",
      });

      expect(result).toEqual(mockCreatedLoan);
      expect(mockAccount.current_balance).toBe(40000);
      expect(mockAccount.save).toHaveBeenCalled();
      expect(Transaction.create).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            type: TransactionType.LENDING,
            amount: 10000,
            account_id: "acc_cash",
          }),
        ],
        { session: sessionMock },
      );
      expect(sessionMock.commitTransaction).toHaveBeenCalled();
    });

    it("should reject loan creation if source account has insufficient balance", async () => {
      const mockAccount = {
        _id: "acc_cash",
        name: "Cash",
        current_balance: 5000,
      };

      (Account.findOne as jest.Mock).mockResolvedValue(mockAccount);

      await expect(
        LoanService.createLoan(mockUserId, {
          borrower_name: "Rahim",
          principal_amount: 10000,
          source_account_id: "acc_cash",
        }),
      ).rejects.toThrow("Insufficient balance");
    });
  });

  describe("addRepayment", () => {
    it("should add partial repayment, credit receiving account, and reduce outstanding amount", async () => {
      const mockLoan = {
        _id: "loan_1",
        user_id: mockUserId,
        borrower_name: "Rahim",
        principal_amount: 10000,
        recovered_amount: 0,
        outstanding_amount: 10000,
        status: LoanStatus.ACTIVE,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockReceivingAccount = {
        _id: "acc_bkash",
        name: "bKash",
        type: "Bkash",
        current_balance: 2000,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockRepayment = {
        _id: "rep_1",
        loan_id: "loan_1",
        amount: 4000,
        payment_method: "Bkash",
        account_id: "acc_bkash",
      };

      (Loan.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockLoan),
      });
      (Account.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockReceivingAccount),
      });
      (LoanRepayment.create as jest.Mock).mockResolvedValue([mockRepayment]);
      (Transaction.create as jest.Mock).mockResolvedValue([{}]);

      const result = await LoanService.addRepayment(mockUserId, "loan_1", {
        amount: 4000,
        account_id: "acc_bkash",
        payment_method: "Bkash",
      });

      expect(result).toEqual(mockRepayment);
      expect(mockReceivingAccount.current_balance).toBe(6000);
      expect(mockLoan.recovered_amount).toBe(4000);
      expect(mockLoan.outstanding_amount).toBe(6000);
      expect(mockLoan.status).toBe(LoanStatus.PARTIALLY_PAID);
      expect(mockLoan.save).toHaveBeenCalled();
      expect(mockReceivingAccount.save).toHaveBeenCalled();
    });

    it("should mark loan as PAID when repayment equals remaining outstanding amount", async () => {
      const mockLoan = {
        _id: "loan_1",
        user_id: mockUserId,
        borrower_name: "Rahim",
        principal_amount: 10000,
        recovered_amount: 4000,
        outstanding_amount: 6000,
        status: LoanStatus.PARTIALLY_PAID,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockReceivingAccount = {
        _id: "acc_cash",
        name: "Cash",
        type: "Cash",
        current_balance: 10000,
        save: jest.fn().mockResolvedValue(true),
      };

      (Loan.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockLoan),
      });
      (Account.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockReceivingAccount),
      });
      (LoanRepayment.create as jest.Mock).mockResolvedValue([{ amount: 6000 }]);
      (Transaction.create as jest.Mock).mockResolvedValue([{}]);

      await LoanService.addRepayment(mockUserId, "loan_1", {
        amount: 6000,
        account_id: "acc_cash",
      });

      expect(mockLoan.recovered_amount).toBe(10000);
      expect(mockLoan.outstanding_amount).toBe(0);
      expect(mockLoan.status).toBe(LoanStatus.PAID);
    });

    it("should reject repayment if amount exceeds outstanding loan balance", async () => {
      const mockLoan = {
        _id: "loan_1",
        user_id: mockUserId,
        outstanding_amount: 5000,
        status: LoanStatus.PARTIALLY_PAID,
      };

      (Loan.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockLoan),
      });

      await expect(
        LoanService.addRepayment(mockUserId, "loan_1", {
          amount: 7000,
          account_id: "acc_cash",
        }),
      ).rejects.toThrow("exceeds outstanding loan balance");
    });
  });

  describe("writeOffLoan", () => {
    it("should set outstanding to 0 and status to WRITTEN_OFF with reason", async () => {
      const mockLoan = {
        _id: "loan_1",
        user_id: mockUserId,
        principal_amount: 10000,
        recovered_amount: 7000,
        outstanding_amount: 3000,
        status: LoanStatus.PARTIALLY_PAID,
        save: jest.fn().mockResolvedValue(true),
      };

      (Loan.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockLoan),
      });

      const result = await LoanService.writeOffLoan(mockUserId, "loan_1", {
        reason: "Borrower unable to pay remaining amount",
      });

      expect(result.write_off_amount).toBe(3000);
      expect(result.outstanding_amount).toBe(0);
      expect(result.status).toBe(LoanStatus.WRITTEN_OFF);
      expect(result.write_off_reason).toBe(
        "Borrower unable to pay remaining amount",
      );
      expect(mockLoan.save).toHaveBeenCalled();
    });
  });

  describe("cancelLoan", () => {
    it("should restore principal to source account and set status to CANCELLED", async () => {
      const mockLoan = {
        _id: "loan_1",
        user_id: mockUserId,
        source_account_id: "acc_cash",
        principal_amount: 10000,
        recovered_amount: 0,
        outstanding_amount: 10000,
        status: LoanStatus.ACTIVE,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockAccount = {
        _id: "acc_cash",
        current_balance: 40000,
        save: jest.fn().mockResolvedValue(true),
      };

      (Loan.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockLoan),
      });
      (LoanRepayment.countDocuments as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(0),
      });
      (Account.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await LoanService.cancelLoan(mockUserId, "loan_1", {
        reason: "Mistake in entry",
      });

      expect(mockAccount.current_balance).toBe(50000);
      expect(result.status).toBe(LoanStatus.CANCELLED);
      expect(result.outstanding_amount).toBe(0);
      expect(mockAccount.save).toHaveBeenCalled();
      expect(mockLoan.save).toHaveBeenCalled();
    });
  });

  describe("reverseRepayment", () => {
    it("should reverse repayment, debit receiving account, and restore outstanding amount", async () => {
      const mockRepayment = {
        _id: "rep_1",
        loan_id: "loan_1",
        user_id: mockUserId,
        amount: 3000,
        account_id: "acc_bkash",
        is_reversed: false,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockLoan = {
        _id: "loan_1",
        user_id: mockUserId,
        principal_amount: 10000,
        recovered_amount: 3000,
        outstanding_amount: 7000,
        status: LoanStatus.PARTIALLY_PAID,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockAccount = {
        _id: "acc_bkash",
        current_balance: 5000,
        save: jest.fn().mockResolvedValue(true),
      };

      (LoanRepayment.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockRepayment),
      });
      (Loan.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockLoan),
      });
      (Account.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAccount),
      });

      await LoanService.reverseRepayment(mockUserId, "loan_1", "rep_1");

      expect(mockRepayment.is_reversed).toBe(true);
      expect(mockAccount.current_balance).toBe(2000);
      expect(mockLoan.recovered_amount).toBe(0);
      expect(mockLoan.outstanding_amount).toBe(10000);
      expect(mockLoan.status).toBe(LoanStatus.ACTIVE);
      expect(mockAccount.save).toHaveBeenCalled();
      expect(mockLoan.save).toHaveBeenCalled();
    });
  });
});
