import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Meeting from "@/models/Meeting";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const meetingsResult = await Meeting.deleteMany({});
  const usersResult = await User.deleteMany({});

  return NextResponse.json({
    ok: true,
    deletedMeetings: meetingsResult.deletedCount,
    deletedUsers: usersResult.deletedCount,
    timestamp: new Date().toISOString(),
  });
}
