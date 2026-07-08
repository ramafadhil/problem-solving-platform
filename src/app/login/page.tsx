"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // State untuk manajemen status Toast Notifikasi
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  const showToastNotification = (
    message: string,
    type: "success" | "error",
  ) => {
    setToast({ show: true, message, type });
    // Menyembunyikan toast secara otomatis setelah 3 detik
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

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
        // Pemicu Toast Sukses
        showToastNotification(
          "Login Berhasil! Menyiapkan lingkungan analisis Anda...",
          "success",
        );

        // 1. Simpan token ke localStorage untuk client fetching
        localStorage.setItem("token", data.token);

        // 2. Simpan di Cookies agar dibaca oleh Next.js Middleware (berlaku selama 7 hari)
        const maxAge = 7 * 24 * 60 * 60;
        document.cookie = `token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

        // 3. Cek rute asal (callbackUrl) setelah kena proteksi rute middleware
        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get("callbackUrl") || "/";

        // Beri sedikit jeda agar user sempat melihat pesan sukses toast sebelum pindah halaman
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      // 🌟 PERBAIKAN 1: Bersihkan pesan error mentah dari HTTP Status menjadi kalimat yang ramah
      let friendlyMsg = "Username atau password salah.";

      // if (err.message && err.message.includes("401")) {
      //   friendlyMsg = "Kredensial salah. Silakan periksa kembali username dan password akunmu.";
      // } else if (err.message && err.message.includes("Fetch")) {
      //   friendlyMsg = "Gagal terhubung ke server. Periksa koneksi internetmu.";
      // } else if (err.message) {
      //   friendlyMsg = err.message;
      // }

      setError(friendlyMsg);

      // 🌟 PERBAIKAN 2: Buat pesan Toast berbeda (singkat) agar tidak duplikat identik dengan kotak merah di bawah
      showToastNotification("Autentikasi Gagal", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neogrid flex items-stretch text-black font-sans selection:bg-indigo-650 selection:text-white relative">
      {/* ================= COMPONENT TOAST FLOATING NOTIFICATION ================= */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] transition-all duration-300 animate-in fade-in slide-in-from-top-4 font-sans text-xs font-black uppercase tracking-wider ${
            toast.type === "success"
              ? "bg-emerald-100 text-emerald-900"
              : "bg-[#FDEDEC] text-red-900"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ================= SISI KIRI: PLACEHOLDER VISUAL ASSET ================= */}
      <section className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

        <div className="relative text-center space-y-4 max-w-sm">
          <div className="w-64 h-08 rounded-3xl flex items-center justify-center  mx-auto overflow-hidden p-6">
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-xl font-black text-black font-serif tracking-tight pt-2">
            Mulai Mengurai Masalah
          </h2>
          <p className="text-xs font-semibold text-slate-650 leading-relaxed">
            Masuk ke akunmu untuk melanjutkan petualangan membedah studi kasus
            kompleks secara bertahap di platform Unravel.
          </p>
        </div>
      </section>

      {/* ================= SISI KANAN: FORM LOGIN VERTIKAL UTUH ================= */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white border-3 border-black rounded-3xl p-8 shadow-[6px_6px_0px_#000] space-y-6">
          {/* BARIS NAVIGASI KEMBALI & BRANDING ATAS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
              >
                Home
              </button>

              <span className="text-xs font-black text-black uppercase tracking-wider tracking-tight select-none">
                Unravel
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <h2 className="text-2xl font-black text-black tracking-tight font-serif">
                Masuk ke Akun Anda
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Silakan masukkan detail kredensial Anda di bawah ini.
              </p>
            </div>
          </div>

          {/* NOTIFIKASI ERROR STATIC JIKA LOGIN GAGAL */}
          {error && (
            <div className="p-3 bg-[#FDEDEC] border-2 border-black rounded-xl text-red-900 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* FORM ISIAN UTAMA */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* INPUT USERNAME */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-650">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                disabled={loading}
                value={formData.username}
                onChange={handleChange}
                placeholder="Isi Username Anda"
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:bg-slate-50 shadow-[2px_2px_0px_#000] transition-all disabled:opacity-60"
              />
            </div>

            {/* INPUT PASSWORD */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-650">
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
                  className="w-full px-4 py-3 pr-10 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:bg-slate-50 shadow-[2px_2px_0px_#000] transition-all disabled:opacity-60"
                />
                {/* Tombol Mata / Intip Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-black transition-colors text-sm cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* BARIS OPSIONAL: REMEMBER ME & FORGOT PASSWORD */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-black text-slate-650 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={loading}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-black accent-indigo-650 cursor-pointer shadow-[1px_1px_0px_#000]"
                />
                <span>Ingat Saya</span>
              </label>
              <a
                href="#"
                className="font-black text-indigo-650 hover:underline"
              >
                Lupa Sandi?
              </a>
            </div>

            {/* TOMBOL SUBMIT UTAMA */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 border-2 border-black text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all mt-4 cursor-pointer ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-750"
              }`}
            >
              {loading ? "Memverifikasi..." : "Masuk Sekarang"}
            </button>
          </form>

          {/* FOOTER AKUN BARU */}
          <div className="text-center pt-2 text-xs font-semibold text-slate-500">
            Belum memiliki akun?{" "}
            <Link
              href="/signup"
              className="font-black text-indigo-650 hover:underline"
            >
              Buat Akun Baru
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
