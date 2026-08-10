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
): Promise<void> => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      ...payload,
    });

    await publishToUser(userId, "new_notification", notification.toJSON());
  } catch (err) {
    console.error(
      "[NotificationHelper] Failed to create/emit notification:",
      err,
    );
  }
};
