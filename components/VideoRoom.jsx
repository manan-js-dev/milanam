"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoRoom({ fetchToken }) {
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

    let hasAudio = true;
    let hasVideo = true;

    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
    } catch {
      hasAudio = false;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      s.getTracks().forEach((t) => t.stop());
    } catch {
      hasVideo = false;
    }

    if (!hasAudio && !hasVideo) {
      setError("No camera or microphone was found on this device.");
      setJoining(false);
      return;
    }

    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

      const tokenData = await fetchToken();

      if (tokenData.error) {
        setError(tokenData.error);
        setJoining(false);
        return;
      }

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

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
        if (mediaType === "audio") user.audioTrack?.play();
      });
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

      const tracksToPublish = [];

      if (hasAudio) {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localTracksRef.current.audioTrack = audioTrack;
        tracksToPublish.push(audioTrack);
      } else {
        setMicOn(false);
      }

      if (hasVideo) {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        localTracksRef.current.videoTrack = videoTrack;
        tracksToPublish.push(videoTrack);
      } else {
        setCamOn(false);
      }

      await client.publish(tracksToPublish);
      setJoined(true);
    } catch (err) {
      console.error(err);
      setError(`Could not join: ${err.message || "unknown error"}`);
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
      <div className="flex flex-col items-center gap-5">
        {error && (
          <p
            className="text-sm px-4 py-2.5 rounded-xl max-w-sm text-center"
            style={{ background: "rgba(193,68,60,0.15)", color: "#FF8A80" }}
          >
            {error}
          </p>
        )}
        <button
          onClick={joinCall}
          disabled={joining}
          className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-transform hover:scale-105"
          style={{
            background: "linear-gradient(135deg, var(--indigo), var(--purple))",
          }}
        >
          {joining ? "Joining…" : "Join meeting"}
        </button>
      </div>
    );
  }

  const tileCount = 1 + remoteUsers.length;
  const gridCols =
    tileCount <= 1
      ? "grid-cols-1"
      : tileCount <= 4
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <div className="w-full max-w-5xl">
      <div className={`grid ${gridCols} gap-3`}>
        <VideoTile
          ref={localVideoRef}
          label="You"
          muted={!micOn}
          videoOff={!camOn}
        />
        {remoteUsers.map((user) => (
          <RemoteTile key={user.uid} user={user} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        <ControlButton
          onClick={toggleMic}
          active={micOn}
          icon={micOn ? <MicIcon /> : <MicOffIcon />}
        />
        <ControlButton
          onClick={toggleCam}
          active={camOn}
          icon={camOn ? <CamIcon /> : <CamOffIcon />}
        />
        <button
          onClick={leaveCall}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: "var(--signal)" }}
        >
          <HangupIcon />
        </button>
      </div>
    </div>
  );
}

const VideoTile = ({ ref, label, muted, videoOff }) => (
  <div
    className="relative rounded-2xl overflow-hidden"
    style={{ background: "#1A1A2E", aspectRatio: "16/10" }}
  >
    <div
      ref={ref}
      className="w-full h-full"
      style={{ display: videoOff ? "none" : "block" }}
    />
    {videoOff && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium"
          style={{
            background: "linear-gradient(135deg, var(--indigo), var(--purple))",
          }}
        >
          {label[0]}
        </div>
      </div>
    )}
    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
      <span
        className="text-xs text-white px-2 py-1 rounded-md"
        style={{ background: "rgba(0,0,0,0.5)" }}
      >
        {label}
      </span>
      {muted && (
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <MicOffIcon small />
        </span>
      )}
    </div>
  </div>
);

function RemoteTile({ user }) {
  const ref = useRef(null);
  useEffect(() => {
    if (user.videoTrack && ref.current) user.videoTrack.play(ref.current);
  }, [user]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ background: "#1A1A2E", aspectRatio: "16/10" }}
    >
      <div ref={ref} className="w-full h-full" />
      <span
        className="absolute bottom-3 left-3 text-xs text-white px-2 py-1 rounded-md"
        style={{ background: "rgba(0,0,0,0.5)" }}
      >
        Participant {user.uid}
      </span>
    </div>
  );
}

function ControlButton({ onClick, active, icon }) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
      style={{
        background: active ? "rgba(255,255,255,0.1)" : "var(--signal)",
        color: "white",
      }}
    >
      {icon}
    </button>
  );
}

function MicIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" />
    </svg>
  );
}
function MicOffIcon({ small }) {
  const size = small ? 14 : 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 1l22 22M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6M19 10v2a7 7 0 0 1-1.03 3.66M12 19v4" />
    </svg>
  );
}
function CamIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}
function CamOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 1l22 22M21 7l-5 3.5V7l5-4v4z" />
      <path d="M16 16.5V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
    </svg>
  );
}
function HangupIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 9c-2.4 0-4.7.4-6.9 1.1-.5.2-.9.6-1 1.2l-.5 2.5c-.1.6.2 1.2.7 1.4l3.6 1.5c.4.2.9.1 1.2-.2l1.4-1.4c.2-.2.5-.3.7-.2 1.9.7 3.9.7 5.8 0 .3-.1.6 0 .7.2l1.4 1.4c.3.3.8.4 1.2.2l3.6-1.5c.5-.2.8-.8.7-1.4l-.5-2.5c-.1-.6-.5-1-1-1.2C16.7 9.4 14.4 9 12 9z" />
    </svg>
  );
}
