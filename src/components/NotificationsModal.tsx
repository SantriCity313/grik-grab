import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  Calendar,
  Lock,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AppNotification, Language } from '../types';
import { translations } from '../translations';

interface NotificationsModalProps {
  language: Language;
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelectAction: (targetView: any) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  language,
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onSelectAction,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'dakwah':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case 'donasi':
        return <HeartHandshake className="w-4 h-4 text-rose-500" />;
      case 'keamanan':
        return <Lock className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <Bell className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                Notifikasi Push & Pembaruan
              </h3>
              <p className="text-[11px] text-stone-500">Notifikasi otomatis & sinkronisasi data aman</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Tandai Dibaca
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (n.actionTab) onSelectAction(n.actionTab);
                onClose();
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                n.isRead
                  ? 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                  {getIcon(n.type)}
                  <span>{n.title}</span>
                </div>
                <span className="text-[10px] text-stone-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {n.timestamp}
                </span>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {n.message}
              </p>

              {n.actionTab && (
                <div className="pt-1 flex justify-end">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>Buka Menu</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
