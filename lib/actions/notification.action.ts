"use server";

import Notification from "@/database/notification.model";
import { connectToDatabase } from "../mongoose";
import { revalidatePath } from "next/cache";

export async function getNotifications(params: { userId: string }) {
  try {
    await connectToDatabase();
    const { userId } = params;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return { notifications: JSON.parse(JSON.stringify(notifications)) };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUnreadNotificationsCount(params: { userId: string }) {
  try {
    await connectToDatabase();
    const { userId } = params;

    const count = await Notification.countDocuments({ recipient: userId, isRead: false });

    return count;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function markNotificationAsRead(params: { notificationId: string, path: string }) {
  try {
    await connectToDatabase();
    const { notificationId, path } = params;

    await Notification.findByIdAndUpdate(notificationId, { isRead: true });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createNotification(params: {
  recipient: string;
  type: 'POST_DELETED' | 'POST_EDITED' | 'COMMENT_ADDED' | 'USER_TAGS_UPDATED' | 'ROLE_UPDATED';
  message: string;
  link?: string;
}) {
  try {
    await connectToDatabase();
    const { recipient, type, message, link } = params;

    await Notification.create({
      recipient,
      type,
      message,
      link
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
