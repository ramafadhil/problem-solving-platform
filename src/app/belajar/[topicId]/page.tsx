"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/utils/api";

// 1. MOCK API CONTRACT: Cetak Biru Struktur Data dari Database (BE)
const dataTemaKasus: Record<
  string,
  {
    namaTema: string;
    listStage: { id: number; name: string; xpReward: number; type: string }[];
  }
> = {
  teknologi: {
    namaTema: "Teknologi",
    listStage: [
      {
        id: 1,
        name: "Pencemaran Sungai Cihampelas (Mudah)",
        xpReward: 50,
        type: "start",
      },
      {
        id: 2,
        name: "Deforestasi Lereng Gunung Galunggung",
        xpReward: 50,
        type: "node",
      },
      {
        id: 3,
        name: "Krisis Sampah Plastik TPA Galuga",
        xpReward: 100,
        type: "challenge",
      },
      {
        id: 4,
        name: "Polusi Udara Kawasan Industri",
        xpReward: 50,
        type: "node",
      },
      {
        id: 5,
        name: "Ancaman Abrasi Pantai Utara Jawa (Sulit)",
        xpReward: 150,
        type: "finish",
      },
    ],
  },
  pendidikan: {
    namaTema: "Pendidikan",
    listStage: [
      {
        id: 1,
        name: "Pemerataan Akses Internet Sekolah (Mudah)",
        xpReward: 50,
        type: "start",
      },
      {
        id: 2,
        name: "Implementasi Kurikulum Digital Terpadu",
        xpReward: 50,
        type: "node",
      },
      {
        id: 3,
        name: "Kesenjangan Kualitas Pengajar Daerah",
        xpReward: 100,
        type: "challenge",
      },
      {
        id: 4,
        name: "Dilema Digitalisasi Bahan Ajar",
        xpReward: 50,
        type: "node",
      },
      {
        id: 5,
        name: "Standardisasi Fasilitas Lab Komputer (Sulit)",
        xpReward: 150,
        type: "finish",
      },
    ],
  },
  politik: {
    namaTema: "Politik",
    listStage: [
      {
        id: 1,
        name: "Fenomena Politik Dinasti Daerah (Mudah)",
        xpReward: 50,
        type: "start",
      },
      {
        id: 2,
        name: "Pembengkakan Kursi Kabinet Pemerintahan",
        xpReward: 50,
        type: "node",
      },
      {
        id: 3,
        name: "Konflik Kepentingan Regulasi Agraria",
        xpReward: 100,
        type: "challenge",
      },
      {
        id: 4,
        name: "Efikasi Anggaran Studi Banding Dewan",
        xpReward: 50,
        type: "node",
      },
      {
        id: 5,
        name: "Uji Materiil Ambang Batas Parlemen (Sulit)",
        xpReward: 150,
        type: "finish",
      },
    ],
  },
};

// 2. MOCK DATA TABLE: Simulasi isi tabel 'users' di Database
const initialUsersDatabase = [
  { id: "u1", name: "Samuel George", xp: 239, isCurrentUser: false },
  { id: "u2", name: "Husnul Khotimah", xp: 189, isCurrentUser: false },
  { id: "u3", name: "Fadhil Ramadhan", xp: 120, isCurrentUser: false },
  { id: "u4", name: "Rama (You)", xp: 0, isCurrentUser: true }, // Akun kamu
  { id: "u5", name: "Salsabila", xp: 0, isCurrentUser: false },
];

export default function LearningDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const temaKey = (params?.topicId as string) || "teknologi";
  const temaAktif = dataTemaKasus[temaKey] || dataTemaKasus["teknologi"];

  // 3. DINAMIS STATE: State ini yang nantinya akan diisi oleh fungsi fetch() ke Database
  const [highestCompletedStage, setHighestCompletedStage] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<typeof initialUsersDatabase>(
    [],
  );
  const [stagesList, setStagesList] = useState<{ id: number; name: string; xpReward: number; type: string }[]>([]);

  // Fungsi pencocokan topik dari API dengan URL parameter
  const matchTopic = (caseTopics: any[], topicKey: string) => {
    if (!caseTopics || !Array.isArray(caseTopics)) return false;
    return caseTopics.some(t => {
      const name = (t.name || "").toLowerCase();
      if (topicKey === "lingkungan") return name.includes("lingkungan");
      if (topicKey === "politik") return name.includes("politik");
      if (topicKey === "sosial-tata-kota") return name.includes("sosial") || name.includes("kota");
      return name.includes(topicKey.toLowerCase());
    });
  };

  // Ambil data studi kasus learning dari API
  useEffect(() => {
    const fetchLearningCases = async () => {
      try {
        const casesRes = await apiFetch("/cases");
        const casesList = Array.isArray(casesRes) ? casesRes : (casesRes?.cases || casesRes?.data || []);
        if (Array.isArray(casesList)) {
          const filtered = casesList.filter((c: any) => c.type === "learning" && matchTopic(c.topics, temaKey));
          if (filtered.length > 0) {
            // Urutkan berdasarkan ID agar berurutan stage-nya
            filtered.sort((a, b) => Number(a.id) - Number(b.id));
            const mappedStages = filtered.map((c: any, index: number) => {
              const types = ["start", "node", "challenge", "node", "finish"];
              const reward = c.logic_blocks && c.logic_blocks.length > 0 
                ? c.logic_blocks.reduce((acc: number, b: any) => acc + (b.points || 0), 0)
                : 50;
              return {
                id: index + 1,
                name: c.title,
                xpReward: reward,
                type: types[index % types.length],
              };
            });
            setStagesList(mappedStages);
            return;
          }
        }
      } catch (err) {
        console.error("Gagal memuat learning cases dari API:", err);
      }
      
      // Fallback ke data mock lokal jika API tidak mengembalikan data apa pun
      setStagesList(temaAktif.listStage);
    };

    fetchLearningCases();
  }, [temaKey, temaAktif]);

  // Membaca progres dan mengupdate leaderboard berdasarkan total level yang selesai
  useEffect(() => {
    const savedProgress = localStorage.getItem(`progress_${temaKey}`);
    if (savedProgress && stagesList.length > 0) {
      const progressInt = parseInt(savedProgress, 10);
      setHighestCompletedStage(progressInt);

      let totalXPEarned = 0;
      for (let i = 0; i < progressInt; i++) {
        totalXPEarned += stagesList[i]?.xpReward || 0;
      }

      const updatedLeaderboard = initialUsersDatabase.map((user) =>
        user.isCurrentUser ? { ...user, xp: totalXPEarned } : user,
      );

      updatedLeaderboard.sort((a, b) => b.xp - a.xp);
      setLeaderboard(updatedLeaderboard);
    } else {
      const defaultSorted = [...initialUsersDatabase].sort(
        (a, b) => b.xp - a.xp,
      );
      setLeaderboard(defaultSorted);
    }
  }, [temaKey, stagesList]);

  const handleStageClick = (stageId: number) => {
    if (stageId > highestCompletedStage + 1) {
      alert(
        "⚠️ Level ini masih terkunci! Selesaikan kasus level sebelumnya terlebih dahulu.",
      );
      return;
    }
    router.push(`/belajar/${temaKey}/stage-${stageId}`);
  };

  // Fungsi utilitas memberikan lambang peringkat visual secara dinamis berdasarkan indeks array
  const getRankBadge = (index: number) => {
    if (index === 0) return "🏆";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "▫️";
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
      {/* AREA KIRI: Peta Jalur Progres */}
      <section className="lg:col-span-8 bg-[#FFFDF6] border border-amber-200/60 rounded-2xl p-8 shadow-sm min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-full text-center mb-8 bg-white/60 p-4 rounded-xl border border-amber-100 backdrop-blur-sm shadow-sm">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Peta Jalur:{" "}
            <span className="text-indigo-600">{temaAktif.namaTema}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Level Aktif:{" "}
            <strong className="text-indigo-600">
              Level {highestCompletedStage + 1}
            </strong>
          </p>
        </div>

        <div className="absolute w-1 bg-dashed border-l-4 border-dashed border-amber-300 h-[50%] top-[30%] z-0 pointer-events-none" />

        <div className="flex flex-col gap-12 w-full max-w-sm z-10">
          {stagesList.map((stage, index) => {
            const isCompleted = stage.id <= highestCompletedStage;
            const isActive = stage.id === highestCompletedStage + 1;
            const alignmentClass =
              index % 2 === 0 ? "self-start ml-4" : "self-end mr-4";

            return (
              <div
                key={stage.id}
                className={`flex flex-col items-center ${alignmentClass} w-48`}
              >
                <button
                  onClick={() => handleStageClick(stage.id)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-md border-4 transition-all transform hover:scale-110 active:scale-95 ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-200 text-white"
                      : isActive
                        ? "bg-indigo-600 border-indigo-200 text-white animate-bounce"
                        : "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isCompleted
                    ? "✓"
                    : stage.type === "challenge"
                      ? "🔥"
                      : stage.id}
                </button>
                <div className="text-center mt-2 w-full">
                  <p className="text-xs font-bold text-slate-800 leading-tight break-words">
                    {stage.name}
                  </p>
                  <p className="text-[10px] font-semibold text-teal-600 mt-0.5">
                    +{stage.xpReward} XP
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AREA KANAN: Leaderboard Dinamis Berdasarkan Sorting Fungsi JavaScript */}
      <section className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
            📊 Papan Peringkat Analis
          </h3>

          <div className="flex flex-col gap-2.5">
            {leaderboard.map((player, idx) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                  player.isCurrentUser
                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                    : "bg-slate-50/50 border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{getRankBadge(idx)}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 uppercase">
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${player.isCurrentUser ? "text-indigo-900" : "text-slate-700"}`}
                    >
                      {player.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">
                      Poin: {player.xp} XP
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-slate-500">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
