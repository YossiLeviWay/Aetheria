import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await db.task.findMany({
    where: {
      AND: [
        {
          OR: [
            { assigneeId: userId },
            { creatorId: userId },
          ],
        },
        {
          OR: [
            { dueDate: { gte: today, lt: tomorrow } },
            { status: { in: ["in_progress", "todo"] } },
          ],
        },
      ],
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      checklist: true,
      tags: true,
    },
    orderBy: { sortOrder: "asc" },
    take: 50,
  });

  return NextResponse.json(tasks);
}
