"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { Settings, AlertTriangle, Star } from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";

interface UserProfile {
  id?: number;
  name: string;
  username: string;
  is_private?: boolean;
  role?: string;
  stats?: {
    casesSolved: number;
    casesCreated: number;
    totalXp: number;
  };
}

interface RiwayatJawaban {
  id: string;
  caseId: string;
  caseTitle: string;
  category: string;
  answeredAt: string;
  snippetArgument: string;
}

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

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const isOwnProfile = !userIdParam;

  const [activeTab, setActiveTab] = useState<
    "diskusi" | "belajar" | "disimpan"
  >("diskusi");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [riwayatDiskusi, setRiwayatDiskusi] = useState<RiwayatJawaban[]>([]);
  const [stats, setStats] = useState({
    casesSolved: 0,
    casesCreated: 0,
    totalXp: 0,
  });

  const [allCases, setAllCases] = useState<any[]>([]);
  const [savedKasusIds, setSavedKasusIds] = useState<string[]>([]);
  const [learningProgress, setLearningProgress] = useState<any[]>([]);

  // States untuk Settings Privacy Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedPrivacy, setSelectedPrivacy] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        setLoading(true);
        setError("");

        let activeUser: UserProfile | null = null;
        let userPerspectives: RiwayatJawaban[] = [];
        let casesCreatedCount = 0;

        let currentUserId = 0;

        const casesRes = await apiFetch("/cases");
        const casesList = Array.isArray(casesRes)
          ? casesRes
          : casesRes?.cases || casesRes?.data || [];
        setAllCases(casesList);

        // Memuat data bookmark dari server jika login, jika gagal/tidak login gunakan localStorage
        let serverSavedIds: string[] = [];
        try {
          const bookmarksRes = await apiFetch("/bookmarks");
          const bookmarksList = Array.isArray(bookmarksRes)
            ? bookmarksRes
            : bookmarksRes?.data || [];
          if (Array.isArray(bookmarksList)) {
            serverSavedIds = bookmarksList
              .map((item: any) => {
                if (item && item.case_id) return String(item.case_id);
                if (item && item.case && item.case.id)
                  return String(item.case.id);
                if (item && item.studi_kasus && item.studi_kasus.id)
                  return String(item.studi_kasus.id);
                if (item && item.id) return String(item.id);
                return null;
              })
              .filter(Boolean) as string[];
          }
        } catch (bookmarkErr) {
          console.error(
            "Gagal mengambil bookmarks dari server, fallback ke localStorage:",
            bookmarkErr,
          );
          const savedBookmarks = localStorage.getItem("unravel_saved_cases");
          if (savedBookmarks) {
            serverSavedIds = JSON.parse(savedBookmarks);
          }
        }
        setSavedKasusIds(serverSavedIds);

        if (isOwnProfile) {
          // 1. Profil Sendiri (Ambil dari /me)
          const userRes = await apiFetch("/me");
          const userData = userRes.data || userRes;
          activeUser = userData;
          currentUserId = userData?.id || 0;
          setSelectedPrivacy(userData?.is_private || false);

          if (userData && Array.isArray(casesList)) {
            const userId = userData.id;

            // Hitung jumlah kasus yang dibuat oleh user saat ini
            casesCreatedCount = casesList.filter(
              (c: any) => c.user_id === userId,
            ).length;

            for (const c of casesList) {
              try {
                const perspectives = await apiFetch(
                  `/cases/${c.id}/perspectives`,
                );
                if (Array.isArray(perspectives)) {
                  const myPerspective = perspectives.find(
                    (p: any) => (p.user_id || p.UserID) === userId,
                  );
                  if (myPerspective) {
                    const category =
                      c.topics && c.topics.length > 0
                        ? c.topics[0].name
                        : "Umum";

                    const dateObj = new Date(myPerspective.created_at);
                    const formattedDate = dateObj.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });

                    const stakeholderDetail = myPerspective.details?.find(
                      (d: any) =>
                        d.pillar_category === "Stakeholder" ||
                        d.pillar_category === "Teknis",
                    );
                    const actionDetail = myPerspective.details?.find(
                      (d: any) =>
                        d.pillar_category === "Action" ||
                        d.pillar_category === "Etika",
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

                    const detailsText = `[STAKEHOLDER]: ${sh}\n\n[ACTION]: ${ac}\n\n[IMPACT]: ${im}`;

                    userPerspectives.push({
                      id: String(myPerspective.ID),
                      caseId: String(c.id),
                      caseTitle: c.title,
                      category: category,
                      answeredAt: formattedDate,
                      snippetArgument: detailsText,
                    });
                  }
                }
              } catch (err) {
                console.error(`Gagal mengambil perspektif kasus ${c.id}:`, err);
              }
            }
          }
        } else {
          // 2. Profil Orang Lain
          const targetUserId = Number(userIdParam);
          currentUserId = targetUserId;
          let targetUserFound: any = null;

          if (Array.isArray(casesList)) {
            // Hitung kasus yang dibuat target user
            casesCreatedCount = casesList.filter(
              (c: any) => c.user_id === targetUserId,
            ).length;

            for (const c of casesList) {
              try {
                const perspectives = await apiFetch(
                  `/cases/${c.id}/perspectives`,
                );
                if (Array.isArray(perspectives)) {
                  const targetPerspective = perspectives.find(
                    (p: any) => (p.user_id || p.UserID) === targetUserId,
                  );
                  if (targetPerspective) {
                    if (!targetUserFound && targetPerspective.user) {
                      targetUserFound = targetPerspective.user;
                    }

                    // Hanya tampilkan jika public
                    if (targetPerspective.is_public) {
                      const category =
                        c.topics && c.topics.length > 0
                          ? c.topics[0].name
                          : "Umum";

                      const dateObj = new Date(targetPerspective.created_at);
                      const formattedDate = dateObj.toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      );

                      const stakeholderDetail = targetPerspective.details?.find(
                        (d: any) =>
                          d.pillar_category === "Stakeholder" ||
                          d.pillar_category === "Teknis",
                      );
                      const actionDetail = targetPerspective.details?.find(
                        (d: any) =>
                          d.pillar_category === "Action" ||
                          d.pillar_category === "Etika",
                      );
                      const impactDetail = targetPerspective.details?.find(
                        (d: any) => d.pillar_category === "Impact",
                      );

                      const sh =
                        stakeholderDetail?.content ||
                        stakeholderDetail?.text_content ||
                        targetPerspective.details?.[0]?.content ||
                        targetPerspective.details?.[0]?.text_content ||
                        "";
                      const ac =
                        actionDetail?.content ||
                        actionDetail?.text_content ||
                        targetPerspective.details?.[1]?.content ||
                        targetPerspective.details?.[1]?.text_content ||
                        "";
                      const im =
                        impactDetail?.content ||
                        impactDetail?.text_content ||
                        targetPerspective.details?.[2]?.content ||
                        targetPerspective.details?.[2]?.text_content ||
                        "";

                      const detailsText = `[STAKEHOLDER]: ${sh}\n\n[ACTION]: ${ac}\n\n[IMPACT]: ${im}`;

                      userPerspectives.push({
                        id: String(targetPerspective.ID),
                        caseId: String(c.id),
                        caseTitle: c.title,
                        category: category,
                        answeredAt: formattedDate,
                        snippetArgument: detailsText,
                      });
                    }
                  }
                }
              } catch (err) {
                console.error(`Gagal mengambil perspektif kasus ${c.id}:`, err);
              }
            }
          }

          if (targetUserFound) {
            activeUser = {
              id: targetUserFound.id,
              name: targetUserFound.name,
              username: targetUserFound.username,
              is_private: targetUserFound.is_private,
              role: targetUserFound.role,
            };
          } else {
            activeUser = {
              name: "Analis Anonim",
              username: "anonim",
              is_private: true,
            };
          }
        }

        setProfile(activeUser);
        setRiwayatDiskusi(userPerspectives);

        // Kalkulasi dinamis statistik dan Points (+50 jika buat & jawab, +25 jika jawab orang lain)
        let calculatedPoints = 0;
        userPerspectives.forEach((rp) => {
          const correspondingCase = casesList.find(
            (c: any) => String(c.id) === rp.caseId,
          );
          if (correspondingCase) {
            const isOwnCase = correspondingCase.user_id === currentUserId;
            calculatedPoints += isOwnCase ? 50 : 25;
          } else {
            calculatedPoints += 25; // fallback
          }
        });

        // Load topics and compute progress
        let progressData: any[] = [];
        try {
          const topicsRes = await apiFetch("/topics");
          const topicsList = Array.isArray(topicsRes)
            ? topicsRes
            : topicsRes?.data || [];
          if (Array.isArray(topicsList) && Array.isArray(casesList)) {
            for (const t of topicsList) {
              const parts = (t.name || "").split("|");
              const displayName = parts[0] || "Topik Tanpa Nama";
              const icon = parts[1] || "📚";
              const topicKey = displayName.toLowerCase().replace(/\s+/g, "-");

              // Filter cases for this topic
              const matchedCases = casesList
                .filter(
                  (c: any) =>
                    c.type === "learning" &&
                    c.topics &&
                    c.topics.some((ct: any) => {
                      const ctParts = (ct.name || "").split("|");
                      const ctTitle = ctParts[0] || "";
                      const ctKey = ctTitle.toLowerCase().replace(/\s+/g, "-");
                      return ctKey === topicKey;
                    }),
                )
                .sort((a: any, b: any) => Number(a.id) - Number(b.id));

              if (matchedCases.length > 0) {
                // Calculate how many stages completed sequentially
                let completedCount = 0;
                for (let i = 0; i < matchedCases.length; i++) {
                  const caseId = matchedCases[i].id;
                  const localKey = `solved_case_${caseId}_${currentUserId}`;
                  const isSolved =
                    (typeof window !== "undefined" &&
                      localStorage.getItem(localKey) === "true") ||
                    userPerspectives.some(
                      (p) => String(p.caseId) === String(caseId),
                    );
                  if (isSolved) {
                    completedCount = i + 1;
                  } else {
                    break;
                  }
                }
                progressData.push({
                  topicId: topicKey,
                  displayName: displayName,
                  icon: icon,
                  completedStages: completedCount,
                  totalStages: matchedCases.length,
                });
              }
            }
          }
        } catch (topicErr) {
          console.error("Gagal memuat data progress belajar:", topicErr);
        }
        setLearningProgress(progressData);

        const solvedCount = userPerspectives.length;

        setStats({
          casesSolved: solvedCount,
          casesCreated: casesCreatedCount,
          totalXp: calculatedPoints,
        });
      } catch (err: any) {
        console.error("Gagal memuat data profil:", err);
        setError(err.message || "Gagal menyinkronkan data dengan server.");
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, [userIdParam, isOwnProfile]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
    router.refresh();
  };

  const toggleSaveKasus = async (id: string) => {
    const isSaved = savedKasusIds.includes(id);
    let updatedSaved: string[];
    if (isSaved) {
      updatedSaved = savedKasusIds.filter((savedId) => savedId !== id);
    } else {
      updatedSaved = [...savedKasusIds, id];
    }
    setSavedKasusIds(updatedSaved);
    localStorage.setItem("unravel_saved_cases", JSON.stringify(updatedSaved));

    try {
      if (isSaved) {
        // DELETE api/bookmarks/{case_id}
        await apiFetch(`/bookmarks/${id}`, {
          method: "DELETE",
        });
      } else {
        // POST api/bookmarks
        await apiFetch("/bookmarks", {
          method: "POST",
          body: JSON.stringify({
            case_id: parseInt(id, 10),
          }),
        });
      }
    } catch (err) {
      console.error("Gagal menyinkronkan bookmark dengan server:", err);
      // Kembalikan ke state semula jika API gagal
      setSavedKasusIds(savedKasusIds);
      localStorage.setItem(
        "unravel_saved_cases",
        JSON.stringify(savedKasusIds),
      );
    }
  };

  const savedCases = allCases.filter((c: any) =>
    savedKasusIds.includes(String(c.id)),
  );

  // Logika override nama jika Anonymous Mode aktif
  const isAnonymous = profile?.is_private && !isOwnProfile;
  const displayName = isAnonymous ? "Analis Anonim" : profile?.name || "Analis";
  const displayUsername = isAnonymous
    ? "anonim"
    : profile?.username || "username";
  const displayAvatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-neogrid text-black font-sans selection:bg-indigo-650 selection:text-white">
      {/* NAVBAR HEADER */}
      <nav className="w-full border-b-4 border-black bg-white sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 flex items-center justify-center">
              <img src="/logo.svg" alt="Logo" className="w-16 h-16" />
            </div>
            <a
              href="/"
              className="font-black text-lg tracking-tight text-black hover:text-[#00BC7D] transition-colors"
            >
              Unravel
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/diskusi"
              className="text-xs font-black uppercase tracking-wider text-slate-500 hover:text-[#00BC7D] transition-colors hidden md:inline"
            >
              Mode Diskusi
            </Link>
            <Link
              href="/belajar"
              className="text-xs font-black uppercase tracking-wider text-slate-500 hover:text-[#00BC7D] transition-colors hidden md:inline"
            >
              Mode Belajar
            </Link>
            <NotificationBell />
            {isOwnProfile ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 border-2 border-black rounded-xl text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer whitespace-nowrap"
              >
                <span className="hidden sm:inline">Keluar Account</span>
                <span className="sm:hidden">Keluar</span>
              </button>
            ) : (
              <Link
                href="/diskusi"
                className="px-3 py-1.5 bg-white border-2 border-black hover:bg-slate-50 text-black rounded-xl text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all whitespace-nowrap"
              >
                <span className="hidden sm:inline">Kembali ke Forum</span>
                <span className="sm:hidden">Kembali</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10">
        {loading ? (
          <div className="w-full py-32 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#00BC7D] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              Memuat Berkas Profil...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-xs font-semibold flex items-center justify-center gap-2 max-w-xl mx-auto">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* ================= SISI KIRI: IDENTITAS & STATS ================= */}
            <section className="md:col-span-4 space-y-6">
              <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_#000] space-y-6 relative">
                {/* TOMBOL PENGATURAN PRIVASI (GEAR) */}
                {isOwnProfile && (
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="absolute top-4 right-4 text-black hover:bg-slate-50 transition-all p-1.5 rounded-lg border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none flex items-center justify-center cursor-pointer"
                    title="Pengaturan Profil"
                  >
                    <Settings size={14} />
                  </button>
                )}

                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-[#FDEDEC] border-2 border-black flex items-center justify-center text-2xl shadow-[3px_3px_0px_#000] select-none font-black text-black">
                    {displayAvatarLetter}
                  </div>
                  <div>
                    {/* DYNAMIC DATA DARI DATABASE */}
                    <h2 className="text-lg font-black tracking-tight text-slate-900 font-serif flex items-center justify-center gap-1.5">
                      {displayName}
                      {profile?.is_private && isOwnProfile && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-slate-100 border-2 border-black text-slate-700 shadow-[1px_1px_0px_#000] select-none">
                          Anonim (Aktif)
                        </span>
                      )}
                    </h2>
                    <p className="text-xs font-bold text-slate-500">
                      @{displayUsername}
                    </p>
                  </div>
                  {profile?.role === "admin" && isOwnProfile && (
                    <Link
                      href="/admin"
                      className="w-full text-center py-2.5 bg-black hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all mt-2"
                    >
                      Panel Admin
                    </Link>
                  )}
                </div>
              </div>

              {/* MATRIKS RINGKASAN KONTRIBUSI */}
              <div className="bg-white border-2 border-black p-5 rounded-3xl shadow-[4px_4px_0px_#000] space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Papan Pencapaian Analis
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-emerald-50/50 border-2 border-black rounded-2xl p-3 text-center shadow-[2px_2px_0px_#000]">
                    <span className="block text-xl font-black text-[#00BC7D] font-serif">
                      {stats.casesSolved}
                    </span>
                    <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wide">
                      Kasus Dijawab
                    </span>
                  </div>
                  <div className="bg-emerald-50/50 border-2 border-black rounded-2xl p-3 text-center shadow-[2px_2px_0px_#000]">
                    <span className="block text-xl font-black text-emerald-750 font-serif">
                      {stats.casesCreated}
                    </span>
                    <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wide">
                      Kasus Dibuat
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white border-2 border-black rounded-xl p-2.5 text-center text-[10px] font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                  Total Skor:{" "}
                  <span className="text-[#00BC7D] font-black">
                    {stats.totalXp} Points
                  </span>
                </div>
              </div>
            </section>

            {/* ================= SISI KANAN: TAB CONTENT RIWAYAT ================= */}
            <section className="md:col-span-8 space-y-6">
              <div className="flex items-center gap-2 p-1.5 bg-white border-2 border-black rounded-2xl w-fit shadow-[3px_3px_0px_#000]">
                <button
                  onClick={() => setActiveTab("diskusi")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "diskusi"
                      ? "bg-[#FDEDEC] border-2 border-black text-indigo-650 shadow-[1.5px_1.5px_0px_#000]"
                      : "text-slate-550 hover:text-black border-2 border-transparent"
                  }`}
                >
                  <span className="hidden sm:inline">Jawaban Diskusi</span>
                  <span className="sm:hidden">Diskusi</span>
                </button>
                <button
                  onClick={() => setActiveTab("belajar")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "belajar"
                      ? "bg-emerald-100 border-2 border-black text-emerald-800 shadow-[1.5px_1.5px_0px_#000]"
                      : "text-slate-550 hover:text-black border-2 border-transparent"
                  }`}
                >
                  <span className="hidden sm:inline">Progres Belajar</span>
                  <span className="sm:hidden">Belajar</span>
                </button>
                <button
                  onClick={() => setActiveTab("disimpan")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "disimpan"
                      ? "bg-amber-100 border-2 border-black text-amber-800 shadow-[1.5px_1.5px_0px_#000]"
                      : "text-slate-550 hover:text-black border-2 border-transparent"
                  }`}
                >
                  <span className="hidden sm:inline">Kasus Disimpan</span>
                  <span className="sm:hidden">Disimpan</span>
                </button>
              </div>

              {/* 1. TAB JAWABAN DISKUSI DYNAMIC */}
              {activeTab === "diskusi" && (
                <div className="space-y-4">
                  {riwayatDiskusi.length === 0 ? (
                    <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-xs font-medium text-slate-400">
                      {isOwnProfile
                        ? "Kamu belum pernah memberikan argumen jawaban studi kasus di forum."
                        : "Analis ini belum pernah memberikan argumen jawaban publik di forum."}
                    </div>
                  ) : (
                    riwayatDiskusi.map((riwayat) => {
                      const parsed = parseCombinedArgument(
                        riwayat.snippetArgument,
                      );
                      const hasPillars = parsed.stakeholder || parsed.action;

                      return (
                        <div
                          key={riwayat.id}
                          className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm hover:border-emerald-500 transition-all space-y-3 group"
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 font-black uppercase tracking-wider rounded">
                              {riwayat.category.split("|")[0] || "Umum"}
                            </span>
                            <span className="font-medium text-slate-400">
                              Dijawab pada {riwayat.answeredAt}
                            </span>
                          </div>
                          <div className="space-y-1 text-left">
                            <h3 className="text-sm font-black text-slate-900 font-serif leading-snug group-hover:text-[#00BC7D] transition-colors">
                              {riwayat.caseTitle}
                            </h3>
                            {hasPillars ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                  <span className="block text-[8px] font-black uppercase  tracking-wider">
                                    1. Stakeholder Utama
                                  </span>
                                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                                    {parsed.stakeholder}
                                  </p>
                                </div>
                                <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                  <span className="block text-[8px] font-black uppercase tracking-wider">
                                    2. Rencana Tindakan
                                  </span>
                                  <p className="text-xs font-medium text-slate-600 mt-0.5 whitespace-pre-line leading-relaxed">
                                    {parsed.action}
                                  </p>
                                </div>
                                <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                  <span className="block text-[8px] font-black uppercase tracking-wider">
                                    3. Prediksi Dampak
                                  </span>
                                  <p className="text-xs font-medium text-slate-600 mt-0.5 whitespace-pre-line leading-relaxed">
                                    {parsed.impact}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <blockquote className="text-xs font-medium text-slate-500 bg-slate-50 border-l-4 border-slate-300 p-3 rounded-r-xl italic leading-relaxed">
                                "{riwayat.snippetArgument}"
                              </blockquote>
                            )}
                          </div>
                          <div className="pt-2 flex justify-end">
                            <Link
                              href={`/diskusi/${riwayat.caseId}`}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-[#00BC7D] rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
                            >
                              Buka Riwayat Diskusi Utuh →
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* 2. TAB PROGRES BELAJAR DYNAMIC */}
              {activeTab === "belajar" && (
                <div className="space-y-4">
                  {learningProgress.length === 0 ? (
                    <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl text-center space-y-2 shadow-sm py-12">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Belum Ada Progres Belajar
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">
                        {isOwnProfile
                          ? "Kamu belum memulai modul kuis berbasis Topik. Silakan pilih salah satu tema untuk mulai memecahkan kuis linear."
                          : "Analis ini belum memiliki progres belajar kuis."}
                      </p>
                      {isOwnProfile && (
                        <div className="pt-2">
                          <Link
                            href="/belajar"
                            className="inline-block text-xs font-black text-[#00BC7D] hover:underline"
                          >
                            Pilih Tema Belajar →
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {learningProgress.map((topic) => {
                        const pct = Math.round(
                          (topic.completedStages / topic.totalStages) * 100,
                        );
                        const isFullyCompleted =
                          topic.completedStages === topic.totalStages;

                        return (
                          <div
                            key={topic.topicId}
                            className="bg-white border-2 border-slate-200 p-5 rounded-2xl flex flex-col justify-between min-h-[160px] transition-all hover:border-slate-300 hover:shadow-md relative"
                          >
                            <div className="space-y-3 text-left">
                              <div className="flex items-center gap-3">
                                <span className="text-slate-700 flex-shrink-0 flex items-center justify-center bg-slate-100 p-2 rounded-xl border border-slate-200 shadow-sm">
                                  <DynamicIcon emoji={topic.icon} size={18} />
                                </span>
                                <div>
                                  <h4 className="text-sm font-extrabold text-slate-900 font-serif leading-none">
                                    {topic.displayName}
                                  </h4>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                                    Topik Modul
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                  <span>Progres Level</span>
                                  <span
                                    className={
                                      isFullyCompleted
                                        ? "text-emerald-600 font-black"
                                        : "text-indigo-650 font-black"
                                    }
                                  >
                                    {topic.completedStages} /{" "}
                                    {topic.totalStages} Level ({pct}%)
                                  </span>
                                </div>
                                {/* Progress Bar Container */}
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isFullyCompleted
                                        ? "bg-emerald-500"
                                        : "bg-indigo-600"
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                              <Link
                                href={`/belajar/${topic.topicId}`}
                                className={`px-3 py-1.5 border-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                                  isOwnProfile
                                    ? "bg-slate-900 hover:bg-slate-800 text-white border-slate-900 hover:-translate-y-0.5"
                                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                                }`}
                              >
                                {isOwnProfile
                                  ? "Lanjutkan Belajar →"
                                  : "Lihat Jalur Belajar →"}
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 3. TAB KASUS DISIMPAN DYNAMIC */}
              {activeTab === "disimpan" && (
                <div className="space-y-4">
                  {!isOwnProfile ? (
                    <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-xs font-medium text-slate-400">
                      Penyimpanan luring analis ini bersifat privat.
                    </div>
                  ) : savedCases.length === 0 ? (
                    <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-xs font-medium text-slate-400">
                      Belum ada kasus yang Anda simpan. Klik ikon penanda
                      bintang di mode diskusi untuk menambahkan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {savedCases.map((kasus) => {
                        const isSaved = savedKasusIds.includes(
                          String(kasus.id),
                        );
                        return (
                          <div
                            key={kasus.id}
                            className="bg-white border-2 border-slate-200 p-5 rounded-2xl flex flex-col justify-between min-h-[180px] transition-all hover:shadow-[4px_4px_0px_0px_rgba(196,30,58,0.3)] hover:border-[#00BC7D] hover:-translate-y-0.5 group relative"
                          >
                            <div className="space-y-2 text-left">
                              <div className="flex justify-between items-center pr-6">
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded shadow-sm bg-red-50 border-red-100 text-red-600">
                                  {kasus.topics && kasus.topics.length > 0
                                    ? kasus.topics[0].name.split("|")[0]
                                    : "Diskusi Umum"}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  @{kasus.name || kasus.username || "analis"}
                                </span>
                              </div>

                              {isOwnProfile && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleSaveKasus(String(kasus.id))
                                  }
                                  title={
                                    isSaved
                                      ? "Hapus dari simpanan"
                                      : "Simpan studi kasus"
                                  }
                                  className={`absolute right-4 top-4 text-xs p-1.5 rounded-lg border transition-all hover:scale-110 flex items-center justify-center ${
                                    isSaved
                                      ? "bg-amber-500 border-amber-600 text-white shadow-sm"
                                      : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600"
                                  }`}
                                >
                                  <Star
                                    size={12}
                                    fill={isSaved ? "currentColor" : "none"}
                                  />
                                </button>
                              )}

                              <h3 className="text-sm font-black text-slate-900 font-serif tracking-tight leading-snug group-hover:text-[#00BC7D] transition-colors pt-1">
                                {kasus.title}
                              </h3>
                              <p className="text-[11px] font-medium text-slate-600 line-clamp-3 leading-relaxed">
                                {kasus.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                              <Link
                                href={`/diskusi/${kasus.id}`}
                                className="px-3 py-1.5 bg-slate-50 border-2 border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-[#00BC7D] rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
                              >
                                Buka Kasus
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* SETTINGS PRIVACY MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-xl max-w-sm w-full space-y-5 text-left">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 font-serif">
                Pengaturan Akun
              </h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Sesuaikan visibilitas identitas profil Anda bagi analis lainnya.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                Visibilitas Profil
              </span>

              <div className="flex bg-slate-50 border-2 border-slate-200 p-1 rounded-2xl text-[10px] font-black uppercase tracking-wider select-none">
                <button
                  type="button"
                  onClick={() => setSelectedPrivacy(false)}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    !selectedPrivacy
                      ? "bg-[#00BC7D] text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPrivacy(true)}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    selectedPrivacy
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Anonymous
                </button>
              </div>

              <div className="text-[10px] font-medium leading-relaxed p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                {!selectedPrivacy ? (
                  <p className="text-slate-500">
                    <span className="font-bold text-[#00BC7D]">Publik:</span>{" "}
                    Nama asli Anda dan ulasan publik terlihat di profil Anda
                    oleh analis lain.
                  </p>
                ) : (
                  <p className="text-slate-500">
                    <span className="font-bold text-slate-700">Anonymous:</span>{" "}
                    Semua ulasan Anda tetap bisa diakses, tetapi nama profil
                    Anda akan ditampilkan sebagai{" "}
                    <span className="font-bold">Analis Anonim</span> bagi analis
                    lain.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                disabled={savingPrivacy}
                className="flex-1 py-2.5 border-2 border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setSavingPrivacy(true);
                    const updateRes = await apiFetch("/profile", {
                      method: "PUT",
                      body: JSON.stringify({
                        is_private: selectedPrivacy,
                      }),
                    });
                    const updatedData = updateRes?.data || updateRes;
                    if (updatedData) {
                      setProfile((prev) =>
                        prev
                          ? { ...prev, is_private: updatedData.is_private }
                          : null,
                      );
                    }
                    setShowSettingsModal(false);
                  } catch (err: any) {
                    alert("Gagal memperbarui pengaturan: " + err.message);
                  } finally {
                    setSavingPrivacy(false);
                  }
                }}
                disabled={savingPrivacy}
                className="flex-1 py-2.5 bg-[#00BC7D] hover:bg-[#00BC7D]/90 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {savingPrivacy ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#00BC7D] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Memuat Berkas Profil...
          </p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
