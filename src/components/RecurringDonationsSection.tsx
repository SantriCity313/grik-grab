import React, { useState } from 'react';
import {
  Repeat,
  Calendar,
  CreditCard,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Plus,
  Pencil,
  Trash2,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  AlertCircle,
  X,
  Building,
  Calculator,
  Coins,
} from 'lucide-react';
import {
  RecurringDonationSubscription,
  DonationCampaign,
  Language,
} from '../types';
import { translations } from '../translations';
import { formatIDR, formatCompactNumber } from '../utils';
import { AutoZakatModal } from './AutoZakatModal';

export interface RecurringDonationsSectionProps {
  language: Language;
  subscriptions: RecurringDonationSubscription[];
  campaigns: DonationCampaign[];
  onOpenDonateModal: (campaign?: DonationCampaign, initialAmount?: number) => void;
  onUpdateSubscription?: (updated: RecurringDonationSubscription) => void;
  onAddSubscription?: (
    newSub: Omit<RecurringDonationSubscription, 'id' | 'startDate' | 'totalDonatedSoFar'>
  ) => void;
  onDeleteSubscription?: (id: string) => void;
  className?: string;
}

export const RecurringDonationsSection: React.FC<RecurringDonationsSectionProps> = ({
  language,
  subscriptions,
  campaigns,
  onOpenDonateModal,
  onUpdateSubscription,
  onAddSubscription,
  onDeleteSubscription,
  className = '',
}) => {
  const t = translations[language];

  // Active state filter
  const [filterState, setFilterState] = useState<'all' | 'active' | 'paused'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<RecurringDonationSubscription | null>(null);
  const [editAmountValue, setEditAmountValue] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Auto-Zakat State
  const [isAutoZakatModalOpen, setIsAutoZakatModalOpen] = useState(false);
  const [autoZakatEditingSub, setAutoZakatEditingSub] = useState<RecurringDonationSubscription | null>(null);

  // Identify active Auto-Zakat subscription if any
  const autoZakatSub = subscriptions.find((s) => s.isAutoZakat || s.category === 'Zakat');

  // New Subscription Form State
  const [newCampaignId, setNewCampaignId] = useState<string>(campaigns[0]?.id || 'cmp-01');
  const [newAmount, setNewAmount] = useState<number>(100000);
  const [newCustomAmount, setNewCustomAmount] = useState<string>('');
  const [newBillingDay, setNewBillingDay] = useState<number>(5);
  const [newPaymentMethod, setNewPaymentMethod] = useState<
    'Auto-Debit BSI' | 'Bank Syariah Muamalat' | 'QRIS Autodebit' | 'GRIK Pay Kas Syariah'
  >('Auto-Debit BSI');

  // Filter subscriptions based on selected tab
  const activeSubscriptions = subscriptions.filter((s) => s.status === 'Aktif');
  const pausedSubscriptions = subscriptions.filter((s) => s.status === 'Dijeda');

  const filteredSubscriptions = subscriptions.filter((s) => {
    if (filterState === 'active') return s.status === 'Aktif';
    if (filterState === 'paused') return s.status === 'Dijeda';
    return true;
  });

  // Calculate Total Monthly Commitment for active subscriptions
  const totalMonthlyCommitment = activeSubscriptions.reduce(
    (acc, sub) => acc + sub.monthlyAmount,
    0
  );

  // Total accumulated lifetime contributions from recurring subscriptions
  const totalContributedLifetime = subscriptions.reduce(
    (acc, sub) => acc + sub.totalDonatedSoFar,
    0
  );

  // Determine next earliest billing date among active subscriptions
  const getDaysUntilBilling = (day: number) => {
    // Current date anchored to 2026-09-25 or current time
    const today = 25; // anchored day in September
    if (day > today) {
      return day - today;
    }
    // next month (October has 31 days)
    return (30 - today) + day;
  };

  const getSortedUpcoming = () => {
    if (activeSubscriptions.length === 0) return null;
    const sorted = [...activeSubscriptions].sort((a, b) => {
      return getDaysUntilBilling(a.billingDay) - getDaysUntilBilling(b.billingDay);
    });
    return sorted[0];
  };

  const nextUpcomingSub = getSortedUpcoming();

  // Notification / Toast helper
  const notify = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  // Toggle status handler
  const handleToggleStatus = (sub: RecurringDonationSubscription) => {
    const updatedStatus = sub.status === 'Aktif' ? 'Dijeda' : 'Aktif';
    const updated: RecurringDonationSubscription = {
      ...sub,
      status: updatedStatus,
    };
    if (onUpdateSubscription) {
      onUpdateSubscription(updated);
    }
    notify(
      updatedStatus === 'Aktif'
        ? `Komitmen donasi rutin ${sub.campaignTitle.split(':')[0]} berhasil diaktifkan kembali.`
        : `Komitmen donasi rutin ${sub.campaignTitle.split(':')[0]} telah dijeda sementara.`
    );
  };

  // Save edited amount
  const handleSaveEditAmount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    const numericAmount = parseInt(editAmountValue.replace(/\D/g, ''), 10);
    if (!numericAmount || numericAmount < 10000) {
      alert('Nominal minimal adalah Rp 10.000');
      return;
    }

    const updated: RecurringDonationSubscription = {
      ...editingSub,
      monthlyAmount: numericAmount,
    };
    if (onUpdateSubscription) {
      onUpdateSubscription(updated);
    }
    setEditingSub(null);
    notify(`Nominal komitmen bulanan diperbarui menjadi ${formatIDR(numericAmount)}/bln.`);
  };

  // Submit new subscription
  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = newCustomAmount ? parseInt(newCustomAmount.replace(/\D/g, ''), 10) : newAmount;
    if (!finalAmount || finalAmount < 10000) {
      alert('Nominal minimal adalah Rp 10.000');
      return;
    }

    const selectedCamp = campaigns.find((c) => c.id === newCampaignId) || campaigns[0];
    const billingDateStr = `${newBillingDay < 10 ? `0${newBillingDay}` : newBillingDay} Oktober 2026`;

    if (onAddSubscription) {
      onAddSubscription({
        campaignId: selectedCamp.id,
        campaignTitle: selectedCamp.title,
        category: selectedCamp.category,
        monthlyAmount: finalAmount,
        frequency: 'Bulanan',
        billingDay: newBillingDay,
        nextBillingDate: billingDateStr,
        paymentMethod: newPaymentMethod,
        status: 'Aktif',
        autoDeduct: true,
      });
    }

    setIsAddModalOpen(false);
    notify(`Alhamdulillah! Komitmen donasi bulanan sebesar ${formatIDR(finalAmount)} berhasil diaktifkan.`);
  };

  // Save or Update Auto-Zakat Subscription
  const handleSaveAutoZakat = (
    subscriptionData: Omit<RecurringDonationSubscription, 'id' | 'startDate' | 'totalDonatedSoFar'>
  ) => {
    if (autoZakatEditingSub) {
      const updated: RecurringDonationSubscription = {
        ...autoZakatEditingSub,
        ...subscriptionData,
      };
      if (onUpdateSubscription) {
        onUpdateSubscription(updated);
      }
      notify(
        `Alhamdulillah! Pengaturan Auto-Zakat Mal bulanan sebesar ${formatIDR(subscriptionData.monthlyAmount)}/bln ke ${subscriptionData.designatedInstitution || 'Lembaga Zakat'} berhasil diperbarui.`
      );
    } else {
      if (onAddSubscription) {
        onAddSubscription(subscriptionData);
      }
      notify(
        `Alhamdulillah! Komitmen Auto-Zakat Mal bulanan sebesar ${formatIDR(subscriptionData.monthlyAmount)} ke ${subscriptionData.designatedInstitution || 'Lembaga Zakat'} berhasil diaktifkan.`
      );
    }
    setAutoZakatEditingSub(null);
    setIsAutoZakatModalOpen(false);
  };

  const presetAmounts = [50000, 100000, 250000, 500000, 1000000];

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-5 transition-all ${className}`}
    >
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800/80 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">
                {t.recurringDonationsTitle || 'Komitmen Donasi Rutin Bulanan'}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                · {activeSubscriptions.length} Langganan Aktif
              </span>
              {autoZakatSub && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  · Auto-Zakat Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
              {t.recurringDonationsSubtitle ||
                'Kelola infaq, sedekah, dan wakaf otomatis bulanan Anda dengan autodebit syariah transparan.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setAutoZakatEditingSub(autoZakatSub || null);
              setIsAutoZakatModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/80 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{autoZakatSub ? 'Kelola Auto-Zakat' : 'Hitung Auto-Zakat'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNewSubscription || 'Tambah Donasi Rutin'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Feedback Banner */}
      {feedbackMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Primary KPI Commitment Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Total Monthly Commitment */}
        <div className="p-4 rounded-2xl bg-emerald-950 text-white dark:bg-emerald-950/90 border border-emerald-800/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-300">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {t.totalMonthlyCommitment || 'Total Komitmen Bulanan'}
            </span>
            <Repeat className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
            {formatIDR(totalMonthlyCommitment)}
            <span className="text-xs font-sans font-medium text-emerald-300 ml-1">/bulan</span>
          </div>
          <p className="text-[11px] text-emerald-200/80 pt-0.5">
            Mencakup {activeSubscriptions.length} program ZISWAF aktif terpilih
          </p>
        </div>

        {/* Metric 2: Next Billing Schedule */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {t.nextBillingDateLabel || 'Jadwal Tagihan Terdekat'}
            </span>
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
            {nextUpcomingSub ? nextUpcomingSub.nextBillingDate : 'Tidak ada jadwal aktif'}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-0.5 flex items-center gap-1">
            {nextUpcomingSub ? (
              <>
                <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {getDaysUntilBilling(nextUpcomingSub.billingDay)} hari lagi ·{' '}
                  {nextUpcomingSub.paymentMethod}
                </span>
              </>
            ) : (
              <span>Aktifkan langganan untuk autodebit otomatis</span>
            )}
          </p>
        </div>

        {/* Metric 3: Total Lifetime Contributions */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Total Tertunai Sejauh Ini
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-mono">
            {formatIDR(totalContributedLifetime)}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
            Tercatat di buku kas terbuka & diaudit transparan
          </p>
        </div>
      </div>

      {/* Auto-Zakat Feature Spotlight Hub */}
      {autoZakatSub ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 border border-emerald-800/80 text-white shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span>Auto-Zakat Mal Aktif</span>
                </span>
                <span aria-hidden="true" className="text-emerald-700">·</span>
                <span className="text-emerald-200 font-medium">
                  {autoZakatSub.designatedInstitution || 'BAZNAS (Badan Amil Zakat Nasional)'}
                </span>
                <span aria-hidden="true" className="text-emerald-700">·</span>
                <span className="text-stone-300 text-[11px]">
                  Autodebit tgl {autoZakatSub.billingDay} tiap bulan
                </span>
                <span aria-hidden="true" className="text-emerald-700">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{autoZakatSub.status}</span>
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-white font-serif">
                Otomatisasi Penyaluran Zakat Mal Syariah
              </h4>

              {autoZakatSub.autoZakatDetails ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-300 pt-0.5">
                  <span>
                    Total Aset: <strong className="text-white font-mono">{formatIDR(autoZakatSub.autoZakatDetails.totalAssets)}</strong>
                  </span>
                  <span aria-hidden="true" className="text-stone-600">·</span>
                  <span>
                    Penghasilan Bersih: <strong className="text-white font-mono">{formatIDR(autoZakatSub.autoZakatDetails.netMonthlyIncome)}/bln</strong>
                  </span>
                  <span aria-hidden="true" className="text-stone-600">·</span>
                  <span>
                    Nisab 85g Emas: <span className="text-emerald-400 font-semibold">{autoZakatSub.autoZakatDetails.isNisabReached ? 'Terpenuhi (Wajib)' : 'Sukarela'}</span>
                  </span>
                  <span aria-hidden="true" className="text-stone-600">·</span>
                  <span>
                    Metode: {autoZakatSub.paymentMethod}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-emerald-200/80">
                  Kewajiban zakat mal disalurkan rutin ke asnaf mustahiq terverifikasi.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-800">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold">
                  Kewajiban Zakat (2.5%)
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                  {formatIDR(autoZakatSub.monthlyAmount)}
                  <span className="text-xs font-sans font-medium text-emerald-200 ml-1">/bln</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAutoZakatEditingSub(autoZakatSub);
                    setIsAutoZakatModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Hitung Ulang & Atur Lembaga</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(autoZakatSub)}
                  className={`p-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    autoZakatSub.status === 'Aktif'
                      ? 'border-stone-700 bg-stone-850 hover:bg-stone-800 text-stone-200'
                      : 'border-emerald-600 bg-emerald-700 hover:bg-emerald-600 text-white'
                  }`}
                  title={autoZakatSub.status === 'Aktif' ? 'Jeda Auto-Zakat' : 'Aktifkan Auto-Zakat'}
                >
                  {autoZakatSub.status === 'Aktif' ? (
                    <PauseCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <PlayCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Otomatisasi Kewajiban Zakat Mal Anda (Auto-Zakat)
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed max-w-xl">
                  Hitung zakat mal 2.5% berdasarkan total aset simpanan dan pendapatan bulanan Anda, lalu otomatiskan penyalurannya ke lembaga amil zakat resmi terverifikasi (BAZNAS, Dompet Dhuafa, Rumah Zakat, LAZISNU, LAZISMU).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAutoZakatEditingSub(null);
                setIsAutoZakatModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Hitung & Otomatisasi Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Filter Controls (Buttons/Tabs following Anti-Slop Guidelines) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={() => setFilterState('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterState === 'all'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Semua ({subscriptions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterState('active')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterState === 'active'
                ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Aktif ({activeSubscriptions.length})
          </button>
          {pausedSubscriptions.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterState('paused')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterState === 'paused'
                  ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              Dijeda ({pausedSubscriptions.length})
            </button>
          )}
        </div>

        <span className="text-[11px] text-stone-400 hidden sm:inline">
          Autodebit syariah diproses tiap tanggal yang dipilih
        </span>
      </div>

      {/* 4. Subscriptions List */}
      {filteredSubscriptions.length === 0 ? (
        <div className="py-8 text-center rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 p-6 space-y-3">
          <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
            <Repeat className="w-5 h-5" />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Tidak ada komitmen donasi rutin pada kategori ini.
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Siapkan Donasi Rutin Pertama Anda</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubscriptions.map((sub) => {
            const isActive = sub.status === 'Aktif';
            const matchedCamp = campaigns.find((c) => c.id === sub.campaignId);

            return (
              <div
                key={sub.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-stone-50/70 dark:bg-stone-850/80 border-stone-200/90 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-800'
                    : 'bg-stone-100/50 dark:bg-stone-900/40 border-stone-200/50 dark:border-stone-800/50 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left Column: Info & Metadata */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Unboxed clean metadata following zero-pill rules */}
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 flex-wrap">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {sub.isAutoZakat ? 'Auto-Zakat Mal' : sub.category}
                      </span>
                      {sub.designatedInstitution && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-stone-700 dark:text-stone-300">
                            {sub.designatedInstitution}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{sub.frequency}</span>
                      <span aria-hidden="true">·</span>
                      <span>{sub.paymentMethod}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500' : 'bg-amber-400'
                          }`}
                        />
                        <span className={isActive ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-amber-700 dark:text-amber-400 font-medium'}>
                          {sub.status}
                        </span>
                      </span>
                    </div>

                    {/* Campaign Title */}
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                      {sub.campaignTitle}
                    </h4>

                    {/* Auto-Zakat Calculation Basis Info */}
                    {sub.autoZakatDetails && (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium pt-0.5">
                        <span className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-500" />
                          <span>Aset: {formatCompactNumber(sub.autoZakatDetails.totalAssets)}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Gaji Bersih: {formatCompactNumber(sub.autoZakatDetails.netMonthlyIncome)}/bln</span>
                        <span aria-hidden="true">·</span>
                        <span>Nisab 85g: {sub.autoZakatDetails.isNisabReached ? 'Wajib (2.5%)' : 'Sukarela'}</span>
                      </div>
                    )}

                    {/* Next Billing Date & Accumulated Breakdown */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400 pt-0.5">
                      <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          Tagihan Berikutnya:{' '}
                          <strong className="text-stone-900 dark:text-stone-100">
                            {sub.nextBillingDate}
                          </strong>
                        </span>
                      </span>
                      <span aria-hidden="true" className="hidden sm:inline">·</span>
                      <span>Tanggal {sub.billingDay} tiap bulan</span>
                      <span aria-hidden="true" className="hidden sm:inline">·</span>
                      <span>Total tertunai: {formatIDR(sub.totalDonatedSoFar)}</span>
                    </div>
                  </div>

                  {/* Right Column: Amount & Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/60 dark:border-stone-800">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-stone-500 dark:text-stone-400">
                        Komitmen Bulanan
                      </div>
                      <div className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {formatIDR(sub.monthlyAmount)}
                        <span className="text-[11px] font-sans font-medium text-stone-500">/bln</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* If Auto-Zakat, allow editing calculation parameters */}
                      {sub.isAutoZakat && (
                        <button
                          type="button"
                          onClick={() => {
                            setAutoZakatEditingSub(sub);
                            setIsAutoZakatModalOpen(true);
                          }}
                          className="p-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
                          title="Hitung Ulang & Atur Parameter Auto-Zakat"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Edit Amount Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSub(sub);
                          setEditAmountValue(sub.monthlyAmount.toString());
                        }}
                        className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition cursor-pointer"
                        title={t.editAmount || 'Ubah Nominal'}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Pause / Resume Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(sub)}
                        className={`p-2 rounded-xl border transition cursor-pointer ${
                          isActive
                            ? 'border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                            : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                        }`}
                        title={isActive ? t.pauseSubscription || 'Jeda Sementara' : t.resumeSubscription || 'Aktifkan Kembali'}
                      >
                        {isActive ? (
                          <PauseCircle className="w-3.5 h-3.5" />
                        ) : (
                          <PlayCircle className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Quick Extra Donation */}
                      <button
                        type="button"
                        onClick={() => onOpenDonateModal(matchedCamp, sub.monthlyAmount)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                        title="Salurkan Donasi Tambahan Sekarang"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Donasi Ekstra</span>
                      </button>

                      {/* Delete Option */}
                      {onDeleteSubscription && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Batalkan komitmen donasi rutin untuk "${sub.campaignTitle}"?`)) {
                              onDeleteSubscription(sub.id);
                              notify('Komitmen donasi rutin berhasil dibatalkan.');
                            }
                          }}
                          className="p-2 rounded-xl text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                          title="Hentikan Langganan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL: Set Up New Monthly Recurring Donation */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                    Siapkan Komitmen Donasi Rutin Bulanan
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Otomatisasi pahala jariyah dengan autodebit syariah bebas riba
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4">
              {/* Campaign Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Pilih Program ZISWAF
                </label>
                <select
                  value={newCampaignId}
                  onChange={(e) => setNewCampaignId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.category}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monthly Amount Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                  <span>Nominal Komitmen Tiap Bulan</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {newCustomAmount
                      ? formatIDR(parseInt(newCustomAmount.replace(/\D/g, '') || '0', 10))
                      : formatIDR(newAmount)}
                  </span>
                </label>

                {/* Preset Chips */}
                <div className="grid grid-cols-5 gap-1.5">
                  {presetAmounts.map((amt) => {
                    const isSelected = !newCustomAmount && newAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setNewAmount(amt);
                          setNewCustomAmount('');
                        }}
                        className={`py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {formatCompactNumber(amt)}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  placeholder="Atau ketik nominal kustom (misal: 150000)"
                  value={newCustomAmount}
                  onChange={(e) => setNewCustomAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Billing Day & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Tanggal Debit Setiap Bulan
                  </label>
                  <select
                    value={newBillingDay}
                    onChange={(e) => setNewBillingDay(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {[1, 5, 10, 15, 20, 25, 28].map((day) => (
                      <option key={day} value={day}>
                        Tanggal {day} tiap bulan
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Metode Autodebit
                  </label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) =>
                      setNewPaymentMethod(
                        e.target.value as
                          | 'Auto-Debit BSI'
                          | 'Bank Syariah Muamalat'
                          | 'QRIS Autodebit'
                          | 'GRIK Pay Kas Syariah'
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Auto-Debit BSI">Auto-Debit BSI</option>
                    <option value="Bank Syariah Muamalat">Bank Syariah Muamalat</option>
                    <option value="QRIS Autodebit">QRIS Autodebit</option>
                    <option value="GRIK Pay Kas Syariah">GRIK Pay Kas Syariah</option>
                  </select>
                </div>
              </div>

              {/* Sharia Compliance Note */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Autodebit syariah dapat dijeda atau dibatalkan sewaktu-waktu tanpa denda atau biaya penalti.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aktifkan Donasi Rutin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Edit Commitment Amount */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                Ubah Nominal Komitmen
              </h4>
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAmount} className="space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Sesuaikan komitmen bulanan untuk program:
                <br />
                <strong className="text-stone-900 dark:text-stone-100">
                  {editingSub.campaignTitle}
                </strong>
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Nominal Baru (Rp)
                </label>
                <input
                  type="number"
                  step={10000}
                  min={10000}
                  value={editAmountValue}
                  onChange={(e) => setEditAmountValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="px-3.5 py-1.5 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Auto-Zakat Calculator & Automated Disbursement */}
      <AutoZakatModal
        isOpen={isAutoZakatModalOpen}
        onClose={() => {
          setIsAutoZakatModalOpen(false);
          setAutoZakatEditingSub(null);
        }}
        language={language}
        campaigns={campaigns}
        existingSubscription={autoZakatEditingSub}
        onSaveAutoZakat={handleSaveAutoZakat}
      />
    </div>
  );
};
