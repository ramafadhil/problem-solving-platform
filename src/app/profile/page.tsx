"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/utils/api";

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
  const stakeholderMatch = text.match(/\[STAKEHOLDER\]:\s*([\s\S]*?)(?=\n\n\[ACTION\]|$)/i);
  const actionMatch = text.match(/\[ACTION\]:\s*([\s\S]*?)(?=\n\n\[IMPACT\]|$)/i);
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

  const [activeTab, setActiveTab] = useState<"diskusi" | "belajar" | "disimpan">("diskusi");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [riwayatDiskusi, setRiwayatDiskusi] = useState<RiwayatJawaban[]>([]);
  const [stats, setStats] = useState({
    casesSolved: 0,
    casesCreated: 0,
    totalXp: 0
  });

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

        const casesRes = await apiFetch("/cases");
        const casesList = Array.isArray(casesRes) ? casesRes : (casesRes?.cases || casesRes?.data || []);

        if (isOwnProfile) {
          // 1. Profil Sendiri (Ambil dari /me)
          const userRes = await apiFetch("/me"); 
          const userData = userRes.data || userRes;
          activeUser = userData;
          setSelectedPrivacy(userData?.is_private || false);

          if (userData && Array.isArray(casesList)) {
            const userId = userData.id;
            
            // Hitung jumlah kasus yang dibuat oleh user saat ini
            casesCreatedCount = casesList.filter((c: any) => c.user_id === userId).length;
            
            for (const c of casesList) {
              try {
                const perspectives = await apiFetch(`/cases/${c.id}/perspectives`);
                if (Array.isArray(perspectives)) {
                  const myPerspective = perspectives.find((p: any) => p.UserID === userId);
                  if (myPerspective) {
                    const category = c.topics && c.topics.length > 0 ? c.topics[0].name : "Umum";
                    
                    const dateObj = new Date(myPerspective.created_at);
                    const formattedDate = dateObj.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    });
                    
                    const stakeholderDetail = myPerspective.details?.find((d: any) => d.pillar_category === "Stakeholder" || d.pillar_category === "Teknis");
                    const actionDetail = myPerspective.details?.find((d: any) => d.pillar_category === "Action" || d.pillar_category === "Etika");
                    const impactDetail = myPerspective.details?.find((d: any) => d.pillar_category === "Impact");
                    
                    const sh = stakeholderDetail?.content || stakeholderDetail?.text_content || myPerspective.details?.[0]?.content || myPerspective.details?.[0]?.text_content || "";
                    const ac = actionDetail?.content || actionDetail?.text_content || myPerspective.details?.[1]?.content || myPerspective.details?.[1]?.text_content || "";
                    const im = impactDetail?.content || impactDetail?.text_content || myPerspective.details?.[2]?.content || myPerspective.details?.[2]?.text_content || "";
                    
                    const detailsText = `[STAKEHOLDER]: ${sh}\n\n[ACTION]: ${ac}\n\n[IMPACT]: ${im}`;
                    
                    userPerspectives.push({
                      id: String(myPerspective.ID),
                      caseId: String(c.id),
                      caseTitle: c.title,
                      category: category,
                      answeredAt: formattedDate,
                      snippetArgument: detailsText
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
          let targetUserFound: any = null;

          if (Array.isArray(casesList)) {
            // Hitung kasus yang dibuat target user
            casesCreatedCount = casesList.filter((c: any) => c.user_id === targetUserId).length;

            for (const c of casesList) {
              try {
                const perspectives = await apiFetch(`/cases/${c.id}/perspectives`);
                if (Array.isArray(perspectives)) {
                  const targetPerspective = perspectives.find((p: any) => p.UserID === targetUserId);
                  if (targetPerspective) {
                    if (!targetUserFound && targetPerspective.user) {
                      targetUserFound = targetPerspective.user;
                    }

                    // Hanya tampilkan jika public
                    if (targetPerspective.is_public) {
                      const category = c.topics && c.topics.length > 0 ? c.topics[0].name : "Umum";
                      
                      const dateObj = new Date(targetPerspective.created_at);
                      const formattedDate = dateObj.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      });
                      
                      const stakeholderDetail = targetPerspective.details?.find((d: any) => d.pillar_category === "Stakeholder" || d.pillar_category === "Teknis");
                      const actionDetail = targetPerspective.details?.find((d: any) => d.pillar_category === "Action" || d.pillar_category === "Etika");
                      const impactDetail = targetPerspective.details?.find((d: any) => d.pillar_category === "Impact");
                      
                      const sh = stakeholderDetail?.content || stakeholderDetail?.text_content || targetPerspective.details?.[0]?.content || targetPerspective.details?.[0]?.text_content || "";
                      const ac = actionDetail?.content || actionDetail?.text_content || targetPerspective.details?.[1]?.content || targetPerspective.details?.[1]?.text_content || "";
                      const im = impactDetail?.content || impactDetail?.text_content || targetPerspective.details?.[2]?.content || targetPerspective.details?.[2]?.text_content || "";
                      
                      const detailsText = `[STAKEHOLDER]: ${sh}\n\n[ACTION]: ${ac}\n\n[IMPACT]: ${im}`;
                      
                      userPerspectives.push({
                        id: String(targetPerspective.ID),
                        caseId: String(c.id),
                        caseTitle: c.title,
                        category: category,
                        answeredAt: formattedDate,
                        snippetArgument: detailsText
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
              role: targetUserFound.role
            };
          } else {
            activeUser = {
              name: "Analis Anonim",
              username: "anonim",
              is_private: true
            };
          }
        }

        setProfile(activeUser);
        setRiwayatDiskusi(userPerspectives);

        // Kalkulasi dinamis statistik
        const solvedCount = userPerspectives.length;
        const calculatedXp = (solvedCount * 100) + (casesCreatedCount * 50);
        
        setStats({
          casesSolved: solvedCount,
          casesCreated: casesCreatedCount,
          totalXp: calculatedXp
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

  // Logika override nama jika Anonymous Mode aktif
  const isAnonymous = profile?.is_private && !isOwnProfile;
  const displayName = isAnonymous ? "Analis Anonim" : (profile?.name || "Analis");
  const displayUsername = isAnonymous ? "anonim" : (profile?.username || "username");
  const displayAvatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* NAVBAR HEADER */}
      <nav className="w-full border-b-2 border-slate-200 bg-white sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-sm">
        <Link href="/" className="font-black text-lg tracking-tight text-slate-900">
          Unravel
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/diskusi" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            Mode Diskusi
          </Link>
          <Link href="/belajar" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            Mode Belajar
          </Link>
          {isOwnProfile ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors border border-red-200"
            >
              Keluar Account
            </button>
          ) : (
            <Link
              href="/diskusi"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors border border-slate-200"
            >
              Kembali ke Forum
            </Link>
          )}
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10">
        {loading ? (
          <div className="w-full py-32 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Memuat Berkas Profil...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-xs font-semibold text-center max-w-xl mx-auto">
            ⚠️ {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ================= SISI KIRI: IDENTITAS & STATS ================= */}
            <section className="lg:col-span-4 space-y-6">
              <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-6 relative">
                
                {/* TOMBOL PENGATURAN PRIVASI (GEAR) */}
                {isOwnProfile && (
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-indigo-600 transition-colors p-1.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white text-xs select-none"
                    title="Pengaturan Profil"
                  >
                    ⚙️
                  </button>
                )}

                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-600 flex items-center justify-center text-2xl shadow-inner select-none font-black text-indigo-600">
                    {displayAvatarLetter}
                  </div>
                  <div>
                    {/* DYNAMIC DATA DARI DATABASE */}
                    <h2 className="text-lg font-black tracking-tight text-slate-900 font-serif flex items-center justify-center gap-1.5">
                      {displayName}
                      {profile?.is_private && isOwnProfile && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-600 select-none">
                          Anonim (Aktif)
                        </span>
                      )}
                    </h2>
                    <p className="text-xs font-semibold text-slate-400">@{displayUsername}</p>
                  </div>
                  {profile?.role === "admin" && isOwnProfile && (
                    <Link
                      href="/admin"
                      className="w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors mt-2"
                    >
                    Panel Admin
                    </Link>
                  )}
                </div>
              </div>

              {/* MATRIKS RINGKASAN KONTRIBUSI */}
              <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Papan Pencapaian Analis</h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 text-center">
                    <span className="block text-xl font-black text-indigo-600 font-serif">{stats.casesSolved}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kasus Dijawab</span>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 text-center">
                    <span className="block text-xl font-black text-emerald-600 font-serif">{stats.casesCreated}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kasus Dibuat</span>
                  </div>
                </div>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Skor: <span className="text-indigo-600 font-black">{stats.totalXp} Points</span>
                </div>
              </div>
            </section>

            {/* ================= SISI KANAN: TAB CONTENT RIWAYAT ================= */}
            <section className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200/40 rounded-2xl w-fit">
                <button
                  onClick={() => setActiveTab("diskusi")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === "diskusi" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Jawaban Diskusi
                </button>
                <button
                  onClick={() => setActiveTab("belajar")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === "belajar" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Progres Belajar
                </button>
                <button
                  onClick={() => setActiveTab("disimpan")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === "disimpan" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Kasus Disimpan
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
                      const parsed = parseCombinedArgument(riwayat.snippetArgument);
                      const hasPillars = parsed.stakeholder || parsed.action;

                      return (
                        <div
                          key={riwayat.id}
                          className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm hover:border-indigo-400 transition-all space-y-3 group"
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 font-black uppercase tracking-wider rounded">
                              {riwayat.category.split("|")[0] || "Umum"}
                            </span>
                            <span className="font-medium text-slate-400">Dijawab pada {riwayat.answeredAt}</span>
                          </div>
                          <div className="space-y-1 text-left">
                            <h3 className="text-sm font-black text-slate-900 font-serif leading-snug group-hover:text-indigo-600 transition-colors">
                              {riwayat.caseTitle}
                            </h3>
                            {hasPillars ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                  <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">1. Stakeholder Utama</span>
                                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{parsed.stakeholder}</p>
                                </div>
                                <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                  <span className="block text-[8px] font-black uppercase text-indigo-500 tracking-wider">2. Rencana Tindakan</span>
                                  <p className="text-xs font-medium text-slate-600 mt-0.5 whitespace-pre-line leading-relaxed">{parsed.action}</p>
                                </div>
                                <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                  <span className="block text-[8px] font-black uppercase text-emerald-500 tracking-wider">3. Prediksi Dampak</span>
                                  <p className="text-xs font-medium text-slate-600 mt-0.5 whitespace-pre-line leading-relaxed">{parsed.impact}</p>
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
                              className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
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

              {/* 2. TAB PROGRES BELAJAR PLACEHOLDER */}
              {activeTab === "belajar" && (
                <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl text-center space-y-2 shadow-sm py-12">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Jalur Linear Sedang Aktif</p>
                  <p className="text-[11px] font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {isOwnProfile 
                      ? "Kamu saat ini sedang menempuh modul berbasis Topik utama. Selesaikan rekonstruksi logika kuis pada peta jalur linear untuk memperbarui progres di sini."
                      : "Analis ini sedang menempuh modul linear berbasis Topik."}
                  </p>
                  {isOwnProfile && (
                    <div className="pt-2">
                      <Link href="/belajar" className="inline-block text-xs font-black text-indigo-600 hover:underline">
                        Lanjutkan Petualangan Belajar →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* 3. TAB KASUS DISIMPAN PLACEHOLDER */}
              {activeTab === "disimpan" && (
                <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center text-xs font-medium text-slate-400">
                  {isOwnProfile 
                    ? "Gumpalan referensi kasus yang kamu bintangi (★) akan terdaftar rapi pada klaster penyimpanan luring ini."
                    : "Penyimpanan luring analis ini bersifat privat."}
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
              <h3 className="text-sm font-black text-slate-900 font-serif">Pengaturan Akun</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Sesuaikan visibilitas identitas profil Anda bagi analis lainnya.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Visibilitas Profil</span>
              
              <div className="flex bg-slate-50 border-2 border-slate-200 p-1 rounded-2xl text-[10px] font-black uppercase tracking-wider select-none">
                <button
                  type="button"
                  onClick={() => setSelectedPrivacy(false)}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    !selectedPrivacy
                      ? "bg-indigo-600 text-white shadow-sm"
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
                    <span className="font-bold text-indigo-600">Publik:</span> Nama asli Anda dan ulasan publik terlihat di profil Anda oleh analis lain.
                  </p>
                ) : (
                  <p className="text-slate-500">
                    <span className="font-bold text-slate-700">Anonymous:</span> Semua ulasan Anda tetap bisa diakses, tetapi nama profil Anda akan ditampilkan sebagai <span className="font-bold">Analis Anonim</span> bagi analis lain.
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
                        is_private: selectedPrivacy
                      })
                    });
                    const updatedData = updateRes?.data || updateRes;
                    if (updatedData) {
                      setProfile(prev => prev ? { ...prev, is_private: updatedData.is_private } : null);
                    }
                    setShowSettingsModal(false);
                  } catch (err: any) {
                    alert("Gagal memperbarui pengaturan: " + err.message);
                  } finally {
                    setSavingPrivacy(false);
                  }
                }}
                disabled={savingPrivacy}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Memuat Berkas Profil...</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}