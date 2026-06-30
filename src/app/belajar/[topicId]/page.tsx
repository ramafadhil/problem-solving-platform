"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/utils/api";

// Fallback mock data jika API kosong
const dataTemaKasus: Record<string, { namaTema: string; listStage: { id: number; name: string; xpReward: number; type: string }[] }> = {
  teknologi: {
    namaTema: "Teknologi",
    listStage: [
      { id: 1, name: "Pencemaran Sungai Cihampelas", xpReward: 50, type: "start" },
      { id: 2, name: "Deforestasi Lereng Gunung Galunggung", xpReward: 50, type: "node" },
      { id: 3, name: "Krisis Sampah Plastik TPA Galuga", xpReward: 100, type: "challenge" },
    ],
  },
  pendidikan: {
    namaTema: "Pendidikan",
    listStage: [
      { id: 1, name: "Pemerataan Akses Internet Sekolah", xpReward: 50, type: "start" },
      { id: 2, name: "Implementasi Kurikulum Digital", xpReward: 50, type: "node" },
      { id: 3, name: "Kesenjangan Kualitas Pengajar Daerah", xpReward: 100, type: "challenge" },
    ],
  },
  politik: {
    namaTema: "Politik",
    listStage: [
      { id: 1, name: "Fenomena Politik Dinasti Daerah", xpReward: 50, type: "start" },
      { id: 2, name: "Pembengkakan Kursi Kabinet", xpReward: 50, type: "node" },
      { id: 3, name: "Konflik Kepentingan Regulasi Agraria", xpReward: 100, type: "challenge" },
    ],
  },
};

interface Stage {
  id: number;
  name: string;
  xpReward: number;
  type: string;
}

export default function LearningDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const temaKey = (params?.topicId as string) || "teknologi";
  const temaFallback = dataTemaKasus[temaKey] || dataTemaKasus["teknologi"];

  const [highestCompletedStage, setHighestCompletedStage] = useState<number>(0);
  const [namaTema, setNamaTema] = useState<string>("");
  const [topicIcon, setTopicIcon] = useState<string>("📚");
  const [topicDesc, setTopicDesc] = useState<string>("");
  const [stagesList, setStagesList] = useState<Stage[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [totalXP, setTotalXP] = useState<number>(0);

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState<Array<{ user_id: number; username: string; is_private: boolean; total_points: number }>>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(true);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);

  // Fungsi pencocokan topik dari API
  const matchTopic = (caseTopics: any[], topicKey: string) => {
    if (!caseTopics || !Array.isArray(caseTopics)) return false;
    return caseTopics.some((t) => {
      const parts = (t.name || "").split("|");
      const title = parts[0] || "";
      const nameKey = title.toLowerCase().replace(/\s+/g, "-");
      return nameKey === topicKey;
    });
  };

  // Ambil nama topik & icon dari API
  useEffect(() => {
    const fetchTopicName = async () => {
      try {
        const topicsRes = await apiFetch("/topics");
        const list = Array.isArray(topicsRes) ? topicsRes : (topicsRes?.data || []);
        if (Array.isArray(list)) {
          const matched = list.find((t) => {
            const parts = (t.name || "").split("|");
            const key = (parts[0] || "").toLowerCase().replace(/\s+/g, "-");
            return key === temaKey;
          });
          if (matched) {
            const parts = matched.name.split("|");
            setNamaTema(parts[0] || temaFallback.namaTema);
            setTopicIcon(parts[1] || "📚");
            setTopicDesc(parts[2] || "");
            return;
          }
        }
      } catch (err) {
        console.error("Gagal memuat nama topik:", err);
      }
      setNamaTema(temaFallback.namaTema);
    };
    fetchTopicName();
  }, [temaKey]);

  // Ambil data me (username)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await apiFetch("/me");
        const data = me?.data || me;
        setUserName(data?.name || data?.username || "Analis");
        setMyUserId(data?.id || null);
      } catch {
        setUserName("Analis");
      }
    };
    fetchMe();
  }, []);

  // Ambil data leaderboard dari BE
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLeaderboardLoading(true);
        const res = await apiFetch("/leaderboard");
        const list = Array.isArray(res) ? res : (res?.data || []);
        if (Array.isArray(list)) {
          const sorted = [...list].sort((a, b) => b.total_points - a.total_points);
          setLeaderboard(sorted);
        }
      } catch (err) {
        console.error("Gagal mengambil data leaderboard:", err);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    fetchLeaderboardData();
  }, []);

  // Cari peringkat user aktif di leaderboard
  useEffect(() => {
    if (leaderboard.length > 0 && myUserId !== null) {
      const idx = leaderboard.findIndex((u) => u.user_id === myUserId);
      if (idx !== -1) {
        setMyRank(idx + 1);
      }
    }
  }, [leaderboard, myUserId]);

  // Ambil studi kasus dari API
  useEffect(() => {
    const fetchLearningCases = async () => {
      try {
        const casesRes = await apiFetch("/cases");
        const casesList = Array.isArray(casesRes) ? casesRes : (casesRes?.cases || casesRes?.data || []);
        if (Array.isArray(casesList)) {
          const filtered = casesList.filter(
            (c: any) => c.type === "learning" && matchTopic(c.topics, temaKey)
          );
          if (filtered.length > 0) {
            filtered.sort((a: any, b: any) => Number(a.id) - Number(b.id));
            const mappedStages: Stage[] = filtered.map((c: any, index: number) => {
              const types = ["start", "node", "challenge", "node", "finish"];
              const reward =
                c.logic_blocks && c.logic_blocks.length > 0
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
        console.error("Gagal memuat learning cases:", err);
      }
      setStagesList(temaFallback.listStage);
    };
    fetchLearningCases();
  }, [temaKey]);

  // Baca progres dari localStorage - hitung berdasarkan solved_case_{id}_{userId} per stage
  useEffect(() => {
    if (stagesList.length === 0 || myUserId === null) return;

    const computeProgress = async () => {
      // Ambil case IDs dari API (sudah dimuat di stagesList, tapi kita butuh ID aslinya)
      try {
        const casesRes = await apiFetch("/cases");
        const casesList = Array.isArray(casesRes) ? casesRes : (casesRes?.cases || casesRes?.data || []);
        const filtered = casesList
          .filter((c: any) => c.type === "learning" && matchTopic(c.topics, temaKey))
          .sort((a: any, b: any) => Number(a.id) - Number(b.id));

        if (filtered.length > 0) {
          // Hitung stage mana saja yang sudah diselesaikan secara berurutan
          let maxCompleted = 0;
          for (let i = 0; i < filtered.length; i++) {
            const caseId = filtered[i].id;
            if (caseId && localStorage.getItem(`solved_case_${caseId}_${myUserId}`) === "true") {
              maxCompleted = i + 1; // posisi 1-indexed
            } else {
              break; // Hentikan jika ada level yang belum selesai di tengah jalan
            }
          }

          // Sinkronkan ke progress local storage untuk digunakan halaman level
          localStorage.setItem(`progress_${temaKey}_${myUserId}`, String(maxCompleted));
          setHighestCompletedStage(maxCompleted);

          let earned = 0;
          for (let i = 0; i < maxCompleted; i++) {
            earned += stagesList[i]?.xpReward || 0;
          }
          setTotalXP(earned);
          return;
        }
      } catch (err) {
        console.error("Gagal menghitung progress dari case IDs:", err);
      }

      // Fallback murni dari progress key lama (hanya jika API kosong/gagal)
      const savedProgress = localStorage.getItem(`progress_${temaKey}_${myUserId}`);
      const progressInt = savedProgress ? parseInt(savedProgress, 10) : 0;
      setHighestCompletedStage(progressInt);
      let earned = 0;
      for (let i = 0; i < progressInt; i++) {
        earned += stagesList[i]?.xpReward || 0;
      }
      setTotalXP(earned);
    };

    computeProgress();
  }, [temaKey, stagesList, myUserId]);

  const handleStageClick = (stageId: number) => {
    if (stageId > highestCompletedStage + 1) {
      alert("⚠️ Level ini masih terkunci! Selesaikan kasus level sebelumnya terlebih dahulu.");
      return;
    }
    router.push(`/belajar/${temaKey}/stage-${stageId}`);
  };

  const completionRate = stagesList.length > 0 ? Math.round((highestCompletedStage / stagesList.length) * 100) : 0;

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-4">

      {/* AREA KIRI: Peta Jalur Progres - Vertikal Centered */}
      <section className="lg:col-span-8 bg-gradient-to-b from-[#FFFDF6] to-[#FFF9ED] border border-amber-200/70 rounded-3xl shadow-sm min-h-[600px] overflow-hidden">
        
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-amber-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/belajar")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-slate-200 hover:border-amber-450 hover:text-amber-600 hover:border-amber-400 font-sans rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
            >
            Ubah Tema
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Jalur Belajar</p>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{topicIcon}</span>
                <span>{namaTema || temaFallback.namaTema}</span>
              </h2>
              {topicDesc && <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{topicDesc}</p>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Level Aktif</p>
            <span className="text-2xl font-black text-indigo-600">
              {Math.min(highestCompletedStage + 1, stagesList.length || 1)}
            </span>
            <span className="text-slate-400 text-sm font-bold"> / {stagesList.length || "—"}</span>
          </div>
        </div>

        {/* Peta Jalur Vertikal */}
        <div className="px-8 py-8">
          {stagesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-4 border-amber-300 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">Memuat jalur belajar...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0">
              {stagesList.map((stage, index) => {
                const isCompleted = stage.id <= highestCompletedStage;
                const isActive = stage.id === highestCompletedStage + 1;
                const isLocked = !isCompleted && !isActive;

                const nodeColor = isCompleted
                  ? "bg-emerald-500 border-emerald-300 text-white shadow-emerald-200"
                  : isActive
                  ? "bg-indigo-600 border-indigo-300 text-white shadow-indigo-200 animate-pulse"
                  : "bg-white border-slate-200 text-slate-400 shadow-slate-100";

                const connectorColor = isCompleted ? "bg-emerald-300" : "bg-slate-200";

                const nodeIcon = isCompleted
                  ? "✓"
                  // : stage.type === "challenge"
                  // ? "🔥"
                  : stage.type === "finish"
                  ? "🏁"
                  : String(stage.id);

                return (
                  <div key={stage.id} className="flex flex-col items-center w-full">
                    {/* Node Row */}
                    <div className="flex items-center gap-5 w-full max-w-md group">
                      {/* Node Button */}
                      <button
                        onClick={() => handleStageClick(stage.id)}
                        disabled={isLocked}
                        className={`
                          w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center
                          font-black text-lg border-4 shadow-lg transition-all duration-200
                          ${nodeColor}
                          ${!isLocked ? "hover:scale-110 active:scale-95 cursor-pointer" : "cursor-not-allowed opacity-60"}
                        `}
                      >
                        {nodeIcon}
                      </button>

                      {/* Info Card */}
                      <button
                        onClick={() => !isLocked && handleStageClick(stage.id)}
                        disabled={isLocked}
                        className={`
                          flex-1 text-left px-4 py-3 rounded-2xl border transition-all duration-200
                          ${isCompleted
                            ? "bg-emerald-50 border-emerald-100 hover:border-emerald-300"
                            : isActive
                            ? "bg-indigo-50 border-indigo-200 hover:border-indigo-400 shadow-sm"
                            : "bg-white/50 border-slate-100 opacity-50 cursor-not-allowed"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${
                              isCompleted ? "text-emerald-600" : isActive ? "text-indigo-600" : "text-slate-400"
                            }`}>
                              {isCompleted ? "✅ Selesai" : isActive ? "▶ Level Aktif" : `🔒 Level ${stage.id}`}
                            </p>
                            <p className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                              {stage.name}
                            </p>
                          </div>
                          <span className={`flex-shrink-0 text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap ${
                            isCompleted ? "bg-emerald-100 text-emerald-700" : isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
                          }`}>
                            +{stage.xpReward} Points
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Connector Line (except after last) */}
                    {index < stagesList.length - 1 && (
                      <div className="flex items-center justify-start w-full max-w-md pl-7 py-1">
                        <div className={`w-0.5 h-8 rounded-full ${connectorColor} ml-[26px]`} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Tambah Konektor ke Locked Stage di paling bawah */}
              <div className="flex items-center justify-start w-full max-w-md pl-7 py-1">
                <div className="w-0.5 h-8 rounded-full bg-slate-200 ml-[26px]" />
              </div>

              {/* Locked Stage Placeholder */}
              <div className="flex items-center gap-5 w-full max-w-md opacity-60">
                {/* Node Button */}
                <div
                  className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center font-black text-base border-4 border-dashed border-slate-200 bg-slate-50 text-slate-400 shadow-sm cursor-not-allowed"
                >
                  🔒
                </div>

                {/* Info Card */}
                <div
                  className="flex-1 text-left px-4 py-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 cursor-not-allowed"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider mb-0.5 text-slate-400">
                        Segera Hadir
                      </p>
                      <p className="text-sm font-extrabold text-slate-450 leading-snug line-clamp-2 text-slate-400">
                        Studi Kasus Analitis Baru
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 border border-slate-200">
                      Locked
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AREA KANAN: Leaderboard + Progres */}
      <section className="lg:col-span-4 flex flex-col gap-4">

        {/* Kartu Profil & XP Singkat */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-base uppercase">
              {userName.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-slate-900 truncate">{userName || "Analis"}</p>
              <p className="text-[10px] text-slate-400 font-medium">Analis Aktif</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-black text-indigo-700">{totalXP}</p>
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Points Jalur</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400">Progres Jalur</p>
              <p className="text-[10px] font-black text-slate-700">{highestCompletedStage}/{stagesList.length} Level</p>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Papan Peringkat</h3>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Berdasarkan total Points</p>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-150 px-2 py-1 rounded-lg">
              Global
            </span>
          </div>

          <div className="space-y-2">
            {leaderboardLoading ? (
              // Skeleton Loader
              [1, 2, 3, 4, 5].map((rank) => (
                <div key={rank} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 animate-pulse">
                  <span className="text-[10px] font-black text-slate-350 w-5 text-center">▫️</span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-slate-200 rounded-full w-20" />
                    <div className="h-2 bg-slate-100 rounded-full w-12" />
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-6" />
                </div>
              ))
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold italic bg-slate-50/20 rounded-2xl border border-dashed border-slate-200">
                Belum ada analis terdaftar.
              </div>
            ) : (
              <>
                {leaderboard.slice(0, 5).map((user, idx) => {
                  const rank = idx + 1;
                  const isMe = user.user_id === myUserId;
                  const rankIcon = rank === 1 ? "🏆" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "▫️";
                  const displayName = user.is_private ? "Analis Anonim" : (user.username || "Analis");
                  const avatarLetter = displayName.charAt(0).toUpperCase();

                  return (
                    <div
                      key={user.user_id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isMe
                          ? "border-indigo-300 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-200"
                          : "border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <span className="text-base w-5 text-center flex-shrink-0 font-black">
                        {rank <= 3 ? rankIcon : rank}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs uppercase flex-shrink-0 ${
                        isMe ? "bg-indigo-200 text-indigo-700" : "bg-slate-200 text-slate-650"
                      }`}>
                        {avatarLetter}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-extrabold truncate ${isMe ? "text-indigo-900" : "text-slate-800"}`}>
                          {displayName} {isMe && <span className="text-[9px] font-bold text-indigo-500">(Kamu)</span>}
                        </p>
                        <p className={`text-[10px] font-semibold ${isMe ? "text-indigo-500" : "text-slate-450"}`}>
                          {user.total_points} Points
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Tampilkan user sendiri jika tidak masuk dalam Top 5 */}
                {myRank !== null && myRank > 5 && (
                  <>
                    <div className="flex justify-center py-1">
                      <div className="h-0.5 w-12 border-t-2 border-dashed border-slate-200" />
                    </div>
                    {(() => {
                      const myUserObj = leaderboard.find(u => u.user_id === myUserId);
                      if (!myUserObj) return null;
                      const displayName = myUserObj.is_private ? "Analis Anonim" : (myUserObj.username || "Analis");
                      const avatarLetter = displayName.charAt(0).toUpperCase();

                      return (
                        <div
                          className="flex items-center gap-3 p-3 rounded-xl border-2 border-indigo-300 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-200"
                        >
                          <span className="text-xs font-black text-indigo-500 w-5 text-center flex-shrink-0">
                            #{myRank}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-black text-xs uppercase flex-shrink-0">
                            {avatarLetter}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-extrabold text-indigo-900 truncate">
                              {displayName} <span className="text-[9px] font-bold text-indigo-500">(Kamu)</span>
                            </p>
                            <p className="text-[10px] text-indigo-500 font-semibold">
                              {myUserObj.total_points} Points
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </>
            )}
          </div>

          {/* Info Poin Global */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed font-sans font-medium">
            <span className="text-xs text-indigo-500 mt-0.5 flex-shrink-0">💡</span>
            <span>
              <strong>Info Poin:</strong> Papan peringkat ini bersifat global. Poin Anda diakumulasikan dari penyelesaian peta jalur belajar dan kontribusi di <strong>Mode Diskusi</strong>.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

