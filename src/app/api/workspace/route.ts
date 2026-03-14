import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const member = await db.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
  });

  if (!member) return NextResponse.json({ error: "No workspace" }, { status: 404 });
  return NextResponse.json(member.workspace);
}
