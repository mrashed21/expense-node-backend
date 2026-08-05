import mongoose from "mongoose";
import { Account } from "../account/account.model";
import { TransactionType } from "./transaction.interface";
import { Transaction } from "./transaction.model";
import { TransactionService } from "./transaction.service";

jest.mock("./transaction.model");
jest.mock("../account/account.model");
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

describe("TransactionService", () => {
  let sessionMock: any;

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

  describe("deleteTransaction", () => {
    it("should delete transaction and adjust account balance", async () => {
      const mockTransaction = {
        _id: "tx1",
        user_id: "user1",
        account_id: "acc1",
        amount: 100,
        type: TransactionType.EXPENSE,
        is_deleted: false,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockAccount = {
        _id: "acc1",
        current_balance: 500,
        save: jest.fn().mockResolvedValue(true),
      };

      (Transaction.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockTransaction),
      });

      (Account.findById as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await TransactionService.deleteTransaction("user1", "tx1");

      expect(result).toBe(true);
      expect(mockTransaction.is_deleted).toBe(true);
      expect(mockTransaction.save).toHaveBeenCalled();
      
      // Since it was an EXPENSE, deleting it should ADD to balance
      expect(mockAccount.current_balance).toBe(600);
      expect(mockAccount.save).toHaveBeenCalled();

      expect(sessionMock.commitTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
    });

    it("should abort transaction if something fails", async () => {
      (Transaction.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(null), // simulate not found
      });

      await expect(TransactionService.deleteTransaction("user1", "tx1")).rejects.toThrow("Transaction not found.");
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
    });
  });

  describe("bulkDeleteTransactions", () => {
    it("should update multiple transactions and bulk write to accounts", async () => {
      const mockTransactions = [
        { _id: "tx1", user_id: "user1", account_id: "acc1", amount: 100, type: TransactionType.EXPENSE },
        { _id: "tx2", user_id: "user1", account_id: "acc1", amount: 200, type: TransactionType.INCOME },
      ];

      (Transaction.find as jest.Mock).mockResolvedValue(mockTransactions);
      (Transaction.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 2 });
      (Account.bulkWrite as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      const result = await TransactionService.bulkDeleteTransactions("user1", ["tx1", "tx2"]);

      expect(result).toEqual({ deletedCount: 2 });
      expect(Transaction.updateMany).toHaveBeenCalled();
      expect(Account.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: "acc1" },
            // tx1 expense (add 100 back), tx2 income (subtract 200) -> net -100
            update: { $inc: { current_balance: -100 } },
          }
        }
      ]);
    });
  });
});
