import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Meeting from "@/models/Meeting";
import { generateRtcToken } from "@/lib/agora";

const JOIN_WINDOW_MINUTES_BEFORE = 10;

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { meetingId } = await request.json();
  await connectDB();

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const isHost = meeting.hostId.toString() === session.user.id;
  const isParticipant = meeting.participants.some(
    (p) => p.email === session.user.email,
  );
  if (!isHost && !isParticipant) {
    return NextResponse.json(
      { error: "You are not invited to this meeting" },
      { status: 403 },
    );
  }

  const now = Date.now();
  const windowStart =
    new Date(meeting.startTime).getTime() - JOIN_WINDOW_MINUTES_BEFORE * 60_000;
  const windowEnd = new Date(meeting.endTime).getTime();

  if (now < windowStart) {
    return NextResponse.json(
      { error: "This meeting has not started yet" },
      { status: 403 },
    );
  }
  if (now > windowEnd) {
    return NextResponse.json(
      { error: "This meeting has ended" },
      { status: 403 },
    );
  }

  const uid = parseInt(session.user.id.slice(-6), 16) % 100000;
  const token = generateRtcToken(meeting.roomId, uid);

  return NextResponse.json({
    token,
    uid,
    channel: meeting.roomId,
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID,
  });
}
