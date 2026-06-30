"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/utils/api";
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
  teknologi: {
    judul: "Kebocoran Data Kredensial Pengguna",
    narasi: [
      "Sebuah platform e-commerce mengalami serangan siber yang mengakibatkan kebocoran data pribadi jutaan pengguna, termasuk password terenkripsi dan alamat rumah. Insiden ini memicu kepanikan massal serta menurunkan tingkat kepercayaan publik secara drastis.",
      "Langkah taktis yang harus segera dilakukan adalah penerapan enkripsi end-to-end yang lebih kuat, audit keamanan menyeluruh, serta transparansi penuh kepada publik mengenai insiden tersebut.",
    ],
    pilihanKataKunci: [
      "Pengguna Platform E-commerce",
      "Audit Keamanan Menyeluruh",
      "Transparansi Insiden Publik",
    ],
    kunciJawaban: {
      "Pengguna Platform E-commerce": "stakeholder",
      "Audit Keamanan Menyeluruh": "action",
      "Transparansi Insiden Publik": "impact",
    },
  },
  politik: {
    judul: "Fenomena Politik Dinasti Daerah",
    narasi: [
      "Pencalonan kerabat dekat kepala daerah petahana dalam pilkada serentak memicu perdebatan mengenai netralitas aparatur sipil negara dan pemerataan kesempatan politik bagi kader independen.",
      "Kondisi ini memerlukan pengawasan ketat dari lembaga swadaya masyarakat dan pembenahan sistem kaderisasi internal partai.",
    ],
    pilihanKataKunci: [
      "Pengawas Pemilu",
      "Audit Investigatif LSM",
      "Kesetaraan Hak Politik",
    ],
    kunciJawaban: {
      "Pengawas Pemilu": "stakeholder",
      "Audit Investigatif LSM": "action",
      "Kesetaraan Hak Politik": "impact",
    },
  },
  pendidikan: {
    judul: "Ketimpangan Digital SMK Pelosok",
    narasi: [
      "Siswa sekolah vokasi di wilayah terluar kesulitan bersaing di industri akibat minimnya perangkat komputer modern dan jaringan internet untuk praktikum software engineering.",
      "Distribusi alokasi anggaran yang belum merata menuntut adanya kolaborasi strategis dengan penyedia layanan internet lokal guna mempercepat pemerataan infrastruktur digital.",
    ],
    pilihanKataKunci: [
      "Siswa Vokasi Daerah",
      "Kemitraan Provider Lokal",
      "Pemerataan Infrastruktur Digital",
    ],
    kunciJawaban: {
      "Siswa Vokasi Daerah": "stakeholder",
      "Kemitraan Provider Lokal": "action",
      "Pemerataan Infrastruktur Digital": "impact",
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

// HALAMAN UTAMA STAGE DINAMIS
export default function DynamicStagePage() {
  const router = useRouter();
  const params = useParams();
  const temaKey = (params?.topicId as string) || "teknologi";
  const stageId = (params?.stageId as string) || "stage-1";
  const levelNum = parseInt(stageId.replace("stage-", ""), 10) || 1;

  // Membaca data repositori sesuai tema aktif (mock)
  const kontenKasus = repoStudiKasus[temaKey] || repoStudiKasus["teknologi"];

  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scoreResult, setScoreResult] = useState({
    pointsEarned: 0,
    feedback: "",
  });

  // Inisialisasi state untuk menampung pembagian zona kartu
  const [items, setItems] = useState({
    pool: [] as string[],
    stakeholder: [] as string[],
    action: [] as string[],
    impact: [] as string[],
  });

  // State untuk data studi kasus dynamic dari API
  const [dynamicCase, setDynamicCase] = useState<{
    judul: string;
    narasi: string[];
    pilihanKataKunci: string[];
    kunciJawaban: Record<string, string>;
    cardPoints: Record<string, number>;
  } | null>(null);

  // Fungsi pencocokan topik dari API dengan URL parameter
  const matchTopic = (caseTopics: any[], topicKey: string) => {
    if (!caseTopics || !Array.isArray(caseTopics)) return false;
    return caseTopics.some(t => {
      const parts = (t.name || "").split("|");
      const title = parts[0] || "";
      const nameKey = title.toLowerCase().replace(/\s+/g, "-");
      return nameKey === topicKey;
    });
  };

  // Mengambil data studi kasus learning dari API untuk Stage terpilih (LevelNum)
  useEffect(() => {
    const fetchStageCase = async () => {
      try {
        const casesRes = await apiFetch("/cases");
        const casesList = Array.isArray(casesRes) ? casesRes : (casesRes?.cases || casesRes?.data || []);
        if (Array.isArray(casesList)) {
          const filtered = casesList.filter((c: any) => c.type === "learning" && matchTopic(c.topics, temaKey));
          if (filtered.length > 0) {
            // Urutkan berdasarkan ID secara ascending (Opsi A)
            filtered.sort((a, b) => Number(a.id) - Number(b.id));
            
            // Dapatkan kasus pada indeks levelNum - 1
            const activeCase = filtered[levelNum - 1] || filtered[0];
            
            const logicBlocks = activeCase.logic_blocks || [];
            const keywords = logicBlocks.map((b: any) => b.content);
            const answers: Record<string, string> = {};
            const cardPoints: Record<string, number> = {};
            logicBlocks.forEach((b: any) => {
              const cat = (b.category || b.pillar_category || "").toLowerCase();
              answers[b.content] = cat;
              cardPoints[b.content] = b.points || 0;
            });

            const paragraphs = activeCase.description
              ? activeCase.description.split("\n").filter((p: string) => p.trim() !== "")
              : [];

            setDynamicCase({
              judul: activeCase.title,
              narasi: paragraphs,
              pilihanKataKunci: keywords,
              kunciJawaban: answers,
              cardPoints: cardPoints
            });
            return;
          }
        }
      } catch (err) {
        console.error("Gagal memuat detail stage case dari API:", err);
      }

      // Fallback ke data mock jika API kosong/gagal
      const mockPoints: Record<string, number> = {};
      kontenKasus.pilihanKataKunci.forEach((k) => {
        mockPoints[k] = 50; // Default mock Points reward
      });
      setDynamicCase({
        judul: kontenKasus.judul,
        narasi: kontenKasus.narasi,
        pilihanKataKunci: kontenKasus.pilihanKataKunci,
        kunciJawaban: kontenKasus.kunciJawaban,
        cardPoints: mockPoints
      });
    };

    fetchStageCase();
  }, [temaKey, levelNum, kontenKasus]);

  // Memasukkan pilihan kata kunci secara dinamis setelah client mounted dan data dimuat
  useEffect(() => {
    if (dynamicCase) {
      setItems({
        pool: dynamicCase.pilihanKataKunci,
        stakeholder: [],
        action: [],
        impact: [],
      });
      setIsMounted(true);
    }
  }, [dynamicCase]);

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
      // 1. Ambil item dari source
      const newSourceItems = prev[sourceZone].filter(item => item !== itemDragged);
      
      // 2. Jika target bukan pool dan sudah ada kartu lain, kembalikan kartu lama ke pool
      let newTargetItems = [...prev[targetZone]];
      let displacedItems: string[] = [];
      
      if (targetZone !== "pool" && newTargetItems.length >= 1) {
        displacedItems = [...newTargetItems];
        newTargetItems = [itemDragged];
      } else {
        newTargetItems.push(itemDragged);
      }

      // 3. Masukkan item lama yang tergeser ke pool
      let newPool = [...prev.pool];
      if (sourceZone === "pool") {
        newPool = newSourceItems;
      }
      if (targetZone === "pool") {
        newPool.push(itemDragged);
      }
      if (displacedItems.length > 0) {
        newPool = [...newPool, ...displacedItems];
      }

      // 4. Return state terupdate secara aman
      return {
        ...prev,
        pool: newPool,
        stakeholder: sourceZone === "stakeholder" ? newSourceItems : (targetZone === "stakeholder" ? newTargetItems : prev.stakeholder),
        action: sourceZone === "action" ? newSourceItems : (targetZone === "action" ? newTargetItems : prev.action),
        impact: sourceZone === "impact" ? newSourceItems : (targetZone === "impact" ? newTargetItems : prev.impact),
      };
    });
  }

  // Verifikasi kebenaran posisi kartu dan perhitungan poin
  const handleVerification = () => {
    const totalDitempatkan =
      items.stakeholder.length +
      items.action.length +
      items.impact.length;
    if (totalDitempatkan < 2) {
      alert(
        "⚠️ Analisis belum lengkap! Taruh minimal 2 kartu kata kunci untuk mulai verifikasi.",
      );
      return;
    }

    let correctCount = 0;
    let totalScore = 0;

    Object.keys(items).forEach((zoneKey) => {
      if (zoneKey !== "pool") {
        items[zoneKey as keyof typeof items].forEach((cardName) => {
          if (dynamicCase && dynamicCase.kunciJawaban[cardName] === zoneKey) {
            correctCount++;
            totalScore += dynamicCase.cardPoints[cardName] || 0;
          }
        });
      }
    });

    let feedbackText = "";
    if (correctCount > 0) {
      feedbackText = `Luar biasa! Anda berhasil menempatkan ${correctCount} kartu dengan benar dan mendapatkan total +${totalScore} Points.`;
    } else {
      feedbackText = "Kerja bagus sudah mencoba! Coba analisis kembali struktur keterkaitan pilarnya.";
    }

    setScoreResult({ pointsEarned: totalScore, feedback: feedbackText });
    setShowModal(true);

    if (totalScore > 0) {
      // Dapatkan progres saat ini
      const savedProgress = localStorage.getItem(`progress_${temaKey}`);
      const currentProgressInt = savedProgress ? parseInt(savedProgress, 10) : 0;
      
      // Update progres jika level yang diselesaikan lebih tinggi
      if (levelNum > currentProgressInt) {
        localStorage.setItem(`progress_${temaKey}`, String(levelNum));
      }
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
              Level {levelNum} - Eksplorasi
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              {dynamicCase?.judul}
            </h2>
          </div>
 
          <article className="text-sm text-slate-600 leading-relaxed space-y-4 border-t border-b border-slate-100 py-4">
            {dynamicCase?.narasi.map((paragraf, index) => (
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
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${lvl === levelNum ? "bg-indigo-600 text-white" : lvl < levelNum ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}
                >
                  {lvl}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <DroppableZone
              id="stakeholder"
              title="1. Stakeholder Utama"
              items={items.stakeholder}
            />
            <DroppableZone
              id="action"
              title="2. Rencana Tindakan (Action)"
              items={items.action}
            />
            <DroppableZone
              id="impact"
              title="3. Konsekuensi Capaian (Impact)"
              items={items.impact}
            />
          </div>

          <button
            onClick={handleVerification}
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all text-sm transform hover:-translate-y-0.5"
          >
            Verifikasi Analisis Level {levelNum}
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
                  +{scoreResult.pointsEarned} Points
                </p>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                  Poin Berhasil Didapatkan
                </p>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed px-2 mb-6">
                {scoreResult.feedback} Progres kamu telah diperbarui di papan
                peringkat secara *real-time*.
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
