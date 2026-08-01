"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";

export default function InvitePage({ params }) {
  const { id } = use(params);
  const [meeting, setMeeting] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [email, setEmail] = useState("");
  const [responded, setResponded] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/meetings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.meeting) setMeeting(data.meeting);
        else setNotFound(true);
      });
  }, [id]);

  async function respond(status) {
    setError("");
    setSubmitting(true);

    const res = await fetch(`/api/meetings/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, status }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }
    setResponded(status);
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(circle at 30% 20%, #EEF0FA 0%, var(--paper) 55%)",
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-8 text-center"
        style={{ boxShadow: "0 30px 80px -20px rgba(46,49,146,0.25)" }}
      >
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="मिलनम्"
            width={90}
            height={50}
            style={{ width: "auto", height: "32px" }}
          />
        </div>

        {notFound ? (
          <>
            <h1
              className="text-lg font-semibold mb-1"
              style={{ color: "var(--ink)" }}
            >
              Invite not found
            </h1>
            <p className="text-sm" style={{ color: "#8B8FA3" }}>
              This meeting link may have expired or been cancelled.
            </p>
          </>
        ) : !meeting ? (
          <p className="text-sm" style={{ color: "#8B8FA3" }}>
            Loading invite…
          </p>
        ) : responded ? (
          <ResponseConfirmed status={responded} meeting={meeting} />
        ) : (
          <>
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
              style={{ background: "#F1EEFC", color: "var(--indigo)" }}
            >
              You&apos;re invited
            </span>
            <h1
              className="text-xl font-display mb-2"
              style={{ color: "var(--ink)" }}
            >
              {meeting.title}
            </h1>
            <p className="text-sm mb-6" style={{ color: "#8B8FA3" }}>
              {new Date(meeting.startTime).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>

            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2"
              style={{
                border: "1px solid var(--line)",
                "--tw-ring-color": "var(--indigo)",
              }}
            />
            {error && (
              <p className="text-xs mb-3" style={{ color: "var(--signal)" }}>
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => respond("declined")}
                disabled={submitting || !email}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors hover:bg-gray-50"
                style={{ border: "1px solid var(--line)", color: "var(--ink)" }}
              >
                Decline
              </button>
              <button
                onClick={() => respond("accepted")}
                disabled={submitting || !email}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-transform hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--indigo), var(--purple))",
                }}
              >
                {submitting ? "..." : "Accept"}
              </button>
            </div>

            <p className="text-xs mt-5" style={{ color: "#B4B7C6" }}>
              No account needed to respond.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function ResponseConfirmed({ status, meeting }) {
  const accepted = status === "accepted";
  return (
    <>
      <div
        className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: accepted ? "#F1EEFC" : "#FEF0EF" }}
      >
        {accepted ? <CheckIcon /> : <XIcon />}
      </div>
      <h1
        className="text-lg font-semibold mb-1"
        style={{ color: "var(--ink)" }}
      >
        {accepted ? "You're in" : "Invite declined"}
      </h1>
      <p className="text-sm" style={{ color: "#8B8FA3" }}>
        {accepted
          ? `We'll see you at "${meeting.title}".`
          : "You won't be attending this meeting."}
      </p>
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--indigo)"
      strokeWidth="2.5"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--signal)"
      strokeWidth="2.5"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
