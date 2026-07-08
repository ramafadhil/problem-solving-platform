"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

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
  userId?: number;
  points?: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JawabanUlasanPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [kasus, setKasus] = useState<DetailKasus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [daftarPerspektif, setDaftarPerspektif] = useState<MockPerspektif[]>(
    [],
  );
  const [isPublic, setIsPublic] = useState<boolean>(true);

  // Fungsi pembongkar teks argumen gabungan 3 pilar
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
      impact: impactMatch ? impactMatch[1].trim() : text,
    };
  };

  useEffect(() => {
    const checkAndLoad = async () => {
      if (!caseId) return;
      try {
        setLoading(true);

        // 1. Cek status submisi dari localStorage
        let submitted = false;
        let localArg = "";
        let localIsPublic = true;
        if (typeof window !== "undefined") {
          submitted =
            localStorage.getItem(`submitted_case_${caseId}`) === "true";
          localArg = localStorage.getItem(`submitted_argument_${caseId}`) || "";
          localIsPublic =
            localStorage.getItem(`submitted_is_public_${caseId}`) !== "false";
        }

        // 2. Verifikasi status dari API responses
        let userId: any = null;
        try {
          const profile = await apiFetch("/me");
          userId = profile?.data?.id || profile?.id;
        } catch (e) {
          console.error("Gagal mengambil data profile:", e);
        }

        let perspectivesRaw: any = null;
        try {
          perspectivesRaw = await apiFetch(`/cases/${caseId}/perspectives`);
        } catch (e) {
          console.error("Gagal mengambil data perspektif dari server:", e);
        }

        const perspectivesList = Array.isArray(perspectivesRaw)
          ? perspectivesRaw
          : perspectivesRaw?.data || perspectivesRaw?.perspectives || [];

        const myPerspective =
          Array.isArray(perspectivesList) && userId
            ? perspectivesList.find(
                (p: any) => Number(p.user_id || p.UserID) === Number(userId),
              )
            : null;

        if (myPerspective) {
          submitted = true;

          const stakeholderDetail = myPerspective.details?.find(
            (d: any) =>
              d.pillar_category === "Stakeholder" ||
              d.pillar_category === "Teknis",
          );
          const actionDetail = myPerspective.details?.find(
            (d: any) =>
              d.pillar_category === "Action" || d.pillar_category === "Etika",
          );
          const impactDetail = myPerspective.details?.find(
            (d: any) => d.pillar_category === "Impact",
          );

          const sh =
            stakeholderDetail?.content ||
            stakeholderDetail?.text_content ||
            myPerspective.details?.[0]?.content ||
            myPerspective.details?.[0]?.text_content ||
            "";
          const ac =
            actionDetail?.content ||
            actionDetail?.text_content ||
            myPerspective.details?.[1]?.content ||
            myPerspective.details?.[1]?.text_content ||
            "";
          const im =
            impactDetail?.content ||
            impactDetail?.text_content ||
            myPerspective.details?.[2]?.content ||
            myPerspective.details?.[2]?.text_content ||
            "";

          localArg = `[STAKEHOLDER]: ${sh}\n\n[ACTION]: ${ac}\n\n[IMPACT]: ${im}`;
          localIsPublic =
            myPerspective.is_public !== undefined
              ? myPerspective.is_public
              : true;

          if (typeof window !== "undefined") {
            localStorage.setItem(`submitted_case_${caseId}`, "true");
            localStorage.setItem(
              `submitted_is_public_${caseId}`,
              String(localIsPublic),
            );
            localStorage.setItem(`submitted_argument_${caseId}`, localArg);
          }
        }

        // Proteksi rute: Jika belum submit, balikkan ke formulir jawab
        if (!submitted) {
          router.push(`/diskusi/${caseId}`);
          return;
        }

        setIsPublic(localIsPublic);

        // 3. Muat detail kasus
        let caseCreatorId = 0;
        try {
          const detail = await apiFetch(`/cases/${caseId}`);
          const actualCase = detail?.data || detail;
          setKasus(actualCase);
          caseCreatorId = actualCase?.user_id || 0;
        } catch (err) {
          console.error("Gagal memuat detail kasus dari Azure:", err);
          setKasus({
            id: caseId,
            title:
              "Debat Etika AI: Bolehkah AI Menggantikan Peran Dokter dalam Diagnosa Awal?",
            type: "general",
            description:
              "Konteks: Saat ini, algoritma AI sudah mampu mendeteksi penyakit melalui X-ray dengan akurasi tinggi. Namun, ada kekhawatiran soal tanggung jawab moral jika terjadi salah diagnosa.\n\nData Pendukung:\n1. Kecepatan: AI butuh beberapa detik, Dokter butuh waktu lebih lama.\n2. Akses: AI jauh lebih murah untuk dijangkau masyarakat di daerah terpencil.",
          });
        }

        // 4. Siapkan feed list ulasan secara dinamis dari database
        const otherAnswers: MockPerspektif[] = [];
        if (Array.isArray(perspectivesList)) {
          perspectivesList.forEach((p: any) => {
            // Kita skip perspective milik user sendiri karena akan ditambahkan paling atas
            if ((p.user_id || p.UserID) === userId) return;

            // Hanya tampilkan jika public
            if (p.is_public) {
              const stakeholderDetail = p.details?.find(
                (d: any) =>
                  d.pillar_category === "Stakeholder" ||
                  d.pillar_category === "Teknis",
              );
              const actionDetail = p.details?.find(
                (d: any) =>
                  d.pillar_category === "Action" ||
                  d.pillar_category === "Etika",
              );
              const impactDetail = p.details?.find(
                (d: any) => d.pillar_category === "Impact",
              );

              const sh =
                stakeholderDetail?.content ||
                stakeholderDetail?.text_content ||
                p.details?.[0]?.content ||
                p.details?.[0]?.text_content ||
                "";
              const ac =
                actionDetail?.content ||
                actionDetail?.text_content ||
                p.details?.[1]?.content ||
                p.details?.[1]?.text_content ||
                "";
              const im =
                impactDetail?.content ||
                impactDetail?.text_content ||
                p.details?.[2]?.content ||
                p.details?.[2]?.text_content ||
                "";

              const pArg = `[STAKEHOLDER]: ${sh}\n\n[ACTION]: ${ac}\n\n[IMPACT]: ${im}`;
              const formattedDate = new Date(p.created_at).toLocaleDateString(
                "id-ID",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                },
              );

              let authorName = `Analis #${p.user_id || p.UserID}`;
              if (p.user) {
                if (p.user.is_private) {
                  authorName = "Analis Anonim";
                } else {
                  authorName = p.user.name || p.user.username || authorName;
                }
              }

              const userPoints =
                (p.user_id || p.UserID) === caseCreatorId ? 50 : 25;

              otherAnswers.push({
                id: String(p.ID),
                author: authorName,
                argument: pArg,
                createdAt: formattedDate,
                userId: p.user_id || p.UserID,
                points: userPoints,
              });
            }
          });
        }

        const ownPoints = userId === caseCreatorId ? 50 : 25;

        if (localArg) {
          const userOwnResponse: MockPerspektif = {
            id: "p-user-own",
            author: "Anda",
            argument: localArg,
            createdAt: "Baru saja",
            userId: userId,
            points: ownPoints,
          };
          setDaftarPerspektif([userOwnResponse, ...otherAnswers]);
        } else {
          setDaftarPerspektif(otherAnswers);
        }
      } catch (err) {
        console.error("Gagal memeriksa status ulasan:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAndLoad();
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-[#00BC7D] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Menyelaraskan Forum Ulasan...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neogrid text-black font-sans flex flex-col selection:bg-[#00BC7D] selection:text-white">
      {/* NAVBAR */}
      <nav className="w-full border-b-4 border-black bg-white sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 flex items-center justify-center">
              <img src="/logo.svg" alt="Logo" className="w-16 h-16" />
            </div>
            <a
              href="/"
              className="font-black text-lg tracking-tight text-black"
            >
              Unravel<span className="text-[#00BC7D]"> Discuss</span>
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/diskusi"
              className="px-3 sm:px-4 py-2 bg-white border-2 border-black hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
            >
              <span className="hidden sm:inline">Daftar Kasus</span>
              <span className="sm:hidden">Forum</span>
            </Link>
            <NotificationBell />
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-6">
        {/* HEADER AREA */}
        <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border-2 border-black bg-emerald-100 text-black shadow-[1px_1px_0px_#000]">
              Perspektif user lain
            </span>
            <h2 className="text-lg font-black tracking-tight text-black font-serif leading-snug mt-1">
              Ulasan Perspektif: {kasus?.title}
            </h2>
            <p className="text-xs text-slate-550 font-semibold font-mono">
              Berikut adalah rumusan kerangka 3 pilar yang dikirimkan oleh para
              analis di komunitas.
            </p>
          </div>
        </div>

        {/* GRID DAFTAR JAWABAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {daftarPerspektif.map((item) => {
            const parsedData = parseCombinedArgument(item.argument);

            return (
              <div
                key={item.id}
                className="bg-white border-2 border-black p-5 rounded-3xl shadow-[4px_4px_0px_#000] flex flex-col hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all min-h-[300px]"
              >
                {/* CARD HEADER */}
                <div className="flex items-center gap-3 border-b-2 border-black pb-3 mb-3">
                  <Link
                    href={
                      item.author === "Anda"
                        ? "/profile"
                        : `/profile?userId=${item.userId}`
                    }
                    className="w-9 h-9 rounded-full bg-emerald-50 border-2 border-black flex items-center justify-center font-black text-xs text-[#00BC7D] shadow-[1px_1px_0px_#000] shrink-0 hover:scale-105 transition-all"
                  >
                    {item.author.charAt(0).toUpperCase()}
                  </Link>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-black text-black flex items-center gap-1.5 leading-none truncate">
                      <Link
                        href={
                          item.author === "Anda"
                            ? "/profile"
                            : `/profile?userId=${item.userId}`
                        }
                        className="hover:text-[#00BC7D] hover:underline cursor-pointer transition-colors"
                      >
                        @{item.author}
                      </Link>
                      {item.author.includes("Anda") && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border-2 border-black shrink-0 shadow-[1px_1px_0px_#000] ${
                            isPublic
                              ? "bg-emerald-100 text-black"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isPublic ? "Publik" : "Privat (Hanya Anda)"}
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                      {item.points || 25} Points
                    </span>
                  </div>
                </div>

                {/* CARD BODY CONTENT */}
                <div className="space-y-3 flex-1 flex flex-col justify-start">
                  {parsedData.stakeholder || parsedData.action ? (
                    <div className="space-y-2 pt-1 flex-1">
                      <div className="bg-white p-2.5 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                        <span className="block text-[8px] font-black uppercase text-black tracking-wider">
                          1. Stakeholder Utama
                        </span>
                        <p className="text-xs font-bold text-slate-850 mt-0.5 font-mono">
                          {parsedData.stakeholder}
                        </p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                        <span className="block text-[8px] font-black uppercase text-black tracking-wider">
                          2. Rencana Tindakan
                        </span>
                        <p className="text-xs font-bold text-slate-850 mt-0.5 font-mono">
                          {parsedData.action}
                        </p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                        <span className="block text-[8px] font-black uppercase text-black tracking-wider">
                          3. Prediksi Dampak
                        </span>
                        <p className="text-xs font-bold text-slate-850 mt-0.5 font-mono">
                          {parsedData.impact}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line bg-white border-2 border-black p-3 rounded-xl flex-1 shadow-[2px_2px_0px_#000] font-mono">
                      {item.argument}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
