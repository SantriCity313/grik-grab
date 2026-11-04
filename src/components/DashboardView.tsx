import React from 'react';
import {
  TrendingUp,
  Users,
  Store,
  HeartHandshake,
  ShieldCheck,
  Radio,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Lock,
  GraduationCap,
  Download,
  AlertCircle,
  QrCode,
  CheckCircle2,
  Repeat,
} from 'lucide-react';
import {
  NavigationTab,
  Language,
  DonationCampaign,
  DonationTransaction,
  RecurringDonationSubscription,
  MicroBusiness,
  DakwahItem,
  CommunityEvent,
} from '../types';
import { translations } from '../translations';
import { formatIDR } from '../utils';
import { initialRecurringSubscriptions } from '../mockData';
import { RecurringDonationsSection } from './RecurringDonationsSection';

interface DashboardViewProps {
  language: Language;
  setActiveTab: (tab: NavigationTab) => void;
  campaigns: DonationCampaign[];
  transactions: DonationTransaction[];
  businesses: MicroBusiness[];
  dakwahList: DakwahItem[];
  events: CommunityEvent[];
  recurringSubscriptions?: RecurringDonationSubscription[];
  onOpenDonateModal: (campaign?: DonationCampaign, initialAmount?: number) => void;
  onOpenReceipt: (trx: DonationTransaction) => void;
  onOpenQRModal?: (campaign: DonationCampaign) => void;
  onUpdateSubscription?: (updated: RecurringDonationSubscription) => void;
  onAddSubscription?: (
    newSub: Omit<RecurringDonationSubscription, 'id' | 'startDate' | 'totalDonatedSoFar'>
  ) => void;
  onDeleteSubscription?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  setActiveTab,
  campaigns,
  transactions,
  businesses,
  dakwahList,
  events,
  recurringSubscriptions = initialRecurringSubscriptions,
  onOpenDonateModal,
  onOpenReceipt,
  onOpenQRModal,
  onUpdateSubscription,
  onAddSubscription,
  onDeleteSubscription,
}) => {
  const t = translations[language];

  const totalDonations = campaigns.reduce((acc, c) => acc + c.collectedAmount, 0);
  const totalBeneficiaries = 1420 + 915 + 740;
  const liveSession = dakwahList.find((d) => d.isLive);

  return (
    <div className="space-y-6">
      {/* Top Banner: Gerakan Rakyat Islamicity Kaffah Purpose */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white p-6 sm:p-8 shadow-lg border border-emerald-800/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Platform Cerdas Berdaya GRIK Kaffah</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
            Integrasi Dakwah Digital & Kemandirian Ekonomi Umat
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Infrastruktur terpadu gerakan umat: transparansi donasi berbasis audit terbuka, inkubasi bisnis mikro syariah bebas riba, komunikasi terenkripsi end-to-end, dan analitik keterlibatan real-time.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenDonateModal(campaigns[0])}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{t.donateNow}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dakwah')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>{t.exploreDakwah}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pelatihan')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>{t.startLearning}</span>
            </button>
          </div>
        </div>

        {/* Decorative Watermark Emblem */}
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none text-emerald-400 font-serif text-[180px] font-black select-none">
          GRIK
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total ZISWAF */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs font-semibold">{t.totalDonations}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            {formatIDR(totalDonations)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% bulan ini (Audit 100%)</span>
          </div>
        </div>

        {/* Card 2: Anggota Kaffah */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs font-semibold">{t.activeMembers}</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            {totalBeneficiaries.toLocaleString('id-ID')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Terverifikasi 2FA & Komunitas</span>
          </div>
        </div>

        {/* Card 3: UMKM Binaan */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs font-semibold">{t.activeMicroBusinesses}</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            {businesses.length} Klaster Usaha
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            <span>Sertifikat Halal & Qardh Murni</span>
          </div>
        </div>

        {/* Card 4: Jangkauan Dakwah Digital */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs font-semibold">{t.dakwahReach}</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            48.5K Jamaah
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Streaming Aktif Real-time</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Dakwah Live + Donasi Transparan Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Streaming & Featured Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Streaming Alert Card */}
          {liveSession && (
            <div className="p-5 rounded-2xl bg-stone-900 text-white border border-stone-800 relative overflow-hidden shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      LIVE DAKWAH
                    </span>
                    <span className="text-xs text-stone-400">
                      {liveSession.liveViewers?.toLocaleString()} Jamaah Terhubung
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-100 font-serif">
                    {liveSession.title}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Narasumber: {liveSession.speaker}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('dakwah')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs whitespace-nowrap shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Masuk Ruang Kajian</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Transparent Campaigns Progress */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Penggalangan Donasi & ZISWAF Terbuka
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Transparansi 100% penyaluran dana dengan skor audit independen
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('donasi')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {campaigns.slice(0, 2).map((camp) => {
                const percent = Math.min(100, Math.round((camp.collectedAmount / camp.targetAmount) * 100));
                return (
                  <div
                    key={camp.id}
                    className="p-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {camp.category}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            Skor Audit: {camp.transparencyScore}%
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                          {camp.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => onOpenQRModal?.(camp)}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs transition cursor-pointer flex items-center gap-1 border border-stone-200 dark:border-stone-700"
                          title="Tampilkan QRIS Mobile"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="hidden sm:inline">QRIS</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenDonateModal(camp)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
                        >
                          Berdonasi
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Milestone Status */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatIDR(camp.collectedAmount)}
                        </span>
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                          Sisa {formatIDR(Math.max(0, camp.targetAmount - camp.collectedAmount))} ({Math.max(0, 100 - percent)}%)
                        </span>
                      </div>
                      <div className="relative w-full bg-stone-200 dark:bg-stone-700 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-stone-500">
                        <span className="flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Milestone: {camp.milestones?.filter(m => m.achieved).length || 3}/4 Fase Tercapai</span>
                        </span>
                        <span className="font-bold text-stone-800 dark:text-stone-200">
                          {percent}% dari {formatIDR(camp.targetAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recurring Donations Section */}
          <RecurringDonationsSection
            language={language}
            subscriptions={recurringSubscriptions}
            campaigns={campaigns}
            onOpenDonateModal={onOpenDonateModal}
            onUpdateSubscription={onUpdateSubscription}
            onAddSubscription={onAddSubscription}
            onDeleteSubscription={onDeleteSubscription}
          />

          {/* Micro Business Spotlight */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Inkubasi UMKM Binaan Komunitas
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Usaha mikro halal mandiri bebas riba dengan skema Qardhul Hasan & Mudharabah
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ekonomi')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Katalog Lengkap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {businesses.slice(0, 2).map((biz) => (
                <div
                  key={biz.id}
                  className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {biz.sector}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Halal BPJPH
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                    {biz.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                    {biz.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] font-medium text-stone-700 dark:text-stone-300">
                    <span>Omset: {formatIDR(biz.monthlyTurnover)}/bln</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{biz.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Realtime Transparent Audit Ledger & Quick Agenda */}
        <div className="space-y-6">
          {/* Realtime Ledger Feed */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  Live Donation Ledger
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('donasi')}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Buku Kas
              </button>
            </div>

            <div className="space-y-3">
              {transactions.map((trx) => (
                <div
                  key={trx.id}
                  className="p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {trx.donorName}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {formatIDR(trx.amount)}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    {trx.campaignTitle}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-stone-400">
                    <span>{trx.paymentMethod} • {trx.timestamp.split(' ')[1]}</span>
                    <button
                      type="button"
                      onClick={() => onOpenReceipt(trx)}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>Kwitansi QR</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1 text-center">
              <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Diaudit Syariah & Terverifikasi Hash</span>
              </p>
            </div>
          </div>

          {/* Quick Agenda */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kegiatan Terdekat</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('kalender')}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Kalender
              </button>
            </div>

            <div className="space-y-2">
              {events.slice(0, 3).map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{evt.date}</span>
                    <span className="text-stone-400">{evt.time.split(' ')[0]}</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-0.5 truncate">
                    {evt.title}
                  </h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    {evt.location}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* E2EE Security Shield Shortcut */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Komunikasi & 2FA Terenkripsi</span>
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
              Seluruh percakapan konsultasi syariah dan data finansial dilindungi enkripsi end-to-end tanpa perantara.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('pesan_e2ee')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs"
              >
                Buka Chat E2EE
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('keamanan_2fa')}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-emerald-300 dark:border-emerald-700 text-xs font-medium"
              >
                Kelola 2FA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
