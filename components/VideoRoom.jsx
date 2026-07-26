"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoRoom({ meetingId }) {
  const clientRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const localVideoRef = useRef(null);

  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  async function joinCall() {
    setJoining(true);
    setError("");

    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

      const tokenRes = await fetch("/api/agora/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId }),
      });
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok) {
        setError(tokenData.error);
        setJoining(false);
        return;
      }

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      // Listen for other people publishing audio/video into this channel
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
          setRemoteUsers((prev) => {
            const exists = prev.find((u) => u.uid === user.uid);
            return exists
              ? prev.map((u) => (u.uid === user.uid ? user : u))
              : [...prev, user];
          });
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      // Remove their tile when they stop publishing or leave
      client.on("user-unpublished", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });
      client.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      await client.join(
        tokenData.appId,
        tokenData.channel,
        tokenData.token,
        tokenData.uid,
      );

      const [audioTrack, videoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = { audioTrack, videoTrack };

      await client.publish([audioTrack, videoTrack]);
      setJoined(true);
    } catch (err) {
      console.error(err);
      setError("Could not join — check camera/microphone permissions.");
    } finally {
      setJoining(false);
    }
  }

  useEffect(() => {
    if (joined && localTracksRef.current.videoTrack) {
      localTracksRef.current.videoTrack.play(localVideoRef.current);
    }
  }, [joined]);

  async function leaveCall() {
    const { audioTrack, videoTrack } = localTracksRef.current;
    audioTrack?.close();
    videoTrack?.close();
    await clientRef.current?.leave();
    setJoined(false);
    setRemoteUsers([]);
  }

  function toggleMic() {
    localTracksRef.current.audioTrack?.setEnabled(!micOn);
    setMicOn(!micOn);
  }

  function toggleCam() {
    localTracksRef.current.videoTrack?.setEnabled(!camOn);
    setCamOn(!camOn);
  }

  useEffect(() => {
    return () => {
      const { audioTrack, videoTrack } = localTracksRef.current;
      audioTrack?.close();
      videoTrack?.close();
      clientRef.current?.leave();
    };
  }, []);

  if (!joined) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button onClick={joinCall} disabled={joining}>
          {joining ? "Joining…" : "Join meeting"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            ref={localVideoRef}
            style={{ width: 300, height: 220, background: "#000" }}
          />
          <span style={tagStyle}>You</span>
        </div>
        {remoteUsers.map((user) => (
          <RemoteTile key={user.uid} user={user} />
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 15 }}>
        <button onClick={toggleMic}>{micOn ? "Mute" : "Unmute"}</button>{" "}
        <button onClick={toggleCam}>
          {camOn ? "Stop video" : "Start video"}
        </button>{" "}
        <button onClick={leaveCall}>Leave call</button>
      </div>
    </div>
  );
}

function RemoteTile({ user }) {
  const ref = useRef(null);

  useEffect(() => {
    if (user.videoTrack && ref.current) {
      user.videoTrack.play(ref.current);
    }
  }, [user]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} style={{ width: 300, height: 220, background: "#000" }} />
      <span style={tagStyle}>{user.uid}</span>
    </div>
  );
}

const tagStyle = {
  position: "absolute",
  bottom: 6,
  left: 6,
  fontSize: 12,
  color: "#fff",
  background: "rgba(0,0,0,0.6)",
  padding: "2px 6px",
  borderRadius: 4,
};
