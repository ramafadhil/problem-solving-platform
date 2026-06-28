"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BuatStudiKasusPage() {
  const router = useRouter();

  // 1. State Penampung Data Gabungan Kasus Baru + 5 Pilar Jawaban Wajib
  const [formData, setFormData] = useState({
    title: "",
    category: "Lingkungan",
    description: "",
    masalahUtama: "",
    penyebabDasar: "",
    stakeholderTerdampak: "",
    tujuanSolusi: "",
    rekomendasiSolusi: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // HANDLER SUBMIT: Payload siap dikirim via POST request ke backend Golang
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      creatorAnswer: {
        masalahUtama: formData.masalahUtama,
        penyebabDasar: formData.penyebabDasar,
        stakeholderTerdampak: formData.stakeholderTerdampak,
        tujuanSolusi: formData.tujuanSolusi,
        rekomendasiSolusi: formData.rekomendasiSolusi,
      },
    };

    try {
      console.log(
        "Mengirim studi kasus baru + solusi jangkar ke BE Golang:",
        payload,
      );

      // CONTOH INTEGRASI API POST REQUEST TIM KAMU:
      // const response = await fetch('https://api.unravel.com/v1/cases', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });

      alert(
        "Studi kasus baru dan solusi awal Anda berhasil dipublikasikan! 🎉",
      );
      // Setelah sukses, lempar user kembali ke halaman Lofi 1 (Daftar Kasus)
      router.push("/diskusi");
    } catch (error) {
      console.error("Gagal mempublikasikan studi kasus baru:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 1. NAVBAR FORUM HEADER */}
      <nav className="w-full border-b-2 border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-black text-lg tracking-tight text-slate-900">
            Unravel<span className="text-indigo-600"> Discuss</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/diskusi"
            className="px-4 py-2 bg-slate-50 border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 transition-colors"
          >
            Batal
          </Link>
        </div>
      </nav>

      {/* 2. FORM LAYOUT UTAMA (DIPASANG MENGALIR KE BAWAH AGAR SEIMBANG) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION A: INFORMASI DETAIL STUDI KASUS */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Bagian 1
              </span>
              <h3 className="text-base font-black text-slate-900 tracking-tight mt-2">
                Detail Identitas Kasus
              </h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Uraikan rumusan masalah gumpalan benang kusut makro yang ingin
                Anda ajukan ke komunitas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* INPUT JUDUL KASUS */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Judul Studi Kasus
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Contoh: Krisis Ruang Terbuka Hijau di Bantaran Kota Satelit"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* DROPDOWN PILIHAN KATEGORI */}
              <div className="md:col-span-1 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Kategori Kasus
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Lingkungan">Lingkungan</option>
                  <option value="Tata Kota">Tata Kota</option>
                  <option value="Politik">Politik</option>
                  <option value="Sosial">Sosial</option>
                </select>
              </div>
            </div>

            {/* INPUT DESKRIPSI KASUS */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Deskripsi Ringkas Narasi Masalah
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Berikan paragraf pemantik singkat mengenai latar belakang, data pendukung, atau realita pelik di lapangan mengenai kasus ini..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* SECTION B: VALIDASI JAWABAN WAJIB DARI KREATOR (5 PILAR ANALISIS) */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm relative overflow-hidden">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Bagian 2 (Wajib Diisi)
              </span>
              <h3 className="text-base font-black text-slate-900 tracking-tight mt-2">
                Lembar Solusi Analisis Pembuat Kasus
              </h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Sesuai aturan Unravel, Anda wajib mengisi rancangan pemecahan 5
                pilar milik Anda sendiri sebelum studi kasus ini bisa
                dipublikasikan.
              </p>
            </div>

            {/* 1. MASALAH UTAMA */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Langkah 1: Masalah Utama
              </label>
              <textarea
                name="masalahUtama"
                required
                rows={2}
                value={formData.masalahUtama}
                onChange={handleInputChange}
                placeholder="Menurut pemikiran Anda, apa inti gumpalan masalah makro paling krusial di sini?"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* 2. PENYEBAB DASAR */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Langkah 2: Penyebab Dasar
              </label>
              <textarea
                name="penyebabDasar"
                required
                rows={2}
                value={formData.penyebabDasar}
                onChange={handleInputChange}
                placeholder="Uraikan faktor pemicu fundamental (regulasi/perilaku/hulu) yang mendasari masalah tersebut..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* 3. STAKEHOLDER TERDAMPAK */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Langkah 3: Stakeholder Terdampak
              </label>
              <textarea
                name="stakeholderTerdampak"
                required
                rows={2}
                value={formData.stakeholderTerdampak}
                onChange={handleInputChange}
                placeholder="Pihak, kelompok masyarakat, ekosistem, atau lembaga mana saja yang paling dirugikan?"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* 4. TUJUAN SOLUSI */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Langkah 4: Tujuan Solusi
              </label>
              <textarea
                name="tujuanSolusi"
                required
                rows={2}
                value={formData.tujuanSolusi}
                onChange={handleInputChange}
                placeholder="Kondisi ideal jangka pendek atau jangka panjang seperti apa yang ingin Anda capai?"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* 5. REKOMENDASI SOLUSI */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Langkah 5: Rekomendasi Solusi
              </label>
              <textarea
                name="rekomendasiSolusi"
                required
                rows={3}
                value={formData.rekomendasiSolusi}
                onChange={handleInputChange}
                placeholder="Tuliskan rekomendasi aksi nyata, rancangan aturan baru, atau langkah taktis eksekusi akhir yang Anda tawarkan..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          {/* AKSI BAWAH: TOMBOL PUBLISH */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(79,70,229,0.3)]"
            >
              Publikasikan Studi Kasus Baru
            </button>
          </div>
        </form>
      </main>

      {/* 3. FOOTER SECTION */}
      <footer className="w-full bg-slate-900 text-slate-400 text-xs py-12 mt-24 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 text-center md:text-left">
          <p className="text-[10px] text-slate-500">
            © 2026 Unravel Inc. Hak cipta dilindungi undang-undang.
          </p>
        </div>
      </footer>
    </div>
  );
}
