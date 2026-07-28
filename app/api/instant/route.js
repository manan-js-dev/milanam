import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Meeting from "@/models/Meeting";
import { generateJoinCode } from "@/lib/joinCode";

export async function POST(request) {
  const { hostName } = await request.json();

  if (!hostName || !hostName.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  await connectDB();

  let joinCode;
  let exists = true;
  while (exists) {
    joinCode = generateJoinCode();
    exists = await Meeting.findOne({ joinCode });
  }

  const meeting = await Meeting.create({
    title: `${hostName.trim()}'s meeting`,
    hostName: hostName.trim(),
    isInstant: true,
    joinCode,
    startTime: new Date(),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6-hour safety expiry
    status: "live",
  });

  return NextResponse.json({
    joinCode: meeting.joinCode,
    meetingId: meeting._id,
  });
}
