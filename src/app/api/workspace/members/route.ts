import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const member = await db.workspaceMember.findFirst({ where: { userId } });
  if (!member) return NextResponse.json([]);

  const members = await db.workspaceMember.findMany({
    where: { workspaceId: member.workspaceId },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { email, role } = await req.json();

  const member = await db.workspaceMember.findFirst({ where: { userId } });
  if (!member || member.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invitedUser = await db.user.findUnique({ where: { email } });
  if (!invitedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await db.workspaceMember.findFirst({
    where: { userId: invitedUser.id, workspaceId: member.workspaceId },
  });
  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 400 });
  }

  const newMember = await db.workspaceMember.create({
    data: { userId: invitedUser.id, workspaceId: member.workspaceId, role: role ?? "member" },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });

  return NextResponse.json(newMember);
}
