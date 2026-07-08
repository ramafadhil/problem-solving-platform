"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import { User } from "lucide-react";

export default function BelajarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();

  // Mengambil ID Kasus dari URL secara dinamis (misal: case-01)
  const caseId = params?.caseId as string;

  return (
    <div className="min-h-screen bg-neogrid text-black font-sans antialiased flex flex-col selection:bg-indigo-650 selection:text-white">
      {/* 1. NAVBAR HEADER */}
      <nav className="w-full border-b-4 border-black bg-white sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-[4px_4px_0px_#000]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 flex items-center justify-center">
            <img src="/logo.svg" alt="Logo" className="w-16 h-16" />
          </div>
          <a href="/" className="font-black text-lg tracking-tight text-black">
            Unravel<span className="text-[#00BC7D]"> Learn</span>
          </a>
        </div>

        {/* Detail Kasus Aktif & Profil User */}
        <div className="flex items-center gap-4">
          {caseId && (
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              Kasus Terpilih:{" "}
              <strong className="text-indigo-600 bg-indigo-50 border-2 border-black px-2 py-1 rounded-lg shadow-[1.5px_1.5px_0px_#000]">
                {caseId}
              </strong>
            </span>
          )}

          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-white border-2 border-black hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
          >
            Home
          </button>

          {/* Notification Button */}
          <NotificationBell />

          {/* Profile Button */}
          <Link
            href="/profile"
            className="w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
            title="Profile"
          >
            <User size={18} className="text-black" />
          </Link>
        </div>
      </nav>

      {/* 2. WADAH KONTEN UTAMA */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 flex flex-col">
        {children}
      </div>
    </div>
  );
}
