import React, { useState } from 'react';
import {
  CloudDownload,
  CloudUpload,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Download,
  RotateCcw,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { CloudBackupSnapshot, Language } from '../types';
import { translations } from '../translations';
import { exportToCSV, exportToJSON } from '../utils';

interface BackupEksporViewProps {
  language: Language;
  snapshots: CloudBackupSnapshot[];
  onTriggerBackup: () => void;
  onRestoreSnapshot: (snap: CloudBackupSnapshot) => void;
  isBackingUp: boolean;
  transactionsData: any[];
  businessesData: any[];
  campaignsData: any[];
}

export const BackupEksporView: React.FC<BackupEksporViewProps> = ({
  language,
  snapshots,
  onTriggerBackup,
  onRestoreSnapshot,
  isBackingUp,
  transactionsData,
  businessesData,
  campaignsData,
}) => {
  const t = translations[language];
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  const handleExportCSV = (type: 'donasi' | 'umkm' | 'kampanye') => {
    if (type === 'donasi') {
      exportToCSV(transactionsData, `GRIK_Donasi_Ledger_${Date.now()}.csv`);
    } else if (type === 'umkm') {
      exportToCSV(businessesData, `GRIK_UMKM_Binaan_${Date.now()}.csv`);
    } else {
      exportToCSV(campaignsData, `GRIK_Kampanye_ZISWAF_${Date.now()}.csv`);
    }
  };

  const handleExportAllJSON = () => {
    const fullBackup = {
      platform: 'GRIK Gerakan Rakyat Islamicity Kaffah',
      timestamp: new Date().toISOString(),
      version: 'v2.4.0',
      data: {
        donations: transactionsData,
        businesses: businessesData,
        campaigns: campaignsData,
      },
    };
    exportToJSON(fullBackup, `GRIK_Full_System_Backup_${Date.now()}.json`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                <CloudDownload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
                {t.tabBackupEkspor}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              {t.cloudBackupSubtitle}
            </p>
          </div>

          {/* Backup Now Trigger */}
          <button
            type="button"
            onClick={onTriggerBackup}
            disabled={isBackingUp}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <CloudUpload className={`w-4 h-4 ${isBackingUp ? 'animate-bounce' : ''}`} />
            <span>{isBackingUp ? 'Menyinkronkan ke Cloud...' : t.backupCloud}</span>
          </button>
        </div>

        {/* Auto backup status bar */}
        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {t.autoBackupEnabled}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
            className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-medium underline"
          >
            {autoBackupEnabled ? 'Ubah Interval Backup' : 'Aktifkan Auto-Backup'}
          </button>
        </div>
      </div>

      {/* Grid: Cloud Snapshot Manager & Multi-Format Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Cloud Snapshots & Disaster Recovery */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                Riwayat Snapshot Cloud Terenkripsi
              </h3>
            </div>
            <span className="text-[11px] font-bold text-stone-400">
              {snapshots.length} Snapshot
            </span>
          </div>

          <div className="space-y-3">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">
                    {snap.id}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {(snap.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>

                <p className="text-[11px] text-stone-500">
                  Waktu Snapshot: <strong>{snap.timestamp}</strong>
                </p>
                <p className="text-[10px] text-stone-400 truncate">
                  Infrastruktur: {snap.deviceInfo}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-stone-200 dark:border-stone-700/60 text-[11px]">
                  <span className="text-stone-500">
                    {snap.recordCounts.donations} Trx • {snap.recordCounts.businesses} UMKM • {snap.recordCounts.messages} Pesan
                  </span>
                  <button
                    type="button"
                    onClick={() => onRestoreSnapshot(snap)}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Pulihkan Snapshot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Multi-Format Document Export Center */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
              {t.exportTitle}
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            {t.exportSubtitle}
          </p>

          <div className="space-y-3 pt-2">
            {/* Format 1: Official PDF / Print */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Laporan Resmi Audit ZISWAF & UMKM (PDF)
                  </h4>
                  <p className="text-[11px] text-stone-500">Format dokumen siap cetak resmi berkop GRIK Kaffah</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 font-bold text-xs transition cursor-pointer"
              >
                Cetak / PDF
              </button>
            </div>

            {/* Format 2: CSV Spreadsheet */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Buku Kas Donasi & Zakat (CSV)
                  </h4>
                  <p className="text-[11px] text-stone-500">Kompatibel penuh Microsoft Excel dan Google Sheets</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleExportCSV('donasi')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Unduh CSV
              </button>
            </div>

            {/* Format 3: JSON Archive */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Arsip Sistem Lengkap (JSON Snapshot)
                  </h4>
                  <p className="text-[11px] text-stone-500">Cadangan basis data terstruktur multi-tabel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportAllJSON}
                className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 font-bold text-xs transition cursor-pointer"
              >
                Unduh JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
