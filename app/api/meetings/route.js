import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Meeting from "@/models/Meeting";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, startTime, endTime, participants } =
    await request.json();

  if (!title || !startTime || !endTime) {
    return NextResponse.json(
      { error: "title, startTime and endTime are required" },
      { status: 400 },
    );
  }
  if (new Date(endTime) <= new Date(startTime)) {
    return NextResponse.json(
      { error: "endTime must be after startTime" },
      { status: 400 },
    );
  }

  await connectDB();

  const meeting = await Meeting.create({
    title,
    description,
    hostId: session.user.id,
    startTime,
    endTime,
    participants: (participants || []).map((email) => ({
      email: email.toLowerCase(),
    })),
  });

  return NextResponse.json({ meeting }, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const meetings = await Meeting.find({
    $or: [
      { hostId: session.user.id },
      { "participants.email": session.user.email },
    ],
  }).sort({ startTime: 1 });

  return NextResponse.json({ meetings });
}
