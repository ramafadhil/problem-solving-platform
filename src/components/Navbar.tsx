"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check if token cookie is present
    const cookies = document.cookie.split(";");
    const hasToken = cookies.some((item) => item.trim().startsWith("token="));
    setIsLoggedIn(hasToken);
  }, []);

  const handleLogout = () => {
    // Remove token cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsLoggedIn(false);
    router.push("/");
    router.refresh();
  };

  const isBelajarActive = pathname.startsWith("/belajar");
  const isDiskusiActive = pathname.startsWith("/diskusi");

  return (
    <nav className="w-full bg-white border-b-4 border-black px-4 sm:px-8 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        {/* SISI KIRI: LOGO */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 flex items-center justify-center">
            <img src="/logo.svg" alt="Logo" className="w-16 h-16" />
          </div>
          <Link
            href="/"
            className="font-black text-lg tracking-tight text-black hover:text-[#00BC7D] transition-colors"
          >
            Unravel
          </Link>
        </div>

        {/* SISI TENGAH: MENU LINKS */}
        <div className="hidden md:flex items-center justify-center gap-8 text-[12px] font-black uppercase tracking-wider text-black absolute left-1/2 -translate-x-1/2">
          <Link
            href="/belajar"
            className={`py-2 transition-all ${
              isBelajarActive
                ? "text-[#00BC7D] underline decoration-4 underline-offset-4 decoration-[#00BC7D]"
                : "hover:underline decoration-2 underline-offset-4 decoration-[#00BC7D] text-black"
            }`}
          >
            Belajar
          </Link>
          <Link
            href="/diskusi"
            className={`py-2 transition-all ${
              isDiskusiActive
                ? "text-[#00BC7D] underline decoration-4 underline-offset-4 decoration-[#00BC7D]"
                : "hover:underline decoration-2 underline-offset-4 decoration-[#00BC7D] text-black"
            }`}
          >
            Diskusi
          </Link>
          <Link
            href="/#fitur"
            className="hover:underline decoration-2 underline-offset-4 decoration-[#00BC7D] transition-all py-2 text-black"
          >
            Konten
          </Link>
          <Link
            href="/#faq"
            className="hover:underline decoration-2 underline-offset-4 decoration-[#00BC7D] transition-all py-2 text-black"
          >
            FAQ
          </Link>
        </div>

        {/* SISI KANAN: AUTH ACTIONS DINAMIS */}
        <div className="flex items-center gap-3 text-[11px] font-black tracking-wider">
          {isLoggedIn ? (
            <>
              <NotificationBell />
              <Link
                href="/profile"
                className={`w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all ${
                  pathname === "/profile" ? "border-[#00BC7D]" : ""
                }`}
                title="Profile"
              >
                <User size={18} className="text-black" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-black border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all text-xs font-black uppercase shrink-0"
              >
                Masuk
              </Link>
              <Link
                href="/signup"
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#00BC7D] text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all text-xs font-black uppercase shrink-0"
              >
                <span className="hidden sm:inline">Mulai Sekarang</span>
                <span className="sm:hidden">Daftar</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
