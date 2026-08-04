import mongoose from "mongoose";
import { Transaction } from "@/modules/transaction/transaction.model";
import { Bill } from "@/modules/bill/bill.model";
import { Installment } from "@/modules/installment/installment.model";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  amount: number;
  type: "income" | "expense" | "bill" | "emi";
  status?: string;
  source: string; // The original collection Name for frontend routing if needed
}

export const CalendarService = {
  getEvents: async (userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
    const uid = new mongoose.Types.ObjectId(userId);
    const events: CalendarEvent[] = [];

    // 1. Fetch Transactions
    const transactions = await Transaction.find({
      user_id: uid,
      is_deleted: false,
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    transactions.forEach((tx) => {
      // Ensure type is strongly typed
      const evType = tx.type === "income" ? "income" : "expense";
      
      events.push({
        id: tx._id.toString(),
        title: tx.notes || "Transaction",
        date: tx.date,
        amount: tx.amount,
        type: evType,
        source: "transaction",
      });
    });

    // 2. Fetch Bills (Using due_date)
    const bills = await Bill.find({
      user_id: uid,
      due_date: { $gte: startDate, $lte: endDate },
    }).lean();

    bills.forEach((bill) => {
      events.push({
        id: bill._id.toString(),
        title: `Bill: ${bill.title}`,
        date: bill.due_date,
        amount: bill.amount,
        type: "bill",
        status: bill.status,
        source: "bill",
      });
    });

    // 3. Fetch EMIs (Using next_payment_date)
    // Note: If Installment has a schedule array, we could map it, but typically it tracks next_payment_date.
    // We will use next_payment_date for this MVP.
    try {
      const installments = await Installment.find({
        user_id: uid,
        status: "active",
        next_payment_date: { $gte: startDate, $lte: endDate },
      }).lean();

      installments.forEach((emi) => {
        events.push({
          id: emi._id.toString(),
          title: `EMI: ${emi.title}`,
          date: emi.start_date,
          amount: emi.monthly_amount,
          type: "emi",
          source: "installment",
        });
      });
    } catch (e) {
      // Ignore if Installment schema is strictly different
    }

    // Sort chronologically
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
};
