"use client";

import React from "react";
import Navbar from "@/components/Navbar";

export default function BelajarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar variant="app" logoAccent="Learn" />

      {/* WADAH KONTEN UTAMA */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 flex flex-col">
        {children}
      </div>
    </div>
  );
}
