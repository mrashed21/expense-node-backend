import { publishToUser } from "../../utils/ably";
import { INotificationDocument } from "./notification.interface";
import { Notification } from "./notification.model";

interface NotificationPayload {
  title: string;
  message: string;
  type: INotificationDocument["type"];
  category?: string;
}

/**
 * Creates a Notification document in MongoDB and emits a real-time
 * `new_notification` event via Ably to the target user's channel.
 */
export const createAndEmitNotification = async (
  userId: string,
  payload: NotificationPayload,
): Promise<void> => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      ...payload,
    });

    await publishToUser(userId, "new_notification", notification);
  } catch (err) {
    // Notifications are non-critical — log but do not propagate errors
    // to avoid breaking the primary business transaction that triggered them.
    console.error("[NotificationHelper] Failed to create/emit notification:", err);
  }
};
