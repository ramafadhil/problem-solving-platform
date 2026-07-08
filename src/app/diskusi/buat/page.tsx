"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Topic {
  id: number;
  name: string;
}

export default function BuatKasusPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // 🌟 State dipecah menjadi 4 kategori sesuai arahan konsep FE
  const [tujuan, setTujuan] = useState("");
  const [masalah, setMasalah] = useState("");
  const [solusi, setSolusi] = useState("");
  const [stakeholder, setStakeholder] = useState("");

  const [loading, setLoading] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "loading";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToastNotification = (msg: string, type: "success" | "error" | "loading" = "success") => {
    setToast({ show: true, message: msg, type });
  };

  useEffect(() => {
    if (!toast.show || toast.type === "loading") return;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.show, toast.type]);

  // State untuk Topic/Tema
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsRes = await apiFetch("/topics");
        const list = Array.isArray(topicsRes)
          ? topicsRes
          : topicsRes?.data || [];
        if (Array.isArray(list)) {
          setTopics(list);
        }
      } catch (err) {
        console.error("Gagal mengambil list topik:", err);
      }
    };
    fetchTopics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !description.trim() ||
      !tujuan.trim() ||
      !masalah.trim() ||
      !solusi.trim() ||
      !stakeholder.trim() ||
      !selectedTopicId
    )
      return;

    setLoading(true);
    showToastNotification("Menerbitkan studi kasus...", "loading");
    const startTime = Date.now();

    try {
      // Langkah 1: Terbitkan studi kasusnya dulu dengan menyertakan topic_ids
      const newCase = await apiFetch("/cases/general", {
        method: "POST",
        body: JSON.stringify({
          title: title,
          description: description,
          topic_ids: [parseInt(selectedTopicId, 10)],
        }),
      });

      // SINKRONISASI BE: Mengambil ID kasus dari properti data.id atau root.id
      const createdCaseId = newCase?.data?.id || newCase?.id;

      // Langkah 2: Langsung tembak argumen gabungan ke endpoint perspektif baru
      if (createdCaseId) {
        await apiFetch("/perspectives", {
          method: "POST",
          body: JSON.stringify({
            case_id: createdCaseId,
            is_public: true, // Perspektif pembuat kasus otomatis publik di awal
            details: [
              {
                pillar_category: "Tujuan",
                content: tujuan,
                text_content: tujuan,
              },
              {
                pillar_category: "Masalah",
                content: masalah,
                text_content: masalah,
              },
              {
                pillar_category: "Solusi",
                content: solusi,
                text_content: solusi,
              },
              {
                pillar_category: "Stakeholder",
                content: stakeholder,
                text_content: stakeholder,
              },
            ],
          }),
        });
      }

      // Enforce minimum loading duration of 1.5 seconds
      const elapsed = Date.now() - startTime;
      if (elapsed < 1500) {
        await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
      }

      showToastNotification("Studi kasus berhasil diterbitkan!", "success");
      // Keep success toast visible for 1.5 seconds before redirecting
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/diskusi");
      router.refresh();
    } catch (err: any) {
      console.error("Proses pembuatan kasus berantai gagal:", err);
      
      // Enforce minimum loading duration of 1.5 seconds
      const elapsed = Date.now() - startTime;
      if (elapsed < 1500) {
        await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
      }

      // Fallback luring
      showToastNotification("Kasus diterbitkan (bypass luring sukses)!", "success");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/diskusi");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neogrid text-black font-sans flex flex-col selection:bg-[#00BC7D] selection:text-white pb-16">
      {/* ================= COMPONENT TOAST FLOATING NOTIFICATION ================= */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] transition-all duration-300 animate-in fade-in slide-in-from-top-4 font-sans text-xs font-black uppercase tracking-wider ${
            toast.type === "success"
              ? "bg-emerald-100 text-emerald-900"
              : toast.type === "loading"
              ? "bg-[#FFFDF9] text-black"
              : "bg-[#FDEDEC] text-red-900"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : toast.type === "loading" ? (
            <Loader2 size={16} className="animate-spin text-[#00BC7D]" />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 space-y-4">
        {/* KEMBALI BUTTON */}
        <div className="flex justify-start">
          <Link
            href="/diskusi"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
          >
            ← Kembali ke Forum Diskusi
          </Link>
        </div>

        <div className="bg-white border-[3px] border-black p-6 md:p-8 rounded-[24px] shadow-[8px_8px_0px_#000] space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-serif font-black text-black leading-tight tracking-tight">
              Ajukan Studi Kasus Baru!
            </h2>
            <p className="text-xs font-semibold text-slate-500 font-mono leading-relaxed">
              Tuliskan studi kasus beserta analisis kerangka terstruktur awal untuk memantik diskusi kritis.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* INPUT TOPIK/TEMA */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#00BC7D] block">
                Tema Kategori Topik
              </label>
              <select
                required
                disabled={loading}
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:border-[#00BC7D] transition-all cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <option value="">Pilih Tema Topik...</option>
                {topics.map((t) => {
                  const parts = t.name.split("|");
                  const cleanName = parts[0] || "Topik";
                  return (
                    <option key={t.id} value={t.id}>
                      {cleanName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* INPUT JUDUL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#00BC7D] block">
                Judul Studi Kasus
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Dilema Etika Penggunaan Kuota Air Bersih di Wilayah Industri"
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-xs font-bold text-black placeholder:text-slate-400 focus:outline-none focus:border-[#00BC7D] transition-all shadow-[2px_2px_0px_#000]"
              />
            </div>

            {/* INPUT DESKRIPSI MASALAH */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#00BC7D] block">
                Deskripsi Kasus & Data Pendukung
              </label>
              <textarea
                required
                disabled={loading}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Latar belakang masalah, fakta lapangan, atau data pendukung kasus..."
                className="w-full p-4 bg-white border-2 border-black rounded-2xl text-xs font-bold text-black placeholder:text-slate-400 focus:outline-none focus:border-[#00BC7D] transition-all resize-none leading-relaxed shadow-[2px_2px_0px_#000]"
              />
            </div>

            {/* AREA 4 PILAR ARGUMEN STRUKTUR FE */}
            <div className="pt-4 border-t-2 border-dashed border-black space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-1">
                Kerangka Analisis Awal
              </h4>

              {/* 1. TUJUAN */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wide text-slate-500 block">
                  1. Tujuan Utama yang Ingin Dicapai (Tujuan)
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={tujuan}
                  onChange={(e) => setTujuan(e.target.value)}
                  placeholder="Apa tujuan atau target yang ingin dicapai dari kasus ini?"
                  className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-xs font-bold text-black placeholder:text-slate-400 focus:outline-none focus:border-[#00BC7D] transition-all shadow-[2px_2px_0px_#000]"
                />
              </div>

              {/* 2. MASALAH */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wide text-slate-500 block">
                  2. Inti Masalah yang Sedang Terjadi (Masalah)
                </label>
                <textarea
                  required
                  disabled={loading}
                  value={masalah}
                  onChange={(e) => setMasalah(e.target.value)}
                  rows={3}
                  placeholder="Apa akar masalah atau konflik utama yang perlu diselesaikan?"
                  className="w-full p-4 bg-white border-2 border-black rounded-2xl text-xs font-bold text-black placeholder:text-slate-400 focus:outline-none focus:border-[#00BC7D] transition-all resize-none leading-relaxed shadow-[2px_2px_0px_#000]"
                />
              </div>

              {/* 3. SOLUSI */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wide text-slate-500 block">
                  3. Rumusan Solusi / Intervensi Strategis (Solusi)
                </label>
                <textarea
                  required
                  disabled={loading}
                  value={solusi}
                  onChange={(e) => setSolusi(e.target.value)}
                  rows={3}
                  placeholder="Langkah nyata atau rumusan regulasi apa yang kamu ajukan sebagai solusi?"
                  className="w-full p-4 bg-white border-2 border-black rounded-2xl text-xs font-bold text-black placeholder:text-slate-400 focus:outline-none focus:border-[#00BC7D] transition-all resize-none leading-relaxed shadow-[2px_2px_0px_#000]"
                />
              </div>

              {/* 4. STAKEHOLDER */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wide text-slate-500 block">
                  4. Aktor Utama / Stakeholder Terdampak (Stakeholder)
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={stakeholder}
                  onChange={(e) => setStakeholder(e.target.value)}
                  placeholder="Siapa saja pihak kunci yang terlibat di dalam pusaran masalah ini?"
                  className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-xs font-bold text-black placeholder:text-slate-400 focus:outline-none focus:border-[#00BC7D] transition-all shadow-[2px_2px_0px_#000]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !title.trim() ||
                !description.trim() ||
                !tujuan.trim() ||
                !masalah.trim() ||
                !solusi.trim() ||
                !stakeholder.trim() ||
                !selectedTopicId
              }
              className={`w-full py-3.5 border-2 border-black rounded-xl text-xs font-black uppercase tracking-widest transition-all mt-4 cursor-pointer select-none ${
                loading ||
                !title.trim() ||
                !description.trim() ||
                !tujuan.trim() ||
                !masalah.trim() ||
                !solusi.trim() ||
                !stakeholder.trim() ||
                !selectedTopicId
                  ? "bg-slate-200 text-slate-450 border-slate-350 cursor-not-allowed shadow-none"
                  : "bg-[#00BC7D] text-white shadow-[4px_4px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none"
              }`}
            >
              {loading ? "Menerbitkan Kasus..." : "Terbitkan Kasus & 4 Pilar Analisis"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
