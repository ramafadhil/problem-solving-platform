"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

// REPOSITORI DATA STUDI KASUS (Simulasi Kontrak Data dari Database / API)
const repoStudiKasus: Record<
  string,
  {
    judul: string;
    narasi: string[];
    pilihanKataKunci: string[];
    kunciJawaban: Record<string, string>;
  }
> = {
  lingkungan: {
    judul: "Pencemaran Sungai Cihampelas",
    narasi: [
      "Sungai Cihampelas mengalami penurunan kualitas air secara drastis akibat pembuangan limbah tanpa pengelolaan yang memadai. Kondisi ini memicu protes dari warga yang tinggal di sepanjang bantaran sungai karena bau menyengat dan matinya ekosistem air baku.",
      "Diperlukan sinergi penegakan regulasi dan upaya restorasi fisik agar fungsi aliran air kembali normal dan aman bagi lingkungan sekitar.",
    ],
    pilihanKataKunci: [
      "Sampah Plastik Menumpuk",
      "Limbah Industri Ilegal",
      "Warga Bantaran Sungai",
      "Restorasi Ekosistem",
      "Regulasi Ketat Pemda",
    ],
    kunciJawaban: {
      "Sampah Plastik Menumpuk": "masalah",
      "Limbah Industri Ilegal": "penyebab",
      "Warga Bantaran Sungai": "stakeholder",
      "Restorasi Ekosistem": "tujuan",
      "Regulasi Ketat Pemda": "solusi",
    },
  },
  politik: {
    judul: "Fenomena Politik Dinasti Daerah",
    narasi: [
      "Pencalonan kerabat dekat kepala daerah petahana dalam pilkada serentak memicu perdebatan mengenai netralitas aparatur sipil negara dan pemerataan kesempatan politik bagi kader independen.",
      "Kondisi ini memerlukan pengawasan ketat dari lembaga swadaya masyarakat dan pembenahan sistem kaderisasi internal partai.",
    ],
    pilihanKataKunci: [
      "Monopoli Kekuasaan",
      "Kaderisasi Internal Mandek",
      "Pengawas Pemilu",
      "Kesetaraan Hak Politik",
      "Audit Investigatif LSM",
    ],
    kunciJawaban: {
      "Monopoli Kekuasaan": "masalah",
      "Kaderisasi Internal Mandek": "penyebab",
      "Pengawas Pemilu": "stakeholder",
      "Kesetaraan Hak Politik": "tujuan",
      "Audit Investigatif LSM": "solusi",
    },
  },
  "sosial-tata-kota": {
    judul: "Alih Fungsi Lahan Trotoar Pedagang",
    narasi: [
      "Trotoar jalan protokol beralih fungsi menjadi area lapak dagang permanen, memicu kemacetan parah serta mengancam keselamatan pejalan kaki. Penertiban sering kali berujung pada bentrokan fisik karena minimnya alternatif lokasi relokasi.",
      "Pemerintah kota dituntut merumuskan penataan kawasan niaga terpadu yang inklusif tanpa mematikan sektor ekonomi informal.",
    ],
    pilihanKataKunci: [
      "Hak Pejalan Kaki Terenggut",
      "Minimnya Area Relokasi",
      "Pedagang Kaki Lima",
      "Ketertiban Fasilitas Publik",
      "Kawasan Niaga Inklusif",
    ],
    kunciJawaban: {
      "Hak Pejalan Kaki Terenggut": "masalah",
      "Minimnya Area Relokasi": "penyebab",
      "Pedagang Kaki Lima": "stakeholder",
      "Ketertiban Fasilitas Publik": "tujuan",
      "Kawasan Niaga Inklusif": "solusi",
    },
  },
  pendidikan: {
    judul: "Ketimpangan Digital SMK Pelosok",
    narasi: [
      "Siswa sekolah vokasi di wilayah terluar kesulitan bersaing di industri akibat minimnya perangkat komputer modern dan jaringan internet untuk praktikum software engineering.",
      "Distribusi alokasi anggaran yang belum merata menuntut adanya kolaborasi strategis dengan penyedia layanan internet lokal guna mempercepat pemerataan infrastruktur digital.",
    ],
    pilihanKataKunci: [
      "Kesenjangan Keterampilan Kerja",
      "Alokasi Anggaran Belum Merata",
      "Siswa Vokasi Daerah",
      "Pemerataan Infrastruktur Digital",
      "Kemitraan Provider Lokal",
    ],
    kunciJawaban: {
      "Kesenjangan Keterampilan Kerja": "masalah",
      "Alokasi Anggaran Belum Merata": "penyebab",
      "Siswa Vokasi Daerah": "stakeholder",
      "Pemerataan Infrastruktur Digital": "tujuan",
      "Kemitraan Provider Lokal": "solusi",
    },
  },
};

// KOMPONEN KARTU DRAGGABLE
function DraggableCard({ id, text }: { id: string; text: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`px-4 py-3 bg-white border-2 border-slate-200 rounded-xl shadow-sm cursor-grab active:cursor-grabbing font-medium text-sm text-slate-700 transition-all hover:border-indigo-400 ${
        isDragging
          ? "opacity-50 ring-2 ring-indigo-500/20 shadow-md scale-105"
          : ""
      }`}
    >
      {text}
    </div>
  );
}

// KOMPONEN WADAH DROPPABLE ZONE
function DroppableZone({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: string[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-xl border-2 border-dashed min-h-[100px] transition-colors flex flex-col gap-2 ${
        isOver ? "bg-indigo-50 border-indigo-400" : "bg-white border-slate-200"
      }`}
    >
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        {title}
      </span>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && (
          <span className="text-xs text-slate-400 my-auto italic py-2">
            Tarik kata kunci yang sesuai ke sini...
          </span>
        )}
        {items.map((item) => (
          <DraggableCard key={item} id={item} text={item} />
        ))}
      </div>
    </div>
  );
}

// HALAMAN UTAMA STAGE 1
export default function StageOnePage() {
  const router = useRouter();
  const params = useParams();
  const temaKey = (params?.caseId as string) || "lingkungan";

  // Membaca data repositori sesuai tema aktif
  const kontenKasus = repoStudiKasus[temaKey] || repoStudiKasus["lingkungan"];

  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scoreResult, setScoreResult] = useState({
    pointsEarned: 0,
    feedback: "",
  });

  // Inisialisasi state untuk menampung pembagian zona kartu
  const [items, setItems] = useState({
    pool: [] as string[],
    masalah: [] as string[],
    penyebab: [] as string[],
    stakeholder: [] as string[],
    tujuan: [] as string[],
    solusi: [] as string[],
  });

  // Memasukkan pilihan kata kunci secara dinamis setelah client mounted
  useEffect(() => {
    setItems((prev) => ({
      ...prev,
      pool: kontenKasus.pilihanKataKunci,
      masalah: [],
      penyebab: [],
      stakeholder: [],
      tujuan: [],
      solusi: [],
    }));
    setIsMounted(true);
  }, [kontenKasus]);

  // Handler perpindahan posisi kartu drag-and-drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const itemDragged = active.id as string;
    const targetZone = over.id as keyof typeof items;

    const sourceZone = Object.keys(items).find((key) =>
      items[key as keyof typeof items].includes(itemDragged),
    ) as keyof typeof items;

    if (!sourceZone || sourceZone === targetZone) return;

    setItems((prev) => {
      const updatedSource = prev[sourceZone].filter(
        (item) => item !== itemDragged,
      );
      const updatedTarget = [...prev[targetZone], itemDragged];
      return {
        ...prev,
        [sourceZone]: updatedSource,
        [targetZone]: updatedTarget,
      };
    });
  }

  // Verifikasi kebenaran posisi kartu dan perhitungan poin
  const handleVerification = () => {
    const totalDitempatkan =
      items.masalah.length +
      items.penyebab.length +
      items.stakeholder.length +
      items.tujuan.length +
      items.solusi.length;
    if (totalDitempatkan < 3) {
      alert(
        "⚠️ Analisis belum lengkap! Taruh minimal 3 kartu kata kunci untuk mulai verifikasi.",
      );
      return;
    }

    let correctCount = 0;
    let totalScore = 0;

    Object.keys(items).forEach((zoneKey) => {
      if (zoneKey !== "pool") {
        items[zoneKey as keyof typeof items].forEach((cardName) => {
          if (kontenKasus.kunciJawaban[cardName] === zoneKey) {
            correctCount++;
            totalScore += 10; // 10 Poin per jawaban tepat
          }
        });
      }
    });

    let feedbackText = "";
    if (correctCount === 5)
      feedbackText =
        "Luar biasa! Analisis komponen masalahmu sangat akurat dan sempurna.";
    else if (correctCount >= 3)
      feedbackText =
        "Analisis cukup baik, namun ada penempatan beberapa indikator yang kurang tepat.";
    else
      feedbackText =
        "Kerja bagus sudah mencoba! Coba analisis kembali struktur keterkaitan sebab-akibatnya.";

    setScoreResult({ pointsEarned: totalScore, feedback: feedbackText });
    setShowModal(true);

    if (totalScore > 0) {
      localStorage.setItem(`progress_${temaKey}`, "1"); // Tandai level 1 telah selesai
    }
  };

  const handleBackToDashboard = () => {
    setShowModal(false);
    router.push(`/belajar/${temaKey}`);
  };

  if (!isMounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 animate-pulse font-medium">
          Memuat area analisis kasus...
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4 relative">
        {/* KOLOM KIRI: Teks Studi Kasus & Pool Kartu Pilihan */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
              Level 1 - Eksplorasi
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              {kontenKasus.judul}
            </h2>
          </div>

          <article className="text-sm text-slate-600 leading-relaxed space-y-4 border-t border-b border-slate-100 py-4">
            {kontenKasus.narasi.map((paragraf, index) => (
              <p key={index}>{paragraf}</p>
            ))}
          </article>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Pilihan Kata Kunci
            </h3>
            <div className="flex flex-wrap gap-3">
              {items.pool.map((text) => (
                <DraggableCard key={text} id={text} text={text} />
              ))}
              {items.pool.length === 0 && (
                <span className="text-sm text-slate-400 italic">
                  Semua opsi sudah terpasang di lembar analisis.
                </span>
              )}
            </div>
          </div>
        </section>

        {/* KOLOM KANAN: Tempat Peletakan DropZone Analisis */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700">
              Kemajuan Analisis Jalur
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${lvl === 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}
                >
                  {lvl}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <DroppableZone
              id="masalah"
              title="1. Masalah Utama"
              items={items.masalah}
            />
            <DroppableZone
              id="penyebab"
              title="2. Penyebab Dasar"
              items={items.penyebab}
            />
            <DroppableZone
              id="stakeholder"
              title="3. Stakeholder Terdampak"
              items={items.stakeholder}
            />
            <DroppableZone
              id="tujuan"
              title="4. Tujuan Solusi"
              items={items.tujuan}
            />
            <DroppableZone
              id="solusi"
              title="5. Rekomendasi Solusi"
              items={items.solusi}
            />
          </div>

          <button
            onClick={handleVerification}
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all text-sm transform hover:-translate-y-0.5"
          >
            Verifikasi Analisis Level 1
          </button>
        </section>

        {/* MODAL NOTIFIKASI HASIL PENILAIAN */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-100">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-black text-slate-900">
                Analisis Selesai Diverifikasi!
              </h3>

              <div className="my-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <p className="text-2xl font-black text-indigo-600">
                  +{scoreResult.pointsEarned} XP
                </p>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                  Poin Berhasil Didapatkan
                </p>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed px-2 mb-6">
                {scoreResult.feedback} Progres kamu telah diperbarui di papan
                peringkat kelompok secara *real-time*.
              </p>

              <button
                onClick={handleBackToDashboard}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                Kembali ke Peta Jalur Belajar
              </button>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
