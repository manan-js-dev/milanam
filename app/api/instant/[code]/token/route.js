import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Meeting from "@/models/Meeting";
import { generateRtcToken } from "@/lib/agora";

export async function POST(request, { params }) {
  const { code } = await params;
  const { name } = await request.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  await connectDB();
  const meeting = await Meeting.findOne({
    joinCode: code.toUpperCase(),
    isInstant: true,
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  if (new Date() > new Date(meeting.endTime)) {
    return NextResponse.json(
      { error: "This meeting has expired" },
      { status: 410 },
    );
  }

  const uid = Math.floor(Math.random() * 100000) + 1;
  const token = generateRtcToken(meeting.roomId, uid);

  return NextResponse.json({
    token,
    uid,
    channel: meeting.roomId,
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID,
    meetingTitle: meeting.title,
  });
}
