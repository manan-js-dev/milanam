import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Meeting from "@/models/Meeting";

export async function GET(request, { params }) {
  const { id } = await params;

  await connectDB();
  const meeting = await Meeting.findById(id).select("title startTime endTime");
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  return NextResponse.json({ meeting });
}
