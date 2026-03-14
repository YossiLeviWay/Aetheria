import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { memberId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const adminMember = await db.workspaceMember.findFirst({ where: { userId } });
  if (!adminMember || adminMember.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { role } = await req.json();
  const member = await db.workspaceMember.update({
    where: { id: params.memberId },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });

  return NextResponse.json(member);
}

export async function DELETE(_req: NextRequest, { params }: { params: { memberId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const adminMember = await db.workspaceMember.findFirst({ where: { userId } });
  if (!adminMember || adminMember.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.workspaceMember.delete({ where: { id: params.memberId } });
  return NextResponse.json({ success: true });
}
