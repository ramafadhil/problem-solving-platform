"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 1. NAVBAR HEADER (Disesuaikan penuh dengan desain terbaru Unravel) */}
      <nav className="w-full border-b-2 border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <a href="/" className="font-black text-lg tracking-tight text-slate-900">
            Unravel<span className="text-indigo-600"> Learn</span>
          </a>
        </div>

        {/* Detail Kasus Aktif & Profil User */}
        <div className="flex items-center gap-4">
          {caseId && (
            <span className="text-xs font-bold text-slate-400 hidden sm:inline">
              Kasus Terpilih:{" "}
              <strong className="text-indigo-600 bg-indigo-50/50 border border-indigo-100/40 px-2 py-1 rounded-lg">
                {caseId}
              </strong>
            </span>
          )}

          <button
            onClick={() => router.push("/")}
            className="px-3 py-1.5 bg-slate-50 border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 transition-all hover:-translate-y-0.5"
          >
            Beranda
          </button>

          {/* Avatar Lingkar User */}
          <Link
            href="/profile"
            className="px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all hover:-translate-y-0.5 text-[10px] sm:text-xs font-black shrink-0"
          >
            Profile
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
