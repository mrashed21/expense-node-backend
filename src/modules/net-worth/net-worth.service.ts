import { Account } from "../account/account.model";
import { Asset } from "../asset/asset.model";
import { DebtType } from "../debt/debt.interface";
import { Debt } from "../debt/debt.model";
import { Installment } from "../installment/installment.model";
import { Investment } from "../investment/investment.model";
import { NetWorthHistory } from "./net-worth-history.model";

const calculateDebtInterest = (debt: any) => {
  let accruedInterest = 0;
  if (debt.interest_rate && debt.interest_rate > 0) {
    const msInYear = 1000 * 60 * 60 * 24 * 365;
    const timeInYears =
      (Date.now() - new Date(debt.createdAt).getTime()) / msInYear;
    accruedInterest =
      debt.amount * (debt.interest_rate / 100) * Math.max(0, timeInYears);
  }
  return Math.max(0, debt.remaining_amount + accruedInterest);
};

export const NetWorthService = {
  calculateCurrentNetWorth: async (userId: string) => {
    const accounts = await Account.find({ user_id: userId }).lean();
    const totalCash = accounts.reduce(
      (sum, acc) => sum + (acc.current_balance || 0),
      0,
    );

    const assets = await Asset.find({
      user_id: userId,
      is_deleted: false,
    }).lean();
    const totalPhysicalAssets = assets.reduce(
      (sum, ast) => sum + (ast.value || 0),
      0,
    );

    const investments = await Investment.find({
      user_id: userId,
      is_deleted: false,
    }).lean();
    const totalInvestments = investments.reduce(
      (sum, inv) => sum + inv.current_price * inv.quantity,
      0,
    );

    const debts = await Debt.find({
      user_id: userId,
      is_deleted: false,
    }).lean();
    let totalLent = 0;
    let totalBorrowed = 0;

    debts.forEach((d) => {
      const trueRemaining = calculateDebtInterest(d);

      if (trueRemaining > 0) {
        if (d.type === DebtType.LENT) {
          totalLent += trueRemaining;
        } else {
          totalBorrowed += trueRemaining;
        }
      }
    });

    const installments = await Installment.find({
      user_id: userId,
      is_deleted: false,
      is_completed: false,
    }).lean();
    const totalEMIs = installments.reduce(
      (sum, inst) => sum + (inst.remaining_amount || 0),
      0,
    );

    const totalAssets =
      totalCash + totalPhysicalAssets + totalInvestments + totalLent;
    const totalLiabilities = totalBorrowed + totalEMIs;
    const netWorth = totalAssets - totalLiabilities;

    return {
      net_worth: netWorth,
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      breakdown: {
        assets: {
          cash: totalCash,
          physical_assets: totalPhysicalAssets,
          investments: totalInvestments,
          money_lent: totalLent,
        },
        liabilities: {
          money_borrowed: totalBorrowed,
          emi_remaining: totalEMIs,
        },
      },
      date: new Date(),
    };
  },

  takeDailySnapshot: async (userId: string) => {
    const current = await NetWorthService.calculateCurrentNetWorth(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingSnapshot = await NetWorthHistory.findOne({
      user_id: userId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (existingSnapshot) {
      existingSnapshot.total_assets = current.total_assets;
      existingSnapshot.total_liabilities = current.total_liabilities;
      existingSnapshot.net_worth = current.net_worth;
      await existingSnapshot.save();
      return existingSnapshot;
    } else {
      return NetWorthHistory.create({
        user_id: userId,
        date: new Date(),
        total_assets: current.total_assets,
        total_liabilities: current.total_liabilities,
        net_worth: current.net_worth,
      });
    }
  },

  getNetWorthHistory: async (userId: string, query: { days?: number }) => {
    const days = Number(query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await NetWorthHistory.find({
      user_id: userId,
      date: { $gte: startDate },
    })
      .sort({ date: 1 })
      .lean();

    return history;
  },
};
