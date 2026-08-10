import mongoose from "mongoose";
import { Bill } from "../../modules/bill/bill.model";
import { Installment } from "../../modules/installment/installment.model";
import { Transaction } from "../../modules/transaction/transaction.model";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  amount: number;
  type: "income" | "expense" | "bill" | "emi";
  status?: string;
  source: string;
}

export const CalendarService = {
  getEvents: async (
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarEvent[]> => {
    const uid = new mongoose.Types.ObjectId(userId);
    const events: CalendarEvent[] = [];

    const transactions = await Transaction.find({
      user_id: uid,
      is_deleted: false,
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    transactions.forEach((tx) => {
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

    const installments = await Installment.find({
      user_id: uid,
      start_date: { $lte: endDate },
      $or: [{ end_date: null }, { end_date: { $gte: startDate } }],
    }).lean();

    try {
      installments.forEach((emi) => {
        const dayOfMonth = new Date(emi.start_date).getDate();
        const start = new Date(startDate);
        const end = new Date(endDate);
        const emiStart = new Date(emi.start_date);
        const emiEnd = new Date(emi.end_date);

        let curr = new Date(start.getFullYear(), start.getMonth(), dayOfMonth);

        while (curr <= end) {
          if (curr >= start && curr >= emiStart && curr <= emiEnd) {
            events.push({
              id: `${emi._id.toString()}-${curr.getTime()}`,
              title: `EMI: ${emi.title}`,
              date: new Date(curr),
              amount: emi.monthly_amount,
              type: "emi",
              source: "installment",
            });
          }
          curr.setMonth(curr.getMonth() + 1);
        }
      });
    } catch (e) {
      console.error("Installment calendar fetch error", e);
    }

    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  },
};
