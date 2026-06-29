"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

// Interface untuk data profil user
interface UserProfile {
  name: string;
  username: string;
  email: string;
  stats: {
    casesSolved: number; // Jumlah kasus yang pernah dijawab
    casesCreated: number; // Jumlah kasus yang pernah dibuat
    totalXp: number;
  };
}

// Interface untuk riwayat jawaban diskusi user
interface RiwayatJawaban {
  id: string;
  caseId: string;
  caseTitle: string;
  category: string;
  answeredAt: string;
  snippetArgument: string; // Potongan jawaban yang pernah ditulis user
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"diskusi" | "belajar" | "disimpan">("diskusi");
  const [loading, setLoading] = useState(true);
  
  // Mock data profile & riwayat (Nanti otomatis diganti fetch saat BE Azure CORS ready)
  const [profile, setProfile] = useState<UserProfile>({
    name: "Rama",
    username: "ramaa_sftwr",
    email: "rama@mahasiswa.id",
    stats: {
      casesSolved: 12,
      casesCreated: 2,
      totalXp: 1450
    }
  });

  const [riwayatDiskusi, setRiwayatDiskusi] = useState<RiwayatJawaban[]>([
    {
      id: "ans-01",
      caseId: "kasus-ciliwung-01",
      caseTitle: "Ancaman Mikroplastik di Aliran Sungai Ciliwung",
      category: "Lingkungan",
      answeredAt: "25 Juni 2026",
      snippetArgument: "Menurut analisis kelompok kami, alur sebab-akibat terbesar berasal dari penumpukan limbah domestik hulu pabrik tekstil yang tidak menerapkan filter sekunder..."
    },
    {
      id: "ans-02",
      caseId: "kasus-politik-03",
      caseTitle: "Efektivitas Regulasi Batas Usia Minimum Pejabat Publik",
      category: "Politik",
      answeredAt: "18 Juni 2026",
      snippetArgument: "Intervensi regulasi hukum harusnya berbasis meritokrasi kompetensi objektif, bukan sekadar batasan angka yang membatasi hak politik pemuda..."
    }
  ]);

  useEffect(() => {
    // Jalankan simulasi loading penarikan data profile luring
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
    
    // NOTE INTEGRASI BE NANTI:
    // const getProfileData = async () => { ... fetch data ke /api/user/profile dan /api/user/responses ... }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* NAVBAR HEADER */}
      <nav className="w-full border-b-2 border-slate-200 bg-white sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-sm">
        <Link href="/" className="font-black text-lg tracking-tight text-slate-900">
          Unravel
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/diskusi" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            Forum Diskusi
          </Link>
          <Link href="/belajar" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            Mode Belajar
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors border border-red-200"
          >
            Keluar Account
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10">
        {loading ? (
          <div className="w-full py-32 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Memuat Berkas Profil...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ================= SISI KIRI: IDENTITAS & STATS (4 Kolom) ================= */}
            <section className="lg:col-span-4 space-y-6">
              {/* KARTU PROFIL UTAMA */}
              <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-6 relative">
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Avatar Bulat Bawaan */}
                  <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-600 flex items-center justify-center text-2xl shadow-inner select-none font-black text-indigo-600">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 font-serif">{profile.name}</h2>
                    <p className="text-xs font-semibold text-slate-400">@{profile.username}</p>
                  </div>
                </div>

                {/* BUTTON EDIT ACTION
                <button className="w-full py-2 bg-slate-50 border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-600 transition-all">
                  Edit Profil Detail
                </button> */}
              </div>

              {/* MATRIKS RINGKASAN KONTRIBUSI */}
              <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Papan Pencapaian Analis</h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 text-center">
                    <span className="block text-xl font-black text-indigo-600 font-serif">{profile.stats.casesSolved}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kasus Dijawab</span>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 text-center">
                    <span className="block text-xl font-black text-emerald-600 font-serif">{profile.stats.casesCreated}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kasus Dibuat</span>
                  </div>
                </div>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  ⚡ Total Skor: <span className="text-indigo-600 font-black">{profile.stats.totalXp} XP</span>
                </div>
              </div>
            </section>

            {/* ================= SISI KANAN: TAB CONTENT RIWAYAT (8 Kolom) ================= */}
            <section className="lg:col-span-8 space-y-6">
              {/* TAB SWITCHER */}
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

              {/* RENDER KONTEN TAB: 1. JAWABAN DISKUSI */}
              {activeTab === "diskusi" && (
                <div className="space-y-4">
                  {riwayatDiskusi.length === 0 ? (
                    <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-xs font-medium text-slate-400">
                      Kamu belum pernah memberikan argumen jawaban studi kasus di forum.
                    </div>
                  ) : (
                    riwayatDiskusi.map((riwayat) => (
                      <div
                        key={riwayat.id}
                        className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm hover:border-indigo-400 transition-all space-y-3 group"
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 font-black uppercase tracking-wider rounded">
                            {riwayat.category}
                          </span>
                          <span className="font-medium text-slate-400">Dijawab pada {riwayat.answeredAt}</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-slate-900 font-serif leading-snug group-hover:text-indigo-600 transition-colors">
                            {riwayat.caseTitle}
                          </h3>
                          <blockquote className="text-xs font-medium text-slate-500 bg-slate-50 border-l-4 border-slate-300 p-3 rounded-r-xl italic leading-relaxed">
                            "{riwayat.snippetArgument}"
                          </blockquote>
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
                    ))
                  )}
                </div>
              )}

              {/* RENDER KONTEN TAB: 2. PROGRES BELAJAR (PLACEHOLDER MOCK) */}
              {activeTab === "belajar" && (
                <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl text-center space-y-2 shadow-sm py-12">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Jalur Linear Sedang Aktif</p>
                  <p className="text-[11px] font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Kamu saat ini sedang menempuh Level 2 pada modul Tema Lingkungan Hidup. Selesaikan teka-teki drag-and-drop untuk memperbarui rapor pencapaian di sini.
                  </p>
                  <div className="pt-2">
                    <Link href="/belajar" className="inline-block text-xs font-black text-indigo-600 hover:underline">
                      Lanjutkan Petualangan Belajar →
                    </Link>
                  </div>
                </div>
              )}

              {/* RENDER KONTEN TAB: 3. KASUS DISIMPAN (BOOKMARK PLACEHOLDER) */}
              {activeTab === "disimpan" && (
                <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center text-xs font-medium text-slate-400">
                  Gumpalan referensi kasus yang kamu bintangi (★) akan terdaftar rapi pada klaster penyimpanan luring ini.
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}