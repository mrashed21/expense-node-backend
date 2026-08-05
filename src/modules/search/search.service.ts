import { Account } from "@/modules/account/account.model";
import { Bill } from "@/modules/bill/bill.model";
import { Category } from "@/modules/category/category.model";
import { Transaction } from "@/modules/transaction/transaction.model";
import mongoose from "mongoose";

export interface SearchResult {
  id: string;
  type: "transaction" | "category" | "account" | "bill" | "goal";
  title: string;
  subtitle?: string;
  url: string;
}

export const SearchService = {
  globalSearch: async (
    userId: string,
    query: string,
  ): Promise<SearchResult[]> => {
    const uid = new mongoose.Types.ObjectId(userId);
    const regex = new RegExp(query, "i"); // Case-insensitive search
    const results: SearchResult[] = [];

    // 1. Search Transactions
    // We search by title, reference, or tags.
    const transactions = await Transaction.find({
      user_id: uid,
      is_deleted: false,
      $or: [
        { notes: { $regex: regex } },
        { reference: { $regex: regex } },
        { tags: { $in: [regex] } }, // Assuming tags is an array of strings
      ],
    })
      .limit(10)
      .lean();

    transactions.forEach((tx) => {
      results.push({
        id: tx._id.toString(),
        type: "transaction",
        title: tx.notes || "Transaction",
        subtitle: `Amount: ${tx.amount} • ${new Date(tx.date).toLocaleDateString()}`,
        url: `/transactions?search=${tx._id}`,
      });
    });

    // 2. Search Categories
    const categories = await Category.find({
      user_id: uid,
      is_deleted: false,
      name: { $regex: regex },
    })
      .limit(5)
      .lean();

    categories.forEach((cat) => {
      results.push({
        id: cat._id.toString(),
        type: "category",
        title: cat.name,
        subtitle: `Category • ${cat.type}`,
        url: `/categories`,
      });
    });

    // 3. Search Accounts
    const accounts = await Account.find({
      user_id: uid,
      is_deleted: false,
      name: { $regex: regex },
    })
      .limit(5)
      .lean();

    accounts.forEach((acc) => {
      results.push({
        id: acc._id.toString(),
        type: "account",
        title: acc.name,
        subtitle: `Account • Balance: ${acc.current_balance}`,
        url: `/accounts`,
      });
    });

    // 4. Search Bills
    const bills = await Bill.find({
      user_id: uid,
      title: { $regex: regex },
    })
      .limit(5)
      .lean();

    bills.forEach((bill) => {
      results.push({
        id: bill._id.toString(),
        type: "bill",
        title: bill.title,
        subtitle: `Bill • Amount: ${bill.amount}`,
        url: `/bills`,
      });
    });

    return results;
  },
};
