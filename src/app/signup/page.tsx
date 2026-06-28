"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Integrasi registrasi user ke BE Golang tim kamu nanti di sini
    console.log("Signup Submitted:", formData, { agreeTerms });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-stretch text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* ================= SISI KIRI: PLACEHOLDER VISUAL ASSET (Sesuai Kotak Catur Wireframe) ================= */}
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-50 to-slate-50 border-r-2 border-slate-100 p-12 flex-col items-center justify-center relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

        <div className="relative text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Mulai Mengurai Masalah
          </h2>
          <p className="text-xs font-medium text-slate-400 leading-relaxed">
            Daftarkan kelompokmu untuk memulai petualangan membedah studi kasus
            kompleks secara bertahap di platform Unravel.
          </p>
        </div>
      </section>

      {/* ================= SISI KANAN: FORM SIGNUP VERTIKAL UTUH (Sesuai Sisi Kanan Wireframe) ================= */}
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

          {/* FORM ISIAN UTAMA */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* INPUT BULANAN / NAMA DEPAN & BELAKANG (2 Kolom Sejajar Sesuai Baris 1 Input Wireframe) */}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Usernam
              </label>
              <input
                type="text"
                name="firstName"
                required
                placeholder="Isi Username Kamu!"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
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
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@mahasiswa.id"
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
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
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
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md hover:shadow-[4px_4px_0px_0px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all mt-4"
            >
              Daftar Akun Baru
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
