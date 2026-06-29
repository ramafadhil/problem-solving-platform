"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/utils/api";

interface LogicBlock {
  category: string;
  content: string;
  points: number;
}

interface LearningCase {
  id: number;
  title: string;
  description: string;
  type: string;
  user_id: number;
  topics?: { id: number; name: string }[];
  logic_blocks?: LogicBlock[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topicId, setTopicId] = useState("1"); // Default: Teknologi (ID: 1)
  
  // Dynamic Cards State
  const [cards, setCards] = useState<Array<{ category: string; content: string; points: number }>>([
    { category: "stakeholder", content: "", points: 50 },
    { category: "action", content: "", points: 50 },
    { category: "impact", content: "", points: 50 },
  ]);

  // List Cases State
  const [cases, setCases] = useState<LearningCase[]>([]);
  const [listLoading, setListLoading] = useState(true);

  // 1. Cek Otorisasi Admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setLoading(true);
        const me = await apiFetch("/me");
        const userData = me?.data || me;
        if (userData && userData.role === "admin") {
          setAuthorized(true);
          fetchCases();
        } else {
          setAuthorized(false);
        }
      } catch (err: any) {
        console.error("Gagal memeriksa status admin:", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  // 2. Ambil List Kasus Belajar dari BE
  const fetchCases = async () => {
    try {
      setListLoading(true);
      const casesRes = await apiFetch("/cases");
      const casesList = Array.isArray(casesRes) ? casesRes : (casesRes?.cases || casesRes?.data || []);
      if (Array.isArray(casesList)) {
        // Hanya tampilkan yang bertipe 'learning'
        const learningOnly = casesList.filter((c: any) => c.type === "learning");
        setCases(learningOnly);
      }
    } catch (err) {
      console.error("Gagal mengambil list kasus:", err);
    } finally {
      setListLoading(false);
    }
  };

  // Dynamic card handlers
  const handleCardChange = (index: number, field: string, value: any) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setCards(updated);
  };

  const addCard = () => {
    setCards([...cards, { category: "stakeholder", content: "", points: 50 }]);
  };

  const removeCard = (index: number) => {
    if (cards.length <= 1) {
      alert("Minimal harus ada 1 kartu jawaban!");
      return;
    }
    setCards(cards.filter((_, idx) => idx !== index));
  };

  // 3. Handler Submit Kasus Baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!title || !description) {
      setError("Judul dan deskripsi wajib diisi!");
      return;
    }

    if (cards.some(c => !c.content.trim())) {
      setError("Semua kata kunci kartu jawaban wajib diisi!");
      return;
    }

    try {
      const payload = {
        title,
        description,
        type: "learning",
        topic_ids: [parseInt(topicId, 10)],
        logic_blocks: cards.map(c => ({
          category: c.category,
          content: c.content.trim(),
          points: Number(c.points)
        }))
      };

      await apiFetch("/cases", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setSuccessMsg("Studi kasus learning berhasil diterbitkan!");
      
      // Reset Form
      setTitle("");
      setDescription("");
      setCards([
        { category: "stakeholder", content: "", points: 50 },
        { category: "action", content: "", points: 50 },
        { category: "impact", content: "", points: 50 },
      ]);
      
      // Refresh List
      fetchCases();
    } catch (err: any) {
      console.error("Gagal membuat kasus baru:", err);
      setError(err.message || "Gagal menerbitkan studi kasus.");
    }
  };

  // 4. Handler Hapus Kasus
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus studi kasus ini?")) return;
    setError("");
    setSuccessMsg("");
    try {
      const res = await apiFetch(`/cases/${id}`, {
        method: "DELETE"
      });
      
      // Tampilkan feedback spesifik jika fitur belum diimplementasikan sepenuhnya di BE
      if (res?.message === "Fitur Delete segera hadir!") {
        alert("⚠️ Backend Info: Fitur Delete belum diimplementasikan sepenuhnya di server API (menampilkan pesan 'Fitur Delete segera hadir!'). Silakan hubungi developer backend Anda.");
        setSuccessMsg("Pesan terkirim ke BE: Fitur Delete segera hadir!");
      } else {
        setSuccessMsg("Kasus berhasil dihapus.");
      }
      fetchCases();
    } catch (err: any) {
      console.error("Gagal menghapus kasus:", err);
      setError(err.message || "Gagal menghapus studi kasus.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memverifikasi Hak Akses...</p>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-6">
        <div className="bg-white border-2 border-slate-200 p-8 rounded-3xl shadow-sm text-center max-w-md w-full space-y-6">
          <div className="text-4xl">⚠️</div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 font-serif">Akses Ditolak</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Halaman ini khusus untuk administrator. Akun Anda tidak memiliki hak akses yang diperlukan.
            </p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-xs uppercase tracking-wider transition-colors"
          >
            Login Sebagai Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      {/* NAVBAR */}
      <nav className="w-full border-b-2 border-slate-200 bg-white sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-black text-lg tracking-tight text-slate-900">
            Unravel<span className="text-indigo-600"> Admin</span>
          </Link>
        </div>
        <Link
          href="/profile"
          className="px-3 py-1.5 bg-slate-50 border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 transition-all shadow-sm"
        >
          Kembali ke Profil
        </Link>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SISI KIRI: INPUT FORM */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 font-serif">Buat Studi Kasus Belajar</h2>
              <p className="text-[11px] font-medium text-slate-400">Terbitkan kasus linear baru dengan daftar kartu dinamis ke database.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold shadow-sm">
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs font-bold shadow-sm">
                ✓ {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Judul */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Judul Studi Kasus</label>
                <input
                  type="text"
                  placeholder="Contoh: Kebocoran Data Kredensial Pengguna"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:outline-none transition-colors"
                />
              </div>

              {/* Topik Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kategori Tema Topik</label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:outline-none transition-colors"
                >
                  <option value="1">Teknologi</option>
                  <option value="2">Politik</option>
                  <option value="3">Pendidikan</option>
                </select>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Deskripsi Narasi Kasus</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan cerita/narasi permasalahan. Gunakan enter untuk memisah paragraf."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="border-t border-slate-100 my-4 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-700 tracking-tight uppercase">Definisi Kartu Pilihan Jawaban ({cards.length})</h3>
                  <button
                    type="button"
                    onClick={addCard}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-indigo-200/50 transition-colors shadow-sm"
                  >
                    + Tambah Kartu
                  </button>
                </div>
                
                {/* LIST KARTU DINAMIS */}
                <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                  {cards.map((card, index) => (
                    <div key={index} className="bg-slate-50/40 border border-slate-200/60 p-3.5 rounded-2xl space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Kartu #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeCard(index)}
                          className="text-[9px] font-bold text-red-500 hover:text-red-700 transition-colors"
                        >
                          Hapus Kartu
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        {/* Kata Kunci */}
                        <div className="md:col-span-6 space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Kata Kunci / Isi Kartu</label>
                          <input
                            type="text"
                            placeholder="Contoh: Audit Keamanan Menyeluruh"
                            value={card.content}
                            onChange={(e) => handleCardChange(index, "content", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:outline-none transition-colors"
                          />
                        </div>

                        {/* Kategori */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Pilar Target</label>
                          <select
                            value={card.category}
                            onChange={(e) => handleCardChange(index, "category", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:outline-none transition-colors"
                          >
                            <option value="stakeholder">Stakeholder</option>
                            <option value="action">Action</option>
                            <option value="impact">Impact</option>
                          </select>
                        </div>

                        {/* XP Reward */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">XP Reward</label>
                          <input
                            type="number"
                            value={card.points}
                            onChange={(e) => handleCardChange(index, "points", parseInt(e.target.value, 10) || 0)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                Terbitkan Studi Kasus
              </button>
            </form>
          </div>
        </section>

        {/* SISI KANAN: LIST KASUS YANG ADA */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900 font-serif">Daftar Kasus Belajar</h2>
              <p className="text-[10px] font-semibold text-slate-400">Total terbit di database: {cases.length} Kasus</p>
            </div>

            {listLoading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : cases.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-semibold italic">
                Belum ada studi kasus learning di database.
              </div>
            ) : (
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {cases.map((c) => {
                  const topicName = c.topics && c.topics.length > 0 ? c.topics[0].name : "Umum";
                  return (
                    <div key={c.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 flex flex-col justify-between gap-3 shadow-sm hover:border-slate-200 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                            {topicName}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400">ID: {c.id}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-950 font-serif line-clamp-1">{c.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{c.description}</p>
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-slate-100/60 pt-2.5">
                        <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                          {c.logic_blocks?.map((block, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1 py-0.5 rounded border border-slate-200/50">
                              {block.content} ({block.points} XP)
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors border border-red-200/30 shadow-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
