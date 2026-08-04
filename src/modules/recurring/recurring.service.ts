import { Recurring, IRecurring, RecurringStatus } from "./recurring.model";
import mongoose from "mongoose";

export const RecurringService = {
  create: async (userId: string, data: Partial<IRecurring>) => {
    const recurring = new Recurring({
      ...data,
      user_id: new mongoose.Types.ObjectId(userId),
    });
    return await recurring.save();
  },

  getAll: async (userId: string) => {
    return await Recurring.find({ user_id: new mongoose.Types.ObjectId(userId) }).sort({ next_run_date: 1 });
  },

  update: async (userId: string, recurringId: string, data: Partial<IRecurring>) => {
    return await Recurring.findOneAndUpdate(
      { _id: recurringId, user_id: new mongoose.Types.ObjectId(userId) },
      data,
      { new: true }
    );
  },

  delete: async (userId: string, recurringId: string) => {
    return await Recurring.findOneAndDelete({
      _id: recurringId,
      user_id: new mongoose.Types.ObjectId(userId),
    });
  },

  toggleStatus: async (userId: string, recurringId: string) => {
    const recurring = await Recurring.findOne({
      _id: recurringId,
      user_id: new mongoose.Types.ObjectId(userId),
    });

    if (!recurring) throw new Error("Recurring item not found");

    recurring.status = recurring.status === RecurringStatus.ACTIVE ? RecurringStatus.PAUSED : RecurringStatus.ACTIVE;
    // @ts-ignore
    return await recurring.save();
  },
};
