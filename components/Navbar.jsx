"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav
      className="flex items-center justify-between px-6 md:px-8 py-3 sticky top-0 z-20 backdrop-blur-md"
      style={{
        background: "rgba(255,255,255,0.85)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="मिलनम्"
          width={40}
          height={22}
          style={{ width: "auto", height: "28px" }}
        />
        <span
          className="font-display text-lg hidden sm:inline"
          style={{ color: "var(--ink)" }}
        >
          मिलनम्
        </span>
      </Link>

      {session?.user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full"
                style={{ width: "28px", height: "28px" }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{
                  background:
                    "linear-gradient(135deg, var(--indigo), var(--purple))",
                }}
              >
                {session.user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-sm" style={{ color: "var(--ink)" }}>
              {session.user.name}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm px-3.5 py-1.5 rounded-lg font-medium transition-colors hover:bg-gray-50"
            style={{ border: "1px solid var(--line)", color: "var(--ink)" }}
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
