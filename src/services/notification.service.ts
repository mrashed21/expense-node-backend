import { Notification } from "../models/notification.model";

export const NotificationService = {
  getUserNotifications: async (userId: string) => {
    return Notification.find({ user_id: userId }).sort({ createdAt: -1 }).limit(30);
  },

  markAsRead: async (userId: string, notificationId: string) => {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user_id: userId },
      { is_read: true },
      { new: true }
    );
  },

  markAllAsRead: async (userId: string) => {
    await Notification.updateMany({ user_id: userId, is_read: false }, { is_read: true });
    return true;
  },
};
