import React, { useState } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Calculator,
  Search,
  FileText,
  Download,
  CheckCircle,
  ExternalLink,
  PlusCircle,
  Clock,
  Coins,
  QrCode,
  Sparkles,
  Smartphone,
  Target,
  TrendingUp,
  CheckCircle2,
  Layers,
  ArrowRight,
  Lock,
  Unlock,
  Fingerprint,
  MapPin,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  DonationCampaign,
  DonationTransaction,
  Language,
  AutoGiftConfig,
  RecurringDonationSubscription,
} from '../types';
import { initialAutoGiftConfig, initialRecurringSubscriptions } from '../mockData';
import { translations } from '../translations';
import { formatIDR, formatCompactNumber } from '../utils';
import { CampaignMilestoneSection } from './CampaignMilestoneSection';
import { DynamicCampaignProgressBar } from './DynamicCampaignProgressBar';
import { AutoGiftSection } from './AutoGiftSection';
import { BeneficiaryMapD3 } from './BeneficiaryMapD3';
import { RoutineDonationDonutChart } from './RoutineDonationDonutChart';

interface DonasiTransparanViewProps {
  language: Language;
  campaigns: DonationCampaign[];
  transactions: DonationTransaction[];
  onOpenDonateModal: (campaign?: DonationCampaign, initialAmount?: number) => void;
  onOpenReceipt: (trx: DonationTransaction) => void;
  onOpenQRModal?: (campaign: DonationCampaign) => void;
  isBiometricUnlocked?: boolean;
  isBiometricProtected?: boolean;
  onOpenBiometricModal?: () => void;
  onLockBiometricSession?: () => void;
  autoGiftConfig?: AutoGiftConfig;
  onUpdateAutoGiftConfig?: (updated: AutoGiftConfig) => void;
  recurringSubscriptions?: RecurringDonationSubscription[];
}

export const DonasiTransparanView: React.FC<DonasiTransparanViewProps> = ({
  language,
  campaigns,
  transactions,
  onOpenDonateModal,
  onOpenReceipt,
  onOpenQRModal,
  isBiometricUnlocked = false,
  isBiometricProtected = false,
  onOpenBiometricModal,
  onLockBiometricSession,
  autoGiftConfig,
  onUpdateAutoGiftConfig,
  recurringSubscriptions = initialRecurringSubscriptions,
}) => {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'kampanye' | 'proporsi' | 'sebaran' | 'ledger' | 'kalkulator' | 'autogift'>('kampanye');
  const [selectedMilestoneCampId, setSelectedMilestoneCampId] = useState<string>(campaigns[0]?.id || 'cmp-01');
  const [campaignViewMode, setCampaignViewMode] = useState<'cards' | 'progress-bars'>('cards');
  const [localAutoGiftConfig, setLocalAutoGiftConfig] = useState<AutoGiftConfig>(
    autoGiftConfig || initialAutoGiftConfig
  );

  // Selected campaign for featured milestone spotlight
  const activeSpotlightCampaign = campaigns.find((c) => c.id === selectedMilestoneCampId) || campaigns[0];

  // Zakat Calculator State
  const [zakatType, setZakatType] = useState<'penghasilan' | 'mal'>('penghasilan');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('12000000');
  const [otherIncome, setOtherIncome] = useState<string>('1500000');
  const [monthlyNeeds, setMonthlyNeeds] = useState<string>('4000000');
  // Zakat Mal
  const [cashAsset, setCashAsset] = useState<string>('95000000');
  const [goldAsset, setGoldAsset] = useState<string>('25000000');
  const [debtPayable, setDebtPayable] = useState<string>('10000000');

  // Gold price estimation per gram
  const goldPricePerGram = 1350000;
  const nisabGold85Gram = 85 * goldPricePerGram; // Rp 114.750.000

  // Calculation logic
  const netIncome = (parseFloat(monthlyIncome) || 0) + (parseFloat(otherIncome) || 0) - (parseFloat(monthlyNeeds) || 0);
  const annualIncome = netIncome * 12;
  const isIncomeEligible = annualIncome >= nisabGold85Gram;
  const zakatIncomeAmount = isIncomeEligible ? Math.round(netIncome * 0.025) : 0;

  const totalMalAsset = (parseFloat(cashAsset) || 0) + (parseFloat(goldAsset) || 0) - (parseFloat(debtPayable) || 0);
  const isMalEligible = totalMalAsset >= nisabGold85Gram;
  const zakatMalAmount = isMalEligible ? Math.round(totalMalAsset * 0.025) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
                {t.tabDonasi}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Buku kas publik & audit terbuka ZISWAF GRIK: kepastian amanah setiap rupiah demi kesejahteraan umat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onOpenQRModal?.(campaigns[0])}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs sm:text-sm border border-stone-200 dark:border-stone-700 transition flex items-center gap-2 cursor-pointer shadow-xs"
              title="Tampilkan kode QR untuk seluruh kampanye donasi"
            >
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.showQrCode}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDonateModal(campaigns[0])}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Salurkan Donasi / Zakat</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-2 border-t border-stone-100 dark:border-stone-800 pt-3 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('kampanye')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeSubTab === 'kampanye'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            Program & Kampanye ZISWAF
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('proporsi')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'proporsi'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.donutChartTabLabel || 'Proporsi Donasi Rutin (Live)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('sebaran')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'sebaran'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.mapTabLabel || 'Peta Sebaran Manfaat'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('ledger')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'ledger'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Buku Kas & Audit Penyaluran</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('kalkulator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'kalkulator'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{t.zakatCalculator}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('autogift')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'autogift'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.autoGiftTabLabel || 'Auto-Gift Proporsional'}</span>
          </button>
        </div>
      </div>

      {/* Biometric Financial Privacy Banner */}
      {isBiometricProtected && (
        <div
          className={`p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
            !isBiometricUnlocked
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`p-2.5 rounded-2xl ${
                !isBiometricUnlocked
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <Fingerprint className="w-5 h-5" />
            </span>
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span>
                  {!isBiometricUnlocked
                    ? 'Proteksi Finansial Biometrik Aktif: Buku Kas Terkunci'
                    : 'Sesi Biometrik Finansial Aktif: Otorisasi Transaksi Terbuka'}
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.2 rounded-full ${
                    !isBiometricUnlocked
                      ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                      : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  {!isBiometricUnlocked ? '🔒 Terkunci' : '🔓 Terbuka'}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                {!isBiometricUnlocked
                  ? 'Akses ke audit buku kas dan otorisasi penyaluran donasi dilindungi sensor biometrik lokal Anda.'
                  : 'Anda dapat menyalurkan donasi, melihat buku kas terbuka, dan mencetak kwitansi secara penuh.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {!isBiometricUnlocked ? (
              <button
                type="button"
                onClick={onOpenBiometricModal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Buka Kunci Biometrik</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onLockBiometricSession}
                className="px-3.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Kunci Sesi</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 1: Kampanye ZISWAF */}
      {activeSubTab === 'kampanye' && (
        <div className="space-y-6">
          {/* Mobile QR Quick Donation Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 border border-emerald-800/50 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-emerald-400 shrink-0">
                <QrCode className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Fitur QRIS Mobile GRIK Kaffah</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold font-serif">
                  Scan & Salurkan Donasi Langsung dari Ponsel Pintar
                </h3>
                <p className="text-xs text-stone-300">
                  Generate kode QR dinamis dengan nominal preset atau kustom untuk seluruh kampanye ZISWAF. Mendukung seluruh e-wallet & m-Banking Syariah (BSI, Muamalat, GoPay, OVO, Dana).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenQRModal?.(campaigns[0])}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span>Buka Generator QR Kampanye</span>
            </button>
          </div>

          {/* Auto-Gift Proportional Distribution Highlight Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-stone-900 to-teal-950 border border-emerald-800/60 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 shrink-0">
                <Sparkles className="w-7 h-7 text-amber-300" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  <Layers className="w-3 h-3 text-amber-300" />
                  <span>Fitur: Auto-Gift ZISWAF Proporsional</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold font-serif">
                  Distribusi Otomatis Zakat, Infaq & Sedekah Sekali Klik
                </h3>
                <p className="text-xs text-stone-300 max-w-xl">
                  Tentukan satu komitmen anggaran bulanan dan bagikan secara otomatis ke berbagai kategori (Zakat, Wakaf Produktif, Modal UMKM, Infaq) secara proporsional.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('autogift')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>Buka Distribusi Auto-Gift</span>
            </button>
          </div>

          {/* Interactive D3 Beneficiary Map Highlight Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-stone-900 via-teal-950 to-emerald-950 border border-emerald-700/50 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 shrink-0">
                <MapPin className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Visualisasi Interaktif D3: Sebaran Nusantara</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold font-serif">
                  Peta Sebaran Penerima Manfaat & Klaster UMKM di Seluruh Indonesia
                </h3>
                <p className="text-xs text-stone-300 max-w-xl">
                  Pantau langsung sebaran geografis 16+ klaster pemberdayaan ekonomi, irigasi sawah wakaf, hingga beasiswa vokasi koding dhuafa dari Sabang sampai Merauke.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('sebaran')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <MapPin className="w-4 h-4 text-stone-950" />
              <span>Jelajahi Peta Sebaran</span>
            </button>
          </div>

          {/* Interactive Donut Chart Distribution Highlight Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-teal-950 via-emerald-950 to-stone-900 border border-emerald-700/60 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 shrink-0">
                <PieChartIcon className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Visualisasi Donat Real-Time: 3 Pilar ZIS</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold font-serif">
                  Proporsi Distribusi Donasi Rutin (Zakat, Infaq, Sedekah)
                </h3>
                <p className="text-xs text-stone-300 max-w-xl">
                  Pantau rasio persentase dan nominal aliran donasi berkala secara langsung dengan live stream update, audit asnaf, dan simulasi transaksi real-time.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('proporsi')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <PieChartIcon className="w-4 h-4 text-stone-950" />
              <span>Buka Tampilan Penuh Donat</span>
            </button>
          </div>

          {/* Embedded Real-Time Routine Donation Donut Chart */}
          <RoutineDonationDonutChart
            language={language}
            transactions={transactions}
            recurringSubscriptions={recurringSubscriptions}
            autoGiftConfig={localAutoGiftConfig}
            campaigns={campaigns}
            onOpenDonateModal={onOpenDonateModal}
          />

          {/* Featured Milestone Tracker & Goal Distance Spotlight Hub */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-emerald-500/30 dark:border-emerald-700/40 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
                    <span>{t.milestoneTrackerTitle || 'Pelacak Milestone & Capaian Program'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-sans font-bold">
                      Real-time
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {t.milestoneTrackerSubtitle || 'Transparansi bertahap realisasi dana dari 0% hingga 100% tuntas.'}
                  </p>
                </div>
              </div>

              {/* Campaign Switcher Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {campaigns.map((c) => {
                  const p = Math.min(100, Math.round((c.collectedAmount / c.targetAmount) * 100));
                  const isSelected = c.id === selectedMilestoneCampId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedMilestoneCampId(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      <span className="truncate max-w-[130px]">{c.title.split(':')[0]}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          isSelected
                            ? 'bg-emerald-800 text-white'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {p}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spotlight Campaign Full Milestone Section */}
            {activeSpotlightCampaign && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-white dark:bg-emerald-900 text-[10px] font-bold uppercase tracking-wider">
                      {activeSpotlightCampaign.category}
                    </span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {activeSpotlightCampaign.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Audit Kepatuhan: {activeSpotlightCampaign.transparencyScore}%
                  </span>
                </div>

                <CampaignMilestoneSection
                  campaign={activeSpotlightCampaign}
                  language={language}
                  onOpenDonateModal={onOpenDonateModal}
                  onOpenQRModal={onOpenQRModal}
                />
              </div>
            )}
          </div>

          {/* Grid of All Active Campaigns with Dynamic Progress Bar & Milestone Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Seluruh Program & Kampanye Aktif ({campaigns.length})
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {campaignViewMode === 'cards'
                    ? 'Pilih program untuk melihat rincian visual progres dan roadmap milestone.'
                    : 'Mode fokus perbandingan progres dinamis: pantau target tercapai dan indikator visual persentase.'}
                </p>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setCampaignViewMode('cards')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    campaignViewMode === 'cards'
                      ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Kartu Lengkap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCampaignViewMode('progress-bars')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    campaignViewMode === 'progress-bars'
                      ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Matriks Progres Dinamis</span>
                </button>
              </div>
            </div>

            {campaignViewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {campaigns.map((camp) => {
                  return (
                    <div
                      key={camp.id}
                      className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition flex flex-col justify-between"
                    >
                      <div className="relative h-44 overflow-hidden bg-stone-100 dark:bg-stone-800">
                        <img
                          src={camp.imageUrl}
                          alt={camp.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider">
                            {camp.category}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-stone-950 text-[10px] font-black shadow-xs">
                            Audit {camp.transparencyScore}%
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif leading-snug">
                            {camp.title}
                          </h3>
                          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                            {camp.description}
                          </p>
                        </div>

                        {/* Visual Progress Bar, Milestone Tracker, Financial Goal Distance & Donate CTA */}
                        <CampaignMilestoneSection
                          campaign={camp}
                          language={language}
                          onOpenDonateModal={onOpenDonateModal}
                          onOpenQRModal={onOpenQRModal}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* DEDICATED DYNAMIC CAMPAIGN PROGRESS BAR MATRIX */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-white dark:bg-emerald-900 text-[10px] font-bold uppercase tracking-wider">
                          {camp.category}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif line-clamp-2">
                          {camp.title}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold shrink-0">
                        Audit {camp.transparencyScore}%
                      </span>
                    </div>

                    {/* DYNAMIC PROGRESS BAR COMPONENT */}
                    <DynamicCampaignProgressBar
                      collectedAmount={camp.collectedAmount}
                      targetAmount={camp.targetAmount}
                      campaignTitle={camp.title}
                      category={camp.category}
                      donorCount={camp.donorCount}
                      deadline={camp.deadline}
                      language={language}
                      variant="detailed"
                      showMilestones={true}
                      showQuickDonate={true}
                      onDonateClick={(amount) => onOpenDonateModal(camp, amount)}
                    />

                    {/* Footer shortcuts */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMilestoneCampId(camp.id);
                          setCampaignViewMode('cards');
                        }}
                        className="text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Rincian Milestone</span>
                      </button>

                      {onOpenQRModal && (
                        <button
                          type="button"
                          onClick={() => onOpenQRModal(camp)}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QRIS Cepat</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Buku Kas & Audit Penyaluran Terbuka */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <p className="text-emerald-900 dark:text-emerald-200 font-medium">
                {t.transparencyNote}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cetak Rekap Kas</span>
            </button>
          </div>

          {/* Table of Disbursements (Pengeluaran / Penyaluran Dana) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                Rekap Penyaluran Dana Program (Audit Trail Keluar)
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                100% Terverifikasi Kwitansi
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500">
                    <th className="py-2.5 px-3 font-bold">Tanggal</th>
                    <th className="py-2.5 px-3 font-bold">Penerima Manfaat / Vendor</th>
                    <th className="py-2.5 px-3 font-bold">Peruntukan Dana</th>
                    <th className="py-2.5 px-3 font-bold">Nominal Penyaluran</th>
                    <th className="py-2.5 px-3 font-bold">Status Audit</th>
                    <th className="py-2.5 px-3 font-bold">Bukti Fisik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {campaigns.flatMap((c) => c.disbursements).map((disb) => (
                    <tr key={disb.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40">
                      <td className="py-3 px-3 font-medium text-stone-500">{disb.date}</td>
                      <td className="py-3 px-3 font-bold text-stone-900 dark:text-stone-100">{disb.recipient}</td>
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-400 max-w-xs">{disb.purpose}</td>
                      <td className="py-3 px-3 font-extrabold text-stone-900 dark:text-stone-100">{formatIDR(disb.amount)}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle className="w-3 h-3" />
                          {disb.auditStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline cursor-pointer">
                          {disb.proofDocument}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table of Donations Received (Pemasukan) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
              Ledger Donasi Masuk Terverifikasi (Audit Hash Publik)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500">
                    <th className="py-2.5 px-3 font-bold">Waktu</th>
                    <th className="py-2.5 px-3 font-bold">Donatur / Hamba Allah</th>
                    <th className="py-2.5 px-3 font-bold">Jenis ZISWAF</th>
                    <th className="py-2.5 px-3 font-bold">Nominal</th>
                    <th className="py-2.5 px-3 font-bold">Kanal Bayar</th>
                    <th className="py-2.5 px-3 font-bold">Cryptographic Hash</th>
                    <th className="py-2.5 px-3 font-bold">Kwitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40">
                      <td className="py-3 px-3 text-stone-500">{trx.timestamp}</td>
                      <td className="py-3 px-3 font-bold text-stone-900 dark:text-stone-100">{trx.donorName}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {trx.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">{formatIDR(trx.amount)}</td>
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-400">{trx.paymentMethod}</td>
                      <td className="py-3 px-3 font-mono text-[10px] text-stone-400 truncate max-w-[140px]">
                        {trx.e2eeReceiptHash}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onOpenReceipt(trx)}
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>QR Resit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Kalkulator Zakat Mal & Profesi */}
      {activeSubTab === 'kalkulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form input */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <span>Simulasi Perhitungan Zakat Syariah</span>
              </h3>
              <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setZakatType('penghasilan')}
                  className={`px-3 py-1 rounded-lg ${
                    zakatType === 'penghasilan' ? 'bg-white dark:bg-stone-900 text-emerald-600 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  Penghasilan
                </button>
                <button
                  type="button"
                  onClick={() => setZakatType('mal')}
                  className={`px-3 py-1 rounded-lg ${
                    zakatType === 'mal' ? 'bg-white dark:bg-stone-900 text-emerald-600 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  Zakat Mal
                </button>
              </div>
            </div>

            {zakatType === 'penghasilan' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Penghasilan Pokok Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Penghasilan Tambahan / Bonus (Rp)
                  </label>
                  <input
                    type="number"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kebutuhan Pokok & Utang Jatuh Tempo (Rp)
                  </label>
                  <input
                    type="number"
                    value={monthlyNeeds}
                    onChange={(e) => setMonthlyNeeds(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tabungan, Deposito, & Rekening Bank (Rp)
                  </label>
                  <input
                    type="number"
                    value={cashAsset}
                    onChange={(e) => setCashAsset(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Emas, Perak, Surat Berharga (Rp)
                  </label>
                  <input
                    type="number"
                    value={goldAsset}
                    onChange={(e) => setGoldAsset(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Utang Jangka Pendek Jatuh Tempo (Rp)
                  </label>
                  <input
                    type="number"
                    value={debtPayable}
                    onChange={(e) => setDebtPayable(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 text-[11px] text-stone-500 space-y-1">
              <p>• Nisab setara 85 gram emas murni: <strong>{formatIDR(nisabGold85Gram)}</strong> / tahun.</p>
              <p>• Kadar kewajiban zakat: <strong>2.5%</strong>.</p>
            </div>
          </div>

          {/* Result card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-lg space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-widest text-emerald-300 uppercase">
                HASIL PERHITUNGAN ZAKAT SYARIAH
              </span>

              {zakatType === 'penghasilan' ? (
                <div>
                  <p className="text-xs text-stone-300">Zakat Profesi Wajib Ditunaikan (Per Bulan):</p>
                  <h4 className="text-3xl font-black text-amber-300 font-serif mt-1">
                    {formatIDR(zakatIncomeAmount)}
                  </h4>
                  <p className="text-xs text-stone-300 mt-2">
                    {isIncomeEligible
                      ? '✓ Penghasilan Anda telah melampaui nisab syariah (Wajib Zakat).'
                      : 'Belum mencapai nisab wajib zakat. Sangat dianjurkan memperbanyak Infaq & Sedekah.'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-stone-300">Zakat Mal Wajib Ditunaikan (Per Tahun):</p>
                  <h4 className="text-3xl font-black text-amber-300 font-serif mt-1">
                    {formatIDR(zakatMalAmount)}
                  </h4>
                  <p className="text-xs text-stone-300 mt-2">
                    {isMalEligible
                      ? '✓ Harta simpanan Anda telah memenuhi nisab dan haul (Wajib Zakat).'
                      : 'Harta bersih belum mencapai nisab 85 gram emas.'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenDonateModal(campaigns[2])}
              className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              Bayar Zakat Sekarang via GRIK Kaffah
            </button>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Auto-Gift Distribusi ZISWAF Proporsional */}
      {activeSubTab === 'autogift' && (
        <AutoGiftSection
          language={language}
          campaigns={campaigns}
          config={localAutoGiftConfig}
          onUpdateConfig={(updated) => {
            setLocalAutoGiftConfig(updated);
            if (onUpdateAutoGiftConfig) {
              onUpdateAutoGiftConfig(updated);
            }
          }}
          onOpenReceipt={onOpenReceipt}
        />
      )}

      {/* Sub-tab 5: Peta Sebaran Lokasi Penerima Manfaat & Program Pemberdayaan (D3) */}
      {activeSubTab === 'sebaran' && (
        <BeneficiaryMapD3
          language={language}
          onOpenDonateModal={(campaignTitle, initialAmount) => {
            const matched =
              campaigns.find((c) =>
                c.title
                  .toLowerCase()
                  .includes(campaignTitle?.toLowerCase() || '')
              ) || campaigns[0];
            onOpenDonateModal(matched, initialAmount);
          }}
        />
      )}

      {/* Sub-tab: Proporsi Donasi Rutin (Live Donut Chart) */}
      {activeSubTab === 'proporsi' && (
        <div className="space-y-6">
          {/* Main Interactive Donut Chart */}
          <RoutineDonationDonutChart
            language={language}
            transactions={transactions}
            recurringSubscriptions={recurringSubscriptions}
            autoGiftConfig={localAutoGiftConfig}
            campaigns={campaigns}
            onOpenDonateModal={onOpenDonateModal}
          />

          {/* Fiqih Governance & 3 Pillars Educational Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800/60 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Pilar Zakat (Maal & Profesi)
                </h4>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Kewajiban fardhu 'ain 2.5% bagi harta yang mencapai nisab (85 gram emas) dan haul. Terikat mutlak hanya untuk <strong>8 Asnaf</strong> syar'i (Fakir, Miskin, Amil, Mu'allaf, Riqab, Gharimin, Fisabilillah, Ibnu Sabil).
              </p>
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Karakter: Wajib & Spesifik
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('kalkulator')}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Hitung Nisab →
                </button>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800/60 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Pilar Infaq (Dakwah & Sarana)
                </h4>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Pemberian harta sukarela tanpa batas nisab untuk kemaslahatan umum, operasional rumah ibadah, syiar dakwah digital, dan pemeliharaan fasilitas umat yang berkelanjutan.
              </p>
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                  Karakter: Fleksibel & Berkelanjutan
                </span>
                <button
                  type="button"
                  onClick={() => onOpenDonateModal(campaigns[0])}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Infaq Sekarang →
                </button>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-cyan-200 dark:border-cyan-800/60 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 shrink-0" />
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Pilar Sedekah (Subuh & Santunan)
                </h4>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Amalan pembuka pintu rezeki dan penolak bala yang dianjurkan setiap saat, terutama di waktu subuh saat dua malaikat mendoakan keberkahan bagi pemberi sedekah.
              </p>
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">
                  Karakter: Harian & Universal
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('autogift')}
                  className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Set Auto-Gift →
                </button>
              </div>
            </div>
          </div>

          {/* Quick Routing Hub */}
          <div className="p-5 rounded-3xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 text-emerald-600 shadow-2xs">
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Kelola Alokasi Proporsional Otomatis Anda
                </h5>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Ingin menyesuaikan persentase distribusi donasi bulanan Anda ke masing-masing pilar program?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSubTab('autogift')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Buka Konfigurasi Auto-Gift
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('sebaran')}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 text-stone-700 dark:text-stone-300 font-bold text-xs border border-stone-200 dark:border-stone-700 transition cursor-pointer"
              >
                Peta Sebaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
