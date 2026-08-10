import { BillService } from "../../modules/bill/bill.service";
import { NotificationService } from "../../modules/notification/notification.service";
import { TransactionService } from "../../modules/transaction/transaction.service";
import { TransferService } from "../../modules/transfer/transfer.service";
import {
  Recurring,
  RecurringFrequency,
  RecurringStatus,
} from "./recurring.model";

const calculateNextRunDate = (
  currentDate: Date,
  frequency: RecurringFrequency,
): Date => {
  const nextDate = new Date(currentDate);
  switch (frequency) {
    case RecurringFrequency.DAILY:
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case RecurringFrequency.WEEKLY:
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case RecurringFrequency.MONTHLY:
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case RecurringFrequency.YEARLY:
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  return nextDate;
};

const executeTask = async (task: any) => {
  const userId = task.user_id.toString();
  const template = task.template;

  try {
    switch (task.type) {
      case "transaction":
        const txData = { ...template, date: new Date() };
        await TransactionService.createTransaction(userId, txData);
        await NotificationService.createNotification(userId, {
          title: "Automated Transaction Executed",
          message: `Your scheduled transaction has been successfully processed.`,
          type: "success",
          category: "system",
        });
        break;
      case "bill":
        const billData = {
          ...template,
          due_date: calculateNextRunDate(new Date(), task.frequency),
        };
        await BillService.createBill(userId, billData);
        await NotificationService.createNotification(userId, {
          title: "Automated Bill Generated",
          message: `Your scheduled bill has been successfully generated.`,
          type: "success",
          category: "system",
        });
        break;
      case "transfer":
        const transferData = { ...template, date: new Date() };
        await TransferService.createTransfer(userId, transferData);
        await NotificationService.createNotification(userId, {
          title: "Automated Transfer Executed",
          message: `Your scheduled transfer has been successfully processed.`,
          type: "success",
          category: "system",
        });
        break;
      default:
        console.warn(`Unknown recurring type: ${task.type}`);
    }
  } catch (error) {
    console.error(`Failed to execute recurring task ${task._id}:`, error);
    throw error;
  }
};

export const runRecurringJobs = async () => {
  console.log("[CRON] Checking for due recurring tasks...");
  const now = new Date();

  try {
    const dueTasks = await Recurring.find({
      status: RecurringStatus.ACTIVE,
      next_run_date: { $lte: now },
    });

    if (dueTasks.length === 0) {
      return;
    }

    console.log(`[CRON] Found ${dueTasks.length} recurring tasks to execute.`);

    for (const task of dueTasks) {
      try {
        await executeTask(task);

        task.last_run_date = new Date();
        task.next_run_date = calculateNextRunDate(
          task.next_run_date,
          task.frequency as RecurringFrequency,
        );

        await task.save();

        console.log(`[CRON] Successfully executed task ${task._id}`);
      } catch (err) {}
    }
  } catch (error) {
    console.error("[CRON] Error querying recurring tasks:", error);
  }
};
