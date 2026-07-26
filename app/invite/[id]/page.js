"use client";

import { use, useEffect, useState } from "react";

export default function InvitePage({ params }) {
  const { id } = use(params);
  const [meeting, setMeeting] = useState(null);
  const [email, setEmail] = useState("");
  const [responded, setResponded] = useState(null);
  const [error, setError] = useState("");

useEffect(() => {
  fetch(`/api/meetings/${id}/public`)
    .then((r) => r.json())
    .then((data) => setMeeting(data.meeting));
}, [id]);

  async function respond(status) {
    setError("");

    const res = await fetch(`/api/meetings/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, status }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }
    setResponded(status);
  }

  if (!meeting)
    return <p style={{ textAlign: "center", marginTop: 60 }}>Loading…</p>;

  return (
    <main
      style={{
        maxWidth: 380,
        margin: "80px auto",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <h2>{meeting.title}</h2>
      <p style={{ color: "#666" }}>
        {new Date(meeting.startTime).toLocaleString()}
      </p>

      {responded ? (
        <p>
          You&apos;ve {responded === "accepted" ? "accepted" : "declined"} this
          invite.
        </p>
      ) : (
        <>
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 10,
              padding: 8,
            }}
          />
          {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}
          <button onClick={() => respond("declined")}>Decline</button>{" "}
          <button onClick={() => respond("accepted")}>Accept</button>
        </>
      )}
    </main>
  );
}
