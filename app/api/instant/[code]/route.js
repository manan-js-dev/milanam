import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Meeting from "@/models/Meeting";

export async function GET(request, { params }) {
  const { code } = await params;

  await connectDB();
  const meeting = await Meeting.findOne({
    joinCode: code.toUpperCase(),
    isInstant: true,
  });

  if (!meeting) {
    return NextResponse.json(
      { error: "Meeting not found. Check the code and try again." },
      { status: 404 },
    );
  }
  if (new Date() > new Date(meeting.endTime)) {
    return NextResponse.json(
      { error: "This meeting has expired." },
      { status: 410 },
    );
  }

  return NextResponse.json({ meeting });
}
