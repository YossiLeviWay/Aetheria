import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const accounts = await db.calendarAccount.findMany({
    where: { userId },
    include: {
      events: {
        orderBy: { startTime: "asc" },
      },
    },
  });

  const events = accounts.flatMap((a) =>
    a.events.map((e) => ({
      ...e,
      account: { color: a.color, calendarName: a.calendarName },
    }))
  );

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { title, startTime, endTime, allDay, location, description } = body;

  if (!title || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Get or create a default "Personal" calendar account
  let account = await db.calendarAccount.findFirst({
    where: { userId, provider: "local" },
  });

  if (!account) {
    account = await db.calendarAccount.create({
      data: {
        userId,
        provider: "local",
        accessToken: "local",
        externalId: `local-${userId}`,
        calendarName: "Personal",
        color: "#4F46E5",
      },
    });
  }

  const event = await db.calendarEvent.create({
    data: {
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      allDay: allDay ?? false,
      location,
      description,
      accountId: account.id,
    },
  });

  return NextResponse.json({ ...event, account: { color: account.color, calendarName: account.calendarName } }, { status: 201 });
}
