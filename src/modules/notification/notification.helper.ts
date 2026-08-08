import { Server } from "socket.io";
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
 * `new_notification` event to the target user's private socket room.
 *
 * The user's socket room is keyed by their userId string (joined on connect).
 * If the server has no Socket.io instance (e.g. tests), it skips the emit.
 */
export const createAndEmitNotification = async (
  io: Server | null,
  userId: string,
  payload: NotificationPayload,
): Promise<void> => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      ...payload,
    });

    if (io) {
      io.to(userId).emit("new_notification", notification);
    }
  } catch (err) {
    // Notifications are non-critical — log but do not propagate errors
    // to avoid breaking the primary business transaction that triggered them.
    console.error("[NotificationHelper] Failed to create notification:", err);
  }
};
