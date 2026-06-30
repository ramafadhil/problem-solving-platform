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
    isSuccess: false,
  });

  // Inisialisasi state untuk menampung pembagian zona kartu
  const [items, setItems] = useState({
    pool: [] as string[],
    stakeholder: [] as string[],
    action: [] as string[],
    impact: [] as string[],
  });

  const [isAlreadySolved, setIsAlreadySolved] = useState<boolean>(false);
  const [highestCompletedStage, setHighestCompletedStage] = useState<number>(0);
  const [totalStages, setTotalStages] = useState<number>(5);
  const [submittedCardIds, setSubmittedCardIds] = useState<number[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // State untuk data studi kasus dynamic dari API
  const [dynamicCase, setDynamicCase] = useState<{
    id?: number;
    judul: string;
    narasi: string[];
    pilihanKataKunci: string[];
    kunciJawaban: Record<string, string>;
    cardPoints: Record<string, number>;
    cardBlockIds: Record<string, number>;
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
            setTotalStages(filtered.length);
            
            // Dapatkan kasus pada indeks levelNum - 1
            const activeCase = filtered[levelNum - 1] || filtered[0];
            
            const logicBlocks = activeCase.logic_blocks || [];
            const keywords = logicBlocks.map((b: any) => b.content);
            const answers: Record<string, string> = {};
            const cardPoints: Record<string, number> = {};
            const cardBlockIds: Record<string, number> = {};
            logicBlocks.forEach((b: any) => {
              const cat = (b.category || b.pillar_category || "").toLowerCase();
              answers[b.content] = cat;
              cardPoints[b.content] = b.points || 0;
              cardBlockIds[b.content] = b.id || 0;
            });

            const paragraphs = activeCase.description
              ? activeCase.description.split("\n").filter((p: string) => p.trim() !== "")
              : [];

            setDynamicCase({
              id: activeCase.id,
              judul: activeCase.title,
              narasi: paragraphs,
              pilihanKataKunci: keywords,
              kunciJawaban: answers,
              cardPoints: cardPoints,
              cardBlockIds: cardBlockIds
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
        id: undefined,
        judul: kontenKasus.judul,
        narasi: kontenKasus.narasi,
        pilihanKataKunci: kontenKasus.pilihanKataKunci,
        kunciJawaban: kontenKasus.kunciJawaban,
        cardPoints: mockPoints,
        cardBlockIds: {}
      });
    };

    fetchStageCase();
  }, [temaKey, levelNum, kontenKasus]);

  // Inisialisasi halaman: cek solved status sebelum isi pool kartu (atomic, menghindari race condition)
  useEffect(() => {
    if (!dynamicCase) return;

    const initializePage = async () => {
      // Ambil user ID terlebih dahulu
      let userId: number | null = null;
      try {
        const profile = await apiFetch("/me");
        const user = profile?.data || profile;
        if (user?.id) {
          userId = Number(user.id);
          setCurrentUserId(userId);
        }
      } catch (err) {
        console.error("Gagal memuat profil user:", err);
      }

      const userSuffix = userId ? `_${userId}` : "";

      // Baca progress dari localStorage langsung (bukan dari state, agar tidak overwrite nilai lebih tinggi)
      const storedProgress = localStorage.getItem(`progress_${temaKey}${userSuffix}`);
      const storedProgressInt = storedProgress ? parseInt(storedProgress, 10) : 0;

      // Fungsi helper: update progress hanya jika nilai baru lebih tinggi
      const updateProgressSafely = (newLevel: number) => {
        const current = parseInt(localStorage.getItem(`progress_${temaKey}${userSuffix}`) || "0", 10);
        const updated = Math.max(current, newLevel);
        localStorage.setItem(`progress_${temaKey}${userSuffix}`, String(updated));
        setHighestCompletedStage(updated);
      };

      // Kunci localStorage berbasis case ID (bukan posisi level) agar kebal terhadap perubahan urutan
      const caseKey = dynamicCase.id ? `solved_case_${dynamicCase.id}${userSuffix}` : null;
      const detailsKey = dynamicCase.id ? `solved_case_details_${dynamicCase.id}${userSuffix}` : null;

      // 1. Cek localStorage berbasis case ID (cepat, sync)
      if (caseKey && localStorage.getItem(caseKey) === "true") {
        setIsAlreadySolved(true);
        updateProgressSafely(levelNum);
        if (detailsKey) {
          try {
            const savedDetails = localStorage.getItem(detailsKey);
            if (savedDetails) {
              setSubmittedCardIds(JSON.parse(savedDetails));
            }
          } catch (e) {
            console.error("Gagal parse saved details:", e);
          }
        }
        setIsMounted(true);
        return;
      }

      // Inisialisasi state progress dari localStorage
      setHighestCompletedStage(storedProgressInt);

      // 2. Cek backend jika ada case ID di database
      if (dynamicCase.id && userId) {
        try {
          const perspectives = await apiFetch(`/cases/${dynamicCase.id}/perspectives`);
          const list = Array.isArray(perspectives) ? perspectives : (perspectives?.data || []);
          if (Array.isArray(list)) {
            // Gunakan Number() untuk mencegah type mismatch antara string dan number
            const userPerspective = list.find((p: any) => Number(p.user_id || p.UserID) === Number(userId));
            if (userPerspective) {
              // Tandai case ID ini sebagai solved di localStorage
              if (caseKey) localStorage.setItem(caseKey, "true");

              // Ekstrak detail logic_block_id yang disubmit user
              const details = userPerspective.details || [];
              const submittedIds = details.map((d: any) => d.logic_block_id || 0).filter((id: number) => id !== 0);
              setSubmittedCardIds(submittedIds);
              if (detailsKey) {
                localStorage.setItem(detailsKey, JSON.stringify(submittedIds));
              }

              updateProgressSafely(levelNum);
              setIsAlreadySolved(true);
              setIsMounted(true);
              return;
            }
          }
        } catch (err) {
          console.error("Gagal memeriksa status dari backend:", err);
        }
      }

      // Fallback mock mode (tidak ada case ID): cek progress level saja
      if (!dynamicCase.id && levelNum <= storedProgressInt) {
        setIsAlreadySolved(true);
        setIsMounted(true);
        return;
      }

      // 3. Belum selesai - isi pool dan aktifkan play mode
      setItems({
        pool: dynamicCase.pilihanKataKunci,
        stakeholder: [],
        action: [],
        impact: [],
      });
      setIsMounted(true);
    };

    initializePage();
  }, [dynamicCase?.id, temaKey, levelNum]);

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
    // BLOKIR jika sudah pernah diselesaikan
    if (isAlreadySolved) return;

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
    let localScore = 0;
    let hasMismatch = false;

    Object.keys(items).forEach((zoneKey) => {
      if (zoneKey !== "pool") {
        items[zoneKey as keyof typeof items].forEach((cardName) => {
          if (dynamicCase) {
            const correctZone = dynamicCase.kunciJawaban[cardName];
            if (correctZone === zoneKey) {
              correctCount++;
              localScore += dynamicCase.cardPoints[cardName] || 0;
            } else {
              hasMismatch = true;
            }
          }
        });
      }
    });

    const isSuccess = !hasMismatch && correctCount >= 2;

    if (isSuccess) {
      const userSuffix = currentUserId ? `_${currentUserId}` : "";

      // Update progres lokal dulu (berbasis posisi level untuk dashboard)
      const savedProgress = localStorage.getItem(`progress_${temaKey}${userSuffix}`);
      const currentProgressInt = savedProgress ? parseInt(savedProgress, 10) : 0;
      if (levelNum > currentProgressInt) {
        localStorage.setItem(`progress_${temaKey}${userSuffix}`, String(levelNum));
      }
      // Tandai case ID ini sebagai solved agar kebal terhadap perubahan urutan
      if (dynamicCase?.id) {
        localStorage.setItem(`solved_case_${dynamicCase.id}${userSuffix}`, "true");

        // Simpan detail logic block ID yang ditempatkan oleh user
        const placedCardIds = [
          ...items.stakeholder.map(c => dynamicCase.cardBlockIds?.[c] || 0),
          ...items.action.map(c => dynamicCase.cardBlockIds?.[c] || 0),
          ...items.impact.map(c => dynamicCase.cardBlockIds?.[c] || 0)
        ].filter(id => id !== 0);
        setSubmittedCardIds(placedCardIds);
        localStorage.setItem(`solved_case_details_${dynamicCase.id}${userSuffix}`, JSON.stringify(placedCardIds));
      }

      // Kirim ke backend dan pakai points_awarded dari respons untuk modal
      if (dynamicCase?.id) {
        apiFetch("/perspectives", {
          method: "POST",
          body: JSON.stringify({
            case_id: dynamicCase.id,
            is_public: true,
            details: [
              ...items.stakeholder.map(content => ({
                pillar_category: "Stakeholder",
                content: content,
                text_content: content,
                logic_block_id: dynamicCase.cardBlockIds?.[content] || 0
              })),
              ...items.action.map(content => ({
                pillar_category: "Action",
                content: content,
                text_content: content,
                logic_block_id: dynamicCase.cardBlockIds?.[content] || 0
              })),
              ...items.impact.map(content => ({
                pillar_category: "Impact",
                content: content,
                text_content: content,
                logic_block_id: dynamicCase.cardBlockIds?.[content] || 0
              }))
            ]
          })
        }).then((res: any) => {
          const backendPoints = res?.points_awarded ?? localScore;
          const feedbackText = `Luar biasa! Anda berhasil menempatkan semua kartu dengan benar dan mendapatkan total +${backendPoints} Points di papan peringkat global.`;
          setScoreResult({ pointsEarned: backendPoints, feedback: feedbackText, isSuccess: true });
          setIsAlreadySolved(true);
        }).catch(err => {
          console.error("Gagal mengirim progress belajar ke backend:", err);
          // Fallback: tampilkan poin lokal jika backend gagal
          const feedbackText = `Luar biasa! Anda berhasil menempatkan semua kartu dengan benar dan mendapatkan total +${localScore} Points.`;
          setScoreResult({ pointsEarned: localScore, feedback: feedbackText, isSuccess: true });
          setIsAlreadySolved(true);
        });
        // Tampilkan modal dulu, lalu update poin saat respons backend datang
        setScoreResult({ pointsEarned: localScore, feedback: "Mengirim hasil ke server...", isSuccess: true });
        setShowModal(true);
        return;
      }
    } else {
      // Gagal atau belum benar semua
      const feedbackText = "Ada penempatan pilar kartu yang belum tepat. Silakan analisis kembali hubungan pilar-pilar tersebut.";
      setScoreResult({ pointsEarned: 0, feedback: feedbackText, isSuccess: false });
      setShowModal(true);
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
            <span className={`text-xs font-bold tracking-wider uppercase ${isAlreadySolved ? "text-emerald-600" : "text-indigo-600"}`}>
              Level {levelNum} - {isAlreadySolved ? "Peninjauan Analisis" : "Eksplorasi"}
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
              {isAlreadySolved ? "Status Level" : "Pilihan Kata Kunci"}
            </h3>
            {isAlreadySolved ? (
              <div className="p-4 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl text-xs text-emerald-800 font-extrabold flex items-center gap-2 shadow-inner">
                <span className="text-lg">🎉</span>
                <span>Level ini sudah selesai dianalisis. Skor optimal telah terekam di papan peringkat.</span>
              </div>
            ) : (
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
            )}
          </div>
        </section>

        {/* KOLOM KANAN: Tempat Peletakan DropZone / Tampilan Kunci Jawaban */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700">
              Kemajuan Analisis Jalur
            </span>
             <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: totalStages }, (_, idx) => idx + 1).map((lvl) => {
                const isActive = lvl === levelNum;
                const isLvlSolved = lvl <= highestCompletedStage;
                return (
                  <div
                    key={lvl}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isActive ? "bg-indigo-600 text-white" : isLvlSolved ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}
                  >
                    {lvl}
                  </div>
                );
              })}
            </div>
          </div>

          {isAlreadySolved ? (
            // Solved / Review Mode
            <div className="flex flex-col gap-3">
              {[
                { key: "stakeholder", title: "1. Stakeholder Utama" },
                { key: "action", title: "2. Rencana Tindakan (Action)" },
                { key: "impact", title: "3. Konsekuensi Capaian (Impact)" }
              ].map((category) => {
                const cardsInCategory = dynamicCase
                  ? Object.keys(dynamicCase.kunciJawaban).filter(
                      (cardName) => dynamicCase.kunciJawaban[cardName] === category.key
                    )
                  : [];

                return (
                  <div
                    key={category.key}
                    className="p-5 rounded-2xl border-2 border-slate-200 bg-white flex flex-col gap-3 shadow-sm"
                  >
                    <span className="text-xs font-black text-slate-450 uppercase tracking-wider">
                      {category.title}
                    </span>
                    <div className="flex flex-col gap-2">
                      {cardsInCategory.map((cardName) => {
                        const points = dynamicCase?.cardPoints[cardName] || 0;
                        const cardId = dynamicCase?.cardBlockIds?.[cardName] || 0;
                        const isChosenByUser = submittedCardIds.includes(cardId);

                        if (isChosenByUser) {
                          return (
                            <div
                              key={cardName}
                              className="px-4 py-3 bg-emerald-50/80 border-2 border-emerald-300 rounded-xl flex items-center justify-between font-bold text-sm text-slate-800 shadow-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-600 font-extrabold">✓</span>
                                <span>{cardName}</span>
                                <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  Pilihanmu
                                </span>
                              </div>
                              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                                +{points} Points
                              </span>
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={cardName}
                              className="px-4 py-3 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-between font-semibold text-sm text-slate-500 shadow-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-bold">○</span>
                                <span>{cardName}</span>
                                <span className="text-[9px] bg-slate-100 text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Alternatif
                                </span>
                              </div>
                              <span className="text-xs bg-slate-100 text-slate-400 px-2.5 py-1 rounded-lg">
                                +{points} Points
                              </span>
                            </div>
                          );
                        }
                      })}
                      {cardsInCategory.length === 0 && (
                        <span className="text-xs text-slate-400 italic">Tidak ada kartu pada pilar ini.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Play Mode (Droppable Zones)
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
          )}

          {isAlreadySolved ? (
            <button
              onClick={() => router.push(`/belajar/${temaKey}`)}
              className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm transform hover:-translate-y-0.5"
            >
              Kembali ke Peta Jalur Belajar
            </button>
          ) : (
            <button
              onClick={handleVerification}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all text-sm transform hover:-translate-y-0.5"
            >
              Verifikasi Analisis Level {levelNum}
            </button>
          )}
        </section>

        {/* MODAL NOTIFIKASI HASIL PENILAIAN */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-100">
              {scoreResult.isSuccess ? (
                <>
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className="text-lg font-black text-slate-900">
                    Analisis Selesai Diverifikasi!
                  </h3>

                  <div className="my-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-2xl font-black text-emerald-600">
                      +{scoreResult.pointsEarned} Points
                    </p>
                    <p className="text-xs text-emerald-500 font-semibold mt-0.5">
                      Poin Berhasil Didapatkan
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed px-2 mb-6">
                    {scoreResult.feedback} Progres kamu telah diperbarui di papan
                    peringkat secara *real-time*.
                  </p>

                  <button
                    onClick={handleBackToDashboard}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Kembali ke Peta Jalur Belajar
                  </button>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">⚠️</div>
                  <h3 className="text-lg font-black text-slate-900">
                    Analisis Belum Tepat!
                  </h3>

                  <div className="my-4 bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <p className="text-2xl font-black text-rose-600">
                      +0 Points
                    </p>
                    <p className="text-xs text-rose-500 font-semibold mt-0.5">
                      Silakan Evaluasi Kembali
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed px-2 mb-6">
                    {scoreResult.feedback}
                  </p>

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
