import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Store,
  GraduationCap,
  HeartHandshake,
  BarChart3,
  CalendarDays,
  Lock,
  ShieldCheck,
  Bot,
  CloudDownload,
} from 'lucide-react';
import { NavigationTab, Language } from '../types';
import { translations } from '../translations';

interface NavigationProps {
  activeTab: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  setActiveTab?: (tab: NavigationTab) => void;
  language: Language;
  orientation?: 'vertical' | 'horizontal';
  isMobileView?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  setActiveTab,
  language,
  orientation = 'horizontal',
  isMobileView = false,
}) => {
  const t = translations[language];
  const handleSelect = onSelectTab || setActiveTab || (() => {});

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: t.tabDashboard, icon: LayoutDashboard },
    { id: 'dakwah', label: t.tabDakwah, icon: Radio, badge: 'LIVE' },
    { id: 'ekonomi', label: t.tabEkonomi, icon: Store },
    { id: 'pelatihan', label: t.tabPelatihan, icon: GraduationCap },
    { id: 'donasi', label: t.tabDonasi, icon: HeartHandshake, badge: 'Audit' },
    { id: 'analitik', label: t.tabAnalitik, icon: BarChart3 },
    { id: 'kalender', label: t.tabKalender, icon: CalendarDays },
    { id: 'pesan', label: t.tabPesanE2EE, icon: Lock, badge: 'E2EE' },
    { id: 'keamanan', label: t.tabKeamanan2FA, icon: ShieldCheck },
    { id: 'asisten', label: t.tabAsistenAI, icon: Bot, badge: 'AI' },
    { id: 'backup', label: t.tabBackupEkspor, icon: CloudDownload },
  ];

  const isTabActive = (itemId: string) => {
    if (activeTab === itemId) return true;
    if (itemId === 'pesan' && activeTab === 'pesan_e2ee') return true;
    if (itemId === 'keamanan' && activeTab === 'keamanan_2fa') return true;
    if (itemId === 'asisten' && activeTab === 'asisten_ai') return true;
    if (itemId === 'backup' && activeTab === 'backup_ekspor') return true;
    return false;
  };

  if (isMobileView) {
    // Mobile Bottom Bar (5 quick tabs + swipeable)
    return (
      <nav className="flex items-center justify-around py-1 gap-1 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isTabActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl min-w-[54px] transition cursor-pointer ${
                active
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.badge === 'LIVE' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <span className="text-[9px] mt-0.5 truncate max-w-[52px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Horizontal Desktop Navigation Bar / Bento Tab Strip
  return (
    <div className="p-1.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
      <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isTabActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                active
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    active
                      ? 'bg-emerald-700/80 text-white'
                      : item.badge === 'LIVE'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                      : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
