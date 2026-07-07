"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";
import AnimatedButton from "@/components/AnimatedButton";

interface NavbarProps {
  /** Varian tampilan navbar */
  variant?: "landing" | "app";
  /**
   * Untuk variant "app": teks di sebelah kiri yang bisa berupa back-link atau judul.
   * Jika tidak diisi, tampil logo Unravel biasa.
   */
  backHref?: string;
  backLabel?: string;
  /** Label warna aksen pada logo (default "Unravel") */
  logoAccent?: string;
}

/**
 * Komponen Navbar yang dipakai di semua halaman.
 *
 * variant="landing" → Header lengkap (logo + nav links + auth buttons + mobile menu)
 * variant="app"     → Navbar app sticky (logo/back + notif + avatar profile)
 */
export default function Navbar({
  variant = "app",
  backHref,
  backLabel,
  logoAccent,
}: NavbarProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cookies = document.cookie.split(";");
    const hasToken = cookies.some((c) => c.trim().startsWith("token="));
    setIsLoggedIn(hasToken);
  }, []);

  // Fetch nama user untuk avatar inisial (hanya jika logged in)
  useEffect(() => {
    if (!isLoggedIn) return;
    import("@/utils/api").then(({ apiFetch }) => {
      apiFetch("/me")
        .then((res: any) => {
          const data = res?.data || res;
          setUserName(data?.name || data?.username || "");
        })
        .catch(() => {});
    });
  }, [isLoggedIn]);

  const avatarLetter = userName ? userName.charAt(0).toUpperCase() : "?";

  /* ─────────────────────────────────────────
     VARIANT: LANDING (halaman utama)
  ───────────────────────────────────────── */
  if (variant === "landing") {
    const handleLogout = () => {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      window.location.reload();
    };

    return (
      <header className="sticky top-0 z-50 bg-[#FFD400] border-b-[3px] border-black shadow-[0_3px_0_#000]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black"
              style={{ border: "4px solid #000", boxShadow: "6px 6px 0 #000", background: "#fff" }}
            >
              U
            </span>
            <span className="text-2xl font-black" style={{ color: "#6D28D9" }}>
              Unravel
            </span>
          </Link>

          {/* Nav links desktop */}
          <nav className="hidden items-center gap-8 text-sm font-extrabold md:flex">
            <Link href="/belajar" className="transition hover:underline underline-offset-4">Belajar</Link>
            <Link href="/diskusi" className="transition hover:underline underline-offset-4">Diskusi</Link>
            <a href="#konten" className="transition hover:underline underline-offset-4">Konten</a>
          </nav>

          {/* Auth buttons desktop */}
          <div className="hidden items-center gap-3 md:flex">
            {mounted && isLoggedIn ? (
              <>
                <NotificationBell />
                {/* Profile icon — same style as NotificationBell */}
                <Link
                  href="/profile"
                  className="w-10 h-10 rounded-xl bg-white border-[3px] border-black text-slate-700 hover:bg-[#E9D5FF] flex items-center justify-center relative cursor-pointer transition-all shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0_#000] select-none"
                  title="Profile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <AnimatedButton as="link" href="/login" background="#fff" shadowSize={6} className="!px-4 !py-2 !text-sm !rounded-xl">
                  Masuk
                </AnimatedButton>
                <AnimatedButton as="link" href="/signup" background="#22C55E" shadowSize={6} className="!px-4 !py-2 !text-sm !rounded-xl">
                  Mulai
                </AnimatedButton>
              </>
            )}
          </div>

          {/* Hamburger mobile */}
          <button
            className="rounded-xl px-3 py-2 text-lg font-black md:hidden"
            style={{ border: "4px solid #000", boxShadow: "6px 6px 0 #000", background: "#fff" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Buka menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "✖" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="mx-4 mb-4 rounded-2xl bg-white p-5 md:hidden"
            style={{ border: "4px solid #000", boxShadow: "8px 8px 0 #000" }}
          >
            <div className="flex flex-col gap-4 text-sm font-extrabold">
              <Link href="/belajar" onClick={() => setMobileOpen(false)}>Belajar</Link>
              <Link href="/diskusi" onClick={() => setMobileOpen(false)}>Diskusi</Link>
              <a href="#konten" onClick={() => setMobileOpen(false)}>Konten</a>
              <div className="my-1 h-px bg-black/10" />
              {isLoggedIn ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)}>Profile</Link>
                  <button onClick={handleLogout} className="text-left text-red-600">Keluar</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>Masuk</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>Mulai</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    );
  }

  /* ─────────────────────────────────────────
     VARIANT: APP (semua halaman dalam app)
  ───────────────────────────────────────── */
  const leftSide = backHref ? (
    <Link
      href={backHref}
      className="text-xs font-black uppercase tracking-wider text-indigo-600 hover:underline flex items-center gap-1"
    >
      ← {backLabel || "Kembali"}
    </Link>
  ) : (
    <Link href="/" className="font-black text-lg tracking-tight text-black flex items-center gap-2">
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black"
        style={{ border: "3px solid #000", boxShadow: "3px 3px 0 #000", background: "#FFD400" }}
      >
        U
      </span>
      <span>
        Unravel
        {logoAccent && <span className="text-indigo-600"> {logoAccent}</span>}
      </span>
    </Link>
  );

  return (
    <nav className="w-full border-b-[3px] border-black bg-[#FFD400] sticky top-0 z-50 shadow-[0_3px_0_#000]">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {leftSide}

        <div className="flex items-center gap-3">
          <NotificationBell />
          {/* Profile icon — same style as NotificationBell */}
          {mounted && (
            <Link
              href="/profile"
              className="w-10 h-10 rounded-xl bg-white border-[3px] border-black text-slate-700 hover:bg-[#E9D5FF] flex items-center justify-center relative cursor-pointer transition-all shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0_#000] select-none"
              title="Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
