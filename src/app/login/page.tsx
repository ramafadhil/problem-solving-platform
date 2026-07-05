"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import AnimatedButton from "@/components/AnimatedButton";

const offsetShadow = (size = 8, color = "#000") =>
  `${size}px ${size}px 0 ${color}`;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (data?.token) {
        localStorage.setItem("token", data.token);
        const maxAge = 7 * 24 * 60 * 60;
        document.cookie = `token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get("callbackUrl") || "/";

        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 300);
      }
    } catch {
      setError("Username atau password salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden text-black flex items-center justify-center px-4 py-12"
      style={{
        backgroundColor: "#FFD400",
        backgroundImage:
          "linear-gradient(#00000010 1px, transparent 1px), linear-gradient(90deg, #00000010 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }}
    >
      {/* Dekorasi pojok */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute -top-6 left-8 h-20 w-28 rounded-2xl"
          style={{ background: "#A21CAF", border: "4px solid #000", boxShadow: offsetShadow(8) }}
        />
        <div
          className="absolute right-10 top-24 h-14 w-14 rounded-full"
          style={{ background: "#22C55E", border: "4px solid #000", boxShadow: offsetShadow(6) }}
        />
        <div
          className="absolute bottom-20 left-12 h-14 w-14 rotate-12 rounded-2xl"
          style={{ background: "#7C3AED", border: "4px solid #000", boxShadow: offsetShadow(6) }}
        />
        <div
          className="absolute bottom-12 right-16 h-10 w-10 rounded-full"
          style={{ background: "#F97316", border: "4px solid #000", boxShadow: offsetShadow(5) }}
        />
      </div>

      {/* Card Utama */}
      <div className="relative z-10 w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-6">
          <Link href="/">
            <span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-2xl"
              style={{ background: "#fff", border: "4px solid #000", boxShadow: offsetShadow(8) }}
            >
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl font-black text-sm"
                style={{ background: "#6D28D9", color: "#fff", border: "3px solid #000" }}
              >
                U
              </span>
              <span style={{ color: "#6D28D9" }}>Unravel</span>
            </span>
          </Link>
          <p className="mt-3 text-sm font-bold text-black/70">
            Masuk dan lanjutkan perjalanan analisismu.
          </p>
        </div>

        {/* Form Card */}
        <div
          className="rounded-[32px] bg-white p-8"
          style={{ border: "5px solid #000", boxShadow: offsetShadow(12) }}
        >
          <h1 className="text-2xl font-black tracking-tight mb-1">Masuk ke Akun</h1>
          <p className="text-sm font-semibold text-slate-500 mb-6">
            Belum punya akun?{" "}
            <Link href="/signup" className="font-black underline underline-offset-2" style={{ color: "#6D28D9" }}>
              Daftar gratis
            </Link>
          </p>

          {/* Error */}
          {error && (
            <div
              className="mb-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-red-700"
              style={{ background: "#FECACA", border: "3px solid #000", boxShadow: offsetShadow(4) }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                disabled={loading}
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan username kamu"
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold bg-[#FFFDF7] focus:outline-none focus:bg-white transition disabled:opacity-60"
                style={{ border: "3px solid #000" }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  disabled={loading}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-12 text-sm font-semibold bg-[#FFFDF7] focus:outline-none focus:bg-white transition disabled:opacity-60"
                  style={{ border: "3px solid #000" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                  tabIndex={-1}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <AnimatedButton
              type="submit"
              disabled={loading}
              background={loading ? "#FDE68A" : "#22C55E"}
              shadowSize={6}
              className="mt-2 w-full !py-3.5 !text-sm !rounded-2xl uppercase tracking-widest"
            >
              {loading ? "Memverifikasi..." : "Masuk Sekarang →"}
            </AnimatedButton>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">atau</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Back to home */}
          <AnimatedButton
            as="link"
            href="/"
            background="#fff"
            shadowSize={5}
            className="w-full !py-3 !text-sm !rounded-2xl uppercase tracking-widest"
          >
            ← Kembali ke Beranda
          </AnimatedButton>
        </div>

        {/* Tagline bawah */}
        <p className="text-center mt-5 text-xs font-bold text-black/60">
          © 2026 Unravel — Belajar, diskusi, dan progres dalam satu tempat.
        </p>
      </div>
    </div>
  );
}
