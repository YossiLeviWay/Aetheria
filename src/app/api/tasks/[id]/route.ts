import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await db.task.findUnique({
    where: { id: params.id },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      checklist: { orderBy: { sortOrder: "asc" } },
      tags: true,
      attachments: true,
      comments: {
        where: { parentId: null },
        include: {
          author: { select: { id: true, name: true, image: true } },
          reactions: true,
          replies: {
            include: {
              author: { select: { id: true, name: true, image: true } },
              reactions: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updates = await req.json();
  const task = await db.task.update({
    where: { id: params.id },
    data: {
      ...updates,
      dueDate: updates.dueDate ? new Date(updates.dueDate) : updates.dueDate === null ? null : undefined,
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      checklist: true,
      tags: true,
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.task.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
