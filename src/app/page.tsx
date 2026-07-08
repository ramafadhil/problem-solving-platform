"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import { apiFetch } from "@/utils/api";
// Import player Lottie resmi
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  User,
  Sparkles,
  Compass,
  MessageSquare,
  BarChart3,
  Trophy,
  Target,
  Heart,
  X,
  HelpCircle,
} from "lucide-react";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showWelcomeOnboarding, setShowWelcomeOnboarding] =
    useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [onboardingKey, setOnboardingKey] = useState<string>(
    "unravel_welcome_onboarded",
  );

  useEffect(() => {
    // Mengecek apakah cookie token tersedia di browser saat landing page dimuat
    const cookies = document.cookie.split(";");
    const hasToken = cookies.some((item) => item.trim().startsWith("token="));
    setIsLoggedIn(hasToken);

    // Fetch user ID untuk membuat key onboarding yang unik per-akun
    const checkOnboarding = async () => {
      let key = "unravel_welcome_onboarded";
      if (hasToken) {
        try {
          const profile = await apiFetch("/me");
          const user = profile?.data || profile;
          if (user?.id) {
            key = `unravel_welcome_onboarded_${user.id}`;
          }
        } catch (err) {
          // Fallback ke generic key jika fetch gagal
          console.warn("Gagal fetch user untuk onboarding key:", err);
        }
      }
      setOnboardingKey(key);
      const onboarded = localStorage.getItem(key);
      if (!onboarded) {
        setShowWelcomeOnboarding(true);
      }
    };

    checkOnboarding();
  }, []);

  const handleLogout = () => {
    // Menghapus cookie token dengan mengatur masa kedaluwarsa ke masa lalu
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsLoggedIn(false);
    window.location.reload(); // Refresh halaman untuk membersihkan state global global
  };

  return (
    <div className="min-h-screen bg-neogrid text-black font-sans selection:bg-indigo-600 selection:text-white pb-16">
      {/* 1. NAVBAR HEADER SECTION */}
      <nav className="w-full bg-white border-b-4 border-black px-4 sm:px-8 py-4 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          {/* SISI KIRI: LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white  flex items-center justify-center">
              <img src="/logo.svg" alt="Logo" className="w-16 h-16" />
            </div>
            <a
              href="/"
              className="font-black text-lg tracking-tight text-black hover:text-[#00BC7D] transition-colors"
            >
              Unravel
            </a>
          </div>

          {/* SISI TENGAH: MENU LINKS */}
          <div className="hidden md:flex items-center justify-center gap-8 text-[12px] font-black uppercase tracking-wider text-black absolute left-1/2 -translate-x-1/2">
            <Link
              href="/belajar"
              className="hover:underline decoration-2 underline-offset-4 decoration-[#00BC7D] transition-all py-2"
            >
              Belajar
            </Link>
            <Link
              href="/diskusi"
              className="hover:underline decoration-2 underline-offset-4 decoration-[#00BC7D] transition-all py-2"
            >
              Diskusi
            </Link>
            <a
              href="#fitur"
              className="hover:underline decoration-2 underline-offset-4 decoration-[#00BC7D] transition-all py-2"
            >
              Konten
            </a>
          </div>

          {/* SISI KANAN: AUTH ACTIONS DINAMIS */}
          <div className="flex items-center gap-3 text-[11px] font-black tracking-wider">
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleLogout}
                  className="text-black hover:text-indigo-600 transition-colors py-2 hidden sm:inline-block cursor-pointer font-bold mr-2 text-xs"
                >
                  Keluar
                </button>
                <NotificationBell />
                <Link
                  href="/profile"
                  className="w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
                  title="Profile"
                >
                  <User size={18} className="text-black" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2.5 bg-white text-black border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all text-xs font-black uppercase shrink-0"
                >
                  Masuk
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2.5 bg-[#00BC7D] text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all text-xs font-black uppercase shrink-0"
                >
                  Mulai Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 space-y-16 py-12">
        {/* 2. HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-black rounded-full shadow-[3px_3px_0px_#000] text-xs font-extrabold text-black">
              <Sparkles size={14} className="text-indigo-600" />
              <span>Belajar, diskusi, dan progres dalam satu tempat</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-black text-black leading-[1.1] tracking-tight font-serif">
              Belajar menganalisis <br className="hidden md:inline" />
              kasus secara <br className="hidden md:inline" />
              terstruktur!
            </h1>

            <p className="text-sm font-semibold text-black leading-relaxed max-w-xl mx-auto lg:mx-0 font-mono">
              Unravel menyatukan jalur belajar interaktif, berbagi perspektif,
              dan progres agar kamu bisa berlatih, berdiskusi, dan melihat
              perkembangan dari pengalaman yang konsisten.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/belajar"
                className="px-6 py-3.5 bg-emerald-500 border-3 border-black hover:bg-emerald-600 text-white font-black rounded-xl shadow-[4px_4px_0px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all text-sm"
              >
                {isLoggedIn ? "Lanjutkan Belajar" : "Lanjutkan Belajar"}
              </Link>
              <Link
                href="/diskusi"
                className="px-6 py-3.5 bg-white border-3 border-black hover:bg-slate-50 text-black font-black rounded-xl shadow-[4px_4px_0px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all text-sm"
              >
                Mode Diskusi
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D1F2D9] border-2 border-black rounded-full shadow-[2.5px_2.5px_0px_#000] text-xs font-black text-black select-none">
                <Target size={14} className="text-black shrink-0" />
                <span>100+ tantangan</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FDE293] border-2 border-black rounded-full shadow-[2.5px_2.5px_0px_#000] text-xs font-black text-black select-none">
                <Trophy size={14} className="text-black shrink-0" />
                <span>ranking & points</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FADBD8] border-2 border-black rounded-full shadow-[2.5px_2.5px_0px_#000] text-xs font-black text-black select-none">
                <Heart
                  size={14}
                  className="text-[#C41E3A] fill-[#C41E3A] shrink-0"
                />
                <span>komunitas aktif</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 w-full flex flex-col items-center justify-center">
            {/* Tablet-style container wrapper for the Lottie graph */}
            <div className="relative w-full max-w-[400px] bg-white border-[3px] border-black rounded-[24px] shadow-[8px_8px_0px_#000] p-6 flex flex-col items-center justify-center">
              {/* Browser Mock Controls */}
              <div className="absolute top-4 left-4 flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#EC7063] border border-black"></span>
                <span className="w-3 h-3 rounded-full bg-[#F5B7B1] border border-black"></span>
                <span className="w-3 h-3 rounded-full bg-[#8EE4AF] border border-black"></span>
              </div>

              <div className="w-full max-w-[270px] aspect-square mt-4 select-none pointer-events-none">
                <DotLottieReact
                  src="/tryliam.json"
                  loop={true}
                  autoplay={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. METODOLOGI BELAJAR */}
        <section id="kenapa" className="w-full pt-4">
          <div className="bg-white border-[3px] border-black rounded-[24px] shadow-[8px_8px_0px_#000] p-6 sm:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-black text-[#00BC7D] uppercase tracking-widest block">
                  METODOLOGI PENGERJAAN
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-black text-black leading-tight tracking-tight">
                  3 Langkah Sederhana Membedah Masalah Kompleks
                </h2>
              </div>
              <div className="shrink-0 self-start md:self-center">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FDE293] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-black text-black">
                  Siklus Pengerjaan Unravel
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Step 1 */}
              <div className="bg-[#FDEDEC] border-2 border-black p-6 rounded-2xl flex flex-col justify-between min-h-[140px] shadow-[3px_3px_0px_#000]">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-black">
                    1. Bedah Kasus Nyata!
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                    Pilih topik dunia nyata dan analisis narasi kasus dari
                    berbagai sudut pandang.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-emerald-100 border-2 border-black p-6 rounded-2xl flex flex-col justify-between min-h-[140px] shadow-[3px_3px_0px_#000]">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-black">
                    2. Formulasi 3 Poin Masalah Utama
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                    Kelompokkan kata kunci ke dalam zona Stakeholder, Action,
                    dan Impact secara tepat.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-blue-100 border-2 border-black p-6 rounded-2xl flex flex-col justify-between min-h-[140px] shadow-[3px_3px_0px_#000]">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-black">
                    3. Bandingkan Perspektif
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                    Bandingkan hasil analisismu dengan ribuan analis lain di
                    forum ulasan publik.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="fitur" className="w-full pt-4">
          <div className="bg-white border-[3px] border-black rounded-[24px] shadow-[8px_8px_0px_#000] p-6 sm:p-10 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 text-white">
                <span className="text-xs font-black text-[#00BC7D] uppercase tracking-widest block">
                  FITUR & EKOSISTEM
                </span>
                <h2 className="text-2xl md:text-3xl text-black font-serif font-black leading-tight tracking-tight">
                  Semua Alat Bantu Analisis untuk Mengasah Logikamu
                </h2>
              </div>
              <div className="shrink-0 self-start lg:self-center">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FDE293] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-black text-black">
                  Fasilitas Belajar Terpadu
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              {/* Card 1 */}
              <div className="bg-[#FDE293] border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_#000] text-black flex flex-col gap-6 justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <Compass size={24} className="text-black" />
                  </div>
                  <h3 className="text-sm font-black text-black font-serif leading-tight">
                    Jalur Belajar Gamifikasi
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                    Pecahkan tantangan studi kasus secara interaktif lewat game
                    drag-and-drop kata kunci.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-emerald-100 border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_#000] text-black flex flex-col gap-6 justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <MessageSquare size={24} className="text-black" />
                  </div>
                  <h3 className="text-sm font-black text-black font-serif leading-tight">
                    Perspektif Kolaboratif
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                    Utarakan argumenmu dan bandingkan ulasan publik komunitas.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-blue-100 border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_#000] text-black flex flex-col gap-6 justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <BarChart3 size={24} className="text-black" />
                  </div>
                  <h3 className="text-sm font-black text-black font-serif leading-tight">
                    Resume Analisis Digital
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                    Rangkum kontribusi riwayat pemecahan masalahmu sebagai
                    portofolio keahlian yang kredibel.
                  </p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-[#FDEDEC] border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_#000] text-black flex flex-col gap-6 justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <Trophy size={24} className="text-black" />
                  </div>
                  <h3 className="text-sm font-black text-black font-serif leading-tight">
                    Points!
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                    Dapatkan points dari analisis berkualitas yang berhasil kamu
                    kirimkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. ALUR PENGALAMAN */}
        <section id="alur" className="w-full pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Sisi Kiri */}
            <div className="lg:col-span-5 bg-white border-[3px] border-black rounded-[24px] shadow-[8px_8px_0px_#000] p-8 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <span className="text-xs font-black text-[#00BC7D] uppercase tracking-widest block">
                  ALUR PENGALAMAN
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-black text-black leading-tight tracking-tight">
                  Mulai dari satu topik, lalu lanjutkan ke diskusi dan progres.
                </h2>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                  Kamu tidak perlu langsung jadi ahli. Pilih topik, selesaikan
                  stage, lalu bagikan perspektifmu dan lihat perkembanganmu di
                  profil.
                </p>
              </div>
              <div>
                <Link
                  href="/belajar"
                  className="inline-block px-6 py-3 bg-[#00BC7D] text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all text-xs font-black uppercase tracking-wide"
                >
                  Coba sekarang
                </Link>
              </div>
            </div>

            {/* Sisi Kanan (3 Steps) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_#000] flex flex-col items-start gap-4 min-h-[195px]">
                <div className="w-8 h-8 rounded-full bg-[#FDE293] border-2 border-black flex items-center justify-center text-xs font-black shadow-[1.5px_1.5px_0px_#000] select-none">
                  1
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-black leading-tight">
                    Pilih topik
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed font-mono">
                    Mulai dari tema yang paling dekat dengan kebutuhanmu.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_#000] flex flex-col items-start gap-4 min-h-[195px]">
                <div className="w-8 h-8 rounded-full bg-[#FDE293] border-2 border-black flex items-center justify-center text-xs font-black shadow-[1.5px_1.5px_0px_#000] select-none">
                  2
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-black leading-tight">
                    Selesaikan stage
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed font-mono">
                    Latih kemampuan analisis lewat jalur belajar yang sudah
                    terarah.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_#000] flex flex-col items-start gap-4 min-h-[195px]">
                <div className="w-8 h-8 rounded-full bg-[#FDE293] border-2 border-black flex items-center justify-center text-xs font-black shadow-[1.5px_1.5px_0px_#000] select-none">
                  3
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-black leading-tight">
                    Kumpulkan Points!
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed font-mono">
                    Kumpulkan poin dari setiap case yang kamu selesaikan dan
                    tingkatkan keahlianmu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FOOTER SECTION */}
        <section id="footer" className="w-full pt-4">
          <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-extrabold text-black">
              © 2026 Unravel
            </div>
            <div className="flex gap-6 text-[11px] font-black uppercase tracking-wider text-black">
              <Link
                href="/belajar"
                className="hover:underline decoration-2 underline-offset-2 decoration-[#00BC7D] transition-all"
              >
                Belajar
              </Link>
              <Link
                href="/diskusi"
                className="hover:underline decoration-2 underline-offset-2 decoration-[#00BC7D] transition-all"
              >
                Diskusi
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ONBOARDING WELCOME MODAL */}
      {showWelcomeOnboarding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_#000] w-full max-w-lg p-6 sm:p-8 flex flex-col gap-6 relative select-none animate-in fade-in zoom-in-95 duration-200">
            {/* Header / Top Controls */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border-2 border-black px-2.5 py-1 rounded-lg shadow-[1.5px_1.5px_0px_#000]">
                Tutorial
              </span>
              <button
                onClick={() => {
                  localStorage.setItem(onboardingKey, "true");
                  setShowWelcomeOnboarding(false);
                }}
                className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer text-black"
                title="Lewati"
              >
                <X size={16} />
              </button>
            </div>

            {/* Slides Content */}
            <div className="min-h-[220px] flex flex-col justify-center gap-4 py-2">
              {currentSlide === 0 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-[#D1F2D9] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                    <Sparkles size={28} className="text-black" />
                  </div>
                  <h3 className="text-xl font-black text-black leading-snug font-serif">
                    Selamat datang di Unravel!
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                    Platform gamifikasi interaktif untuk melatih logika berpikir
                    kritis kamu dalam membedah berbagai studi kasus dunia nyata
                    secara terstruktur.
                  </p>
                </div>
              )}

              {currentSlide === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-[#FDE293] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                    <Compass size={28} className="text-black" />
                  </div>
                  <h3 className="text-xl font-black text-black leading-snug font-serif">
                    Mode Belajar
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                    Di sini kamu memecahkan tantangan dengan drag-and-drop kata
                    kunci kasus ke pilar <strong>Stakeholder</strong>,{" "}
                    <strong>Action</strong>, dan <strong>Impact</strong> yang
                    tepat untuk mengasah logika analitismu.
                  </p>
                </div>
              )}

              {currentSlide === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-[#D6EAF8] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                    <MessageSquare size={28} className="text-black" />
                  </div>
                  <h3 className="text-xl font-black text-black leading-snug font-serif">
                    Mode Diskusi
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                    Bandingkan jawabanmu dan temukan perspektif baru dari ribuan
                    analis lain secara global.
                  </p>
                </div>
              )}

              {currentSlide === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-[#FADBD8] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                    <Trophy size={28} className="text-black" />
                  </div>
                  <h3 className="text-xl font-black text-black leading-snug font-serif">
                    Points!
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-mono">
                    Kumpulkan poin dari setiap kasus yang berhasil kamu
                    selesaikan dan naikkan peringkat globalmu!
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Controls / Progress Dots */}
            <div className="flex items-center justify-between border-t-2 border-black pt-4">
              {/* Dots */}
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((slideIdx) => (
                  <span
                    key={slideIdx}
                    className={`w-2.5 h-2.5 rounded-full border border-black shadow-[0.5px_0.5px_0px_#000] transition-colors ${
                      currentSlide === slideIdx ? "bg-indigo-600" : "bg-white"
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {currentSlide > 0 && (
                  <button
                    onClick={() => setCurrentSlide((prev) => prev - 1)}
                    className="px-4 py-2 bg-white border-2 border-black rounded-xl text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                )}

                {currentSlide < 3 ? (
                  <button
                    onClick={() => setCurrentSlide((prev) => prev + 1)}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 border-2 border-black text-white rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
                  >
                    Lanjut
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      localStorage.setItem(onboardingKey, "true");
                      setShowWelcomeOnboarding(false);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 border-2 border-black text-white rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
                  >
                    Mulai Eksplorasi!
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING HELP BUTTON */}
      <button
        onClick={() => {
          setCurrentSlide(0);
          setShowWelcomeOnboarding(true);
        }}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#FDE293] hover:bg-[#fddb73] text-black border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer z-40"
        title="Buka Panduan Tutorial"
      >
        <HelpCircle size={22} className="stroke-[3]" />
      </button>
    </div>
  );
}
