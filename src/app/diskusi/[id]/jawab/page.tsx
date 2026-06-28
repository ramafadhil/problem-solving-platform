"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DetailKasus {
  id: string;
  title: string;
  category: string;
  description: string;
  author: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InputJawabanPage({ params }: PageProps) {
  const router = useRouter();

  const resolvedParams = use(params);
  const kasusId = resolvedParams.id;

  const [kasus, setKasus] = useState<DetailKasus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State untuk 5 formulir solusi masalah sesuai matriks Mode Belajar
  const [solusiSteps, setSolusiSteps] = useState({
    masalahUtama: "",
    penyebabDasar: "",
    stakeholderTerdampak: "",
    tujuanSolusi: "",
    rekomendasiSolusi: "",
  });
  const [isPublic, setIsPublic] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetailKasus = async () => {
      try {
        setLoading(true);

        const mockDatabase: Record<string, DetailKasus> = {
          "kasus-ciliwung-01": {
            id: "kasus-ciliwung-01",
            title: "Ancaman Mikroplastik di Aliran Sungai Ciliwung",
            category: "Lingkungan",
            description:
              "Gumpalan masalah makro industri hulu dan hilir limbah domestik menyebabkan ekosistem air kritis di sepanjang bantaran sungai.",
            author: "Fadhil",
          },
          "kasus-rth-urban-02": {
            id: "kasus-rth-urban-02",
            title: "Dilema Ruang Terbuka Hijau vs Koridor Transportasi Urban",
            category: "Tata Kota",
            description:
              "Eksplorasi pemecahan konflik tata guna lahan publik untuk pembangunan jalur transportasi massal vs paru-paru kota satelit.",
            author: "Radit",
          },
          "kasus-politik-03": {
            id: "kasus-politik-03",
            title: "Efektivitas Regulasi Batas Usia Minimum Pejabat Publik",
            category: "Politik",
            description:
              "Tantangan analisis kritis berskala tinggi seputar perumusan regulasi konstitusi dan dampaknya pada regenerasi demokrasi.",
            author: "Cipa",
          },
        };

        const foundCase = mockDatabase[kasusId] || {
          id: kasusId,
          title: "Studi Kasus Kustom Analisis",
          category: "Umum",
          description:
            "Deskripsi studi kasus komunitas eksternal terenkripsi di dalam database.",
          author: "AnalisAnonim",
        };

        setTimeout(() => {
          setKasus(foundCase);
          setLoading(false);
        }, 400);
      } catch (error) {
        console.error("Gagal memuat detail kasus:", error);
        setLoading(false);
      }
    };

    fetchDetailKasus();
  }, [kasusId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSolusiSteps({ ...solusiSteps, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Payload terstruktur rapi membawa 5 data inti untuk BE Golang
    const payload = {
      caseId: kasusId,
      answers: [
        solusiSteps.masalahUtama,
        solusiSteps.penyebabDasar,
        solusiSteps.stakeholderTerdampak,
        solusiSteps.tujuanSolusi,
        solusiSteps.rekomendasiSolusi,
      ],
      isPublic: isPublic,
    };

    console.log("Mengirim 5 pilar analisis ke BE Golang:", payload);
    router.push(`/diskusi/${kasusId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Memuat Informasi Kasus...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 1. NAVBAR HEADER */}
      <nav className="w-full border-b-2 border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-black text-lg tracking-tight text-slate-900">
            Unravel<span className="text-indigo-600"> Discuss</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/diskusi"
            className="px-4 py-2 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
          >
            Daftar Kasus
          </Link>
        </div>
      </nav>

      {/* 2. LAYOUT FORM UTAMA */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* KANAL KIRI: RUANG DETAIL MATERI PROBLEM */}
        <section className="lg:col-span-4 bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block">
              Kasus Utama yang Diurai
            </span>
            <h3 className="text-base font-black text-slate-900 tracking-tight mt-1.5 leading-snug">
              {kasus?.title}
            </h3>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">
              Pembuat: @{kasus?.author} • Kategori: {kasus?.category}
            </p>
            <p className="text-[11px] font-medium text-slate-400 leading-relaxed mt-3 pt-3 border-t border-slate-50">
              {kasus?.description}
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] font-medium text-amber-800 leading-relaxed">
            Gembok Akses: Sesuai sistem Unravel, Anda diwajibkan untuk mengisi
            draf solusi analisis sendiri terlebih dahulu sebelum gembok forum
            ulasan publik terbuka.
          </div>
        </section>

        {/* KANAL KANAN: FORM ISIAN 5 PILAR (Sesuai mode belajar & gambar bimbingan) */}
        <form
          onSubmit={handleFormSubmit}
          className="lg:col-span-8 bg-white border-2 border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Formulir Solusi Masalah
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Tuliskan rancangan pemikiran taktis kelompok Anda ke dalam klaster
              blok di bawah ini.
            </p>
          </div>

          {/* INPUT FIELDS VERTICAL STACK (5 PILAR UTAMA) */}
          <div className="space-y-5">
            {/* 1. MASALAH UTAMA */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Langkah 1: Masalah Utama
              </label>
              <textarea
                name="masalahUtama"
                required
                rows={3}
                value={solusiSteps.masalahUtama}
                onChange={handleInputChange}
                placeholder="Definisikan inti gumpalan masalah makro yang paling krusial dari kasus ini..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* 2. PENYEBAB DASAR */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Langkah 2: Penyebab Dasar
              </label>
              <textarea
                name="penyebabDasar"
                required
                rows={3}
                value={solusiSteps.penyebabDasar}
                onChange={handleInputChange}
                placeholder="Uraikan akar penyebab atau pemicu fundamental (hulu/kebijakan/perilaku) yang mendasari masalah..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* 3. STAKEHOLDER TERDAMPAK */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Langkah 3: Stakeholder Terdampak
              </label>
              <textarea
                name="stakeholderTerdampak"
                required
                rows={3}
                value={solusiSteps.stakeholderTerdampak}
                onChange={handleInputChange}
                placeholder="Sebutkan siapa saja pihak, komunitas, ekosistem, atau lembaga yang merugi akibat masalah ini..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* 4. TUJUAN SOLUSI */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Langkah 4: Tujuan Solusi
              </label>
              <textarea
                name="tujuanSolusi"
                required
                rows={3}
                value={solusiSteps.tujuanSolusi}
                onChange={handleInputChange}
                placeholder="Target atau kondisi ideal jangka pendek/panjang yang ingin dicapai dari pemecahan kasus..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* 5. REKOMENDASI SOLUSI */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Langkah 5: Rekomendasi Solusi
              </label>
              <textarea
                name="rekomendasiSolusi"
                required
                rows={3}
                value={solusiSteps.rekomendasiSolusi}
                onChange={handleInputChange}
                placeholder="Rancangan solusi taktis, regulasi baru, substitusi material, atau eksekusi riil yang Anda tawarkan..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          {/* BARIS PILIHAN PRIVASI */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-800 tracking-tight">
                Visibilitas Lembar Jawaban
              </h4>
              <p className="text-[10px] font-medium text-slate-400 leading-normal">
                Pilih Public agar jawaban Anda masuk ke forum diskusi komunitas,
                atau Private untuk dokumentasi internal kelompok.
              </p>
            </div>

            <div className="flex bg-white border border-slate-200 p-1 rounded-xl text-[10px] font-black uppercase tracking-wider select-none shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`px-3 py-1.5 rounded-lg transition-all ${isPublic ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`px-3 py-1.5 rounded-lg transition-all ${!isPublic ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                Private
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON ACTIONS */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(79,70,229,0.3)]"
            >
              Kirim Jawaban & Buka Forum
            </button>
          </div>
        </form>
      </main>

      {/* 3. FOOTER SECTION */}
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
          <div className="flex justify-center md:justify-end gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <Link
              href="/belajar"
              className="hover:text-white transition-colors"
            >
              Belajar
            </Link>
            <Link
              href="/diskusi"
              className="hover:text-white transition-colors"
            >
              Diskusi
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              Fitur
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
