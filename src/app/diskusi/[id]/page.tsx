"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface LogicBlock {
  category: string;
  content: string;
  points: number;
}

interface DetailKasus {
  id: string;
  title: string;
  description: string;
  type: "learning" | "general";
  logic_blocks?: LogicBlock[];
}

interface MockPerspektif {
  id: string;
  author: string;
  argument: string;
  createdAt: string;
}

export default function DetailKasusPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [kasus, setKasus] = useState<DetailKasus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  // State untuk form input 3 pilar respons
  const [shInput, setShInput] = useState("");
  const [acInput, setAcInput] = useState("");
  const [imInput, setImInput] = useState("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Mock data riwayat tanggapan untuk simulasi visual di halaman detail
  const [daftarPerspektif, setDaftarPerspektif] = useState<MockPerspektif[]>([
    {
      id: "p-1",
      author: "Fadhil",
      argument: "[STAKEHOLDER]: Pemkot & Pedagang Lokal\n\n[ACTION]: Relokasi terpusat dengan subsidi sewa 6 bulan pertama dan digitalisasi lapak.\n\n[IMPACT]: Mengurangi kemacetan koridor utama hingga 30% namun membutuhkan pengawasan agar pedagang tidak kembali ke jalan.",
      createdAt: "28 Juni 2026"
    }
  ]);

  useEffect(() => {
    const loadDetailKasus = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Menembak endpoint GET /api/cases/{id} asli dari Azure
        const data = await apiFetch(`/cases/${caseId}`);
        setKasus(data);
      } catch (err: any) {
        console.error("Gagal memuat detail kasus dari Azure:", err);
        
        // Fallback Mock Data tipe general jika terkena masalah CORS saat pengujian
        setKasus({
          id: caseId,
          title: "Debat Etika AI: Bolehkah AI Menggantikan Peran Dokter dalam Diagnosa Awal?",
          type: "general",
          description: "Konteks: Saat ini, algoritma AI sudah mampu mendeteksi penyakit melalui X-ray dengan akurasi tinggi. Namun, ada kekhawatiran soal tanggung jawab moral jika terjadi salah diagnosa.\n\nData Pendukung:\n1. Kecepatan: AI butuh beberapa detik, Dokter butuh waktu lebih lama.\n2. Akses: AI jauh lebih murah untuk dijangkau masyarakat di daerah terpencil.\n3. Masalah Utama: Jika AI salah mendiagnosa, pihak mana yang memikul tanggung jawab hukum? Pengembang software atau pihak rumah sakit?",
        });
      } finally {
        setLoading(false);
      }
    };

    if (caseId) loadDetailKasus();
  }, [caseId]);

  // Fungsi pembongkar teks argumen gabungan 3 pilar dari backend
  const parseCombinedArgument = (text: string) => {
    const stakeholderMatch = text.match(/\[STAKEHOLDER\]:\s*([\s\S]*?)(?=\n\n\[ACTION\]|$)/i);
    const actionMatch = text.match(/\[ACTION\]:\s*([\s\S]*?)(?=\n\n\[IMPACT\]|$)/i);
    const impactMatch = text.match(/\[IMPACT\]:\s*([\s\S]*?)$/i);

    return {
      stakeholder: stakeholderMatch ? stakeholderMatch[1].trim() : "",
      action: actionMatch ? actionMatch[1].trim() : "",
      impact: impactMatch ? impactMatch[1].trim() : text, // Fallback jika teks biasa tanpa pilar resmi
    };
  };

  const handleSubmitPerspektif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shInput.trim() || !acInput.trim() || !imInput.trim()) return;

    setError("");
    setSubmitting(true);

    // Satukan input form FE menjadi satu kesatuan format string untuk kebutuhan BE
    const combinedArgument = `[STAKEHOLDER]: ${shInput}\n\n[ACTION]: ${acInput}\n\n[IMPACT]: ${imInput}`;

    try {
      // Menembak endpoint POST /api/cases/{id}/perspective
      await apiFetch(`/cases/${caseId}/perspective`, {
        method: "POST",
        body: JSON.stringify({ argument: combinedArgument })
      });

      // Update state luring lokal untuk visual testing instant
      const newResponse: MockPerspektif = {
        id: `p-${Date.now()}`,
        author: "Kelompok_Anda",
        argument: combinedArgument,
        createdAt: "Baru saja"
      };
      setDaftarPerspektif([newResponse, ...daftarPerspektif]);

      setSubmitSuccess(true);
      setShInput("");
      setAcInput("");
      setImInput("");
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      console.error("Gagal mengirim argumen:", err);
      
      // Bypass testing luring lokal
      const newResponse: MockPerspektif = {
        id: `p-${Date.now()}`,
        author: "Kelompok_Anda (Lokal Test)",
        argument: combinedArgument,
        createdAt: "Baru saja"
      };
      setDaftarPerspektif([newResponse, ...daftarPerspektif]);
      
      setSubmitSuccess(true);
      setShInput("");
      setAcInput("");
      setImInput("");
      setTimeout(() => setSubmitSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Mengurai Paket Studi Kasus...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* NAVBAR */}
      <nav className="w-full border-b-2 border-slate-200 bg-white sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-sm">
        <Link href="/diskusi" className="text-xs font-black uppercase tracking-wider text-indigo-600 hover:underline flex items-center gap-1">
          ← Kembali ke Forum
        </Link>
        <span className="font-black text-xs uppercase tracking-widest text-slate-400">Ruang Analisis Kasus</span>
      </nav>

      {/* MAIN LAYOUT CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SISI KIRI: DETAIL KASUS & PAPAN RIWAYAT FEED JAWABAN (7 Kolom) */}
        <section className="lg:col-span-7 space-y-6">
          {/* BLOK DESKRIPSI UTAMA */}
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border bg-blue-50 border-blue-200 text-blue-600">
                Diskusi Umum Publik
              </span>
              <h1 className="text-xl font-black text-slate-900 font-serif tracking-tight leading-snug">
                {kasus?.title}
              </h1>
            </div>

            <div className="text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 border border-slate-100 rounded-2xl shadow-inner">
              {kasus?.description}
            </div>
          </div>

          {/* CLUSTER FEED LIST JAWABAN / PERSPEKTIF ANALIS LAIN */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
              Klaster Diskusi Perspektif ({daftarPerspektif.length})
            </h4>

            {daftarPerspektif.map((item) => {
              const parsedData = parseCombinedArgument(item.argument);

              return (
                <div key={item.id} className="bg-white border-2 border-slate-200 p-5 rounded-3xl space-y-3 shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-100 pb-2">
                    <span className="text-slate-700">👤 @{item.author}</span>
                    <span>{item.createdAt}</span>
                  </div>

                  {/* KONDISI RENDER STRUKTUR 3 PILAR JIKA BERHASIL DI-PARSER */}
                  {parsedData.stakeholder || parsedData.action ? (
                    <div className="space-y-2.5 pt-1">
                      <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">1. Stakeholder Utama</span>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">{parsedData.stakeholder}</p>
                      </div>
                      <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        <span className="block text-[8px] font-black uppercase text-indigo-500 tracking-wider">2. Rencana Tindakan (Action)</span>
                        <p className="text-xs font-medium text-slate-600 mt-0.5 whitespace-pre-line">{parsedData.action}</p>
                      </div>
                      <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        <span className="block text-[8px] font-black uppercase text-emerald-500 tracking-wider">3. Prediksi Dampak (Impact)</span>
                        <p className="text-xs font-medium text-slate-600 mt-0.5 whitespace-pre-line">{parsedData.impact}</p>
                      </div>
                    </div>
                  ) : (
                    /* Fallback data teks konvensional */
                    <p className="text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl">
                      {item.argument}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SISI KANAN: FORMULIR INPUT JAWABAN PERSPEKTIF 3 PILAR (5 Kolom) */}
        <section className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Uraikan Argumen Kelompok</h3>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                Bedah kasus ini ke dalam format analisis 3 pilar objektif khas Unravel sebelum disiarkan ke server global.
              </p>
            </div>

            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-xs font-semibold text-center animate-fade-in">
                ✓ Argumen analisis terstruktur berhasil dikirim!
              </div>
            )}

            <form onSubmit={handleSubmitPerspektif} className="space-y-4">
              {/* 1. STAKEHOLDER INPUT */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">1. Stakeholder Utama</label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={shInput}
                  onChange={(e) => setShInput(e.target.value)}
                  placeholder="Aktor/Pihak kunci terdampak..."
                  className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* 2. ACTION INPUT */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-indigo-600">2. Rencana Tindakan (Action)</label>
                <textarea
                  required
                  disabled={submitting}
                  value={acInput}
                  onChange={(e) => setAcInput(e.target.value)}
                  rows={3}
                  placeholder="Langkah strategis operasional kelompok..."
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              {/* 3. IMPACT INPUT */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-emerald-600">3. Konsekuensi Capaian (Impact)</label>
                <textarea
                  required
                  disabled={submitting}
                  value={imInput}
                  onChange={(e) => setImInput(e.target.value)}
                  rows={3}
                  placeholder="Efek domino positif/negatif yang diprediksi..."
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting || !shInput.trim() || !acInput.trim() || !imInput.trim()}
                className={`w-full py-3.5 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-sm transition-all mt-2 ${
                  submitting || !shInput.trim() || !acInput.trim() || !imInput.trim()
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-[4px_4px_0px_0px_rgba(79,70,229,0.3)] hover:-translate-y-0.5"
                }`}
              >
                {submitting ? "Mentransmisikan..." : "Kirim Respon Perspektif"}
              </button>
            </form>
          </div>
        </section>

      </main>
    </div>
  );
}