"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { apiFetch } from "@/utils/api";
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
      gradient: "from-blue-50 to-indigo-50",
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
        const rawTopics = Array.isArray(topicsRes) ? topicsRes : (topicsRes?.data || []);
        
        // 2. Ambil semua kasus dari BE untuk menghitung jumlah stage bertipe 'learning' per topik
        const casesRes = await apiFetch("/cases");
        const rawCases = Array.isArray(casesRes) ? casesRes : (casesRes?.cases || casesRes?.data || []);
        const learningCases = rawCases.filter((c: any) => c.type === "learning");

        if (Array.isArray(rawTopics)) {
          const mapped = rawTopics.map((t: any, index: number) => {
            // Parse Opsi B (Format pipa: Nama|Icon|Deskripsi)
            const parts = (t.name || "").split("|");
            const title = parts[0] || "Topik Tanpa Nama";
            const icon = parts[1] || "📚";
            const description = parts[2] || `Analisis problem solving dan bedah kasus kritis seputar tema ${title}.`;
            const id = title.toLowerCase().replace(/\s+/g, "-");

            // Cari jumlah kasus bertipe learning untuk topik ini
            const matchTopic = (caseTopics: any[]) => {
              if (!caseTopics || !Array.isArray(caseTopics)) return false;
              return caseTopics.some(ct => (ct.id === t.id) || (ct.name?.split("|")[0].toLowerCase() === title.toLowerCase()));
            };
            const topicCasesCount = learningCases.filter((c: any) => matchTopic(c.topics)).length;

            // Dapatkan warna preset berurutan berdasarkan index
            const color = colorPresets[index % colorPresets.length];

            return {
              id,
              title,
              icon,
              description,
              totalStages: topicCasesCount || 5, // Fallback default ke 5 stage (data mock) jika di DB belum ada
              ...color
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
    <div
      className="min-h-screen text-black font-sans flex flex-col selection:bg-indigo-500 selection:text-white"
      style={{
        backgroundColor: "#FFD400",
        backgroundImage:
          "linear-gradient(#00000010 1px, transparent 1px), linear-gradient(90deg, #00000010 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }}
    >
      <Navbar variant="app" logoAccent="Learn" />

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* SISI KIRI: Lottie + headline */}
          <section className="lg:col-span-5 flex flex-col items-center lg:items-start gap-6">
            <div className="w-full max-w-[420px] aspect-square">
              <DotLottieReact src="/aset_learning.json" loop autoplay />
            </div>
            <div className="text-center lg:text-left space-y-3">
              <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight">
                Pilih Tema,<br />Mulai Analisis.
              </h1>
              <p className="text-sm font-semibold text-black/60 leading-relaxed max-w-xs">
                Setiap tema punya jalur linear — makin dalam makin menantang.
              </p>
            </div>
          </section>

          {/* SISI KANAN: daftar topik */}
          <section className="lg:col-span-7 flex flex-col gap-4">

            {/* Label section */}
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-xl"
                style={{ background: "#fff", border: "3px solid #000", boxShadow: "3px 3px 0 #000" }}
              >
                🗺️ Pilih Tema
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
              {loading ? (
                <div
                  className="py-16 flex flex-col items-center justify-center space-y-3 rounded-2xl"
                  style={{ background: "#fff", border: "3px solid #000", boxShadow: "4px 4px 0 #000" }}
                >
                  <div className="w-6 h-6 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black text-black/50 uppercase tracking-widest">Memuat Tema...</span>
                </div>
              ) : topics.length === 0 ? (
                <div
                  className="py-16 text-center text-xs font-bold text-black/40 rounded-2xl"
                  style={{ background: "#fff", border: "3px solid #000", boxShadow: "4px 4px 0 #000" }}
                >
                  Belum ada tema terdaftar di database.
                </div>
              ) : (
                <>
                  {topics.map((tema) => (
                    <div
                      key={tema.id}
                      onClick={() => handleSelectTema(tema.id)}
                      className="group bg-white rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                      style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000" }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = "5px 5px 0 #000")}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = "4px 4px 0 #000")}
                    >
                      <div className="flex gap-4 items-center flex-1 min-w-0">
                        <div
                          className={`text-xl ${tema.iconBg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}
                          style={{ border: "3px solid #000", boxShadow: "3px 3px 0 #000" }}
                        >
                          {tema.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black tracking-tight text-black truncate">
                            {tema.title}
                          </h3>
                          <p className="text-[11px] font-medium text-black/50 mt-0.5 leading-relaxed line-clamp-2">
                            {tema.description}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span
                          className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                          style={{ background: "#FFD400", border: "2px solid #000" }}
                        >
                          {tema.totalStages} Kasus
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Locked */}
                  <div
                    className="rounded-2xl p-4 flex items-center justify-between gap-4 opacity-50 cursor-not-allowed"
                    style={{ background: "#f1f5f9", border: "3px dashed #94a3b8" }}
                  >
                    <div className="flex gap-4 items-center flex-1">
                      <div className="text-xl bg-slate-200 w-12 h-12 rounded-xl flex items-center justify-center border-2 border-slate-300 shrink-0">
                        🔒
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-400">Tema Baru (Segera Hadir)</h3>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">Sedang dirancang oleh tim analis.</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-400 border border-slate-300">
                      Locked
                    </span>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
