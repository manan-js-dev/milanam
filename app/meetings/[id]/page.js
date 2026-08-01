"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import VideoRoom from "@/components/VideoRoom";

export default function MeetingRoomPage({ params }) {
  const { id } = use(params);
  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/meetings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.meeting) setMeeting(data.meeting);
        else setError(data.error || "Meeting not found.");
      });
  }, [id]);

  if (error) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--ink)" }}
      >
        <p className="text-sm" style={{ color: "var(--signal)" }}>
          {error}
        </p>
      </main>
    );
  }

  if (!meeting) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--ink)" }}
      >
        <p className="text-sm text-white/50">Loading…</p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "#0D0D1A" }}
    >
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="मिलनम्"
            width={80}
            height={45}
            style={{ width: "auto", height: "60px" }}
          />
          <span className="text-white/30">|</span>
          <h1 className="text-white text-sm font-medium">{meeting.title}</h1>
        </div>
        <span className="text-xs text-white/40">
          {new Date(meeting.startTime).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 pb-6">
        <VideoRoom
          fetchToken={async () => {
            const res = await fetch("/api/agora/token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ meetingId: meeting._id }),
            });
            const data = await res.json();
            return res.ok ? data : { error: data.error };
          }}
        />
      </div>
    </main>
  );
}
