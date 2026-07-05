"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface NotificationItem {
  id: number;
  user_id: number;
  message: string;
  case_id: number;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch("/notifications");
      // Backend returns either direct array or { data: [] }
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (Array.isArray(list)) {
        setNotifications(list);
      }
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await apiFetch("/notifications", { method: "DELETE" });
      setNotifications([]);
    } catch (err) {
      console.error("Gagal menghapus notifikasi:", err);
    }
  };

  const handleNotifClick = (caseId: number) => {
    setIsOpen(false);
    router.push(`/diskusi/${caseId}`);
  };

  // Fetch on mount and set polling interval
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000); // Poll every 15s

    return () => clearInterval(interval);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button - Neobrutalist Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white border-[3px] border-black text-slate-700 hover:bg-amber-100 flex items-center justify-center relative cursor-pointer transition-all shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0_#000] select-none"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 rounded-full bg-rose-500 border-[3px] border-black text-[9px] font-black text-white flex items-center justify-center shadow-[2px_2px_0_#000]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown - Neobrutalist Style */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0_#000] z-[999] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-amber-50 border-b-[3px] border-black flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              🔔 Notifikasi
            </span>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[10px] text-slate-600 hover:text-rose-600 font-black uppercase tracking-wide cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-rose-50 border-2 border-transparent hover:border-rose-300"
              >
                Hapus Semua
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <span className="text-3xl block mb-2">📭</span>
                <p className="text-xs text-slate-500 font-bold">
                  Tidak ada notifikasi baru.
                </p>
              </div>
            ) : (
              <div className="divide-y-[2px] divide-slate-200">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotifClick(notif.case_id)}
                    className={`p-3.5 hover:bg-amber-50 cursor-pointer transition-colors flex flex-col gap-1.5 text-left group ${
                      !notif.is_read ? "bg-indigo-50 border-l-4 border-indigo-500" : ""
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 leading-relaxed group-hover:text-indigo-700">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2">
                      {!notif.is_read && (
                        <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-md border border-indigo-700">
                          Baru
                        </span>
                      )}
                      <span className="text-[9px] text-slate-500 font-semibold">
                        {new Date(notif.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} · {new Date(notif.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
