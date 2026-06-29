"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// 1. MOCK API CONTRACT: Cetak Biru Struktur Data dari Database (BE)
const dataTemaKasus: Record<
  string,
  {
    namaTema: string;
    listStage: { id: number; name: string; xpReward: number; type: string }[];
  }
> = {
  lingkungan: {
    namaTema: "Lingkungan Hidup",
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
  politik: {
    namaTema: "Politik & Kebijakan",
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
  const temaKey = (params?.caseId as string) || "lingkungan";
  const temaAktif = dataTemaKasus[temaKey] || dataTemaKasus["lingkungan"];

  // 3. DINAMIS STATE: State ini yang nantinya akan diisi oleh fungsi fetch() ke Database
  const [highestCompletedStage, setHighestCompletedStage] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<typeof initialUsersDatabase>(
    [],
  );

  // Simulasi Ambil Data saat Halaman di-load (Fetching Simulation)
  useEffect(() => {
    // Membaca progres yang disimpan sementara di localStorage (fitur auto-save progress)
    const savedProgress = localStorage.getItem(`progress_${temaKey}`);
    if (savedProgress) {
      const progressInt = parseInt(savedProgress, 10);
      setHighestCompletedStage(progressInt);

      // Kalkulasi dinamis poin Rama berdasarkan jumlah level yang berhasil diselesaikan
      let totalXPEarned = 0;
      for (let i = 0; i < progressInt; i++) {
        totalXPEarned += temaAktif.listStage[i]?.xpReward || 0;
      }

      // Update nilai XP Rama di tabel leaderboard secara dinamis
      const updatedLeaderboard = initialUsersDatabase.map((user) =>
        user.isCurrentUser ? { ...user, xp: totalXPEarned } : user,
      );

      // Urutkan leaderboard secara otomatis berdasarkan XP tertinggi (Sorting Dinamis)
      updatedLeaderboard.sort((a, b) => b.xp - a.xp);
      setLeaderboard(updatedLeaderboard);
    } else {
      // Jika belum ada progres, tampilkan susunan default terurut
      const defaultSorted = [...initialUsersDatabase].sort(
        (a, b) => b.xp - a.xp,
      );
      setLeaderboard(defaultSorted);
    }
  }, [temaKey, temaAktif]);

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
          {temaAktif.listStage.map((stage, index) => {
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
