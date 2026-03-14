import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mission = await db.mission.findUnique({
    where: { id: params.id },
    include: {
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, image: true } },
          checklist: { orderBy: { sortOrder: "asc" } },
          tags: true,
          _count: { select: { comments: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!mission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mission);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updates = await req.json();
  const mission = await db.mission.update({
    where: { id: params.id },
    data: {
      ...updates,
      startDate: updates.startDate ? new Date(updates.startDate) : undefined,
      dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
    },
  });

  return NextResponse.json(mission);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.mission.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
