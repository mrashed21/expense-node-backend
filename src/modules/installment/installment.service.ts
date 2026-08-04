import ApiError from "@/helpers/api-error";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { Installment } from "./installment.model";
import { InstallmentPayment } from "./installment-payment.model";
import { IInstallment } from "./installment.interface";

const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const InstallmentService = {
  createInstallment: async (userId: string, payload: Partial<IInstallment>) => {
    const monthly_amount = payload.total_amount! / payload.total_months!;
    const end_date = addMonths(new Date(payload.start_date!), payload.total_months!);
    
    return Installment.create({
      ...payload,
      user_id: userId,
      monthly_amount,
      remaining_amount: payload.total_amount,
      paid_amount: 0,
      months_paid: 0,
      end_date,
      is_completed: false,
    });
  },

  getInstallments: async (
    userId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }
  ) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: any = { user_id: userId, is_deleted: false };

    if (query.status === "active") {
      filter.is_completed = false;
    } else if (query.status === "completed") {
      filter.is_completed = true;
    }

    if (query.search) {
      filter.title = { $regex: query.search, $options: "i" };
    }

    const total = await Installment.countDocuments(filter);
    
    // Global Metrics
    const allInstallments = await Installment.find({ user_id: userId, is_deleted: false }).lean();
    let totalMonthlyBurden = 0;
    let totalOutstanding = 0;
    let activeCount = 0;
    let completedCount = 0;

    allInstallments.forEach(inst => {
      if (!inst.is_completed) {
        totalMonthlyBurden += inst.monthly_amount;
        totalOutstanding += inst.remaining_amount;
        activeCount++;
      } else {
        completedCount++;
      }
    });

    const installments = await Installment.find(filter)
      .populate("account_id", "name type color")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        metrics: {
          totalMonthlyBurden,
          totalOutstanding,
          activeCount,
          completedCount
        }
      },
      data: installments,
    };
  },

  getInstallmentById: async (userId: string, installmentId: string) => {
    const installment = await Installment.findOne({
      _id: installmentId,
      user_id: userId,
      is_deleted: false,
    })
      .populate("account_id", "name type color")
      .lean();
      
    if (!installment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Installment not found");
    }
    
    const payments = await InstallmentPayment.find({ installment_id: installmentId })
      .sort({ date: -1 })
      .lean();
      
    return { ...installment, payments };
  },

  updateInstallment: async (userId: string, installmentId: string, payload: Partial<IInstallment>) => {
    const installment = await Installment.findOne({ _id: installmentId, user_id: userId, is_deleted: false });
    if (!installment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Installment not found");
    }
    
    // If core calculation fields change, recalculate
    if (payload.total_amount !== undefined || payload.total_months !== undefined || payload.start_date !== undefined) {
      const newTotal = payload.total_amount ?? installment.total_amount;
      const newMonths = payload.total_months ?? installment.total_months;
      const newStart = payload.start_date ? new Date(payload.start_date) : installment.start_date;
      
      const newMonthly = newTotal / newMonths;
      const newEnd = addMonths(newStart, newMonths);
      
      const newRemaining = Math.max(0, newTotal - installment.paid_amount);
      const newMonthsPaid = Math.floor(installment.paid_amount / newMonthly);
      
      payload.monthly_amount = newMonthly;
      payload.end_date = newEnd;
      payload.remaining_amount = newRemaining;
      payload.months_paid = newMonthsPaid;
      payload.is_completed = newRemaining <= 0;
    }
    
    const updated = await Installment.findOneAndUpdate(
      { _id: installmentId, user_id: userId, is_deleted: false },
      { $set: payload },
      { new: true }
    );
    
    return updated;
  },

  deleteInstallment: async (userId: string, installmentId: string) => {
    const installment = await Installment.findOneAndUpdate(
      { _id: installmentId, user_id: userId, is_deleted: false },
      { $set: { is_deleted: true } },
      { new: true },
    );
    if (!installment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Installment not found");
    }
    return installment;
  },
  
  addPayment: async (userId: string, installmentId: string, payload: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const installment = await Installment.findOne({ _id: installmentId, user_id: userId, is_deleted: false }).session(session);
      if (!installment) {
        throw new ApiError(httpStatus.NOT_FOUND, "Installment not found");
      }
      
      if (installment.is_completed) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Installment is already fully paid");
      }
      
      const payment = await InstallmentPayment.create([{
        installment_id: installmentId,
        user_id: userId,
        amount: payload.amount,
        date: payload.date ? new Date(payload.date) : new Date(),
        notes: payload.notes
      }], { session });
      
      const newPaid = installment.paid_amount + payload.amount;
      const newRemaining = Math.max(0, installment.total_amount - newPaid);
      const newMonthsPaid = Math.floor(newPaid / installment.monthly_amount);
      
      installment.paid_amount = newPaid;
      installment.remaining_amount = newRemaining;
      installment.months_paid = newMonthsPaid;
      
      if (newRemaining <= 0) {
        installment.is_completed = true;
      }
      
      await installment.save({ session });
      await session.commitTransaction();
      session.endSession();
      
      return payment[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
};
