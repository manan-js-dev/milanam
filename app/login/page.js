"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup' | 'instant'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [instantTab, setInstantTab] = useState("host"); // 'host' | 'join'
  const [guestName, setGuestName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [instantError, setInstantError] = useState("");
  const [instantSubmitting, setInstantSubmitting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setSubmitting(false);
      return;
    }
    const loginRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (loginRes?.error) {
      setError("Account created, but automatic sign-in failed.");
      setSubmitting(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleSignin(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password.");
      setSubmitting(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleHostInstant(e) {
    e.preventDefault();
    setInstantError("");
    setInstantSubmitting(true);

    const res = await fetch("/api/instant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostName: guestName }),
    });
    const data = await res.json();
    setInstantSubmitting(false);

    if (!res.ok) {
      setInstantError(data.error);
      return;
    }
    router.push(`/call/${data.joinCode}?name=${encodeURIComponent(guestName)}`);
  }

  function handleJoinInstant(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    router.push(`/call/${joinCode.trim().toUpperCase()}`);
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
        className="w-full max-w-4xl rounded-3xl overflow-hidden flex"
        style={{
          boxShadow: "0 30px 80px -20px rgba(46,49,146,0.35)",
          minHeight: 580,
        }}
      >
        {/* Left — mesh gradient hero */}
        <div className="hidden md:flex flex-col justify-between flex-1 relative overflow-hidden p-10">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 15% 15%, #4A4FC4 0%, transparent 45%), radial-gradient(circle at 85% 30%, #9B4FC7 0%, transparent 50%), radial-gradient(circle at 30% 90%, #6A3FA0 0%, transparent 50%), linear-gradient(160deg, var(--indigo) 0%, var(--purple) 100%)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 260,
              height: 260,
              top: -80,
              right: -80,
              background: "rgba(255,255,255,0.12)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              bottom: -60,
              left: -40,
              background: "rgba(255,255,255,0.1)",
              filter: "blur(50px)",
            }}
          />

          <div
            className="relative z-10 inline-flex self-start rounded-xl px-3 py-2"
            style={{ background: "rgba(255,255,255,0.95)" }}
          >
            <Image
              src="/logo.png"
              alt="मिलनम्"
              width={100}
              height={56}
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </div>

          <div className="relative z-10">
            <h2 className="text-white text-4xl font-display leading-tight">
              Every meeting starts
              <br />
              <span style={{ color: "#D8C9FF" }}>with showing up.</span>
            </h2>
            <p className="text-white/70 text-sm mt-4 max-w-xs">
              मिलनम् schedules the time and opens the room — one place, no dead
              links.
            </p>
            <div className="flex gap-4 mt-8">
              <Stat label="Video" value="HD" />
              <Stat label="Scheduling" value="Live" />
              <Stat label="Setup" value="0 min" />
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div
          className="flex-1 flex flex-col justify-center p-8 md:p-12"
          style={{ background: "white" }}
        >
          <div className="flex md:hidden justify-center mb-6">
            <Image
              src="/logo.png"
              alt="मिलनम्"
              width={90}
              height={50}
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </div>

          {mode === "instant" ? (
            <div>
              <h1
                className="text-3xl font-display mb-1"
                style={{ color: "var(--ink)" }}
              >
                Meet instantly
              </h1>
              <p className="text-sm mb-6" style={{ color: "#8B8FA3" }}>
                No account needed — just a name.
              </p>

              <div
                className="flex rounded-xl p-1 mb-5"
                style={{ background: "#F5F4FA" }}
              >
                <button
                  onClick={() => setInstantTab("host")}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={
                    instantTab === "host"
                      ? {
                          background: "white",
                          color: "var(--ink)",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        }
                      : { color: "#8B8FA3" }
                  }
                >
                  Host a meeting
                </button>
                <button
                  onClick={() => setInstantTab("join")}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={
                    instantTab === "join"
                      ? {
                          background: "white",
                          color: "var(--ink)",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        }
                      : { color: "#8B8FA3" }
                  }
                >
                  Join a meeting
                </button>
              </div>

              {instantTab === "host" ? (
                <form
                  onSubmit={handleHostInstant}
                  className="flex flex-col gap-3"
                >
                  <FieldInput
                    icon={<UserIcon />}
                    placeholder="Your name"
                    value={guestName}
                    onChange={setGuestName}
                  />
                  {instantError && (
                    <p className="text-xs" style={{ color: "var(--signal)" }}>
                      {instantError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={instantSubmitting}
                    className="rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 transition-transform hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--indigo), var(--purple))",
                      boxShadow: "0 10px 25px -8px rgba(46,49,146,0.5)",
                    }}
                  >
                    {instantSubmitting ? "Creating…" : "Start meeting"}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={handleJoinInstant}
                  className="flex flex-col gap-3"
                >
                  <input
                    required
                    placeholder="Meeting code (e.g. 7XJ4KQ)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="px-3.5 py-3 rounded-xl text-sm uppercase tracking-wider focus:outline-none focus:ring-2"
                    style={{
                      border: "1px solid var(--line)",
                      "--tw-ring-color": "var(--indigo)",
                    }}
                  />
                  <button
                    type="submit"
                    className="rounded-xl py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--indigo), var(--purple))",
                      boxShadow: "0 10px 25px -8px rgba(46,49,146,0.5)",
                    }}
                  >
                    Join meeting
                  </button>
                </form>
              )}

              <p
                className="text-center mt-7 text-sm"
                style={{ color: "#8B8FA3" }}
              >
                Want scheduling and calendar features?{" "}
                <span
                  onClick={() => setMode("signin")}
                  className="cursor-pointer font-semibold"
                  style={{ color: "var(--indigo)" }}
                >
                  Sign in
                </span>
              </p>
            </div>
          ) : (
            <>
              <h1
                className="text-3xl font-display mb-1"
                style={{ color: "var(--ink)" }}
              >
                {mode === "signin" ? "Welcome back" : "Get started"}
              </h1>
              <p className="text-sm mb-7" style={{ color: "#8B8FA3" }}>
                {mode === "signin"
                  ? "Sign in to मिलनम् to continue."
                  : "Create your मिलनम् account."}
              </p>

              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full py-3 rounded-xl text-sm font-medium mb-5 flex items-center justify-center gap-2.5 transition-all hover:shadow-md"
                style={{ border: "1px solid var(--line)" }}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div
                  className="h-px flex-1"
                  style={{ background: "var(--line)" }}
                />
                <span className="text-xs" style={{ color: "#B4B7C6" }}>
                  or continue with email
                </span>
                <div
                  className="h-px flex-1"
                  style={{ background: "var(--line)" }}
                />
              </div>

              <form
                onSubmit={mode === "signin" ? handleSignin : handleSignup}
                className="flex flex-col gap-3.5"
              >
                {mode === "signup" && (
                  <FieldInput
                    icon={<UserIcon />}
                    placeholder="Full name"
                    value={name}
                    onChange={setName}
                  />
                )}
                <FieldInput
                  icon={<MailIcon />}
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={setEmail}
                />
                <FieldInput
                  icon={<LockIcon />}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={setPassword}
                />

                {error && (
                  <p className="text-xs" style={{ color: "var(--signal)" }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl py-3 text-sm font-semibold text-white mt-1 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--indigo), var(--purple))",
                    boxShadow: "0 10px 25px -8px rgba(46,49,146,0.5)",
                  }}
                >
                  {submitting
                    ? mode === "signin"
                      ? "Signing in…"
                      : "Creating account…"
                    : mode === "signin"
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>

              <p
                className="text-center mt-7 text-sm"
                style={{ color: "#8B8FA3" }}
              >
                {mode === "signin" ? (
                  <>
                    New to मिलनम्?{" "}
                    <span
                      onClick={() => setMode("signup")}
                      className="cursor-pointer font-semibold"
                      style={{ color: "var(--indigo)" }}
                    >
                      Create an account
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span
                      onClick={() => setMode("signin")}
                      className="cursor-pointer font-semibold"
                      style={{ color: "var(--indigo)" }}
                    >
                      Sign in
                    </span>
                  </>
                )}
              </p>

              <button
                onClick={() => setMode("instant")}
                className="w-full py-3 rounded-xl text-sm font-semibold mt-4 flex items-center justify-center gap-2 transition-all hover:shadow-md"
                style={{
                  border: "1.5px solid transparent",
                  background:
                    "linear-gradient(white, white) padding-box, linear-gradient(135deg, var(--indigo), var(--purple)) border-box",
                  color: "var(--indigo)",
                }}
              >
                <BoltIcon />
                Meet instantly — no account needed
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function FieldInput({ icon, type = "text", placeholder, value, onChange }) {
  return (
    <div className="relative">
      <span
        className="absolute left-3.5 top-1/2 -translate-y-1/2"
        style={{ color: "#B4B7C6" }}
      >
        {icon}
      </span>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-3.5 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-shadow"
        style={{
          border: "1px solid var(--line)",
          "--tw-ring-color": "var(--indigo)",
        }}
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-white text-lg font-semibold">{value}</p>
      <p className="text-white/50 text-xs">{label}</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}
