import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { message } = await req.json();

  const task = await db.task.update({
    where: { id: params.id },
    data: { status: "in_progress" },
    include: { creator: true },
  });

  // Post a submission comment
  await db.comment.create({
    data: {
      content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: message ?? "Work submitted for review." }] }] },
      authorId: userId,
      taskId: params.id,
    },
  });

  // Notify the task creator
  if (task.creatorId !== userId) {
    await createNotification({
      userId: task.creatorId,
      type: "submission",
      title: "Work submitted",
      message: `Work was submitted for task: "${task.name}"`,
      link: `/tasks/${task.id}`,
    });
  }

  return NextResponse.json(task);
}
