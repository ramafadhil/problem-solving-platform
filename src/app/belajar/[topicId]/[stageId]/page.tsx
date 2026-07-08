"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { Trophy, AlertTriangle, PartyPopper, Lightbulb, CheckCircle2, X, HelpCircle } from "lucide-react";
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
      className={`px-4 py-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] cursor-grab active:cursor-grabbing font-bold text-sm text-black transition-all active:translate-y-0.5 active:translate-x-0.5 active:shadow-none hover:bg-slate-50 ${
        isDragging
          ? "opacity-50 ring-2 ring-indigo-500/20 scale-105"
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
      className={`p-4 rounded-xl border-2 border-black min-h-[100px] transition-colors flex flex-col gap-2 shadow-[4px_4px_0px_#000] ${
        isOver ? "bg-[#FDEDEC]" : "bg-white"
      }`}
    >
      <span className="text-xs font-black text-black uppercase tracking-wider">
        {title}
      </span>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && (
          <span className="text-xs text-slate-500 my-auto italic py-2">
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
  const [showGameplayGuide, setShowGameplayGuide] = useState<boolean>(false);
  const [guideStep, setGuideStep] = useState<number>(1);
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

      const gameplayGuidedKey = userId ? `unravel_gameplay_guided_${userId}` : "unravel_gameplay_guided";
      const guided = localStorage.getItem(gameplayGuidedKey);
      if (!guided) {
        setShowGameplayGuide(true);
      }

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

  const renderGuideBox = () => {
    return (
      <div className="bg-[#FFFDF9] border-[3px] border-black rounded-[20px] shadow-[6px_6px_0px_#000] w-full p-5 flex flex-col gap-4 relative animate-in slide-in-from-top-4 duration-200 mt-4 z-40 text-left">
        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border-2 border-black px-2 py-0.5 rounded-md shadow-[1px_1px_0px_#000]">
            Petunjuk Bermain (Langkah {guideStep}/4)
          </span>
          <button
            onClick={() => {
              const key = currentUserId ? `unravel_gameplay_guided_${currentUserId}` : "unravel_gameplay_guided";
              localStorage.setItem(key, "true");
              setShowGameplayGuide(false);
            }}
            className="text-xs font-bold text-slate-500 hover:text-black hover:underline cursor-pointer"
          >
            Skip
          </button>
        </div>

        {/* Step content */}
        <div className="space-y-2">
          {guideStep === 1 && (
            <>
              <h4 className="text-sm font-black text-black font-sans">1. Membaca Deskripsi Kasus</h4>
              <p className="text-[11px] font-semibold text-slate-700 leading-relaxed font-mono">
                Di sisi kiri ini, bacalah narasi permasalahan kasus dengan cermat untuk menemukan pilar-pilar penting.
              </p>
            </>
          )}
          {guideStep === 2 && (
            <>
              <h4 className="text-sm font-black text-black font-sans">2. Pilih Kata Kunci</h4>
              <p className="text-[11px] font-semibold text-slate-700 leading-relaxed font-mono">
                Di bawah teks narasi, terdapat beberapa pilihan kata kunci penting yang mewakili pilar analisis.
              </p>
            </>
          )}
          {guideStep === 3 && (
            <>
              <h4 className="text-sm font-black text-black font-sans">3. Seret ke Pilar Drop Zone</h4>
              <p className="text-[11px] font-semibold text-slate-700 leading-relaxed font-mono">
                Seret kata kunci tersebut dan letakkan (drop) ke dalam salah satu dari 3 kategori pilar di sebelah kanan: Stakeholder, Action, atau Impact.
              </p>
            </>
          )}
          {guideStep === 4 && (
            <>
              <h4 className="text-sm font-black text-black font-sans">4. Lakukan Verifikasi</h4>
              <p className="text-[11px] font-semibold text-slate-700 leading-relaxed font-mono">
                Setelah semua pilar terisi, tekan tombol "Verifikasi" di bawah drop zone untuk mengevaluasi jawabanmu secara real-time.
              </p>
            </>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center border-t border-black pt-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`w-2 h-2 rounded-full border border-black ${
                  guideStep === step ? "bg-indigo-600" : "bg-white"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {guideStep > 1 && (
              <button
                onClick={() => setGuideStep((prev) => prev - 1)}
                className="px-3 py-1.5 bg-white border-2 border-black rounded-lg text-[10px] font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
              >
                Sebelumnya
              </button>
            )}
            {guideStep < 4 ? (
              <button
                onClick={() => setGuideStep((prev) => prev + 1)}
                className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 border-2 border-black text-white rounded-lg text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
              >
                Lanjut
              </button>
            ) : (
              <button
                onClick={() => {
                  const key = currentUserId ? `unravel_gameplay_guided_${currentUserId}` : "unravel_gameplay_guided";
                  localStorage.setItem(key, "true");
                  setShowGameplayGuide(false);
                }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 border-2 border-black text-white rounded-lg text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
              >
                Selesai!
              </button>
            )}
          </div>
        </div>
      </div>
    );
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
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-4 relative">
        {/* KOLOM KIRI: Teks Studi Kasus & Pool Kartu Pilihan */}
        <section className="md:col-span-5 bg-white border-[3px] border-black rounded-[24px] shadow-[8px_8px_0px_#000] p-6 flex flex-col gap-6">
          <div className={`transition-all duration-300 ${showGameplayGuide ? "blur-[2.5px] opacity-40 pointer-events-none" : ""}`}>
            <span className={`text-xs font-black tracking-wider uppercase ${isAlreadySolved ? "text-emerald-600" : "text-indigo-600"}`}>
              Level {levelNum} - {isAlreadySolved ? "Peninjauan Analisis" : "Eksplorasi"}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1 font-serif">
              {dynamicCase?.judul}
            </h2>
          </div>
 
          <article
            id="guide-narrative"
            className={`text-sm text-slate-700 leading-relaxed space-y-4 border-t-2 border-b-2 border-black py-4 font-mono transition-all duration-300 ${
              showGameplayGuide
                ? guideStep === 1
                  ? "ring-[4px] ring-indigo-600 ring-offset-4 rounded-lg bg-indigo-50/30 p-2 scale-[1.01] z-30 relative"
                  : "blur-[2.5px] opacity-40 pointer-events-none"
                : ""
            }`}
          >
            {dynamicCase?.narasi.map((paragraf, index) => (
              <p key={index}>{paragraf}</p>
            ))}
          </article>
          {showGameplayGuide && guideStep === 1 && renderGuideBox()}

          <div
            id="guide-keywords"
            className={`transition-all duration-300 ${
              showGameplayGuide
                ? guideStep === 2
                  ? "ring-[4px] ring-indigo-600 ring-offset-4 rounded-2xl p-3 bg-indigo-50/30 scale-[1.01] z-30 relative"
                  : "blur-[2.5px] opacity-40 pointer-events-none"
                : ""
            }`}
          >
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
              {isAlreadySolved ? "Status Level" : "Pilihan Kata Kunci"}
            </h3>
            {isAlreadySolved ? (
              <div className="p-4 bg-emerald-100 border-2 border-black rounded-2xl text-xs text-emerald-900 font-extrabold flex items-center gap-2 shadow-[3px_3px_0px_#000]">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
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
          {showGameplayGuide && guideStep === 2 && renderGuideBox()}
        </section>

        {/* KOLOM KANAN: Tempat Peletakan DropZone / Tampilan Kunci Jawaban */}
        <section className="md:col-span-7 flex flex-col gap-4">
          <div className={`bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] flex justify-between items-center transition-all duration-300 ${showGameplayGuide ? "blur-[2.5px] opacity-40 pointer-events-none" : ""}`}>
            <span className="text-sm font-black text-black">
              Kemajuan Analisis Jalur
            </span>
             <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: totalStages }, (_, idx) => idx + 1).map((lvl) => {
                const isActive = lvl === levelNum;
                const isLvlSolved = lvl <= highestCompletedStage;
                return (
                  <div
                    key={lvl}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0px_#000] ${isActive ? "bg-indigo-650 text-white" : isLvlSolved ? "bg-[#00c853] text-white" : "bg-slate-100 text-slate-400 opacity-60 shadow-none border-dashed border-slate-350"}`}
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
                    className="p-5 rounded-2xl border-2 border-black bg-white flex flex-col gap-3 shadow-[4px_4px_0px_#000]"
                  >
                    <span className="text-xs font-black text-black uppercase tracking-wider">
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
                               className="px-4 py-3 bg-emerald-100 border-2 border-black rounded-xl flex items-center justify-between font-bold text-sm text-emerald-900 shadow-[2px_2px_0px_#000]"
                             >
                               <div className="flex items-center gap-2">
                                 <CheckCircle2 size={16} className="text-emerald-750 shrink-0" />
                                 <span>{cardName}</span>
                                 <span className="text-[9px] bg-emerald-600 border border-black text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                   Pilihanmu
                                 </span>
                               </div>
                               <span className="text-xs bg-emerald-250 border border-black text-emerald-800 px-2.5 py-1 rounded-lg">
                                 +{points} Points
                               </span>
                             </div>
                           );
                        } else {
                          return (
                            <div
                              key={cardName}
                              className="px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-between font-semibold text-sm text-slate-400"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-bold">○</span>
                                <span>{cardName}</span>
                                <span className="text-[9px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Alternatif
                                </span>
                              </div>
                              <span className="text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
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
             <div
               id="guide-zones"
               className={`flex flex-col gap-3 transition-all duration-300 ${
                 showGameplayGuide
                   ? guideStep === 3
                     ? "ring-[4px] ring-indigo-600 ring-offset-4 rounded-2xl p-3 bg-indigo-50/30 scale-[1.01] z-30 relative"
                     : "blur-[2.5px] opacity-40 pointer-events-none"
                   : ""
               }`}
             >
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
          {showGameplayGuide && guideStep === 3 && renderGuideBox()}

          {isAlreadySolved ? (
            <button
              onClick={() => router.push(`/belajar/${temaKey}`)}
              className={`w-full mt-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all text-sm font-black uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                showGameplayGuide ? "blur-[2.5px] opacity-40 pointer-events-none" : ""
              }`}
            >
              Kembali ke Peta Jalur Belajar
            </button>
          ) : (
            <>
              <button
                id="guide-verify"
                onClick={handleVerification}
                className={`w-full mt-2 py-3.5 bg-indigo-650 hover:bg-indigo-700 text-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all text-sm font-black uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                  showGameplayGuide
                    ? guideStep === 4
                      ? "ring-[4px] ring-indigo-600 ring-offset-4 animate-pulse scale-[1.01] z-30 relative"
                      : "blur-[2.5px] opacity-40 pointer-events-none"
                    : ""
                }`}
              >
                Verifikasi Analisis Level {levelNum}
              </button>
              {showGameplayGuide && guideStep === 4 && renderGuideBox()}
            </>
          )}
        </section>

        {/* MODAL NOTIFIKASI HASIL PENILAIAN */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-[8px_8px_0px_#000] border-2 border-black space-y-4">
              {scoreResult.isSuccess ? (
                <>
                  <div className="text-amber-500 flex justify-center mb-2">
                    <PartyPopper size={48} className="animate-bounce" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Analisis Selesai Diverifikasi!
                  </h3>

                  <div className="my-4 bg-[#FDEDEC] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]">
                    <p className="text-2xl font-black text-indigo-650">
                      +{scoreResult.pointsEarned} Points
                    </p>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                      Poin Berhasil Didapatkan
                    </p>
                  </div>

                  <p className="text-xs text-slate-550 leading-relaxed px-2 mb-6 font-semibold">
                    {scoreResult.feedback} Progres kamu telah diperbarui di papan
                    peringkat secara *real-time*.
                  </p>

                  <button
                    onClick={handleBackToDashboard}
                    className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
                  >
                    Kembali ke Peta Jalur Belajar
                  </button>
                </>
              ) : (
                <>
                  <div className="text-rose-500 flex justify-center mb-2">
                    <AlertTriangle size={48} className="animate-pulse" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Analisis Belum Tepat!
                  </h3>

                  <div className="my-4 bg-[#FDEDEC] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]">
                    <p className="text-2xl font-black text-rose-600">
                      +0 Points
                    </p>
                    <p className="text-xs text-rose-500 font-semibold mt-0.5">
                      Silakan Evaluasi Kembali
                    </p>
                  </div>

                  <p className="text-xs text-slate-550 leading-relaxed px-2 mb-6 font-semibold">
                    {scoreResult.feedback}
                  </p>

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FLOATING TUTORIAL HELP BUTTON */}
      {!showGameplayGuide && !isAlreadySolved && (
        <button
          onClick={() => {
            setGuideStep(1);
            setShowGameplayGuide(true);
          }}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#FDE293] hover:bg-[#fddb73] text-black border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all cursor-pointer z-40"
          title="Buka Petunjuk Bermain"
        >
          <HelpCircle size={22} className="stroke-[3]" />
        </button>
      )}
    </DndContext>
  );
}
