import { Bill } from "../../modules/bill/bill.model";
import { Budget } from "../../modules/budget/budget.model";
import { Installment } from "../../modules/installment/installment.model";
import { createAndEmitNotification } from "../../modules/notification/notification.helper";
import { Notification } from "../../modules/notification/notification.model";
import { Transaction } from "../../modules/transaction/transaction.model";
import { User } from "../../modules/user/user.model";
import {
  reminderColors,
  reminderIcons,
  reminderTemplate,
} from "../../utils/email-templates";
import { sendEmail } from "../../utils/send-email";

const ALERT_DAYS_THRESHOLD = 3;
const BUDGET_WARNING_THRESHOLD = 0.8;
const DEDUPE_WINDOW_HOURS = 20;

let stats = { sent: 0, skipped: 0, failed: 0 };

const wasRecentlyNotified = async (
  userId: string,
  title: string,
  message: string,
) => {
  const since = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000);
  return Notification.exists({
    user_id: userId,
    title,
    message,
    createdAt: { $gte: since },
  });
};

const notifyUser = async (
  userId: string,
  title: string,
  message: string,
  type: string,
  category: string = "system",
) => {
  try {
    if (await wasRecentlyNotified(userId, title, message)) {
      stats.skipped++;
      return;
    }

    const notification = await createAndEmitNotification(userId, {
      title,
      message,
      type,
      category,
    });

    if (!notification) {
      stats.failed++;
      console.error(
        `[CRON Reminder] Skipping email for user ${userId}: notification could not be stored.`,
      );
      return;
    }

    stats.sent++;

    const user = await User.findById(userId);
    if (user && user.user_email) {
      const accentColor = reminderColors[type] ?? reminderColors.default;
      const icon = reminderIcons[type] ?? reminderIcons.default;
      await sendEmail(
        user.user_email,
        title,
        reminderTemplate(title, message, {
          icon,
          accentColor,
          userName: user.user_name,
        }),
      );
    }
  } catch (err) {
    stats.failed++;
    console.error(`[CRON Reminder] Failed to notify user ${userId}:`, err);
  }
};

const checkBills = async (now: Date, targetDate: Date) => {
  const upcomingBills = await Bill.find({
    status: { $ne: "paid" },
    auto_reminder: true,
    due_date: { $gte: now, $lte: targetDate },
  });

  for (const bill of upcomingBills) {
    await notifyUser(
      bill.user_id.toString(),
      "Upcoming Bill Reminder",
      `Your bill "${bill.title}" of ${bill.amount} is due on ${new Date(bill.due_date).toLocaleDateString()}.`,
      "bill_due",
      "reminder",
    );
  }

  const overdueBills = await Bill.find({
    status: { $ne: "paid" },
    auto_reminder: true,
    due_date: { $lt: now },
  });

  for (const bill of overdueBills) {
    await notifyUser(
      bill.user_id.toString(),
      "Overdue Bill Alert",
      `URGENT: Your bill "${bill.title}" of ${bill.amount} was due on ${new Date(bill.due_date).toLocaleDateString()} and is currently overdue!`,
      "bill_overdue",
      "reminder",
    );
  }
};

const getNextPaymentDate = (startDate: Date, monthsPaid: number): Date => {
  const next = new Date(startDate);
  next.setMonth(next.getMonth() + monthsPaid);
  return next;
};

const checkEMIs = async (now: Date, targetDate: Date) => {
  try {
    const activeEMIs = await Installment.find({
      is_completed: false,
      is_deleted: false,
    });

    for (const emi of activeEMIs) {
      const dueDate = getNextPaymentDate(emi.start_date, emi.months_paid);
      if (dueDate < now || dueDate > targetDate) continue;

      await notifyUser(
        emi.user_id.toString(),
        "Upcoming EMI Reminder",
        `Your EMI for "${emi.title}" of ${emi.monthly_amount} is due on ${dueDate.toLocaleDateString()}.`,
        "emi_due",
        "reminder",
      );
    }
  } catch (error) {
    console.error("[CRON Reminder] EMI check error", error);
  }
};

const checkBudgets = async (now: Date) => {
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthYear = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

  const activeBudgets = await Budget.find({ month_year: monthYear });

  for (const budget of activeBudgets) {
    const spentData = await Transaction.aggregate([
      {
        $match: {
          user_id: budget.user_id,
          category_id: budget.category_id,
          type: "expense",
          date: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
          is_deleted: false,
        },
      },
      {
        $group: { _id: null, total: { $sum: "$amount" } },
      },
    ]);

    const spent = spentData[0]?.total || 0;
    const ratio = spent / budget.amount;

    if (ratio >= BUDGET_WARNING_THRESHOLD && ratio < 1) {
      await notifyUser(
        budget.user_id.toString(),
        "Budget Warning",
        `You have consumed ${(ratio * 100).toFixed(0)}% of your budget for this category.`,
        "budget_alert",
        "budget",
      );
    } else if (ratio >= 1) {
      await notifyUser(
        budget.user_id.toString(),
        "Budget Exceeded",
        `You have exceeded your budget of ${budget.amount}. Total spent: ${spent}.`,
        "budget_exceeded",
        "budget",
      );
    }
  }
};

export const runReminderJobs = async () => {
  console.log("[CRON Reminder] Running daily system check...");
  const now = new Date();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + ALERT_DAYS_THRESHOLD);

  stats = { sent: 0, skipped: 0, failed: 0 };

  try {
    await checkBills(now, targetDate);
    await checkEMIs(now, targetDate);
    await checkBudgets(now);
  } catch (error) {
    console.error("[CRON Reminder] Failed execution:", error);
  }

  console.log(
    `[CRON Reminder] Done. sent=${stats.sent} skipped=${stats.skipped} failed=${stats.failed}`,
  );

  return stats;
};
