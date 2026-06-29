"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loading || setLoading(true);

    try {
      const data = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (data.token) {
        localStorage.setItem("token", data.token);

        // Alihkan ke halaman beranda utama dan segarkan state
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Username atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-stretch text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* ================= SISI KIRI: PLACEHOLDER VISUAL ASSET ================= */}
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-50 to-slate-50 border-r-2 border-slate-100 p-12 flex-col items-center justify-center relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

        <div className="relative text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Mulai Mengurai Masalah
          </h2>
          <p className="text-xs font-medium text-slate-400 leading-relaxed">
            Masuk ke akun kelompokmu untuk melanjutkan petualangan membedah
            studi kasus kompleks secara bertahap di platform Unravel.
          </p>
        </div>
      </section>

      {/* ================= SISI KANAN: FORM LOGIN VERTIKAL UTUH ================= */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* BARIS NAVIGASI KEMBALI & BRANDING ATAS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 transition-all hover:-translate-y-0.5"
              >
                Beranda
              </button>

              <span className="text-xs font-black text-slate-600 tracking-tight select-none">
                Unravel
              </span>
            </div>

            <div className="space-y-1 pt-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Masuk ke Akun Anda
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Silakan masukkan detail kredensial Anda di bawah ini.
              </p>
            </div>
          </div>

          {/* NOTIFIKASI ERROR JIKA LOGIN GAGAL */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* FORM ISIAN UTAMA */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* INPUT USERNAME (DISESUAIKAN DENGAN STRUKTUR BE GOLANG) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Isi Username Anda"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* INPUT PASSWORD */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
                {/* Tombol Mata / Intip Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors text-sm"
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            {/* BARIS OPSIONAL: REMEMBER ME & FORGOT PASSWORD */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-500 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-2 border-slate-300 accent-indigo-600 cursor-pointer"
                />
                <span>Ingat Saya</span>
              </label>
              <a
                href="#"
                className="font-black text-indigo-600 hover:underline"
              >
                Lupa Sandi?
              </a>
            </div>

            {/* TOMBOL SUBMIT UTAMA */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all mt-4 ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-[4px_4px_0px_0px_rgba(79,70,229,0.3)] hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Memverifikasi..." : "Masuk Sekarang"}
            </button>
          </form>

          {/* FOOTER AKUN BARU */}
          <div className="text-center pt-4 text-xs font-medium text-slate-400">
            Belum memiliki akun?{" "}
            <Link
              href="/signup"
              className="font-black text-indigo-600 hover:underline"
            >
              Buat Akun Baru
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
