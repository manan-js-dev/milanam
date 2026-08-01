"use client";

import { use, useState } from "react";
import Image from "next/image";
import VideoRoom from "@/components/VideoRoom";
import { useSearchParams } from "next/navigation";

export default function CallPage({ params }) {
  const { code } = use(params);
  const searchParams = useSearchParams();
  const nameFromUrl = searchParams.get("name");

  const [name, setName] = useState("");
  const [confirmedName, setConfirmedName] = useState(nameFromUrl || "");

  function handleContinue(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setConfirmedName(name.trim());
  }

  if (!confirmedName) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "#0D0D1A" }}
      >
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center">
          <div className="flex justify-center mb-5">
            <Image
              src="/logo.png"
              alt="मिलनम्"
              width={90}
              height={50}
              style={{ width: "auto", height: "32px" }}
            />
          </div>
          <h1
            className="text-lg font-semibold mb-1"
            style={{ color: "var(--ink)" }}
          >
            Join meeting
          </h1>
          <p className="text-sm mb-5" style={{ color: "#8B8FA3" }}>
            Code: {code.toUpperCase()}
          </p>
          <form onSubmit={handleContinue} className="flex flex-col gap-3">
            <input
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{
                border: "1px solid var(--line)",
                "--tw-ring-color": "var(--indigo)",
              }}
            />
            <button
              type="submit"
              className="rounded-xl py-2.5 text-sm font-semibold text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--indigo), var(--purple))",
              }}
            >
              Continue
            </button>
          </form>
        </div>
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
            style={{ width: "auto", height: "24px" }}
          />
          <span className="text-white/30">|</span>
          <h1 className="text-white text-sm font-medium">
            Code: {code.toUpperCase()}
          </h1>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 pb-6">
        <VideoRoom
          fetchToken={async () => {
            const res = await fetch(`/api/instant/${code}/token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: confirmedName }),
            });
            const data = await res.json();
            return res.ok ? data : { error: data.error };
          }}
        />
      </div>
    </main>
  );
}
