"use client";

import { use, useEffect, useState } from "react";
import VideoRoom from "@/components/VideoRoom";

export default function MeetingRoomPage({ params }) {
  const { id } = use(params);
  const [meeting, setMeeting] = useState(null);

  useEffect(() => {
    fetch(`/api/meetings/${id}`)
      .then((r) => r.json())
      .then((data) => setMeeting(data.meeting));
  }, [id]);

  if (!meeting)
    return <p style={{ textAlign: "center", marginTop: 60 }}>Loading…</p>;

  return (
    <main
      style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}
    >
      <h2 style={{ textAlign: "center" }}>{meeting.title}</h2>
      <VideoRoom meetingId={meeting._id} />
    </main>
  );
}
