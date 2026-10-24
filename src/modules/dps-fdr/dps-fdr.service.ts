import httpStatus from "http-status";
import mongoose from "mongoose";
import ApiError from "../../helpers/api-error";
import { Account } from "../account/account.model";
import { Transaction } from "../transaction/transaction.model";
import { TransactionType } from "../transaction/transaction.interface";
import { DepositStatus, DepositType } from "./dps-fdr.interface";
import { DpsFdr } from "./dps-fdr.model";

const calculateMaturity = (principal: number, rate: number, months: number) =>
  principal * Math.pow(1 + rate / 100 / 12, months);

export const DpsFdrService = {
  create: async (userId: string, payload: any) => {
    if (payload.type === DepositType.DPS && !payload.monthly_installment) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Monthly installment is required for DPS.");
    }
    const start = new Date(payload.start_date);
    const maturity = new Date(payload.maturity_date);
    const months = Math.max(1, Math.round((maturity.getTime() - start.getTime()) / (30.44 * 86400000)));
    const upfront = payload.type === DepositType.FDR ? payload.principal_amount : payload.monthly_installment;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const account = await Account.findOne({ _id: payload.account_id, user_id: userId, is_deleted: false }).session(session);
      if (!account || account.current_balance < upfront) throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient account balance.");
      account.current_balance -= upfront;
      await account.save({ session });
      await Transaction.create([{ user_id: userId, account_id: account._id, type: TransactionType.EXPENSE, amount: upfront, date: start, notes: `${payload.type.toUpperCase()} deposit: ${payload.name}` }], { session });
      const deposit = await DpsFdr.create([{ ...payload, user_id: userId, paid_installments: payload.type === DepositType.DPS ? 1 : 0, total_paid: upfront, maturity_amount: calculateMaturity(payload.type === DepositType.FDR ? payload.principal_amount : payload.monthly_installment * months, payload.interest_rate, months) }], { session });
      await session.commitTransaction();
      return deposit[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
  list: (userId: string, type?: DepositType) =>
    DpsFdr.find({
      user_id: userId,
      is_deleted: false,
      ...(type ? { type } : {}),
    })
      .populate("account_id", "name currency")
      .sort({ createdAt: -1 })
      .lean(),
  update: async (userId: string, id: string, payload: any) => {
    const item = await DpsFdr.findOneAndUpdate({ _id: id, user_id: userId, is_deleted: false }, payload, { new: true, runValidators: true });
    if (!item) throw new ApiError(httpStatus.NOT_FOUND, "DPS/FDR not found.");
    return item;
  },
  payDps: async (userId: string, id: string) => {
    const item = await DpsFdr.findOne({ _id: id, user_id: userId, type: DepositType.DPS, status: DepositStatus.ACTIVE, is_deleted: false });
    if (!item || !item.monthly_installment) throw new ApiError(httpStatus.NOT_FOUND, "Active DPS not found.");
    return DpsFdrService.createPayment(userId, item, item.monthly_installment);
  },
  createPayment: async (userId: string, item: any, amount: number) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const account = await Account.findOne({ _id: item.account_id, user_id: userId, is_deleted: false }).session(session);
      if (!account || account.current_balance < amount) throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient account balance.");
      account.current_balance -= amount;
      await account.save({ session });
      await Transaction.create([{ user_id: userId, account_id: account._id, type: TransactionType.EXPENSE, amount, date: new Date(), notes: `DPS installment: ${item.name}` }], { session });
      item.paid_installments += 1;
      item.total_paid += amount;
      await item.save({ session });
      await session.commitTransaction();
      return item;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally { session.endSession(); }
  },
  close: async (userId: string, id: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const item = await DpsFdr.findOne({ _id: id, user_id: userId, status: DepositStatus.ACTIVE, is_deleted: false }).session(session);
      if (!item) throw new ApiError(httpStatus.NOT_FOUND, "Active DPS/FDR not found.");
      const account = await Account.findOne({ _id: item.account_id, user_id: userId, is_deleted: false }).session(session);
      if (!account) throw new ApiError(httpStatus.NOT_FOUND, "Linked account not found.");
      const payout = item.type === DepositType.FDR
        ? item.maturity_amount
        : item.total_paid * Math.pow(1 + item.interest_rate / 100 / 12, Math.max(1, item.paid_installments));
      account.current_balance += payout;
      await account.save({ session });
      await Transaction.create([{ user_id: userId, account_id: account._id, type: TransactionType.INCOME, amount: payout, date: new Date(), notes: `${item.type.toUpperCase()} maturity payout: ${item.name}` }], { session });
      item.status = DepositStatus.CLOSED;
      await item.save({ session });
      await session.commitTransaction();
      return item;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally { session.endSession(); }
  },
};
