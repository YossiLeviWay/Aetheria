import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { name, description, projectId, priority, startDate, dueDate } = await req.json();

  const mission = await db.mission.create({
    data: {
      name,
      description,
      projectId,
      creatorId: userId,
      priority: priority ?? "medium",
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: { _count: { select: { tasks: true } } },
  });

  return NextResponse.json(mission, { status: 201 });
}
