import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  try {
    // Delete in correct dependency order
    await db.notification.deleteMany({ where: { userId } });
    await db.reaction.deleteMany({ where: { userId } });
    await db.comment.deleteMany({ where: { authorId: userId } });
    await db.calendarAccount.deleteMany({ where: { userId } });
    await db.workspaceMember.deleteMany({ where: { userId } });
    await db.account.deleteMany({ where: { userId } });
    await db.session.deleteMany({ where: { userId } });
    await db.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
