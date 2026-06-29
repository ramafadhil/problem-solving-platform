"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

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

  const showToastNotification = (message: string, type: "success" | "error") => {
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

      // Pemicu Toast Sukses
      showToastNotification("✓ Registrasi Berhasil! Mengalihkan ke halaman masuk...", "success");

      // Beri sedikit jeda agar user sempat melihat pesan sukses sebelum dialihkan
      setTimeout(() => {
        router.push("/login");
      }, 1200);

    } catch (err: any) {
      // 🌟 PERBAIKAN 1: Saring pesan error mentah dari HTTP Status menjadi kalimat yang ramah
      let friendlyMsg = "Registrasi gagal. Silakan coba lagi.";
      
      // Biasanya jika email atau username sudah terdaftar, backend mengirim status 400 atau 409
      if (err.message && (err.message.includes("400") || err.message.includes("409"))) {
        friendlyMsg = "Username atau email sudah digunakan oleh orang lain.";
      } else if (err.message && err.message.includes("Fetch")) {
        friendlyMsg = "Gagal terhubung ke server. Periksa koneksi internetmu.";
      } else if (err.message) {
        friendlyMsg = err.message;
      }

      setError(friendlyMsg);
      
      // 🌟 PERBAIKAN 2: Buat pesan Toast menjadi ringkas sebagai indikator cepat saja
      showToastNotification("⚠️ Registrasi Gagal", "error");
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-stretch text-slate-800 font-sans selection:bg-indigo-500 selection:text-white relative">
      
      {/* ================= COMPONENT TOAST FLOATING NOTIFICATION ================= */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-4 font-sans text-xs font-bold uppercase tracking-wider ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-400 text-emerald-800"
              : "bg-red-50 border-red-400 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* ================= SISI KIRI: PLACEHOLDER VISUAL ASSET ================= */}
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-50 to-slate-50 border-r-2 border-slate-100 p-12 flex-col items-center justify-center relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

        <div className="relative text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Mulai Mengurai Masalah
          </h2>
          <p className="text-xs font-medium text-slate-400 leading-relaxed">
            Daftarkan dirimu untuk memulai petualangan membedah studi kasus
            kompleks secara bertahap di platform Unravel.
          </p>
        </div>
      </section>

      {/* ================= SISI KANAN: FORM SIGNUP VERTIKAL UTUH ================= */}
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
                Daftar Akun Baru
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Silakan lengkapi isian formulir pendaftaran di bawah ini.
              </p>
            </div>
          </div>

          {/* NOTIFIKASI ERROR STATIC JIKA RESPONSE BE GAGAL */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* FORM ISIAN UTAMA */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* INPUT NAMA LENGKAP */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
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
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>

            {/* INPUT USERNAME */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
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
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>

            {/* INPUT EMAIL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
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
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-60"
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
                  disabled={loading}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-60"
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

            {/* BARIS KETENTUAN LAYANAN */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-500 select-none">
                <input
                  type="checkbox"
                  required
                  disabled={loading}
                  className="w-4 h-4 rounded-md border-2 border-slate-300 accent-indigo-600 cursor-pointer"
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
              className={`w-full py-3.5 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all mt-4 ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-[4px_4px_0px_0px_rgba(79,70,229,0.3)] hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Memproses Pendaftaran..." : "Daftar Akun Baru"}
            </button>
          </form>

          {/* FOOTER AKUN BARU */}
          <div className="text-center pt-4 text-xs font-medium text-slate-400">
            Sudah memiliki akun sebelumnya?{" "}
            <Link
              href="/login"
              className="font-black text-indigo-600 hover:underline"
            >
              Masuk Di Sini
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}