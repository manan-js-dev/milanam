import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Meeting from "@/models/Meeting";

export async function POST(request, { params }) {
  const { id } = await params;
  const { email, status } = await request.json();

  if (!email || !["accepted", "declined"].includes(status)) {
    return NextResponse.json(
      { error: "A valid email and status (accepted/declined) are required" },
      { status: 400 },
    );
  }

  await connectDB();
  const meeting = await Meeting.findById(id);
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const participant = meeting.participants.find(
    (p) => p.email === email.toLowerCase(),
  );
  if (!participant) {
    return NextResponse.json(
      { error: "This email was not invited to this meeting" },
      { status: 403 },
    );
  }

  participant.status = status;
  await meeting.save();

  return NextResponse.json({ ok: true, meeting });
}
