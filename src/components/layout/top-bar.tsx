"use client";

import { Search, Bell, Globe, LogOut, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { useTranslation } from "@/hooks/use-translation";
import { cn, getInitials } from "@/lib/utils";

export default function TopBar() {
  const { data: session } = useSession();
  const { language, setLanguage, unreadCount } = useAppStore();
  const { t, isRTL } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-surface border-b border-border z-30 flex items-center px-4 gap-4">
      {/* Logo */}
      <Link
        href="/my-day"
        className="flex items-center gap-2 font-bold text-xl text-primary shrink-0"
      >
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-sm">
          Æ
        </div>
        <span>Aetheria</span>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            placeholder={t("common.search")}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background rounded-xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            onFocus={() => setSearchOpen(true)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === "en" ? "he" : "en")}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-border hover:bg-gray-50 transition-colors"
          aria-label="Switch language"
        >
          <Globe size={15} className="text-text-secondary" />
          <span className="text-text-secondary">{language === "en" ? "EN" : "HE"}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-surface rounded-2xl shadow-modal border border-border z-50 p-4 slide-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{t("notifications.title")}</h3>
                <button className="text-xs text-primary hover:underline">
                  {t("notifications.markAllRead")}
                </button>
              </div>
              <p className="text-sm text-text-secondary text-center py-4">
                {t("notifications.noNotifications")}
              </p>
            </div>
          )}
        </div>

        {/* User avatar */}
        {session?.user && (
          <div className="relative">
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center hover:bg-primary/20 transition-colors overflow-hidden"
              aria-label="User menu"
            >
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={session.user.name ?? ""} className="w-full h-full object-cover" />
              ) : (
                getInitials(session.user.name ?? "U")
              )}
            </button>

            {userOpen && (
              <div className="absolute right-0 top-11 w-48 bg-surface rounded-2xl shadow-modal border border-border z-50 p-2 slide-in">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium truncate">{session.user.name}</p>
                  <p className="text-xs text-text-secondary truncate">{session.user.email}</p>
                </div>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => setUserOpen(false)}
                >
                  <User size={15} />
                  <span>{t("settings.profile")}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-danger rounded-xl hover:bg-danger/5 transition-colors w-full"
                >
                  <LogOut size={15} />
                  <span>{t("auth.logout")}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
