"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function TopikSelectionPage() {
  const router = useRouter();

  // Matriks Data Induk Tema Utama Modul Pemecahan Masalah
  const temaList = [
    {
      id: "lingkungan",
      title: "Lingkungan Hidup",
      // icon: "🌱",
      description:
        "Analisis problem solving seputar krisis ekosistem, pencemaran wilayah, hingga manajemen limbah industri makro.",
      totalStages: 5,
      gradient: "from-emerald-50 to-teal-50",
      borderColor: "hover:border-emerald-400",
      iconBg: "bg-emerald-500",
      textColor: "text-emerald-900",
      shadowColor: "hover:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]",
    },
    {
      id: "sosial-tata-kota",
      title: "Sosial & Tata Kota",
      // icon: "🏙️",
      description:
        "Eksplorasi pemecahan konflik lahan publik, dinamika interaksi komunal, dan problem populasi urban.",
      totalStages: 5,
      gradient: "from-blue-50 to-indigo-50",
      borderColor: "hover:border-blue-400",
      iconBg: "bg-blue-500",
      textColor: "text-blue-900",
      shadowColor: "hover:shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]",
    },
    {
      id: "politik",
      title: "Tema Politik & Kebijakan",
      // icon: "⚖️",
      description:
        "Tantangan analisis kritis berskala tinggi seperti isu politik dinasti hingga perumusan regulasi pemerintahan.",
      totalStages: 5,
      gradient: "from-purple-50 to-fuchsia-50",
      borderColor: "hover:border-purple-400",
      iconBg: "bg-purple-500",
      textColor: "text-purple-900",
      shadowColor: "hover:shadow-[4px_4px_0px_0px_rgba(168,85,247,1)]",
    },
    {
      id: "future-topic",
      title: "Topik Baru (Future Updates)",
      // icon: "⚙️",
      description:
        "Materi tema analisis tambahan akan segera dirilis pada pembaruan sistem berikutnya untuk memperluas ruang lingkup.",
      totalStages: 0,
      isFutureUpdate: true,
      gradient: "from-slate-50 to-slate-100",
      borderColor: "border-slate-200",
      iconBg: "bg-slate-400",
      textColor: "text-slate-400",
      shadowColor: "",
    },
  ];

  const handleSelectTema = (id: string, isFuture?: boolean) => {
    if (isFuture) return;
    router.push(`/belajar/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-6 lg:p-12 relative">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        {/* SISI KIRI: RUANG FOKUS UTAMA UNTUK MOTION GRAPHICS (AUTOPLAY & LOOP) */}
        <section className="lg:col-span-5 flex flex-col justify-center items-center w-full">
          <div className="w-full h-full min-h-[450px] flex items-center justify-center">
            {/* Player Lottie Vektor Terisolasi */}
            <div className="w-full max-w-[320px] aspect-square">
              <DotLottieReact
                src="/mascot-animation.json"
                loop={true}
                autoplay={true}
              />
            </div>
          </div>
        </section>

        {/* SISI KANAN: MENU SELECTION DENGAN INDIKATOR JALUR LINEAR */}
        <section className="lg:col-span-7 flex flex-col justify-center space-y-6 relative">
          {/* TOMBOL KEMBALI (Back Button Modern & Playful) */}
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 font-sans rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm transition-all hover:-translate-y-0.5"
            >
              Kembali
            </button>
          </div>

          <div className="space-y-3 mb-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight font-serif">
              Pilih Tema Utama Analisis
            </h1>
            <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-xl font-sans">
              Tentukan payung masalah yang ingin kamu bedah. Setiap tema
              menyediakan jalur petualangan linear dengan studi kasus yang makin
              menantang di tiap levelnya!
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {temaList.map((tema) => (
              <div
                key={tema.id}
                onClick={() => handleSelectTema(tema.id, tema.isFutureUpdate)}
                className={`bg-white border-2 rounded-2xl p-5 flex items-center justify-between transition-all duration-200 gap-4 min-h-[95px] ${
                  tema.isFutureUpdate
                    ? "opacity-50 cursor-not-allowed border-dashed bg-slate-50"
                    : `border-slate-200 cursor-pointer bg-gradient-to-br ${tema.gradient} ${tema.borderColor} ${tema.shadowColor} hover:-translate-y-0.5`
                }`}
              >
                {/* Deskripsi Ikon & Ringkasan Topik */}
                <div className="flex gap-4 items-center flex-1">
                  <div
                    className={`text-xl ${tema.iconBg} w-11 h-11 rounded-xl flex items-center justify-center border-2 border-white shadow-md transform -rotate-3 shrink-0`}
                  >
                    {tema.icon}
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-black tracking-tight font-serif ${tema.textColor}`}
                    >
                      {tema.title}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed max-w-sm font-sans">
                      {tema.description}
                    </p>
                  </div>
                </div>

                {/* Badge Indikator Informasi Kasus */}
                <div className="shrink-0 text-right min-w-[85px] font-sans">
                  {tema.isFutureUpdate ? (
                    <span className="text-[9px] font-black text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded border border-slate-300/40 uppercase tracking-wider">
                      Soon
                    </span>
                  ) : (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-indigo-600 shadow-sm text-[9px] font-black uppercase tracking-wider">
                        {tema.totalStages} Kasus
                      </span>
                      {/* <span className="text-[8px] font-bold text-slate-400 tracking-tight">Jalur Linear</span> */}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
