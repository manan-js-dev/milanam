"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Calendar from "@/components/Calendar";

export default function DashboardPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [participants, setParticipants] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(new Date());

  async function loadMeetings() {
    const res = await fetch("/api/meetings");
    const data = await res.json();
    setMeetings(data.meetings || []);
    setLoading(false);
  }

  useEffect(() => {
    loadMeetings();
  }, []);

  // Re-check "is this meeting live right now" every 30s, so the highlight
  // turns on/off without needing a page refresh
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        participants: participants
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }
    setTitle("");
    setStartTime("");
    setEndTime("");
    setParticipants("");
    loadMeetings();
  }

  const upcoming = meetings
    .filter((m) => new Date(m.endTime) > now && m.status !== "cancelled")
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  function isLive(m) {
    return new Date(m.startTime) <= now && new Date(m.endTime) > now;
  }

  const cardStyle = {
    border: "1px solid var(--line)",
    boxShadow: "0 4px 20px -8px rgba(46,49,146,0.08)",
  };
  const inputStyle = {
    border: "1px solid var(--line)",
    "--tw-ring-color": "var(--indigo)",
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col lg:h-[calc(100vh-64px)]">
      <h1
        className="font-display text-2xl mb-6 shrink-0"
        style={{ color: "var(--ink)" }}
      >
        Your meetings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 lg:min-h-0">
        {/* Left column: form + upcoming, stacked */}
        <div className="flex flex-col gap-6 min-h-0">
          <div className="rounded-2xl p-6 bg-white shrink-0" style={cardStyle}>
            <div className="flex items-center gap-2.5 mb-4">
              <IconBadge color="var(--indigo)">
                <CalendarPlusIcon />
              </IconBadge>
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Schedule a meeting
              </h2>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input
                placeholder="Meeting title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
              <div>
                <label className="text-xs" style={{ color: "#8B8FA3" }}>
                  Starts
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm mt-1 focus:outline-none focus:ring-2"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs" style={{ color: "#8B8FA3" }}>
                  Ends
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm mt-1 focus:outline-none focus:ring-2"
                  style={inputStyle}
                />
              </div>
              <input
                placeholder="Invite by email, comma separated"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
              {error && (
                <p className="text-xs" style={{ color: "var(--signal)" }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl py-2.5 text-sm font-semibold text-white mt-1 disabled:opacity-50 transition-transform hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--indigo), var(--purple))",
                }}
              >
                {submitting ? "Scheduling…" : "Schedule meeting"}
              </button>
            </form>
          </div>

          <div
            className="rounded-2xl p-6 bg-white flex flex-col flex-1 min-h-0"
            style={cardStyle}
          >
            <div className="flex items-center gap-2.5 mb-4 shrink-0">
              <IconBadge color="var(--purple)">
                <ClockIcon />
              </IconBadge>
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Up next
              </h2>
            </div>

            {loading ? (
              <p className="text-sm" style={{ color: "#8B8FA3" }}>
                Loading…
              </p>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-8">
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "#F1EEFC" }}
                >
                  <ClockIcon />
                </div>
                <p className="text-sm" style={{ color: "#8B8FA3" }}>
                  Nothing scheduled yet.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-1 min-h-0">
                {upcoming.map((m) => {
                  const live = isLive(m);
                  return (
                          <li key={m._id}>
                            {live ? (
                                <Link
                                  href={`/meetings/${m._id}`}
                                  className="block rounded-xl px-3.5 py-2.5 transition-colors hover:opacity-90"
                                  style={{ background: 'linear-gradient(135deg, var(--indigo), var(--purple))', border: 'none' }}
                                >
                                  <MeetingRow meeting={m} live />
                                </Link>
                            ) : (
                              <div
                                className="rounded-xl px-3.5 py-2.5"
                                style={{ border: '1px solid var(--line)', cursor: 'default' }}
                              >
                                <MeetingRow meeting={m} live={false} />
                              </div>
                            )}
                          </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right: calendar, spans 2 of 3 columns */}
        <div
          className="lg:col-span-2 rounded-2xl p-4 bg-white"
          style={cardStyle}
        >
          {loading ? (
            <p className="text-sm p-4" style={{ color: "#8B8FA3" }}>
              Loading calendar…
            </p>
          ) : (
            <Calendar meetings={meetings} />
          )}
        </div>
      </div>
    </main>
  );
}

function IconBadge({ color, children }) {
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
      style={{ background: color }}
    >
      {children}
    </div>
  );
}

function CalendarPlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4M12 14v6M9 17h6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function MeetingRow({ meeting, live }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <p
          className="text-sm font-medium"
          style={{ color: live ? "white" : "var(--ink)" }}
        >
          {meeting.title}
        </p>
        {live && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{ background: "rgba(255,255,255,0.25)", color: "white" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#4ADE80" }}
            />
            LIVE
          </span>
        )}
      </div>
      <p
        className="text-xs mt-0.5"
        style={{ color: live ? "rgba(255,255,255,0.85)" : "#8B8FA3" }}
      >
        {new Date(meeting.startTime).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
    </>
  );
}