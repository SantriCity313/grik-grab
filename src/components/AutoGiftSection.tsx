import React, { useState } from 'react';
import {
  Sparkles,
  PieChart,
  CheckCircle2,
  Calendar,
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Sliders,
  HeartHandshake,
  TrendingUp,
  Receipt,
  AlertCircle,
  Coins,
  Building,
  Check,
  Zap,
} from 'lucide-react';
import {
  DonationCampaign,
  DonationTransaction,
  Language,
  AutoGiftConfig,
  AutoGiftCategoryAllocation,
  AutoGiftExecutionLog,
} from '../types';
import { translations } from '../translations';
import { formatIDR, formatCompactNumber } from '../utils';

export interface AutoGiftSectionProps {
  language: Language;
  campaigns: DonationCampaign[];
  config: AutoGiftConfig;
  onUpdateConfig: (updated: AutoGiftConfig) => void;
  onOpenReceipt?: (trx: DonationTransaction) => void;
  className?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  'Zakat': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    bar: 'bg-emerald-600',
    border: 'border-emerald-300 dark:border-emerald-800',
  },
  'Wakaf Produktif': {
    bg: 'bg-teal-50 dark:bg-teal-950/60',
    text: 'text-teal-700 dark:text-teal-300',
    bar: 'bg-teal-600',
    border: 'border-teal-300 dark:border-teal-800',
  },
  'Modal UMKM': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    bar: 'bg-indigo-600',
    border: 'border-indigo-300 dark:border-indigo-800',
  },
  'Infaq': {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    bar: 'bg-amber-500',
    border: 'border-amber-300 dark:border-amber-800',
  },
  'Kemanusiaan': {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    bar: 'bg-rose-500',
    border: 'border-rose-300 dark:border-rose-800',
  },
};

export const AutoGiftSection: React.FC<AutoGiftSectionProps> = ({
  language,
  campaigns,
  config,
  onUpdateConfig,
  onOpenReceipt,
  className = '',
}) => {
  const t = translations[language];

  // Editable local state
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(config.totalMonthlyBudget);
  const [customBudgetStr, setCustomBudgetStr] = useState<string>('');
  const [billingDay, setBillingDay] = useState<number>(config.billingDay);
  const [paymentMethod, setPaymentMethod] = useState(config.paymentMethod);
  const [allocations, setAllocations] = useState<AutoGiftCategoryAllocation[]>(config.allocations);
  const [historyLogs, setHistoryLogs] = useState<AutoGiftExecutionLog[]>(config.historyLogs || []);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<AutoGiftExecutionLog | null>(null);

  // Preset budget buttons
  const budgetPresets = [250000, 500000, 1000000, 2000000, 5000000];

  // Calculate sum of percentages
  const totalPercentage = allocations.reduce((sum, item) => sum + item.percentage, 0);
  const isBalanced = totalPercentage === 100;

  const notify = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Adjust percentage for a category
  const handlePercentageChange = (index: number, newPercent: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newPercent)));
    setAllocations((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, percentage: clamped } : item))
    );
  };

  // Assign designated campaign for a category
  const handleCampaignChange = (index: number, campaignId: string) => {
    const matched = campaigns.find((c) => c.id === campaignId);
    setAllocations((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              designatedCampaignId: campaignId,
              notes: matched ? matched.title : item.notes,
            }
          : item
      )
    );
  };

  // Quick Preset Strategies
  const applyPresetStrategy = (strategy: 'balanced' | 'economic' | 'zakatPriority') => {
    if (strategy === 'balanced') {
      setAllocations([
        { category: 'Zakat', percentage: 40, designatedCampaignId: 'cmp-03', notes: 'Zakat Mal Vokasi Duafa' },
        { category: 'Wakaf Produktif', percentage: 30, designatedCampaignId: 'cmp-01', notes: 'Wakaf Sentra Grosir Halal' },
        { category: 'Modal UMKM', percentage: 20, designatedCampaignId: 'cmp-02', notes: 'Modal 100 Ibu Tangguh' },
        { category: 'Infaq', percentage: 10, designatedCampaignId: 'cmp-03', notes: 'Infaq Dakwah Santri' },
      ]);
      notify('Strategi "Seimbang Syariah" (40% Zakat, 30% Wakaf, 20% UMKM, 10% Infaq) diterapkan.');
    } else if (strategy === 'economic') {
      setAllocations([
        { category: 'Modal UMKM', percentage: 45, designatedCampaignId: 'cmp-02', notes: 'Modal 100 Ibu Tangguh' },
        { category: 'Wakaf Produktif', percentage: 35, designatedCampaignId: 'cmp-01', notes: 'Wakaf Sentra Grosir Halal' },
        { category: 'Zakat', percentage: 10, designatedCampaignId: 'cmp-03', notes: 'Zakat Mal Vokasi Duafa' },
        { category: 'Infaq', percentage: 10, designatedCampaignId: 'cmp-03', notes: 'Infaq Dakwah Santri' },
      ]);
      notify('Strategi "Fokus Pemberdayaan UMKM" (45% UMKM, 35% Wakaf, 10% Zakat, 10% Infaq) diterapkan.');
    } else if (strategy === 'zakatPriority') {
      setAllocations([
        { category: 'Zakat', percentage: 60, designatedCampaignId: 'cmp-03', notes: 'Zakat Mal Vokasi Duafa' },
        { category: 'Kemanusiaan', percentage: 20, designatedCampaignId: 'cmp-02', notes: 'Bantuan Darurat Duafa' },
        { category: 'Wakaf Produktif', percentage: 10, designatedCampaignId: 'cmp-01', notes: 'Wakaf Sentra Grosir Halal' },
        { category: 'Infaq', percentage: 10, designatedCampaignId: 'cmp-03', notes: 'Infaq Dakwah Santri' },
      ]);
      notify('Strategi "Prioritas Zakat & Duafa" (60% Zakat, 20% Kemanusiaan, 10% Wakaf, 10% Infaq) diterapkan.');
    }
  };

  // Auto-Balance to 100%
  const handleAutoBalance = () => {
    if (allocations.length === 0) return;
    const currentSum = allocations.reduce((sum, a) => sum + a.percentage, 0);
    if (currentSum === 0) {
      const equalShare = Math.floor(100 / allocations.length);
      const remainder = 100 - equalShare * allocations.length;
      setAllocations((prev) =>
        prev.map((a, i) => ({
          ...a,
          percentage: equalShare + (i === 0 ? remainder : 0),
        }))
      );
    } else {
      let allocatedTotal = 0;
      const normalized = allocations.map((a, i) => {
        if (i === allocations.length - 1) {
          return { ...a, percentage: 100 - allocatedTotal };
        }
        const proportion = Math.round((a.percentage / currentSum) * 100);
        allocatedTotal += proportion;
        return { ...a, percentage: proportion };
      });
      setAllocations(normalized);
    }
    notify('Alokasi persentase berhasil diseimbangkan tepat 100%!');
  };

  // Save Config
  const handleSaveConfig = () => {
    if (!isBalanced) {
      alert(`Total alokasi harus genap 100%. Saat ini: ${totalPercentage}%`);
      return;
    }

    const effectiveBudget = customBudgetStr
      ? parseInt(customBudgetStr.replace(/\D/g, '') || '0', 10)
      : monthlyBudget;

    if (effectiveBudget < 50000) {
      alert('Anggaran bulanan minimal adalah Rp 50.000');
      return;
    }

    const updated: AutoGiftConfig = {
      ...config,
      isEnabled,
      totalMonthlyBudget: effectiveBudget,
      billingDay,
      paymentMethod,
      allocations,
      nextExecutionDate: `${billingDay < 10 ? `0${billingDay}` : billingDay} Oktober 2026`,
      historyLogs,
    };

    onUpdateConfig(updated);
    notify(
      `Alhamdulillah! Konfigurasi Auto-Gift proporsional sebesar ${formatIDR(
        effectiveBudget
      )}/bulan berhasil disimpan & diaktifkan.`
    );
  };

  // Immediate Simulation Execution
  const handleRunInstantSimulation = () => {
    if (!isBalanced) {
      alert(`Harap seimbangkan alokasi persentase ke 100% sebelum simulasi. Saat ini: ${totalPercentage}%`);
      return;
    }

    setIsSimulating(true);

    const effectiveBudget = customBudgetStr
      ? parseInt(customBudgetStr.replace(/\D/g, '') || '0', 10)
      : monthlyBudget;

    setTimeout(() => {
      const generatedLog: AutoGiftExecutionLog = {
        id: `ag-log-${Date.now()}`,
        date: '30 September 2026',
        totalAmount: effectiveBudget,
        status: 'Berhasil',
        receiptHash: `0x${Array.from({ length: 32 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`,
        allocations: allocations.map((a) => {
          const matched = campaigns.find((c) => c.id === a.designatedCampaignId) || campaigns[0];
          const nominal = Math.round((a.percentage / 100) * effectiveBudget);
          return {
            category: a.category,
            campaignTitle: matched?.title || a.notes || a.category,
            amount: nominal,
            percentage: a.percentage,
          };
        }),
      };

      setSimulationResult(generatedLog);
      const updatedLogs = [generatedLog, ...historyLogs];
      setHistoryLogs(updatedLogs);

      // Also persist to config
      onUpdateConfig({
        ...config,
        historyLogs: updatedLogs,
        totalDisbursedLifetime: config.totalDisbursedLifetime + effectiveBudget,
        lastDisbursedDate: '30 September 2026',
      });

      setIsSimulating(false);
      notify(`Penyaluran Auto-Gift proporsional sebesar ${formatIDR(effectiveBudget)} berhasil dieksekusi!`);
    }, 1200);
  };

  const effectiveBudget = customBudgetStr
    ? parseInt(customBudgetStr.replace(/\D/g, '') || '0', 10)
    : monthlyBudget;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header Hero Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-xs shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">
                  {t.autoGiftTitle || 'Auto-Gift Distribusi ZISWAF Proporsional'}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  · Autodebit Sekali, Berbagi ke Semua
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {isEnabled ? 'Status: Aktif' : 'Status: Dijeda'}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed max-w-2xl">
                {t.autoGiftSubtitle ||
                  'Atur distribusi otomatis zakat, infaq, sedekah, dan wakaf Anda ke berbagai kategori program secara proporsional berdasarkan persentase bulanan.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsEnabled(!isEnabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                isEnabled
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                  : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500 shadow-xs'
              }`}
            >
              {isEnabled ? (
                <>
                  <PauseCircle className="w-4 h-4" />
                  <span>Jeda Auto-Gift</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Aktifkan Auto-Gift</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t.saveAutoGift || 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Toast Feedback */}
        {feedbackMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">{feedbackMessage}</span>
            </div>
          </div>
        )}

        {/* 2. Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Total Monthly Commitment Budget */}
          <div className="p-4 rounded-2xl bg-emerald-950 text-white border border-emerald-800/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {t.monthlyBudgetLabel || 'Anggaran Komitmen Bulanan'}
              </span>
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
              {formatIDR(effectiveBudget)}
              <span className="text-xs font-sans font-medium text-emerald-300 ml-1">/bulan</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 pt-0.5">
              Dibagi ke {allocations.length} kategori ZISWAF terverifikasi
            </p>
          </div>

          {/* Card 2: Next Billing Schedule */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Jadwal Eksekusi Terdekat
              </span>
              <Calendar className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              {config.nextExecutionDate}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
              Autodebit tgl {billingDay} tiap bulan · {paymentMethod}
            </p>
          </div>

          {/* Card 3: Total Lifetime Distributed */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Total Tertunai Sejauh Ini
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-mono">
              {formatIDR(config.totalDisbursedLifetime)}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
              Tercatat pada ledger publik & audit independen
            </p>
          </div>
        </div>

        {/* 3. Budget Configuration Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 dark:bg-stone-850/80 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Pilih atau Tentukan Anggaran Bulanan
              </label>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Nominal ini akan otomatis disalurkan sesuai proporsi persentase yang Anda tentukan di bawah.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              {budgetPresets.map((amt) => {
                const isSelected = !customBudgetStr && monthlyBudget === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setMonthlyBudget(amt);
                      setCustomBudgetStr('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {formatCompactNumber(amt)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 shrink-0">
              Nominal Kustom:
            </span>
            <input
              type="text"
              placeholder="Contoh: 1500000"
              value={customBudgetStr}
              onChange={(e) => setCustomBudgetStr(e.target.value)}
              className="max-w-xs px-3.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500"
            />
            {customBudgetStr && (
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                = {formatIDR(parseInt(customBudgetStr.replace(/\D/g, '') || '0', 10))}
              </span>
            )}
          </div>
        </div>

        {/* 4. Visual Stacked Proportional Distribution Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 dark:text-stone-100 font-serif">
                Visualisasi Proporsi Pembagian:
              </span>
              <span
                className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                  isBalanced
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                }`}
              >
                Total: {totalPercentage}% {isBalanced ? '✓ Tepat 100%' : '⚠️ Belum 100%'}
              </span>
            </div>

            {!isBalanced && (
              <button
                type="button"
                onClick={handleAutoBalance}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Seimbangkan ke 100%</span>
              </button>
            )}
          </div>

          {/* Multi-segment progress bar */}
          <div className="h-4 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden flex p-0.5 border border-stone-200 dark:border-stone-700/80">
            {allocations.map((item, idx) => {
              if (item.percentage <= 0) return null;
              const colorConfig = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Zakat'];
              return (
                <div
                  key={idx}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                  className={`h-full ${colorConfig.bar} first:rounded-l-full last:rounded-r-full transition-all duration-300`}
                  title={`${item.category}: ${item.percentage}% (${formatIDR(
                    Math.round((item.percentage / 100) * effectiveBudget)
                  )})`}
                />
              );
            })}
          </div>

          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 dark:text-stone-400 pt-1">
            {allocations.map((item, idx) => {
              const colorConfig = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Zakat'];
              const nominal = Math.round((item.percentage / 100) * effectiveBudget);
              return (
                <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2.5 h-2.5 rounded-full ${colorConfig.bar}`} />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{item.category}</span>
                  <span className="font-mono text-stone-500">
                    {item.percentage}% ({formatIDR(nominal)})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Preset Strategy Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Pilihan Template Strategi Distribusi:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyPresetStrategy('balanced')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              {t.presetBalanced || 'Seimbang Syariah'}
            </button>
            <button
              type="button"
              onClick={() => applyPresetStrategy('economic')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              {t.presetEconomic || 'Fokus Pemberdayaan UMKM'}
            </button>
            <button
              type="button"
              onClick={() => applyPresetStrategy('zakatPriority')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              {t.presetZakatPriority || 'Prioritas Zakat & Duafa'}
            </button>
          </div>
        </div>

        {/* 6. Allocation Category Cards */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Rincian Alokasi Proporsional Per Kategori
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {allocations.map((alloc, idx) => {
              const colorConfig = CATEGORY_COLORS[alloc.category] || CATEGORY_COLORS['Zakat'];
              const allocatedNominal = Math.round((alloc.percentage / 100) * effectiveBudget);
              const availableCampaigns = campaigns.filter(
                (c) => c.category === alloc.category || alloc.category === 'Infaq'
              );

              return (
                <div
                  key={alloc.category}
                  className={`p-4 rounded-2xl border ${colorConfig.border} ${colorConfig.bg} space-y-3 transition-all`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${colorConfig.bar}`} />
                        <span>{alloc.category}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {alloc.notes || `Alokasi program ${alloc.category}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black font-mono text-stone-900 dark:text-stone-100">
                        {formatIDR(allocatedNominal)}
                      </div>
                      <div className="text-[11px] font-bold text-stone-500">
                        {alloc.percentage}% dari total
                      </div>
                    </div>
                  </div>

                  {/* Percentage Slider & Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-stone-600 dark:text-stone-400">
                        Porsi Persentase (%):
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={alloc.percentage}
                          onChange={(e) => handlePercentageChange(idx, Number(e.target.value) || 0)}
                          className="w-14 px-2 py-0.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono font-bold text-center"
                        />
                        <span className="font-bold text-xs">%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={alloc.percentage}
                      onChange={(e) => handlePercentageChange(idx, Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 rounded-lg bg-stone-200 dark:bg-stone-700"
                    />
                  </div>

                  {/* Designated Campaign Selector */}
                  <div className="space-y-1 pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
                    <label className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400">
                      Kampanye Tujuan Penyaluran:
                    </label>
                    <select
                      value={alloc.designatedCampaignId || availableCampaigns[0]?.id || campaigns[0]?.id}
                      onChange={(e) => handleCampaignChange(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 text-[11px] font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.category}] {c.title.length > 55 ? `${c.title.slice(0, 55)}...` : c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Schedule, Payment & Instant Simulation Trigger */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Tanggal Debit Bulanan
              </label>
              <select
                value={billingDay}
                onChange={(e) => setBillingDay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value={25}>Tanggal 25 (Gajian / Tutup Bulan)</option>
                <option value={1}>Tanggal 1 (Awal Bulan Baru)</option>
                <option value={5}>Tanggal 5 tiap bulan</option>
                <option value={10}>Tanggal 10 tiap bulan</option>
                <option value={15}>Tanggal 15 tiap bulan</option>
                <option value={28}>Tanggal 28 tiap bulan</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Metode Autodebit Syariah
              </label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as
                      | 'Auto-Debit BSI'
                      | 'Bank Syariah Muamalat'
                      | 'QRIS Autodebit'
                      | 'GRIK Pay Kas Syariah'
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Auto-Debit BSI">Auto-Debit BSI (Rekening Syariah)</option>
                <option value="Bank Syariah Muamalat">Bank Syariah Muamalat</option>
                <option value="QRIS Autodebit">QRIS Autodebit</option>
                <option value="GRIK Pay Kas Syariah">GRIK Pay Kas Syariah</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-700">
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Autodebit syariah fleksibel, tanpa biaya administrasi tersembunyi dan dapat dijeda sewaktu-waktu.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunInstantSimulation}
                disabled={isSimulating}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Zap className="w-4 h-4 text-stone-900" />
                <span>
                  {isSimulating ? 'Memproses Penyaluran...' : t.simulateDisbursement || 'Uji Penyaluran Sekarang'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.saveAutoGift || 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 8. Simulation Success Dialog / Breakdown */}
        {simulationResult && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                    Bukti Penyaluran Auto-Gift Berhasil
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Tanggal: {simulationResult.date} · Transaksi #{simulationResult.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSimulationResult(null)}
                className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              {simulationResult.allocations.map((item, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800/80 space-y-0.5"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {item.category} ({item.percentage}%)
                  </div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                    {item.campaignTitle}
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatIDR(item.amount)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 pt-1">
              <span>Hash Audit: {simulationResult.receiptHash}</span>
              <span className="font-bold">Total Disalurkan: {formatIDR(simulationResult.totalAmount)}</span>
            </div>
          </div>
        )}

        {/* 9. Execution History Log Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
              {t.autoGiftHistory || 'Riwayat Eksekusi Auto-Gift'}
            </h4>
            <span className="text-xs text-stone-500">
              {historyLogs.length} Riwayat Penyaluran Tercatat
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
              <thead className="bg-stone-100 dark:bg-stone-800/80 text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Total Eksekusi</th>
                  <th className="p-3.5">Rincian Proporsi</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Bukti Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {historyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-850/50 transition">
                    <td className="p-3.5 font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatIDR(log.totalAmount)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {log.allocations.map((a, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                          >
                            {a.category}: {a.percentage}% ({formatCompactNumber(a.amount)})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-[10px] text-stone-400">
                      {log.receiptHash.slice(0, 14)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
