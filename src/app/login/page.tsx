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

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Recovery Flow States
  const [recoveryState, setRecoveryState] = useState<"login" | "forgot_email" | "forgot_waiting" | "forgot_reset">("login");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");
  const [showRecoveryNewPass, setShowRecoveryNewPass] = useState(false);
  const [showRecoveryConfirmPass, setShowRecoveryConfirmPass] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handleSendRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;

    setError("");
    setRecoveryLoading(true);
    try {
      // Mock API call POST /auth/forgot-password
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: recoveryEmail }),
      });
    } catch (err: any) {
      console.warn("Backend /auth/forgot-password belum diimplementasikan, membypass untuk demo:", err.message);
    } finally {
      setRecoveryLoading(false);
      setRecoveryState("forgot_waiting");
      showToastNotification("Email pemulihan terkirim!", "success");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryNewPassword || !recoveryConfirmPassword) return;

    if (recoveryNewPassword.length < 6) {
      setError("Kata sandi baru minimal 6 karakter.");
      showToastNotification("Gagal mereset sandi", "error");
      return;
    }

    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setError("Konfirmasi kata sandi baru tidak cocok.");
      showToastNotification("Gagal mereset sandi", "error");
      return;
    }

    setError("");
    setRecoveryLoading(true);
    try {
      // Mock API call POST /auth/reset-password
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: recoveryEmail,
          password: recoveryNewPassword,
        }),
      });
    } catch (err: any) {
      console.warn("Backend /auth/reset-password belum diimplementasikan, membypass untuk demo:", err.message);
    } finally {
      setRecoveryLoading(false);
      setRecoveryState("login");
      setRecoveryEmail("");
      setRecoveryNewPassword("");
      setRecoveryConfirmPassword("");
      showToastNotification("Kata sandi berhasil diubah! Silakan login.", "success");
    }
  };

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
            Masuk ke akunmu untuk melanjutkan petualangan membedah studi kasus
            kompleks secara bertahap di platform Unravel.
          </p>
        </section>

        {/* ================= SISI KANAN: FORM LOGIN VERTIKAL UTUH ================= */}
        <section className="w-full lg:w-1/2 flex flex-col justify-center items-center">
          <div className="w-full max-w-md bg-white border-3 border-black rounded-3xl p-8 shadow-[6px_6px_0px_#000] space-y-6">
            {recoveryState === "login" && (
              <>
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

                  <span className="text-xs font-black text-black uppercase tracking-wider select-none">
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
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-black transition-colors text-sm cursor-pointer flex items-center justify-center"
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
                      className="w-4 h-4 rounded border-2 border-black accent-[#00BC7D] cursor-pointer shadow-[1px_1px_0px_#000]"
                    />
                    <span>Ingat Saya</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setRecoveryState("forgot_email");
                    }}
                    className="font-black text-[#00BC7D] hover:underline cursor-pointer bg-transparent border-none text-xs"
                  >
                    Lupa Sandi?
                  </button>
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
                  {loading ? "Memverifikasi..." : "Masuk Sekarang"}
                </button>
              </form>

              {/* FOOTER AKUN BARU */}
              <div className="text-center pt-2 text-xs font-semibold text-slate-500">
                Belum memiliki akun?{" "}
                <Link
                  href="/signup"
                  className="font-black text-[#00BC7D] hover:underline"
                >
                  Buat Akun Baru
                </Link>
              </div>
            </>
          )}

          {recoveryState === "forgot_email" && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setRecoveryState("login")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
                  >
                    Kembali
                  </button>
                  <span className="text-xs font-black text-black uppercase tracking-wider select-none">
                    Unravel
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <h2 className="text-2xl font-black text-black tracking-tight font-serif">
                    Lupa Kata Sandi?
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Masukkan email terdaftar Anda untuk memulihkan kata sandi Anda.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#FDEDEC] border-2 border-black rounded-xl text-red-900 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSendRecoveryEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-650">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    disabled={recoveryLoading}
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:bg-slate-50 shadow-[2px_2px_0px_#000] transition-all disabled:opacity-60 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full py-3.5 border-2 border-black text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all mt-4 cursor-pointer bg-[#00BC7D] hover:bg-[#00BC7D]"
                >
                  {recoveryLoading ? "Mengirim..." : "Kirim Tautan Pemulihan"}
                </button>
              </form>
            </>
          )}

          {recoveryState === "forgot_waiting" && (
            <>
              <div className="space-y-4">
                <span className="text-xs font-black text-black uppercase tracking-wider select-none">
                  Unravel Recovery
                </span>

                <div className="space-y-2 pt-1">
                  <h2 className="text-2xl font-black text-black tracking-tight font-serif">
                    Email Pemulihan Terkirim
                  </h2>
                  <p className="text-xs font-semibold text-slate-650 leading-relaxed">
                    Kami telah mengirimkan tautan verifikasi ganti sandi ke email Anda:{" "}
                    <span className="font-bold text-[#00BC7D]">{recoveryEmail}</span>.
                  </p>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">
                    Silakan periksa kotak masuk atau spam email Anda.
                  </p>
                </div>
              </div>

              {/* SIMULATION CONTAINER FOR DEMO/TESTING */}
              <div className="p-4 bg-emerald-50 border-2 border-dashed border-[#00BC7D] rounded-2xl space-y-3">
                <span className="text-[9px] font-black uppercase text-[#00BC7D] tracking-widest block">
                  Simulasi Pengujian (Front-end Demo)
                </span>
                <p className="text-[10px] font-medium text-slate-600 leading-relaxed">
                  Gunakan tombol di bawah untuk mensimulasikan ketika user menekan tautan verifikasi ganti sandi yang dikirimkan ke email mereka.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setRecoveryState("forgot_reset");
                  }}
                  className="w-full py-2 bg-[#00BC7D] hover:bg-[#07A06E] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
                >
                  Simulasikan Klik Verifikasi Email
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setRecoveryState("login")}
                  className="font-black text-xs text-slate-500 hover:text-black hover:underline cursor-pointer"
                >
                  Kembali ke Login
                </button>
              </div>
            </>
          )}

          {recoveryState === "forgot_reset" && (
            <>
              <div className="space-y-4">
                <span className="text-xs font-black text-black uppercase tracking-wider select-none">
                  Unravel Reset
                </span>

                <div className="space-y-1 pt-1">
                  <h2 className="text-2xl font-black text-black tracking-tight font-serif">
                    Setel Ulang Kata Sandi
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Masukkan kata sandi baru untuk akun Anda ({recoveryEmail}).
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#FDEDEC] border-2 border-black rounded-xl text-red-900 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Password Baru */}
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-650">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showRecoveryNewPass ? "text" : "password"}
                      required
                      disabled={recoveryLoading}
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-10 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:bg-slate-50 shadow-[2px_2px_0px_#000] transition-all disabled:opacity-60 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRecoveryNewPass(!showRecoveryNewPass)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-black transition-colors text-sm cursor-pointer flex items-center justify-center"
                    >
                      {showRecoveryNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password Baru */}
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-650">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showRecoveryConfirmPass ? "text" : "password"}
                      required
                      disabled={recoveryLoading}
                      value={recoveryConfirmPassword}
                      onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-10 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:bg-slate-50 shadow-[2px_2px_0px_#000] transition-all disabled:opacity-60 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRecoveryConfirmPass(!showRecoveryConfirmPass)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-black transition-colors text-sm cursor-pointer flex items-center justify-center"
                    >
                      {showRecoveryConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full py-3.5 border-2 border-black text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all mt-4 cursor-pointer bg-[#00BC7D] hover:bg-[#00BC7D]"
                >
                  {recoveryLoading ? "Menyetel Ulang..." : "Perbarui Kata Sandi"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
      </div> {/* Closes max-w-6xl container */}
    </div>
  );
}
