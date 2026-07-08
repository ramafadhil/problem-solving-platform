"use client";

import React, { useState, useEffect } from "react";
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

  // OTP verification step
  const [signupStep, setSignupStep] = useState<"form" | "otp">("form");
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

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
      // Registration succeeded — proceed to OTP verification
      setSignupStep("otp");
      setResendCountdown(60);
      showToastNotification("Kode OTP telah dikirim ke emailmu!", "success");
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setError("Masukkan 6 digit OTP yang valid.");
      return;
    }
    setError("");
    setOtpLoading(true);
    try {
      await apiFetch("/auth/verify-register-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, otp: otpValue }),
      });
      // OTP valid — now auto-login
      const loginData = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });
      if (loginData?.token) {
        localStorage.setItem("token", loginData.token);
        const maxAge = 7 * 24 * 60 * 60;
        document.cookie = `token=${loginData.token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
      }
      showToastNotification("Akun berhasil diverifikasi! Selamat datang!", "success");
      setTimeout(() => { router.push("/"); }, 1200);
    } catch (err: any) {
      setError(err.message || "OTP salah atau sudah kedaluwarsa.");
      showToastNotification("Verifikasi Gagal", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendRegisterOtp = async () => {
    if (resendCountdown > 0) return;
    setOtpLoading(true);
    try {
      await apiFetch("/auth/reset-register-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email }),
      });
      setResendCountdown(60);
      showToastNotification("OTP baru terkirim!", "success");
    } catch {
      showToastNotification("Gagal kirim ulang OTP", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

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

        {/* ================= SISI KANAN: FORM SIGNUP / OTP ================= */}
        <section className="w-full lg:w-1/2 flex flex-col justify-center items-center">
          <div className="w-full max-w-md bg-white border-3 border-black rounded-3xl p-8 shadow-[6px_6px_0px_#000] space-y-6">

          {/* ─── REGISTRATION FORM ─── */}
          {signupStep === "form" && (<>
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
          </>)}

          {/* ─── OTP VERIFICATION SCREEN ─── */}
          {signupStep === "otp" && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setSignupStep("form"); setOtpValue(""); setError(""); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
                  >
                    Kembali
                  </button>
                  <span className="text-xs font-black text-black uppercase tracking-wider select-none">Unravel</span>
                </div>

                <div className="space-y-1 pt-1">
                  <h2 className="text-2xl font-black text-black tracking-tight font-serif">Verifikasi Email</h2>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    Kami mengirimkan kode 6 digit ke{" "}
                    <span className="font-black text-[#00BC7D]">{formData.email}</span>.
                    Masukkan kode untuk mengaktifkan akunmu.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#FDEDEC] border-2 border-black rounded-xl text-red-900 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-650">Kode OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                    placeholder="_ _ _ _ _ _"
                    className="w-full px-4 py-4 bg-white border-2 border-black rounded-xl text-2xl font-black text-black text-center tracking-[0.5em] focus:outline-none focus:bg-slate-50 shadow-[2px_2px_0px_#000] transition-all font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-3.5 border-2 border-black text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all cursor-pointer bg-[#00BC7D] disabled:opacity-60"
                >
                  {otpLoading ? "Memverifikasi..." : "Verifikasi & Aktifkan Akun"}
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  disabled={resendCountdown > 0 || otpLoading}
                  onClick={handleResendRegisterOtp}
                  className="text-xs font-black text-slate-500 hover:text-[#00BC7D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {resendCountdown > 0
                    ? `Kirim ulang OTP dalam ${resendCountdown}s`
                    : "Tidak menerima OTP? Kirim Ulang"}
                </button>
              </div>
            </>
          )}

          </div>
        </section>
      </div>
    </div>
  );
}
