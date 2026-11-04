import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { exportToCSV, exportToJSON, formatIDR } from '../utils';

interface AnalitikPerformaViewProps {
  language: Language;
}

export const AnalitikPerformaView: React.FC<AnalitikPerformaViewProps> = ({ language }) => {
  const t = translations[language];
  const [period, setPeriod] = useState<'mingguan' | 'bulanan' | 'kuartalan'>('bulanan');

  // Periodic metrics data
  const periodicData = {
    mingguan: {
      periodLabel: 'Minggu III September 2026',
      totalDonasi: 42500000,
      activeMembers: 3200,
      umkmTransaction: 68000000,
      dakwahStreamViewers: 14200,
      growthRate: '+12.5%',
      weeklyBars: [
        { label: 'Sen', value: 45 },
        { label: 'Sel', value: 60 },
        { label: 'Rab', value: 75 },
        { label: 'Kam', value: 85 },
        { label: 'Jum', value: 100 },
        { label: 'Sab', value: 90 },
        { label: 'Ahad', value: 95 },
      ],
    },
    bulanan: {
      periodLabel: 'September 2026',
      totalDonasi: 686100000,
      activeMembers: 18450,
      umkmTransaction: 245000000,
      dakwahStreamViewers: 48500,
      growthRate: '+24.8%',
      weeklyBars: [
        { label: 'Mgg 1', value: 65 },
        { label: 'Mgg 2', value: 80 },
        { label: 'Mgg 3', value: 92 },
        { label: 'Mgg 4', value: 88 },
      ],
    },
    kuartalan: {
      periodLabel: 'Kuartal III 2026 (Juli - September)',
      totalDonasi: 1850000000,
      activeMembers: 42000,
      umkmTransaction: 720000000,
      dakwahStreamViewers: 135000,
      growthRate: '+38.2%',
      weeklyBars: [
        { label: 'Juli', value: 70 },
        { label: 'Agustus', value: 85 },
        { label: 'September', value: 98 },
      ],
    },
  };

  const currentData = periodicData[period];

  const handleExportReportCSV = () => {
    const report = [
      {
        Periode: currentData.periodLabel,
        Total_Donasi_ZISWAF: currentData.totalDonasi,
        Anggota_Aktif: currentData.activeMembers,
        Transaksi_UMKM: currentData.umkmTransaction,
        Penonton_Dakwah_Digital: currentData.dakwahStreamViewers,
        Tingkat_Pertumbuhan: currentData.growthRate,
        Status_Audit: 'Akuntabel & WTP (Wajar Tanpa Pengecualian)',
      },
    ];
    exportToCSV(report, `Laporan_Performa_GRIK_${period}_2026.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Periodic Filter */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
                <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
                {t.tabAnalitik}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Analitik keterlibatan pengguna real-time & sistem pelaporan performa berkala ekosistem dakwah & ekonomi GRIK.
            </p>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
            <button
              type="button"
              onClick={() => setPeriod('mingguan')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                period === 'mingguan' ? 'bg-white dark:bg-stone-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-stone-500'
              }`}
            >
              Mingguan
            </button>
            <button
              type="button"
              onClick={() => setPeriod('bulanan')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                period === 'bulanan' ? 'bg-white dark:bg-stone-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-stone-500'
              }`}
            >
              Bulanan
            </button>
            <button
              type="button"
              onClick={() => setPeriod('kuartalan')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                period === 'kuartalan' ? 'bg-white dark:bg-stone-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-stone-500'
              }`}
            >
              Kuartalan (Q3)
            </button>
          </div>
        </div>

        {/* Action bar to download reports */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <span className="text-stone-500">
            Periode Aktif: <strong className="text-stone-900 dark:text-stone-100">{currentData.periodLabel}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportReportCSV}
              className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards for Selected Period */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
          <span className="text-xs text-stone-500">Total ZISWAF Periode Ini</span>
          <p className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
            {formatIDR(currentData.totalDonasi)}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {currentData.growthRate} vs periode lalu
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
          <span className="text-xs text-stone-500">Anggota Terlibat Aktif</span>
          <p className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
            {currentData.activeMembers.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-teal-600 font-medium">Jamaah Kaffah</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
          <span className="text-xs text-stone-500">Transaksi UMKM Binaan</span>
          <p className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
            {formatIDR(currentData.umkmTransaction)}
          </p>
          <span className="text-[11px] text-amber-600 font-medium">Perputaran Rill Umat</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
          <span className="text-xs text-stone-500">Penonton Dakwah Digital</span>
          <p className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
            {currentData.dakwahStreamViewers.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-purple-600 font-medium">Akses Global</span>
        </div>
      </div>

      {/* Visual Analytics Bar Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
              Visualisasi Tren Keterlibatan Jamaah ({currentData.periodLabel})
            </h3>
            <p className="text-xs text-stone-500">
              Aktivitas live stream, partisipasi donasi, dan penyelesaian modul pelatihan
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            Real-time Telemetry
          </span>
        </div>

        {/* Bar visualizer */}
        <div className="pt-6 pb-2">
          <div className="h-48 flex items-end gap-3 sm:gap-6 justify-between px-2">
            {currentData.weeklyBars.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition">
                  {bar.value}%
                </span>
                <div className="w-full max-w-[48px] bg-stone-100 dark:bg-stone-800 rounded-xl h-full flex items-end overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-teal-700 to-emerald-500 rounded-xl transition-all duration-700"
                    style={{ height: `${bar.value}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs space-y-2">
          <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Ringkasan Eksekutif Dewan Pengawas Syariah</span>
          </h4>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            Pada periode {currentData.periodLabel}, efisiensi penyaluran dana donasi ke program produktif mencapai 99.4%, dengan tingkat pengembalian modal Qardhul Hasan bergulir tanpa bunga tepat waktu mencapai 98.7%. Jangkauan dakwah digital menunjukkan lonjakan signifikan di kawasan Asia Tenggara dan diaspora global.
          </p>
        </div>
      </div>
    </div>
  );
};
