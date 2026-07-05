"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import AnimatedButton from "@/components/AnimatedButton";
import Navbar from "@/components/Navbar";

const offsetShadow = (size = 8, color = "#000") =>
  `${size}px ${size}px 0 ${color}`;

const cards = [
  {
    title: "Jalur Belajar Interaktif",
    desc: "Masuk ke topik, lanjutkan stage, dan selesaikan tantangan secara bertahap.",
    accent: "#FFE76A",
    emoji: "🧭",
  },
  {
    title: "Forum Diskusi Publik",
    desc: "Baca studi kasus lain, beri perspektif, dan lihat sudut pandang yang berbeda.",
    accent: "#A7F3D0",
    emoji: "💬",
  },
  {
    title: "Profil Progres",
    desc: "Pantau aktivitas, riwayat jawaban, dan pencapaianmu dari satu tempat.",
    accent: "#E9D5FF",
    emoji: "📊",
  },
  {
    title: "Badge & XP",
    desc: "Dapatkan motivasi dari pencapaian kecil yang terus tumbuh seiring latihan.",
    accent: "#FDBA74",
    emoji: "🏅",
  },
];

const steps = [
  {
    title: "Pilih topik",
    desc: "Mulai dari tema yang paling dekat dengan kebutuhanmu.",
  },
  {
    title: "Selesaikan stage",
    desc: "Latih kemampuan analisis lewat jalur belajar yang sudah terarah.",
  },
  {
    title: "Bagikan perspektif",
    desc: "Tukar jawaban dan diskusikan hasilmu di forum publik.",
  },
];

// A few sample cases for the interactive demo card in the hero.
// Cycling through these gives visitors a taste of the actual exercise
// instead of one static screenshot.
const demoCases = [
  {
    label: "Susun alur sebab → akibat",
    masalah: "Munculnya backlog yang terus bertambah.",
    solusi: "Tentukan akar masalah sebelum mengambil tindakan.",
  },
  {
    label: "Baca studi kasus tim produk",
    masalah: "Fitur baru jarang dipakai setelah dirilis.",
    solusi: "Validasi kebutuhan pengguna sebelum membangun fitur.",
  },
  {
    label: "Analisis keputusan bisnis",
    masalah: "Keputusan diambil tanpa data yang cukup.",
    solusi: "Kumpulkan data pendukung, lalu uji beberapa opsi.",
  },
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    const cookies = document.cookie.split(";");
    const hasToken = cookies.some((item) => item.trim().startsWith("token="));
    setIsLoggedIn(hasToken);
  }, []);

  const activeDemo = demoCases[demoIndex];

  return (
    <div
      className="relative min-h-screen text-black"
      style={{
        backgroundColor: "#FFD400",
        backgroundImage:
          "linear-gradient(#00000010 1px, transparent 1px), linear-gradient(90deg, #00000010 1px, transparent 1px)",
        backgroundSize: "64px 64px, 64px 64px",
      }}
    >
      {/* Decorative shapes — kept sparse on purpose so they read as accents, not clutter */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute -top-8 left-6 h-20 w-28 rounded-xl"
          style={{ background: "#A21CAF", border: "4px solid #000", boxShadow: offsetShadow(8) }}
        />
        <div
          className="absolute right-12 top-28 h-16 w-16 rounded-full"
          style={{ background: "#22C55E", border: "4px solid #000", boxShadow: offsetShadow(6) }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* ---------- Header ---------- */}
      <Navbar variant="landing" />

      <main className="relative z-10 overflow-x-hidden">
        {/* ---------- Hero ---------- */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <span
                className="inline-flex rounded-full px-4 py-2 text-sm font-black"
                style={{ background: "#fff", border: "4px solid #000", boxShadow: offsetShadow(6) }}
              >
                ✨ Belajar, diskusi, dan progres dalam satu tempat
              </span>

              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.1] md:text-5xl lg:text-6xl">
                Belajar menganalisis kasus, lalu bagikan hasilmu.
              </h1>

              <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-slate-700 md:text-lg">
                Unravel menyatukan jalur belajar interaktif, forum diskusi publik, dan profil
                progres agar kamu bisa berlatih, berdiskusi, dan melihat perkembangan dari satu
                pengalaman yang konsisten.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <AnimatedButton
                  as="link"
                  href="/belajar"
                  background="#22C55E"
                  shadowSize={8}
                >
                  {isLoggedIn ? "Lanjutkan Belajar" : "Mulai Sekarang"}
                </AnimatedButton>
                <AnimatedButton
                  as="link"
                  href="/diskusi"
                  background="#fff"
                  shadowSize={8}
                >
                  Lihat Diskusi
                </AnimatedButton>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-xs font-black">
                <span
                  className="rounded-full px-3 py-2"
                  style={{ background: "#A7F3D0", border: "4px solid #000", boxShadow: offsetShadow(4) }}
                >
                  🎯 100+ tantangan
                </span>
                <span
                  className="rounded-full px-3 py-2"
                  style={{ background: "#FDE68A", border: "4px solid #000", boxShadow: offsetShadow(4) }}
                >
                  🏆 badge & skor
                </span>
                <span
                  className="rounded-full px-3 py-2"
                  style={{ background: "#E9D5FF", border: "4px solid #000", boxShadow: offsetShadow(4) }}
                >
                  🤝 komunitas aktif
                </span>
              </div>
            </div>

            {/* Interactive demo card — visitors can click through a few sample cases
                instead of seeing one static example, which gives a real feel for the product. */}
            <div className="relative mx-auto w-full max-w-xl">
              <div
                className="rounded-[32px] border-[6px] border-black bg-[#6D28D9] p-4 sm:p-5"
                style={{ boxShadow: offsetShadow(14) }}
              >
                <div className="rounded-[24px] border-[4px] border-black bg-white p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6D28D9]">
                        Contoh aktivitas
                      </p>
                      <h2 className="mt-1 text-xl font-black">{activeDemo.label}</h2>
                    </div>
                    <div
                      className="rounded-full bg-[#FFE76A] px-3 py-2 text-sm font-black"
                      style={{ border: "3px solid #000" }}
                    >
                      Live
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-[20px] border-[4px] border-black bg-[#FDE68A] p-4">
                      <p className="text-sm font-black">Masalah</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                        {activeDemo.masalah}
                      </p>
                    </div>
                    <div className="rounded-[20px] border-[4px] border-black bg-[#A7F3D0] p-4">
                      <p className="text-sm font-black">Solusi</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                        {activeDemo.solusi}
                      </p>
                    </div>
                  </div>

                  {/* Dots let visitors flip through sample cases */}
                  <div className="mt-6 flex items-center justify-center gap-2">
                    {demoCases.map((demoCase, index) => (
                      <button
                        key={demoCase.label}
                        onClick={() => setDemoIndex(index)}
                        aria-label={`Lihat contoh ${index + 1}`}
                        className="h-3 w-3 rounded-full transition-all"
                        style={{
                          background: index === demoIndex ? "#6D28D9" : "#E5E7EB",
                          border: "2px solid #000",
                          transform: index === demoIndex ? "scale(1.3)" : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="absolute -left-3 bottom-5 h-20 w-20 rounded-2xl rotate-3"
                style={{ background: "#10B981", border: "4px solid #000", boxShadow: offsetShadow(8) }}
              />
              <div
                className="absolute -right-3 top-5 h-20 w-20 rounded-full -rotate-6"
                style={{ background: "#F59E0B", border: "4px solid #000", boxShadow: offsetShadow(8) }}
              />
            </div>
          </div>
        </section>

        {/* ---------- Quick overview ---------- */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-28">
          <div className="rounded-[32px] border-[6px] border-black bg-white p-8 md:p-10" style={{ boxShadow: offsetShadow(12) }}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6D28D9]">
                  Kenapa terasa lebih mudah dipahami
                </p>
                <h2 className="mt-3 text-2xl font-black leading-snug md:text-3xl">
                  Semua bagian utama web terasa terhubung dan mudah diikuti.
                </h2>
              </div>
              <div className="rounded-2xl border-[4px] border-black bg-[#FDE68A] px-4 py-3 text-sm font-black" style={{ boxShadow: offsetShadow(6) }}>
                Belajar → diskusi → progres
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border-[4px] border-black bg-[#FDF2F8] p-5">
                <p className="text-sm font-black">1. Pilih topik</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">Mulai dari tema yang paling relevan dengan kebutuhanmu.</p>
              </div>
              <div className="rounded-[24px] border-[4px] border-black bg-[#ECFDF5] p-5">
                <p className="text-sm font-black">2. Selesaikan stage</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">Lanjutkan tantangan secara bertahap tanpa rasa terburu-buru.</p>
              </div>
              <div className="rounded-[24px] border-[4px] border-black bg-[#F5F3FF] p-5">
                <p className="text-sm font-black">3. Bagikan hasil</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">Tukar perspektif dan lihat perkembanganmu di profil.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Feature cards ---------- */}
        <section id="konten" className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-28">
          <div
            className="rounded-[32px] border-[6px] border-black bg-[#3B1E7A] p-8 md:p-10"
            style={{ boxShadow: offsetShadow(12) }}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FDE68A]">
                  Yang bisa kamu lakukan
                </p>
                <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                  Semua bagian utama web ada di sini
                </h2>
              </div>
              <div
                className="rounded-2xl bg-white px-4 py-3 text-sm font-black"
                style={{ border: "4px solid #000", boxShadow: offsetShadow(6) }}
              >
                Belajar, berdiskusi, dan pantau progres
              </div>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[24px] border-[4px] border-black bg-white p-5 transition-transform duration-200 hover:-translate-y-1.5"
                  style={{ boxShadow: offsetShadow(10) }}
                >
                  <div
                    className="mb-4 flex h-24 items-center justify-center rounded-[16px] border-[4px] border-black text-4xl"
                    style={{ background: card.accent }}
                  >
                    {card.emoji}
                  </div>
                  <h3 className="text-lg font-black text-[#6D28D9]">{card.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                    {card.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Experience flow ---------- */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-28">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div
              className="rounded-[28px] border-[4px] border-black bg-white p-8"
              style={{ boxShadow: offsetShadow(10) }}
            >
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6D28D9]">
                Alur pengalaman
              </p>
              <h2 className="mt-2 text-2xl font-black leading-snug md:text-3xl">
                Mulai dari satu topik, lalu lanjutkan ke diskusi dan progres.
              </h2>
              <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">
                Kamu tidak perlu langsung jadi ahli. Pilih topik, selesaikan stage, lalu bagikan
                perspektifmu dan lihat perkembanganmu di profil.
              </p>
              <AnimatedButton
                as="link"
                href="/belajar"
                background="#F472B6"
                shadowSize={8}
                className="mt-6"
              >
                Coba sekarang
              </AnimatedButton>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[24px] border-[4px] border-black bg-white p-6 transition hover:-translate-y-1"
                  style={{ boxShadow: offsetShadow(8) }}
                >
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD400] text-sm font-black"
                    style={{ border: "3px solid #000" }}
                  >
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-black">{step.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Footer ---------- */}
        <footer className="mx-6 mb-10 max-w-7xl pt-6 lg:mx-auto lg:px-0 lg:pt-8">
          <div
            className="flex flex-col gap-3 rounded-[24px] border-[4px] border-black bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between"
            style={{ boxShadow: offsetShadow(8) }}
          >
            <div className="font-black">© 2026 Unravel</div>
            <div className="flex gap-5 text-sm font-extrabold">
              <Link href="/belajar" className="hover:underline underline-offset-4">
                Belajar
              </Link>
              <Link href="/diskusi" className="hover:underline underline-offset-4">
                Diskusi
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
