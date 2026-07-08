"use client";

import React from "react";
import Navbar from "@/components/Navbar";

export default function BelajarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neogrid text-black font-sans antialiased flex flex-col selection:bg-[#00BC7D] selection:text-white">
      {/* 1. NAVBAR HEADER */}
      <Navbar />

      {/* 2. WADAH KONTEN UTAMA */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 flex flex-col">
        {children}
      </div>
    </div>
  );
}
