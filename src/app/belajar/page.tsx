"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { apiFetch } from "@/utils/api";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Lock } from "lucide-react";
import Navbar from "@/components/Navbar";

interface DynamicTopic {
  id: string;
  title: string;
  icon: string;
  description: string;
  totalStages: number;
  gradient: string;
  borderColor: string;
  iconBg: string;
  textColor: string;
  shadowColor: string;
}

export default function TopikSelectionPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<DynamicTopic[]>([]);
  const [loading, setLoading] = useState(true);

  // Palet warna premium berurutan untuk kartu dinamis
  const colorPresets = [
    {
      gradient: "from-emerald-50 to-teal-50",
      borderColor: "hover:border-emerald-400",
      iconBg: "bg-emerald-500",
      textColor: "text-emerald-900",
      shadowColor: "hover:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]",
    },
    {
      gradient: "from-blue-50 to-blue-100",
      borderColor: "hover:border-blue-400",
      iconBg: "bg-blue-500",
      textColor: "text-blue-900",
      shadowColor: "hover:shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]",
    },
    {
      gradient: "from-purple-50 to-fuchsia-50",
      borderColor: "hover:border-purple-400",
      iconBg: "bg-purple-500",
      textColor: "text-purple-900",
      shadowColor: "hover:shadow-[4px_4px_0px_0px_rgba(168,85,247,1)]",
    },
    {
      gradient: "from-amber-50 to-orange-50",
      borderColor: "hover:border-amber-400",
      iconBg: "bg-amber-500",
      textColor: "text-amber-900",
      shadowColor: "hover:shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]",
    },
    {
      gradient: "from-rose-50 to-pink-50",
      borderColor: "hover:border-rose-400",
      iconBg: "bg-rose-500",
      textColor: "text-rose-900",
      shadowColor: "hover:shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]",
    },
    {
      gradient: "from-cyan-50 to-sky-50",
      borderColor: "hover:border-cyan-400",
      iconBg: "bg-cyan-500",
      textColor: "text-cyan-900",
      shadowColor: "hover:shadow-[4px_4px_0px_0px_rgba(6,182,212,1)]",
    },
  ];

  useEffect(() => {
    const loadTopicsAndCases = async () => {
      try {
        setLoading(true);
        // 1. Ambil semua topik dari BE
        const topicsRes = await apiFetch("/topics");
        const rawTopics = Array.isArray(topicsRes)
          ? topicsRes
          : topicsRes?.data || [];

        // 2. Ambil semua kasus dari BE untuk menghitung jumlah stage bertipe 'learning' per topik
        const casesRes = await apiFetch("/cases");
        const rawCases = Array.isArray(casesRes)
          ? casesRes
          : casesRes?.cases || casesRes?.data || [];
        const learningCases = rawCases.filter(
          (c: any) => c.type === "learning",
        );

        if (Array.isArray(rawTopics)) {
          const mapped = rawTopics.map((t: any, index: number) => {
            // Parse Opsi B (Format pipa: Nama|Icon|Deskripsi)
            const parts = (t.name || "").split("|");
            const title = parts[0] || "Topik Tanpa Nama";
            const icon = parts[1] || "📚";
            const description =
              parts[2] ||
              `Analisis problem solving dan bedah kasus kritis seputar tema ${title}.`;
            const id = title.toLowerCase().replace(/\s+/g, "-");

            // Cari jumlah kasus bertipe learning untuk topik ini
            const matchTopic = (caseTopics: any[]) => {
              if (!caseTopics || !Array.isArray(caseTopics)) return false;
              return caseTopics.some(
                (ct) =>
                  ct.id === t.id ||
                  ct.name?.split("|")[0].toLowerCase() === title.toLowerCase(),
              );
            };
            const topicCasesCount = learningCases.filter((c: any) =>
              matchTopic(c.topics),
            ).length;

            // Dapatkan warna preset berurutan berdasarkan index
            const color = colorPresets[index % colorPresets.length];

            return {
              id,
              title,
              icon,
              description,
              totalStages: topicCasesCount || 5, // Fallback default ke 5 stage (data mock) jika di DB belum ada
              ...color,
            };
          });

          setTopics(mapped);
        }
      } catch (err) {
        console.error("Gagal memuat topik dinamis:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTopicsAndCases();
  }, []);

  const handleSelectTema = (id: string) => {
    router.push(`/belajar/${id}`);
  };
  return (
    <div className="min-h-screen bg-neogrid text-black font-sans flex flex-col selection:bg-[#00BC7D] selection:text-white">
      <Navbar />
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-stretch">
          {/* SISI KIRI: RUANG FOKUS UTAMA UNTUK MOTION GRAPHICS */}
          <section className="md:col-span-5 flex flex-col justify-center items-center w-full">
            <div className="w-full md:h-full md:min-h-[650px] flex items-center justify-center">
              <div className="w-full max-w-[240px] md:max-w-[500px] aspect-[4/3]">
                <DotLottieReact
                  src="/aset_learning.json"
                  loop={true}
                  autoplay={true}
                  renderConfig={{
                    devicePixelRatio:
                      typeof window !== "undefined"
                        ? window.devicePixelRatio || 2
                        : 2,
                  }}
                />
              </div>
            </div>
          </section>

          {/* SISI KANAN: MENU SELECTION DENGAN INDIKATOR JALUR LINEAR */}
          <section className="md:col-span-7 flex flex-col justify-center space-y-6 relative">
            <div className="space-y-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight font-serif">
                Pilih Tema Utama Analisis
              </h1>
              <p className="text-xs font-semibold text-black text-slate-650 leading-relaxed max-w-xl font-mono">
                Tentukan tema masalah yang ingin kamu bedah. Setiap tema
                menyediakan jalur petualangan linear dengan studi kasus yang
                makin menantang di tiap levelnya!
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-h-[480px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white border-2 border-black rounded-3xl shadow-[4px_4px_0px_#000]">
                  <div className="w-6 h-6 border-3 border-[#00BC7D] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Memuat Tema Analisis...
                  </span>
                </div>
              ) : topics.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-400 font-semibold italic bg-white border-2 border-black rounded-3xl shadow-[4px_4px_0px_#000]">
                  Belum ada tema analisis terdaftar di database.
                </div>
              ) : (
                <>
                  {topics.map((tema) => (
                    <div
                      key={tema.id}
                      onClick={() => handleSelectTema(tema.id)}
                      className={`bg-white border-2 border-black rounded-2xl p-5 flex items-center justify-between transition-all duration-200 gap-4 min-h-[95px] cursor-pointer bg-gradient-to-br ${tema.gradient} shadow-[4px_4px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none shrink-0`}
                    >
                      {/* Deskripsi Ikon & Ringkasan Topik */}
                      <div className="flex gap-4 items-center flex-1">
                        <div
                          className={`text-xl ${tema.iconBg} w-11 h-11 rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000] transform -rotate-3 shrink-0 text-white`}
                        >
                          <DynamicIcon
                            emoji={tema.icon}
                            className="w-5 h-5 text-white"
                          />
                        </div>
                        <div>
                          <h3
                            className={`text-sm font-black tracking-tight font-serif ${tema.textColor}`}
                          >
                            {tema.title}
                          </h3>
                          <p className="text-[12px] font-semibold text-black text-slate-600 mt-0.5 leading-relaxed max-w-sm font-mono">
                            {tema.description}
                          </p>
                        </div>
                      </div>

                      {/* Badge Indikator Informasi Kasus */}
                      <div className="shrink-0 text-right min-w-[85px] font-sans">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="bg-white px-2 py-0.5 rounded-md border-2 border-black text-black shadow-[1.5px_1.5px_0px_#000] text-[9px] font-black uppercase tracking-wider">
                            {tema.totalStages} Kasus
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Kotak Locked (Future Updates) */}
                  <div className="bg-slate-50/50 border-2 border-dashed border-black rounded-2xl p-5 flex items-center justify-between gap-4 min-h-[95px] cursor-not-allowed opacity-80 shrink-0">
                    <div className="flex gap-4 items-center flex-1">
                      <div className="text-lg bg-slate-200 w-11 h-11 rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000] shrink-0 animate-pulse">
                        <Lock size={16} className="text-slate-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black tracking-tight font-serif text-slate-500">
                          Tema Baru (Segera Hadir)
                        </h3>
                        <p className="text-[11px] text-black font-medium text-slate-450 mt-0.5 leading-relaxed max-w-sm font-mono text-slate-450">
                          Petualangan dan studi kasus baru sedang dirancang oleh
                          tim analis.
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right min-w-[85px] font-sans">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md border-2 border-dashed border-slate-350 text-slate-500 text-[9px] font-black uppercase tracking-wider">
                          Locked
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
