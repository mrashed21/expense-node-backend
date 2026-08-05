import { BillService } from "@/modules/bill/bill.service";
import { TransactionService } from "@/modules/transaction/transaction.service";
import { TransferService } from "@/modules/transfer/transfer.service";
import cron from "node-cron";
import {
  Recurring,
  RecurringFrequency,
  RecurringStatus,
} from "./recurring.model";

/**
 * Calculates the next run date based on the frequency.
 */
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

/**
 * Executes a single recurring task based on its type.
 */
const executeTask = async (task: any) => {
  const userId = task.user_id.toString();
  const template = task.template;

  try {
    switch (task.type) {
      case "transaction":
        // Add date to the template
        const txData = { ...template, date: new Date() };
        await TransactionService.createTransaction(userId, txData);
        break;
      case "bill":
        const billData = {
          ...template,
          due_date: calculateNextRunDate(new Date(), task.frequency),
        }; // Bill due is next cycle
        await BillService.createBill(userId, billData);
        break;
      case "transfer":
        const transferData = { ...template, date: new Date() };
        await TransferService.createTransfer(userId, transferData);
        break;
      default:
        console.warn(`Unknown recurring type: ${task.type}`);
    }
  } catch (error) {
    console.error(`Failed to execute recurring task ${task._id}:`, error);
    throw error;
  }
};

/**
 * The main cron job runner.
 * Scans for active tasks where next_run_date is less than or equal to now.
 */
const runRecurringJobs = async () => {
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

        // Update task with new run date
        task.last_run_date = new Date();
        task.next_run_date = calculateNextRunDate(
          task.next_run_date,
          task.frequency as RecurringFrequency,
        );
        // @ts-ignore
        await task.save();

        console.log(`[CRON] Successfully executed task ${task._id}`);
      } catch (err) {
        // Continue to the next task even if one fails
      }
    }
  } catch (error) {
    console.error("[CRON] Error querying recurring tasks:", error);
  }
};

/**
 * Initialize the cron job.
 * Runs every hour on the hour (0 * * * *).
 * Adjust schedule as needed (e.g., '0 0 * * *' for midnight).
 */
export const initRecurringCron = () => {
  // Run every hour to catch anything due
  cron.schedule("0 * * * *", () => {
    runRecurringJobs();
  });

  // Run immediately on startup just in case we missed some while server was down
  setTimeout(() => {
    runRecurringJobs();
  }, 10000); // Wait 10 seconds after boot
};
