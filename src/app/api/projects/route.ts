import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const member = await db.workspaceMember.findFirst({ where: { userId } });
  if (!member) return NextResponse.json([]);

  const projects = await db.project.findMany({
    where: { workspaceId: member.workspaceId },
    include: { _count: { select: { missions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const member = await db.workspaceMember.findFirst({ where: { userId } });
  if (!member) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const { name, description, color, icon } = await req.json();
  const project = await db.project.create({
    data: {
      name,
      description,
      color: color ?? "#4F46E5",
      icon,
      creatorId: userId,
      workspaceId: member.workspaceId,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
