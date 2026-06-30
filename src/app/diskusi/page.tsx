"use client";

import React, { useState, useEffect } from "react";
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

interface Topic {
  id: number;
  name: string;
}

interface StudiKasus {
  id: string;
  title: string;
  description: string;
  type: "learning" | "general";
  logic_blocks?: LogicBlock[];
  name?: string;
  username?: string;
  user_id?: number;
  topics?: Topic[];
  perspectivesCount?: number;
}

export default function DaftarKasusPage() {
  const [kasusList, setKasusList] = useState<StudiKasus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();

  // Opsi Filter & Bookmark Lokal
  const [filterType, setFilterType] = useState<"terbaru" | "populer" | "disimpan">("terbaru");
  const [savedKasusIds, setSavedKasusIds] = useState<string[]>([]);

  // State untuk Filter Topik
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");

  // Load list topik untuk filter
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsRes = await apiFetch("/topics");
        const list = Array.isArray(topicsRes) ? topicsRes : (topicsRes?.data || []);
        if (Array.isArray(list)) {
          setTopics(list);
        }
      } catch (err) {
        console.error("Gagal mengambil list topik:", err);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchDaftarKasus = async () => {
      try {
        setLoading(true);
        setError("");

        // Menembak endpoint GET /api/cases asli dari Azure BE
        const data = await apiFetch("/cases");
        
        let casesListRaw: StudiKasus[] = [];
        // 🌟 SINKRONISASI PENGAMAN DATA: Memastikan data yang disimpan ke state selalu berupa Array
        if (Array.isArray(data)) {
          casesListRaw = data;
        } else if (data && Array.isArray(data.cases)) {
          casesListRaw = data.cases;
        } else if (data && Array.isArray(data.data)) {
          casesListRaw = data.data;
        }

        // Ambil jumlah tanggapan (perspektif) untuk setiap kasus bertipe general secara paralel
        const generalCases = casesListRaw.filter((c: any) => c.type === "general");
        const casesWithCounts = await Promise.all(
          generalCases.map(async (c) => {
            try {
              const perspectives = await apiFetch(`/cases/${c.id}/perspectives`);
              const count = Array.isArray(perspectives) ? perspectives.length : 0;
              return { ...c, perspectivesCount: count };
            } catch {
              return { ...c, perspectivesCount: 0 };
            }
          })
        );

        setKasusList(casesWithCounts);

        // Memuat data bookmark lokal sementara dari localStorage jika ada
        const savedBookmarks = localStorage.getItem("unravel_saved_cases");
        if (savedBookmarks) {
          setSavedKasusIds(JSON.parse(savedBookmarks));
        }
      } catch (err: any) {
        console.error("Gagal mengambil daftar kasus dari server:", err);
        setError(err.message || "Gagal mengambil data dari server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDaftarKasus();
  }, []);

  // Toggling bookmark simpan studi kasus
  const toggleSaveKasus = (id: string) => {
    let updatedSaved: string[];
    if (savedKasusIds.includes(id)) {
      updatedSaved = savedKasusIds.filter((savedId) => savedId !== id);
    } else {
      updatedSaved = [...savedKasusIds, id];
    }
    setSavedKasusIds(updatedSaved);
    localStorage.setItem("unravel_saved_cases", JSON.stringify(updatedSaved));
  };

  // PROSES DATA: Memastikan forum diskusi publik HANYA menampilkan tipe "general"
  const getProcessedKasus = () => {
    // 🌟 SINKRONISASI PENGAMAN ARRAY: Double-check menghindari crash runtime di server
    const safeList = Array.isArray(kasusList) ? kasusList : [];

    // 1. Filter awal: Singkirkan tipe 'learning', ambil yang murni 'general'
    let result = safeList.filter((kasus) => kasus && kasus.type === "general");

    // 2. Filter berdasarkan topik yang dipilih jika ada
    if (selectedTopicId) {
      result = result.filter((kasus) => {
        if (!kasus.topics || !Array.isArray(kasus.topics)) return false;
        return kasus.topics.some((t) => String(t.id) === selectedTopicId);
      });
    }

    // 3. Jalankan pencarian teks keyword judul dan deskripsi
    result = result.filter((kasus) => {
      const matchesTitle = (kasus.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDesc = (kasus.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTitle || matchesDesc;
    });

    // 4. Klasifikasi berdasarkan tab filter dropdown aktif
    if (filterType === "terbaru") {
      result = [...result].sort((a, b) => Number(b.id) - Number(a.id));
    } else if (filterType === "populer") {
      result = [...result].sort((a, b) => (b.perspectivesCount || 0) - (a.perspectivesCount || 0));
    } else if (filterType === "disimpan") {
      result = result.filter((kasus) => savedKasusIds.includes(kasus.id));
    }

    return result;
  };

  const processedKasus = getProcessedKasus();

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 1. NAVBAR FORUM HEADER */}
      <nav className="w-full border-b-2 border-slate-200 bg-white sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <a href="/" className="font-black text-lg tracking-tight text-slate-900">
            Unravel<span className="text-indigo-600"> Discuss</span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 bg-slate-50 border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 transition-colors"
          >
            Beranda
          </Link>
          <NotificationBell />
        </div>
      </nav>

      {/* MAIN CONTAINER CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-6">
        {/* HEADER BARIS UTAMA */}
        <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight text-slate-900 font-serif">
              Urai dan Pecahkan Studi Kasus Global
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Cari topik studi kasus yang dibuat oleh analis lain atau ajukan problem benang kusut barumu sendiri.
            </p>
          </div>
          <button
            onClick={() => router.push("/diskusi/buat")}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(196,30,58,0.3)] shrink-0"
          >
            + Buat Studi Kasus Baru
          </button>
        </div>

        {/* CONTROLLER & INPUT PENCARIAN BAR */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <div className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-inner">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari studi kasus publik (ex: krisis air bersih, limbah urban, etika)..."
              className="w-full bg-transparent outline-none text-xs font-semibold text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* FILTER TOPIK */}
          <div className="relative shrink-0 flex items-stretch">
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-slate-200 hover:border-indigo-500 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-600 transition-colors focus:outline-none cursor-pointer shadow-sm min-w-[160px]"
            >
              <option value="">Semua Topik</option>
              {topics.map((t) => {
                const parts = t.name.split("|");
                const cleanName = parts[0] || "Topik";
                return (
                  <option key={t.id} value={t.id}>
                    {cleanName}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="relative shrink-0 flex items-stretch">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 bg-white border-2 border-slate-200 hover:border-indigo-500 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-600 transition-colors focus:outline-none cursor-pointer shadow-sm min-w-[150px]"
            >
              <option value="terbaru">Terbaru</option>
              <option value="populer">Paling Populer</option>
              <option value="disimpan">Kasus Disimpan</option>
            </select>
          </div>
        </div>

        {/* ERROR CONDITIONAL STATE */}
        {error && !loading && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-xs font-semibold text-center max-w-xl mx-auto">
            ⚠️ {error}
          </div>
        )}

        {/* AREA DAFTAR KASUS */}
        {loading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              Memuat diskusi...
            </p>
          </div>
        ) : processedKasus.length === 0 ? (
          <div className="w-full py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-2 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {filterType === "disimpan" ? "Belum ada kasus yang Anda simpan" : "Studi kasus tidak ditemukan"}
            </p>
            <p className="text-[11px] font-medium text-slate-400 max-w-xs mx-auto">
              {filterType === "disimpan" &&
                "Klik ikon penanda di pojok kanan kartu studi kasus untuk menyimpan referensi belajar nanti."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {processedKasus.map((kasus) => {
              const isSaved = savedKasusIds.includes(kasus.id);

              return (
                <div
                  key={kasus.id}
                  className="bg-white border-2 border-slate-200 p-5 rounded-2xl flex flex-col justify-between min-h-[180px] transition-all hover:shadow-[4px_4px_0px_0px_rgba(196,30,58,0.3)] hover:border-indigo-400 hover:-translate-y-0.5 group relative"
                >
                  <div className="space-y-2">
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

                    {/* TOMBOL BOOKMARK */}
                    <button
                      type="button"
                      onClick={() => toggleSaveKasus(kasus.id)}
                      title={isSaved ? "Hapus dari simpanan" : "Simpan studi kasus"}
                      className={`absolute right-4 top-4 text-xs p-1.5 rounded-lg border transition-all hover:scale-110 ${
                        isSaved
                          ? "bg-amber-500 border-amber-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {isSaved ? "★" : "☆"}
                    </button>

                    <h3 className="text-sm font-black text-slate-900 font-serif tracking-tight leading-snug group-hover:text-indigo-600 transition-colors pt-1">
                      {kasus.title}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-600 line-clamp-3 leading-relaxed">
                      {kasus.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                    <Link
                      href={`/diskusi/${kasus.id}`}
                      className="px-3 py-1.5 bg-slate-50 border-2 border-slate-200 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
                    >
                      Buka Kasus
                    </Link>
                    <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                      💬 {kasus.perspectivesCount || 0} Tanggapan
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}