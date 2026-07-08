"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { Bell } from "lucide-react";

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
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white border-2 border-black text-black hover:bg-indigo-50 flex items-center justify-center relative cursor-pointer transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none select-none"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 border border-black text-[9px] font-black text-white flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="fixed top-20 left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-3 sm:w-80 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-indigo-50/50 border-b-2 border-black flex items-center justify-between">
            <span className="text-xs font-black text-black uppercase tracking-wider">
              Notifikasi
            </span>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[10px] text-slate-400 hover:text-rose-600 font-extrabold uppercase tracking-wide cursor-pointer transition-colors"
              >
                Hapus Semua
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                {/* <span className="text-2xl block mb-1">📭</span> */}
                <p className="text-xs text-slate-400 font-semibold italic">
                  Tidak ada notifikasi baru.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif.case_id)}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col gap-1 text-left ${
                    !notif.is_read ? "bg-indigo-50/20" : ""
                  }`}
                >
                  <p className="text-xs font-extrabold text-slate-700 leading-normal">
                    {notif.message}
                  </p>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {new Date(notif.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} - {new Date(notif.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
