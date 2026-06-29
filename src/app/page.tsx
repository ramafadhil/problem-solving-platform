"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
// Import player Lottie resmi
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Mengecek apakah cookie token tersedia di browser saat landing page dimuat
    const cookies = document.cookie.split(";");
    const hasToken = cookies.some((item) => item.trim().startsWith("token="));
    setIsLoggedIn(hasToken);
  }, []);

  const handleLogout = () => {
    // Menghapus cookie token dengan mengatur masa kedaluwarsa ke masa lalu
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsLoggedIn(false);
    window.location.reload(); // Refresh halaman untuk membersihkan state global global
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      title: "Gamifikasi Analisis Kasus",
      desc: "Belajar membedah masalah makro lewat metode interaktif drag-and-drop yang seru, terstruktur, dan tidak membosankan.",
    },
    {
      title: "Jalur Belajar Linear & Terarah",
      desc: "Mulailah dari level eksplorasi dasar hingga perumusan rekomendasi solusi nyata melalui berbagai tema pilihan.",
    },
  ];

  const testimonials = [
    {
      name: "Rama",
      role: "Mahasiswa Rekayasa Perangkat Lunak",
      text: "Platform ini ngebantu banget buat ngasah critical thinking. UI gamifikasinya bikin betah ngerjain studi kasus berjam-jam!",
    },
    {
      name: "Radit",
      role: "Rekan Belajar",
      text: "Fitur leaderboard dan papan skor real-time-nya bikin kompetisi belajar bareng rekan analis lain jadi makin seru dan kompetitif.",
    },
    {
      name: "Fadhil",
      role: "Beta Tester Platform",
      text: "Biasa males baca studi kasus yang panjang dan kaku, tapi pas coba dibikin model interaktif begini jadi gampang paham alur sebab-akibatnya.",
    },
  ];

  const faqs = [
    {
      q: "Apa itu Platform Unravel?",
      a: "Unravel adalah sebuah platform edutech gamifikasi yang dirancang untuk membantu kamu belajar membedah studi kasus kompleks (seperti isu lingkungan, politik, and sosial) dengan cara mengurai komponen masalah secara interaktif.",
    },
    {
      q: "Bagaimana cara kerja sistem penilaian skornya?",
      a: "Setiap kali kamu berhasil menempatkan kartu kata kunci analisis di kotak yang tepat pada permainan drag-and-drop, kamu akan mendapatkan poin Points dinamis yang langsung menaikkan peringkatmu di leaderboard.",
    },
    {
      q: "Apakah jalur petualangan belajarnya harus berurutan?",
      a: "Ya, platform ini menerapkan sistem kemajuan linear. Kamu harus menyelesaikan Level 1 (Eksplorasi) terlebih dahulu untuk membuka tantangan di level berikutnya.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. NAVBAR HEADER SECTION (Responsif & Rata Tengah Sempurna) */}
      <nav className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-4 max-w-7xl mx-auto rounded-b-2xl shadow-sm relative">
        <div className="flex items-center justify-between w-full">
          
          {/* SISI KIRI: LOGO */}
          <div className="flex items-center z-10">
            <span className="font-black text-xl tracking-tight text-slate-950">
              Unravel
            </span>
          </div>

          {/* SISI TENGAH: MENU LINKS (Hidden di mobile, mengunci posisi absolut di tengah pada desktop) */}
          <div className="hidden md:flex items-center justify-center gap-8 text-[11px] font-black uppercase tracking-wider text-slate-500 absolute left-1/2 -translate-x-1/2">
            <Link href="/belajar" className="hover:text-indigo-600 transition-colors py-2">
              Mode Belajar
            </Link>
            <Link href="/diskusi" className="hover:text-indigo-600 transition-colors py-2">
              Mode Diskusi
            </Link>
            <a href="#features" className="hover:text-indigo-600 transition-colors py-2">
              Fitur
            </a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors py-2">
              FAQ
            </a>
          </div>

          {/* SISI KANAN: AUTH ACTIONS DINAMIS */}
          <div className="flex items-center gap-3 sm:gap-6 text-[11px] font-black uppercase tracking-wider z-10">
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-500 transition-colors py-2 hidden sm:inline-block cursor-pointer"
                >
                  Keluar
                </button>
                <Link
                  href="/profile"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all hover:-translate-y-0.5 text-[10px] sm:text-xs font-black shrink-0"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-500 hover:text-indigo-600 transition-colors py-2 hidden sm:inline-block"
                >
                  Masuk
                </Link>
                <Link
                  href="/signup"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all hover:-translate-y-0.5 text-[10px] sm:text-xs font-bold normal-case shrink-0"
                >
                  Mulai Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 space-y-24 py-12">
        
        {/* 2. HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 leading-tight tracking-tight">
              Kuasai Analisis Kasus <br className="hidden md:inline" />
              <span className="text-indigo-600 font-sans font-black font-serif">
                Lewat Gamifikasi Interaktif
              </span>
            </h1>
            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Uji kemampuan problem-solving secara mandiri atau diskusikan
              analisis pemecahan masalah pelik bersama komunitas analis
              secara real-time.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/belajar"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-[4px_4px_0px_0px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all"
              >
                {isLoggedIn ? "Lanjutkan Belajar" : "Masuk Mode Belajar"}
              </Link>
              <Link
                href="/diskusi"
                className="px-6 py-3 bg-white border-2 border-slate-200 hover:border-indigo-400 text-slate-700 font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.15)]"
              >
                Masuk Mode Diskusi
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 w-full flex flex-col items-center justify-center">
            <div className="w-full max-w-[280px] aspect-square">
              <DotLottieReact
                src="/basic-animation.json"
                loop={true}
                autoplay={true}
              />
            </div>
          </div>
        </section>

        {/* 3. FEATURES SECTION */}
        <section id="features" className="space-y-12 pt-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Cara Baru Memahami Masalah Kompleks
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Bukan sekadar membaca teks kaku, tapi berinteraksi langsung dengan struktur kasus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-slate-200 hover:border-indigo-400 p-6 rounded-2xl shadow-sm transition-all hover:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)] group hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {idx === 0 ? "🎮" : "🛣️"}
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. TESTIMONIALS SECTION */}
        <section id="testimonials" className="space-y-12 pt-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Testimoni Pengguna Platform
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Apa kata mereka yang sudah merasakan serunya membedah kasus di sini?
            </p>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
            {testimonials.map((testi, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm min-w-[280px] md:min-w-[340px] flex-1 snap-start flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-400 text-sm mb-3">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                    "{testi.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-50">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 tracking-tight">
                      {testi.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {testi.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. FAQ SECTION */}
        <section
          id="faq"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8 border-t border-slate-100"
        >
          <div className="lg:col-span-5 space-y-3 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              Punya pertanyaan seputar platform ini? Temukan jawaban cepat atas kebingungan umum kamu di sini.
            </p>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-3 w-full">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-black text-xs text-slate-800 hover:text-indigo-600 tracking-tight"
                >
                  <span>{faq.q}</span>
                  <span
                    className={`transform transition-transform text-slate-400 ${openFaq === idx ? "rotate-180 text-indigo-600" : ""}`}
                  >
                    ▼
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 pt-1 text-xs font-medium text-slate-500 leading-relaxed border-t border-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 6. FOOTER SECTION */}
      <footer className="w-full bg-slate-900 text-slate-400 text-xs py-12 mt-24 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-center md:text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-black text-sm">
              Unravel
            </div>
            <p className="text-[10px] text-slate-500">
              © 2026 Unravel Inc. Hak cipta dilindungi undang-undang.
            </p>
          </div>
          <div className="flex justify-center md:justify-end gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <Link href="/belajar" className="hover:text-white transition-colors">
              Belajar
            </Link>
            <Link href="/diskusi" className="hover:text-white transition-colors">
              Diskusi
            </Link>
            <a href="#features" className="hover:text-white transition-colors">
              Fitur
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}