import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { name, description, missionId, assigneeId, priority, dueDate, status } = await req.json();

  const task = await db.task.create({
    data: {
      name,
      description,
      missionId,
      creatorId: userId,
      assigneeId,
      priority: priority ?? "medium",
      status: status ?? "todo",
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      checklist: true,
      tags: true,
    },
  });

  // Notify assignee
  if (assigneeId && assigneeId !== userId) {
    await createNotification({
      userId: assigneeId,
      type: "assigned",
      title: "New task assigned",
      message: `You were assigned: "${name}"`,
      link: `/tasks/${task.id}`,
    });
  }

  return NextResponse.json(task, { status: 201 });
}
