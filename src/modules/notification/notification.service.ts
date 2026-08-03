import ApiError from "@/helpers/api-error";
import httpStatus from "http-status";
import { Notification } from "./notification.model";

export const NotificationService = {
  getUserNotifications: async (userId: string) => {
    return Notification.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  },

  getUnreadCount: async (userId: string) => {
    return Notification.countDocuments({ user_id: userId, is_read: false });
  },

  markAsRead: async (userId: string, notificationId: string) => {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user_id: userId },
      { is_read: true },
      { new: true },
    );
  },

  markAllAsRead: async (userId: string) => {
    await Notification.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
    return true;
  },

  deleteNotification: async (userId: string, notificationId: string) => {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user_id: userId,
    });
    if (!notification) {
      throw new ApiError(httpStatus.NOT_FOUND, "Notification not found.");
    }
    return true;
  },
};

