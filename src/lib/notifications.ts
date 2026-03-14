import { db } from "./db";

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string;
}) {
  return db.notification.create({
    data: { userId, type, title, message, link },
  });
}
