"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      // Auto-login: langsung login dengan kredensial yang sama setelah registrasi berhasil
      const loginData = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (loginData?.token) {
        // Simpan token ke localStorage
        localStorage.setItem("token", loginData.token);
        // Simpan di cookie agar dibaca Next.js Middleware (berlaku 7 hari)
        const maxAge = 7 * 24 * 60 * 60;
        document.cookie = `token=${loginData.token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
      }

      // Pemicu Toast Sukses
      showToastNotification(
        "Akun berhasil dibuat! Selamat datang di Unravel!",
        "success",
      );

      // Arahkan langsung ke homepage setelah singkat jeda toast
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: any) {
      // 🌟 PERBAIKAN 1: Saring pesan error mentah dari HTTP Status menjadi kalimat yang ramah
      let friendlyMsg = "Registrasi gagal. Silakan coba lagi.";

      // Biasanya jika email atau username sudah terdaftar, backend mengirim status 400 atau 409
      if (
        err.message &&
        (err.message.includes("400") || err.message.includes("409"))
      ) {
        friendlyMsg = "Username atau email sudah digunakan oleh orang lain.";
      } else if (err.message && err.message.includes("Fetch")) {
        friendlyMsg = "Gagal terhubung ke server. Periksa koneksi internetmu.";
      } else if (err.message) {
        friendlyMsg = err.message;
      }

      setError(friendlyMsg);

      // 🌟 PERBAIKAN 2: Buat pesan Toast menjadi ringkas sebagai indikator cepat saja
      showToastNotification("Registrasi Gagal", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neogrid flex items-center justify-center text-black font-sans selection:bg-[#00BC7D] selection:text-white relative p-6 sm:p-12">
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

      {/* Centered bounded container to reduce distance gap between left and right */}
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 xl:gap-24">
        {/* ================= SISI KIRI: PLACEHOLDER VISUAL ASSET ================= */}
        <section className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center text-center space-y-4 max-w-sm">
          <div className="w-96 h-96 flex items-center justify-center mx-auto overflow-hidden">
            <DotLottieReact
              src="/loginnsignup.json"
              loop={true}
              autoplay={true}
              className="w-full h-full"
              style={{ transform: "scale(1.4)" }}
              renderConfig={{
                devicePixelRatio: typeof window !== "undefined" ? window.devicePixelRatio || 2 : 2
              }}
            />
          </div>
          <h2 className="text-xl font-black text-black font-serif tracking-tight pt-2">
            Mulai Mengurai Masalah
          </h2>
          <p className="text-xs font-semibold text-slate-650 leading-relaxed">
            Daftarkan dirimu untuk memulai petualangan membedah studi kasus
            kompleks secara bertahap di platform Unravel.
          </p>
        </section>

        {/* ================= SISI KANAN: FORM SIGNUP VERTIKAL UTUH ================= */}
        <section className="w-full lg:w-1/2 flex flex-col justify-center items-center">
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
                Daftar Akun Baru
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Silakan lengkapi isian formulir pendaftaran di bawah ini.
              </p>
            </div>
          </div>

          {/* NOTIFIKASI ERROR STATIC JIKA RESPONSE BE GAGAL */}
          {error && (
            <div className="p-3 bg-[#FDEDEC] border-2 border-black rounded-xl text-red-900 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* FORM ISIAN UTAMA */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* INPUT NAMA LENGKAP */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-650">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                required
                disabled={loading}
                value={formData.name}
                onChange={handleChange}
                placeholder="Isi Nama Lengkap Kamu"
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:bg-slate-50 shadow-[2px_2px_0px_#000] transition-all disabled:opacity-60"
              />
            </div>

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
                placeholder="Isi Username Unik Kamu"
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:bg-slate-50 shadow-[2px_2px_0px_#000] transition-all disabled:opacity-60"
              />
            </div>

            {/* INPUT EMAIL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-650">
                Surel / Email
              </label>
              <input
                type="email"
                name="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@mahasiswa.id"
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

            {/* BARIS KETENTUAN LAYANAN */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-black text-slate-650 select-none">
                <input
                  type="checkbox"
                  required
                  disabled={loading}
                  className="w-4 h-4 rounded border-2 border-black accent-[#00BC7D] cursor-pointer shadow-[1px_1px_0px_#000]"
                />
                <span className="text-[11px]">
                  Saya menyetujui Ketentuan Layanan
                </span>
              </label>
            </div>

            {/* TOMBOL SUBMIT UTAMA */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 border-2 border-black text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all mt-4 cursor-pointer ${
                loading
                  ? "bg-[#00BC7D] cursor-not-allowed shadow-none"
                  : "bg-[#00BC7D] hover:bg-[#00BC7D]"
              }`}
            >
              {loading ? "Memproses Pendaftaran..." : "Daftar Akun Baru"}
            </button>
          </form>

          {/* FOOTER AKUN BARU */}
          <div className="text-center pt-2 text-xs font-semibold text-slate-500">
            Sudah memiliki akun sebelumnya?{" "}
            <Link
              href="/login"
              className="font-black text-[#00BC7D] hover:underline"
            >
              Masuk Di Sini
            </Link>
          </div>
        </div>
      </section>
      </div> {/* Closes max-w-6xl container */}
    </div>
  );
}
