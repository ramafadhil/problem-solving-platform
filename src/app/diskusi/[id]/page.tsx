"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { CheckCircle2 } from "lucide-react";

interface LogicBlock {
  category?: string;
  pillar_category?: string;
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
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(true);

  // Fungsi pembongkar teks argumen gabungan 3 pilar dari backend
  const parseCombinedArgument = (text: string) => {
    const stakeholderMatch = text.match(
      /\[STAKEHOLDER\]:\s*([\s\S]*?)(?=\n\n\[ACTION\]|$)/i,
    );
    const actionMatch = text.match(
      /\[ACTION\]:\s*([\s\S]*?)(?=\n\n\[IMPACT\]|$)/i,
    );
    const impactMatch = text.match(/\[IMPACT\]:\s*([\s\S]*?)$/i);

    return {
      stakeholder: stakeholderMatch ? stakeholderMatch[1].trim() : "",
      action: actionMatch ? actionMatch[1].trim() : "",
      impact: impactMatch ? impactMatch[1].trim() : text, // Fallback jika teks biasa tanpa pilar resmi
    };
  };

  useEffect(() => {
    const loadDetailKasus = async () => {
      try {
        setLoading(true);
        setError("");

        // Menembak endpoint GET /api/cases/{id} asli dari Azure
        const data = await apiFetch(`/cases/${caseId}`);
        setKasus(data?.data || data);
      } catch (err: any) {
        console.error("Gagal memuat detail kasus dari server:", err);

        // Fallback Mock Data tipe general jika terkena masalah CORS saat pengujian
        setKasus({
          id: caseId,
          title:
            "Debat Etika AI: Bolehkah AI Menggantikan Peran Dokter dalam Diagnosa Awal?",
          type: "general",
          description:
            "Konteks: Saat ini, algoritma AI sudah mampu mendeteksi penyakit melalui X-ray dengan akurasi tinggi. Namun, ada kekhawatiran soal tanggung jawab moral jika terjadi salah diagnosa.\n\nData Pendukung:\n1. Kecepatan: AI butuh beberapa detik, Dokter butuh waktu lebih lama.\n2. Akses: AI jauh lebih murah untuk dijangkau masyarakat di daerah terpencil.\n3. Masalah Utama: Jika AI salah mendiagnosa, pihak mana yang memikul tanggung jawab hukum? Pengembang software atau pihak rumah sakit?",
        });
      } finally {
        setLoading(false);
      }
    };

    if (caseId) loadDetailKasus();
  }, [caseId]);

  // Cek apakah user sudah mengirim jawaban untuk kasus ini
  useEffect(() => {
    const checkSubmission = async () => {
      if (!caseId) return;

      // 1. Cek localStorage terlebih dahulu untuk feedback instan
      if (typeof window !== "undefined") {
        const localSubmitted = localStorage.getItem(`submitted_case_${caseId}`);
        if (localSubmitted === "true") {
          setHasSubmitted(true);
          const savedArg = localStorage.getItem(`submitted_argument_${caseId}`);
          if (savedArg) {
            const parsed = parseCombinedArgument(savedArg);
            setShInput(parsed.stakeholder);
            setAcInput(parsed.action);
            setImInput(parsed.impact);
          }
          const savedIsPublic = localStorage.getItem(
            `submitted_is_public_${caseId}`,
          );
          if (savedIsPublic !== null) {
            setIsPublic(savedIsPublic === "true");
          }
          router.push(`/diskusi/${caseId}/jawaban`);
          return;
        }
      }

      // 2. Jika tidak ada di localStorage, cek dari backend
      try {
        const profile = await apiFetch("/me");
        const userId = profile?.data?.id || profile?.id;

        if (userId) {
          const perspectives = await apiFetch(`/cases/${caseId}/perspectives`);
          const matchingResponse = Array.isArray(perspectives)
            ? perspectives.find((p: any) => p.UserID === userId)
            : null;

          if (matchingResponse) {
            setHasSubmitted(true);

            const stakeholderDetail = matchingResponse.details?.find(
              (d: any) =>
                d.pillar_category === "Stakeholder" ||
                d.pillar_category === "Teknis",
            );
            const actionDetail = matchingResponse.details?.find(
              (d: any) =>
                d.pillar_category === "Action" || d.pillar_category === "Etika",
            );
            const impactDetail = matchingResponse.details?.find(
              (d: any) => d.pillar_category === "Impact",
            );

            const sh =
              stakeholderDetail?.content ||
              stakeholderDetail?.text_content ||
              matchingResponse.details?.[0]?.content ||
              matchingResponse.details?.[0]?.text_content ||
              "";
            const ac =
              actionDetail?.content ||
              actionDetail?.text_content ||
              matchingResponse.details?.[1]?.content ||
              matchingResponse.details?.[1]?.text_content ||
              "";
            const im =
              impactDetail?.content ||
              impactDetail?.text_content ||
              matchingResponse.details?.[2]?.content ||
              matchingResponse.details?.[2]?.text_content ||
              "";

            const fullArg = `[STAKEHOLDER]: ${sh}\n\n[ACTION]: ${ac}\n\n[IMPACT]: ${im}`;
            const responseIsPublic =
              matchingResponse.is_public !== undefined
                ? matchingResponse.is_public
                : true;
            setIsPublic(responseIsPublic);

            if (typeof window !== "undefined") {
              localStorage.setItem(`submitted_case_${caseId}`, "true");
              localStorage.setItem(
                `submitted_is_public_${caseId}`,
                String(responseIsPublic),
              );
              localStorage.setItem(`submitted_argument_${caseId}`, fullArg);
            }

            setShInput(sh);
            setAcInput(ac);
            setImInput(im);
            router.push(`/diskusi/${caseId}/jawaban`);
          }
        }
      } catch (err) {
        console.error("Gagal memuat status pengiriman dari backend:", err);
      }
    };

    checkSubmission();
  }, [caseId]);

  const handleSubmitPerspektif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shInput.trim() || !acInput.trim() || !imInput.trim()) return;

    setError("");
    setSubmitting(true);

    // Satukan input form FE menjadi satu kesatuan format string untuk kebutuhan BE
    const combinedArgument = `[STAKEHOLDER]: ${shInput}\n\n[ACTION]: ${acInput}\n\n[IMPACT]: ${imInput}`;

    try {
      // Menembak endpoint POST /api/perspectives
      await apiFetch("/perspectives", {
        method: "POST",
        body: JSON.stringify({
          case_id: parseInt(caseId, 10),
          is_public: isPublic,
          details: [
            {
              pillar_category: "Stakeholder",
              content: shInput,
              text_content: shInput,
            },
            {
              pillar_category: "Action",
              content: acInput,
              text_content: acInput,
            },
            {
              pillar_category: "Impact",
              content: imInput,
              text_content: imInput,
            },
          ],
        }),
      });

      setSubmitSuccess(true);
      setHasSubmitted(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(`submitted_case_${caseId}`, "true");
        localStorage.setItem(`submitted_argument_${caseId}`, combinedArgument);
        localStorage.setItem(`submitted_is_public_${caseId}`, String(isPublic));
      }
      setTimeout(() => {
        setSubmitSuccess(false);
        router.push(`/diskusi/${caseId}/jawaban`);
      }, 1000);
    } catch (err: any) {
      console.error("Gagal mengirim argumen:", err);
      setError(err.message || "Gagal mengirimkan respon perspektif ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Mengurai Paket Studi Kasus...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neogrid text-black font-sans flex flex-col selection:bg-indigo-650 selection:text-white">
      {/* NAVBAR */}
      <nav className="w-full border-b-4 border-black bg-white sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <Link
            href="/diskusi"
            className="text-xs font-black uppercase tracking-wider text-black border-2 border-black bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 rounded-xl shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="hidden sm:inline">Kembali ke Forum</span>
            <span className="sm:hidden">Kembali</span>
          </Link>
          <NotificationBell />
        </div>
      </nav>

      {/* MAIN LAYOUT CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* SISI KIRI: DETAIL KASUS & SETTING PRIVASI JAWABAN (5 Kolom) */}
        <section className="md:col-span-5 space-y-6">
          {/* KARTU DETAIL STUDI KASUS */}
          <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_#000] space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-black tracking-wider">
                Studi Kasus Analisis
              </span>
              <h2 className="text-lg font-black text-slate-900 font-serif leading-snug">
                {kasus?.title}
              </h2>
            </div>
            <div className="border-t-2 border-black pt-3">
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-semibold font-mono">
                {kasus?.description}
              </p>
            </div>
          </div>

          {/* KARTU PENGATURAN PRIVASI JAWABAN */}
          <div className="bg-white border-2 border-black p-5 rounded-3xl shadow-[4px_4px_0px_#000] space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-black uppercase tracking-wider mt-1">
                Visibilitas Lembar Jawaban
              </h3>
              <p className="text-[11px] font-semibold text-slate-550 leading-relaxed font-mono">
                Pilih apakah analis lain boleh melihat draf pemecahan masalah
                Anda.
              </p>
            </div>

            <div className="flex bg-white border-2 border-black p-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider select-none shadow-[2px_2px_0px_#000]">
              <button
                type="button"
                disabled={hasSubmitted}
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isPublic
                    ? "bg-emerald-100 text-black shadow-sm border border-black"
                    : "text-slate-400 hover:text-slate-650 disabled:hover:text-slate-400 border border-transparent"
                }`}
              >
                Public
              </button>
              <button
                type="button"
                disabled={hasSubmitted}
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !isPublic
                    ? "bg-slate-800 text-white shadow-sm border border-black"
                    : "text-slate-400 hover:text-slate-650 disabled:hover:text-slate-400 border border-transparent"
                }`}
              >
                Private
              </button>
            </div>

            <div className="text-[10px] font-semibold leading-relaxed p-3 bg-slate-50/50 border-2 border-black rounded-xl font-mono">
              {isPublic ? (
                <p className="text-slate-500">
                  <span className="font-bold text-black">Publik aktif:</span>{" "}
                  Jawaban Anda dapat diulas oleh komunitas lain di forum dan
                  akan muncul pada draf portofolio profil publik Anda.
                </p>
              ) : (
                <p className="text-slate-500">
                  <span className="font-bold text-slate-700">
                    Privat aktif:
                  </span>{" "}
                  Anda tetap dapat melihat jawaban analis lain, tetapi tanggapan
                  Anda disembunyikan dari forum publik dan tidak terlihat di
                  profil Anda oleh pengguna lain.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* SISI KANAN: FORMULIR INPUT JAWABAN PERSPEKTIF 3 PILAR (7 Kolom) */}
        <section className="md:col-span-7 space-y-4">
          <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_#000] space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-black uppercase tracking-wider">
                Uraikan Argumen Anda
              </h3>
              <p className="text-[11px] font-semibold text-slate-550 leading-relaxed font-mono">
                Bedah kasus ini ke dalam format analisis 3 pilar objektif khas
                Unravel sebelum disiarkan ke server global.
              </p>
            </div>

            {hasSubmitted ? (
              <div className="p-4 bg-[#FDEDEC] border-2 border-black rounded-2xl flex items-center gap-3 animate-fade-in shadow-[3px_3px_0px_#000]">
                <CheckCircle2
                  size={20}
                  className="text-indigo-650 shrink-0 animate-bounce"
                />
                <div>
                  <p className="text-xs font-black text-indigo-700 uppercase">
                    Analisis Terkirim
                  </p>
                  <p className="text-[10px] font-bold text-indigo-500">
                    Anda sudah memberikan jawaban untuk studi kasus ini.
                    Mengalihkan...
                  </p>
                </div>
              </div>
            ) : submitSuccess ? (
              <div className="p-3 bg-emerald-100 border-2 border-black rounded-xl text-emerald-900 text-xs font-black text-center animate-fade-in flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000]">
                <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                <span>
                  Argumen analisis terstruktur berhasil dikirim! Mengalihkan...
                </span>
              </div>
            ) : null}

            <form onSubmit={handleSubmitPerspektif} className="space-y-4">
              {/* 1. STAKEHOLDER INPUT */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-650">
                  1. Stakeholder Utama
                </label>
                <input
                  type="text"
                  required
                  disabled={submitting || hasSubmitted}
                  value={shInput}
                  onChange={(e) => setShInput(e.target.value)}
                  placeholder="Aktor/Pihak kunci terdampak..."
                  className="w-full px-3 py-2.5 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:bg-slate-50 shadow-[2px_2px_0px_#000] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* 2. ACTION INPUT */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-black">
                  2. Rencana Tindakan (Action)
                </label>
                <textarea
                  required
                  disabled={submitting || hasSubmitted}
                  value={acInput}
                  onChange={(e) => setAcInput(e.target.value)}
                  rows={3}
                  placeholder="Langkah strategis operasional menurut anda..."
                  className="w-full p-3 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:bg-slate-50 shadow-[2px_2px_0px_#000] transition-all resize-none leading-relaxed disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* 3. IMPACT INPUT */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-black">
                  3. Konsekuensi Capaian (Impact)
                </label>
                <textarea
                  required
                  disabled={submitting || hasSubmitted}
                  value={imInput}
                  onChange={(e) => setImInput(e.target.value)}
                  rows={3}
                  placeholder="Efek domino positif/negatif yang diprediksi..."
                  className="w-full p-3 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:bg-slate-50 shadow-[2px_2px_0px_#000] transition-all resize-none leading-relaxed disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  hasSubmitted ||
                  !shInput.trim() ||
                  !acInput.trim() ||
                  !imInput.trim()
                }
                className={`w-full py-3.5 text-xs font-black border-2 border-black uppercase tracking-widest rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all mt-2 cursor-pointer ${
                  hasSubmitted
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border-dashed border-slate-350"
                    : submitting ||
                        !shInput.trim() ||
                        !acInput.trim() ||
                        !imInput.trim()
                      ? "bg-slate-300 text-slate-400 cursor-not-allowed shadow-none border-dashed border-slate-350"
                      : "bg-indigo-650 text-white hover:bg-indigo-750"
                }`}
              >
                {hasSubmitted
                  ? "Tanggapan Terkirim"
                  : submitting
                    ? "Mentransmisikan..."
                    : "Kirim Respon Perspektif"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
