import { publishToUser } from "../../utils/ably";
import { INotificationDocument } from "./notification.interface";
import { Notification } from "./notification.model";

interface NotificationPayload {
  title: string;
  message: string;
  type: INotificationDocument["type"];
  category?: string;
}

export const createAndEmitNotification = async (
  userId: string,
  payload: NotificationPayload,
): Promise<INotificationDocument | null> => {
  let notification: INotificationDocument;

  try {
    notification = await Notification.create({
      user_id: userId,
      ...payload,
    });
  } catch (err) {
    console.error(
      `[NotificationHelper] DB create failed for user ${userId}:`,
      err,
    );
    return null;
  }

  try {
    await publishToUser(userId, "new_notification", notification.toJSON());
  } catch (err) {
    console.error(
      `[NotificationHelper] Ably publish failed for user ${userId}:`,
      err,
    );
  }

  return notification;
};
