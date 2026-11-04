import React from 'react';
import {
  ShieldCheck,
  Bell,
  Cloud,
  RefreshCw,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Language, Theme, ViewMode, UserProfile, AppNotification } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  user: UserProfile;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  isSyncing: boolean;
  onManualSync: () => void;
  lastSyncTime: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
  theme,
  setTheme,
  viewMode,
  setViewMode,
  user,
  notifications,
  onOpenNotifications,
  isSyncing,
  onManualSync,
  lastSyncTime,
}) => {
  const t = translations[language];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-600/20 shrink-0">
              <span className="font-bold text-lg sm:text-xl tracking-tighter font-serif">GR</span>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-stone-900 border-2 border-white dark:border-stone-900">
                K
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50 tracking-tight truncate">
                  GRIK <span className="text-emerald-600 dark:text-emerald-400 font-serif">Kaffah</span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Syariah AI Cloud
                </span>
              </div>
              <p className="hidden sm:block text-xs text-stone-500 dark:text-stone-400 truncate max-w-md">
                {t.appTagline}
              </p>
            </div>
          </div>

          {/* Center & Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* View Mode Switcher: Mobile App vs Web Portal */}
            <div className="hidden lg:flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setViewMode('web')}
                title="Tampilan Portal Web"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'web'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Web Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                title="Tampilan Mobile App View"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Mobile Frame</span>
              </button>
            </div>

            {/* Cloud Sync Status & Trigger */}
            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              title={`Status Cloud Sync: Terhubung | Terakhir: ${lastSyncTime}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xl:inline text-[11px]">{t.realtimeSync}</span>
              <RefreshCw className={`w-3 h-3 text-stone-500 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Language Switcher */}
            <div className="relative flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 border border-stone-200 dark:border-stone-700 text-xs">
              <Globe className="w-3.5 h-3.5 ml-2 text-stone-500 hidden sm:inline" />
              <select
                aria-label="Pilih Bahasa"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent font-semibold py-1.5 px-2 text-stone-700 dark:text-stone-300 focus:outline-hidden cursor-pointer"
              >
                <option value="id" className="dark:bg-stone-900">ID (Indonesia)</option>
                <option value="en" className="dark:bg-stone-900">EN (English)</option>
                <option value="ar" className="dark:bg-stone-900">AR (العربية)</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Ganti Tema Gelap / Terang"
              className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label="Buka Notifikasi"
              className="relative p-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 2FA Shield Badge & Profile Avatar */}
            <div className="flex items-center gap-2 pl-1 border-l border-stone-200 dark:border-stone-800">
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-emerald-500/50"
                />
                {user.is2FAEnabled && (
                  <span
                    title="2FA Aktif - Perlindungan Kriptografis Dua Langkah"
                    className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-600 text-white shadow-xs"
                  >
                    <ShieldCheck className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
