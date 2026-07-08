"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import {
  Star,
  MessageSquare,
  AlertTriangle,
  User,
  Lock,
  BookOpen,
} from "lucide-react";

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
  const [filterType, setFilterType] = useState<
    "terbaru" | "populer" | "disimpan"
  >("terbaru");
  const [savedKasusIds, setSavedKasusIds] = useState<string[]>([]);

  // State untuk Filter Topik
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");

  // State untuk gating akses mode diskusi (minimal 1 stage learning selesai)
  const [isLearningGated, setIsLearningGated] = useState<boolean>(false);
  const [gateChecked, setGateChecked] = useState<boolean>(false);

  // Cek apakah user sudah menyelesaikan minimal 1 stage mode belajar
  useEffect(() => {
    const checkLearningGate = async () => {
      console.log("[GATE] Memulai cek learning gate...");
      try {
        const profile = await apiFetch("/me");
        const user = profile?.data || profile;
        console.log("[GATE] User dari /me:", user);

        if (!user?.id) {
          console.log("[GATE] Tidak ada userId → TERKUNCI");
          setIsLearningGated(true);
          setGateChecked(true);
          return;
        }

        const userId = user.id;
        console.log("[GATE] userId:", userId);

        // Regex ketat: hanya cocok dengan format solved_case_<caseId>_<userId>
        // Mencegah false positive: solved_case_53 TIDAK cocok untuk userId=53
        // karena harus ada digit sebelum _<userId>: solved_case_\d+_53
        const strictKeyRegex = new RegExp(`^solved_case_\\d+_${userId}$`);

        // Log semua key localStorage yang relevan
        const allSolvedKeys = Object.keys(localStorage).filter((k) =>
          k.startsWith("solved_case_"),
        );
        console.log(
          "[GATE] Semua solved_case_* keys di localStorage:",
          allSolvedKeys,
        );

        const hasSolvedLocal = allSolvedKeys.some((key) => {
          const regexMatch = strictKeyRegex.test(key);
          const valueMatch = localStorage.getItem(key) === "true";
          const match = regexMatch && valueMatch;
          console.log(
            `[GATE] Key "${key}" → regex match: ${regexMatch}, value: ${localStorage.getItem(key)}, final: ${match}`,
          );
          return match;
        });

        console.log("[GATE] hasSolvedLocal:", hasSolvedLocal);

        if (hasSolvedLocal) {
          console.log("[GATE] Ditemukan di localStorage → BUKA AKSES");
          setIsLearningGated(false);
        } else {
          console.log(
            "[GATE] Tidak ditemukan di localStorage → Cek backend...",
          );
          const casesRes = await apiFetch("/cases");
          const casesList = Array.isArray(casesRes)
            ? casesRes
            : casesRes?.cases || casesRes?.data || [];
          const learningCases = Array.isArray(casesList)
            ? casesList.filter((c: any) => c.type === "learning")
            : [];
          console.log("[GATE] Jumlah learning cases:", learningCases.length);

          let hasSolvedBackend = false;
          for (const lCase of learningCases.slice(0, 10)) {
            try {
              const perspectives = await apiFetch(
                `/cases/${lCase.id}/perspectives`,
              );
              const list = Array.isArray(perspectives)
                ? perspectives
                : perspectives?.data || [];
              const userPerspective = Array.isArray(list)
                ? list.find(
                    (p: any) =>
                      Number(p.user_id || p.UserID) === Number(userId),
                  )
                : null;
              console.log(
                `[GATE] Case ${lCase.id}: ${list.length} perspectives, user match:`,
                userPerspective,
              );
              if (userPerspective) {
                hasSolvedBackend = true;
                localStorage.setItem(
                  `solved_case_${lCase.id}_${userId}`,
                  "true",
                );
                break;
              }
            } catch (e) {
              console.log(`[GATE] Error pada case ${lCase.id}:`, e);
            }
          }

          console.log(
            "[GATE] hasSolvedBackend:",
            hasSolvedBackend,
            "→ isLearningGated:",
            !hasSolvedBackend,
          );
          setIsLearningGated(!hasSolvedBackend);
        }
      } catch (err) {
        console.log("[GATE] Error tak terduga → TERKUNCI:", err);
        setIsLearningGated(true);
      } finally {
        setGateChecked(true);
      }
    };

    checkLearningGate();
  }, []);

  // Load list topik untuk filter
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsRes = await apiFetch("/topics");
        const list = Array.isArray(topicsRes)
          ? topicsRes
          : topicsRes?.data || [];
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
        const generalCases = casesListRaw.filter(
          (c: any) => c.type === "general",
        );
        const casesWithCounts = await Promise.all(
          generalCases.map(async (c) => {
            try {
              const perspectives = await apiFetch(
                `/cases/${c.id}/perspectives`,
              );
              const count = Array.isArray(perspectives)
                ? perspectives.length
                : 0;
              return { ...c, perspectivesCount: count };
            } catch {
              return { ...c, perspectivesCount: 0 };
            }
          }),
        );

        setKasusList(casesWithCounts);

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
        } catch (err) {
          console.error(
            "Gagal mengambil bookmarks dari server, fallback ke localStorage:",
            err,
          );
          const savedBookmarks = localStorage.getItem("unravel_saved_cases");
          if (savedBookmarks) {
            serverSavedIds = JSON.parse(savedBookmarks);
          }
        }
        setSavedKasusIds(serverSavedIds);
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
      const matchesTitle = (kasus.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesDesc = (kasus.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesTitle || matchesDesc;
    });

    // 4. Klasifikasi berdasarkan tab filter dropdown aktif
    if (filterType === "terbaru") {
      result = [...result].sort((a, b) => Number(b.id) - Number(a.id));
    } else if (filterType === "populer") {
      result = [...result].sort(
        (a, b) => (b.perspectivesCount || 0) - (a.perspectivesCount || 0),
      );
    } else if (filterType === "disimpan") {
      result = result.filter((kasus) => savedKasusIds.includes(kasus.id));
    }

    return result;
  };

  const processedKasus = getProcessedKasus();

  return (
    <div className="min-h-screen bg-neogrid text-black font-sans flex flex-col selection:bg-indigo-650 selection:text-white">
      {/* LEARNING GATE OVERLAY — Muncul jika belum selesaikan 1 stage learning */}
      {gateChecked && isLearningGated && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FFFDF9] border-[4px] border-black rounded-[24px] shadow-[10px_10px_0px_#000] w-full max-w-md mx-4 p-8 flex flex-col items-center gap-5 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Icon kunci */}
            <div className="w-16 h-16 rounded-2xl bg-[#FDE293] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_#000]">
              <Lock size={32} className="stroke-[2.5]" />
            </div>

            {/* Badge */}
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 border-2 border-black px-3 py-1 rounded-full shadow-[1.5px_1.5px_0px_#000]">
              Akses Terkunci
            </span>

            {/* Judul & Deskripsi */}
            <div className="space-y-2">
              <h2 className="text-xl font-black text-black">
                Mode Diskusi Belum Terbuka
              </h2>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                Kamu harus menyelesaikan minimal <strong>1 stage</strong> dari
                Mode Belajar terlebih dahulu sebelum bisa berdiskusi dengan
                komunitas.
              </p>
            </div>

            {/* Tip card */}
            <div className="w-full bg-indigo-50 border-2 border-black rounded-xl p-4 text-left shadow-[2px_2px_0px_#000]">
              <p className="text-[11px] font-black uppercase tracking-wider text-indigo-600 mb-1">
                Kenapa?
              </p>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                Mode diskusi akan jauh lebih bermakna ketika kamu sudah punya
                pemahaman dasar dari kasus-kasus di Mode Belajar.
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => router.push("/belajar")}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-650 hover:bg-indigo-700 text-white text-sm font-black border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
            >
              <BookOpen size={16} />
              Mulai Mode Belajar Sekarang
            </button>

            {/* Back link */}
            <button
              onClick={() => router.push("/")}
              className="text-xs font-bold text-slate-500 hover:text-black hover:underline cursor-pointer transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
      {/* 1. NAVBAR FORUM HEADER */}
      <nav className="w-full border-b-4 border-black bg-white sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 flex items-center justify-center">
              <img src="/logo.svg" alt="Logo" className="w-16 h-16" />
            </div>
            <a href="/" className="font-black text-lg tracking-tight text-black">
              Unravel<span className="text-[#00BC7D]"> Discuss</span>
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="px-3 sm:px-4 py-2 bg-white border-2 border-black hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
            >
              Home
            </Link>
            <NotificationBell />

            {/* Profile Button */}
            <Link
              href="/profile"
              className="w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
              title="Profile"
            >
              <User size={18} className="text-black" />
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-6">
        {/* HEADER BARIS UTAMA */}
        <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[4px_4px_0px_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight text-black font-serif">
              Urai dan Pecahkan Studi Kasus Global
            </h2>
            <p className="text-xs text-slate-550 font-semibold font-mono">
              Cari topik studi kasus yang dibuat oleh analis lain atau ajukan
              studi kasus barumu sendiri!
            </p>
          </div>
          <button
            onClick={() => router.push("/diskusi/buat")}
            className="px-5 py-3 bg-emerald-100 hover:bg-indigo-750 text-black font-black text-xs border-2 border-black uppercase tracking-wider rounded-xl shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all shrink-0 cursor-pointer"
          >
            + Buat Studi Kasus Baru
          </button>
        </div>

        {/* CONTROLLER & INPUT PENCARIAN BAR */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <div className="flex-1 bg-white border-2 border-black rounded-2xl p-4 flex items-center gap-3 shadow-[2px_2px_0px_#000]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari studi kasus publik (ex: krisis air bersih, limbah urban, etika)..."
              className="w-full bg-transparent outline-none text-xs font-bold text-black placeholder-slate-400"
            />
          </div>

          {/* FILTER TOPIK */}
          <div className="relative shrink-0 flex items-stretch">
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-black rounded-2xl text-xs font-black uppercase tracking-wider text-black transition-colors focus:outline-none cursor-pointer shadow-[3px_3px_0px_#000] min-w-[160px]"
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
              className="px-4 py-3 bg-white border-2 border-black rounded-2xl text-xs font-black uppercase tracking-wider text-black transition-colors focus:outline-none cursor-pointer shadow-[3px_3px_0px_#000] min-w-[150px]"
            >
              <option value="terbaru">Terbaru</option>
              <option value="populer">Paling Populer</option>
              <option value="disimpan">Kasus Disimpan</option>
            </select>
          </div>
        </div>

        {/* ERROR CONDITIONAL STATE */}
        {error && !loading && (
          <div className="p-4 bg-red-100 border-2 border-black rounded-2xl text-red-800 text-xs font-black flex items-center justify-center gap-2 max-w-xl mx-auto shadow-[3px_3px_0px_#000]">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AREA DAFTAR KASUS */}
        {loading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center space-y-3 bg-white border-2 border-black rounded-3xl shadow-[4px_4px_0px_#000] max-w-md mx-auto">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
              Memuat diskusi...
            </p>
          </div>
        ) : processedKasus.length === 0 ? (
          <div className="w-full py-20 text-center border-2 border-black rounded-2xl bg-white space-y-2 shadow-[4px_4px_0px_#000]">
            <p className="text-xs font-black text-black uppercase tracking-widest">
              {filterType === "disimpan"
                ? "Belum ada kasus yang Anda simpan"
                : "Studi kasus tidak ditemukan"}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 max-w-xs mx-auto">
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
                  className="bg-white border-2 border-black p-5 rounded-2xl flex flex-col justify-between min-h-[180px] transition-all shadow-[4px_4px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none group relative"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pr-10">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border-2 border-black rounded shadow-[1.5px_1.5px_0px_#000] bg-emerald-100 text-black">
                        {kasus.topics && kasus.topics.length > 0
                          ? kasus.topics[0].name.split("|")[0]
                          : "Diskusi Umum"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        @{kasus.name || kasus.username || "analis"}
                      </span>
                    </div>

                    {/* TOMBOL BOOKMARK */}
                    <button
                      type="button"
                      onClick={() => toggleSaveKasus(kasus.id)}
                      title={
                        isSaved ? "Hapus dari simpanan" : "Simpan studi kasus"
                      }
                      className={`absolute right-4 top-4 text-xs p-1.5 rounded-lg border-2 border-black transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none flex items-center justify-center cursor-pointer ${
                        isSaved
                          ? "bg-amber-400 text-black animate-pulse"
                          : "bg-white text-slate-400 hover:text-slate-650"
                      }`}
                    >
                      <Star
                        size={12}
                        fill={isSaved ? "currentColor" : "none"}
                      />
                    </button>

                    <h3 className="text-[16px] font-black text-black font-serif tracking-tight leading-snug group-hover:text-[#00BC7D] transition-colors pt-1">
                      {kasus.title}
                    </h3>
                    <p className="text-[12px] font-semibold text-slate-1000 line-clamp-3 leading-relaxed font-mono">
                      {kasus.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-black mt-4">
                    <Link
                      href={`/diskusi/${kasus.id}`}
                      className="px-3 py-1.5 bg-white border-2 border-black hover:bg-slate-50 text-black rounded-xl text-[10px] font-black uppercase tracking-wider shadow-[2.5px_2.5px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
                    >
                      Buka Kasus
                    </Link>
                    <span className="text-[10px] font-black text-black flex items-center gap-1 select-none">
                      <MessageSquare size={12} /> {kasus.perspectivesCount || 0}{" "}
                      Tanggapan
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
