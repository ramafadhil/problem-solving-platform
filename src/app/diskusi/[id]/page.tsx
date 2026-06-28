"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Interface struktur data ulasan analis diperbarui agar konsisten membawa 5 pilar
interface AnalisJawaban {
  id: string;
  author: string;
  points: number;
  masalahUtama: string;
  penyebabDasar: string;
  stakeholderTerdampak: string;
  tujuanSolusi: string;
  rekomendasiSolusi: string;
  upvotes: number;
  hasUpvoted?: boolean;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ForumUlasanKasusPage({ params }: PageProps) {
  const router = useRouter();

  const resolvedParams = use(params);
  const kasusId = resolvedParams.id;

  const [comments, setComments] = useState<AnalisJawaban[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // FETCH DATA FORUM: Mock data disesuaikan penuh dengan 5 kriteria pilar Mode Belajar
  useEffect(() => {
    const fetchForumAnswers = async () => {
      try {
        setLoading(true);

        const mockAnswersData: AnalisJawaban[] = [
          {
            id: "ans-01",
            author: "Samuel George",
            points: 39,
            masalahUtama:
              "Tingginya akumulasi partikel mikroplastik berbahaya di sepanjang ekosistem perairan sungai hulu ke hilir.",
            penyebabDasar:
              "Lemahnya regulasi pengawasan audit limbah amdal korporasi industri tekstil dan plastik makro.",
            stakeholderTerdampak:
              "Masyarakat bantaran sungai, biota air, serta ekosistem rantai makanan konsumsi lokal.",
            tujuanSolusi:
              "Menurunkan kadar cemaran partikel plastik air sungai hingga di bawah ambang batas aman dalam 12 bulan.",
            rekomendasiSolusi:
              "Penegakan sanksi pembekuan izin operasional industri pelanggar serta wajib memasang filter penyaring partikel.",
            upvotes: 12,
          },
          {
            id: "ans-02",
            author: "Ahmad Jaelani",
            points: 25,
            masalahUtama:
              "Pencemaran limbah domestik akibat belum optimalnya pemilahan sampah berkala di masyarakat.",
            penyebabDasar:
              "Kurangnya fasilitas infrastruktur tempat pembuangan sampah terpadu (TPST) di level kelurahan satelit.",
            stakeholderTerdampak:
              "Warga pemukiman padat urban dan petugas kebersihan lingkungan daerah hilir.",
            tujuanSolusi:
              "Membentuk sistem tata kelola pemilahan limbah organik dan non-organik mandiri yang terotomasi dari rumah.",
            rekomendasiSolusi:
              "Pemberian stimulus program insentif poin digital bagi rukun warga yang aktif memilah sampah melalui bank sampah lokal.",
            upvotes: 5,
          },
          {
            id: "ans-03",
            author: "Siti Rahma",
            points: 54,
            masalahUtama:
              "Ancaman kerusakan jangka panjang ekosistem air tawar akibat endapan zat kimia plastik korporasi.",
            penyebabDasar:
              "Batas denda administrasi yudisial yang terlalu rendah sehingga industri lebih memilih membayar denda dibanding mengolah limbah.",
            stakeholderTerdampak:
              "PDAM penyedia air bersih perkotaan, nelayan tradisional, dan kelestarian hayati perairan.",
            tujuanSolusi:
              "Mendorong transformasi korporasi agar beralih menggunakan kemasan bio-degradable ramah lingkungan.",
            rekomendasiSolusi:
              "Amandemen undang-undang lingkungan untuk menaikkan tarif batas denda pelanggaran amdal secara progresif hingga 200%.",
            upvotes: 19,
          },
        ];

        setTimeout(() => {
          setComments(mockAnswersData);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Gagal memuat isi forum ulasan publik:", error);
        setLoading(false);
      }
    };

    fetchForumAnswers();
  }, [kasusId]);

  const handleUpvote = (id: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === id) {
          const hasUpvoted = !comment.hasUpvoted;
          return {
            ...comment,
            hasUpvoted,
            upvotes: hasUpvoted ? comment.upvotes + 1 : comment.upvotes - 1,
          };
        }
        return comment;
      }),
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Membuka Kunci Forum Komunitas...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 1. NAVBAR FORUM HEADER */}
      <nav className="w-full border-b-2 border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-black text-lg tracking-tight text-slate-900">
            Unravel<span className="text-indigo-600"> Discuss</span>
          </span>
        </div>
        <Link
          href="/diskusi"
          className="px-4 py-2 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:-translate-y-0.5"
        >
          Cari Kasus Lain
        </Link>
      </nav>

      {/* 2. MAIN FORUM LAYOUT (GRID 3 KOLOM) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-6">
        {/* BARIS JUDUL UTAMA FORUM */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-2 border-slate-100 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Eksplorasi Jawaban Analis Komunitas
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Membandingkan skema pemecahan masalah dari ID kasus:{" "}
              <span className="font-bold text-indigo-600">{kasusId}</span>
            </p>
          </div>

          <button
            onClick={() => router.push(`/diskusi/${kasusId}/jawab`)}
            className="px-4 py-2.5 bg-white border-2 border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 font-black text-xs uppercase tracking-wider rounded-xl transition-all hover:-translate-y-0.5 shadow-sm"
          >
            Tinjau Jawabanmu
          </button>
        </div>

        {/* GRID KARTU OPINI SOSIAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {comments.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)] hover:border-indigo-400 transition-all duration-200 group"
            >
              <div className="space-y-4">
                {/* Baris Atas: Profil */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-50 border-2 border-slate-200 font-black text-sm text-slate-400 flex items-center justify-center select-none group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                    👤
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 tracking-tight leading-tight">
                      {item.author}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      Point: {item.points}
                    </p>
                  </div>
                </div>

                {/* Baris Tengah: Tampilan Hasil 5 Pilar Pemecahan Masalah Komunitas */}
                <div className="space-y-3 text-[11px] font-medium text-slate-500 leading-relaxed">
                  <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-xl shadow-inner">
                    <strong className="text-indigo-600 block mb-0.5">
                      Langkah 1: Masalah Utama
                    </strong>
                    "{item.masalahUtama}"
                  </div>
                  <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-xl shadow-inner">
                    <strong className="text-indigo-600 block mb-0.5">
                      Langkah 2: Penyebab Dasar
                    </strong>
                    "{item.penyebabDasar}"
                  </div>
                  <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-xl shadow-inner">
                    <strong className="text-indigo-600 block mb-0.5">
                      Langkah 3: Stakeholder Terdampak
                    </strong>
                    "{item.stakeholderTerdampak}"
                  </div>
                  <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-xl shadow-inner">
                    <strong className="text-indigo-600 block mb-0.5">
                      Langkah 4: Tujuan Solusi
                    </strong>
                    "{item.tujuanSolusi}"
                  </div>
                  <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-xl shadow-inner">
                    <strong className="text-indigo-600 block mb-0.5">
                      Langkah 5: Rekomendasi Solusi
                    </strong>
                    "{item.rekomendasiSolusi}"
                  </div>
                </div>
              </div>

              {/* Baris Bawah: Interaksi Bersih (Downvote Telah Dihapus Sesuai Permintaan) */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4 text-slate-400 text-sm font-bold">
                <div className="flex items-center gap-4">
                  {/* Upvote Button */}
                  <button
                    onClick={() => handleUpvote(item.id)}
                    className={`flex items-center gap-1 transition-all hover:scale-110 ${item.hasUpvoted ? "text-indigo-600" : "hover:text-indigo-600"}`}
                  >
                    <span>👍</span>
                    <span className="text-[10px] font-black">
                      {item.upvotes}
                    </span>
                  </button>
                </div>

                {/* Reply Link Trigger */}
                <button
                  onClick={() =>
                    alert(
                      "Fitur lembar komentar / thread balasan opini sedang dikembangkan!",
                    )
                  }
                  className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 tracking-wider hover:underline"
                >
                  Balas 💬
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 3. FOOTER SECTION */}
      <footer className="w-full bg-slate-900 text-slate-400 text-xs py-12 mt-24 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-center md:text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-black text-sm">
              <span>🦉</span> Unravel
            </div>
            <p className="text-[10px] text-slate-500">
              © 2026 Unravel Inc. Hak cipta dilindungi undang-undang.
            </p>
          </div>
          <div className="flex justify-center md:justify-end gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <Link
              href="/belajar"
              className="hover:text-white transition-colors"
            >
              Belajar
            </Link>
            <Link
              href="/diskusi"
              className="hover:text-white transition-colors"
            >
              Diskusi
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              Fitur
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
