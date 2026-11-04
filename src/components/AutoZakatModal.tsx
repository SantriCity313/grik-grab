import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building,
  HelpCircle,
  X,
  Coins,
  Wallet,
  TrendingUp,
  Receipt,
  BookOpen,
} from 'lucide-react';
import {
  RecurringDonationSubscription,
  DonationCampaign,
  Language,
  AutoZakatDetails,
} from '../types';
import { translations } from '../translations';
import { formatIDR, formatCompactNumber } from '../utils';

export interface DesignatedInstitution {
  id: string;
  name: string;
  shortName: string;
  category: string;
  skKemenag: string;
  logoText: string;
  description: string;
}

export const ZAKAT_INSTITUTIONS: DesignatedInstitution[] = [
  {
    id: 'baznas',
    name: 'BAZNAS (Badan Amil Zakat Nasional)',
    shortName: 'BAZNAS RI',
    category: 'Lembaga Resmi Pemerintah',
    skKemenag: 'Kepres No. 8/2001 & UU No. 23/2011',
    logoText: 'BAZNAS',
    description: 'Badan pengelola zakat resmi negara dengan audit WTP dan jangkauan 38 provinsi.',
  },
  {
    id: 'dompet-dhuafa',
    name: 'Dompet Dhuafa',
    shortName: 'Dompet Dhuafa',
    category: 'LAZ Skala Nasional',
    skKemenag: 'SK Menag No. 439/2001',
    logoText: 'DD',
    description: 'Pemberdayaan kaum duafa melalui program kesehatan gratis, pendidikan, dan ekonomi.',
  },
  {
    id: 'rumah-zakat',
    name: 'Rumah Zakat',
    shortName: 'Rumah Zakat',
    category: 'LAZ Skala Nasional',
    skKemenag: 'SK Menag No. 42/2007',
    logoText: 'RZ',
    description: 'Fokus program Desa Berdaya, beasiswa anak yatim, dan ketahanan pangan mustahiq.',
  },
  {
    id: 'lazisnu',
    name: 'LAZISNU (NU Care - PBNU)',
    shortName: 'NU Care LAZISNU',
    category: 'LAZ Skala Nasional',
    skKemenag: 'SK Menag No. 255/2016',
    logoText: 'LAZISNU',
    description: 'Penyaluran zakat produktif berbasis pesantren, kemandirian umat, dan kebajikan sosial.',
  },
  {
    id: 'lazismu',
    name: 'LAZISMU (PP Muhammadiyah)',
    shortName: 'LAZISMU',
    category: 'LAZ Skala Nasional',
    skKemenag: 'SK Menag No. 730/2016',
    logoText: 'LAZISMU',
    description: 'Penguatan 8 asnaf melalui jaringan rumah sakit, klinik, dan sekolah vokasi Islam.',
  },
  {
    id: 'grik-baitulmaal',
    name: 'Baitul Maal Masjid GRIK Kaffah',
    shortName: 'Baitul Maal GRIK',
    category: 'Amil Zakat Komunitas Masjid',
    skKemenag: 'Rekomendasi BAZNAS Kota 2026/GRIK-09',
    logoText: 'GRIK',
    description: 'Penyaluran langsung 100% transparan untuk santri duafa, lansia, dan janda binaan masjid.',
  },
];

export interface AutoZakatModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  campaigns: DonationCampaign[];
  existingSubscription?: RecurringDonationSubscription | null;
  onSaveAutoZakat: (
    subscriptionData: Omit<RecurringDonationSubscription, 'id' | 'startDate' | 'totalDonatedSoFar'>
  ) => void;
}

export const AutoZakatModal: React.FC<AutoZakatModalProps> = ({
  isOpen,
  onClose,
  language,
  campaigns,
  existingSubscription,
  onSaveAutoZakat,
}) => {
  const t = translations[language];

  // Default calculation values
  const defaultGoldPrice = 1420000; // Rp 1.420.000 / gram per Sept 2026

  // Form State
  const [calcTab, setCalcTab] = useState<'calculator' | 'institution' | 'schedule'>('calculator');
  const [calculationMethod, setCalculationMethod] = useState<'income' | 'comprehensive'>('income');

  // 1. Income Inputs
  const [monthlyIncome, setMonthlyIncome] = useState<number>(
    existingSubscription?.autoZakatDetails?.monthlyIncome ?? 15000000
  );
  const [additionalIncome, setAdditionalIncome] = useState<number>(
    existingSubscription?.autoZakatDetails?.additionalIncome ?? 2500000
  );
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(
    existingSubscription?.autoZakatDetails?.monthlyExpenses ?? 4500000
  );

  // 2. Asset Inputs
  const [savingsAndCash, setSavingsAndCash] = useState<number>(
    existingSubscription?.autoZakatDetails?.savingsAndCash ?? 75000000
  );
  const [goldAndInvestments, setGoldAndInvestments] = useState<number>(
    existingSubscription?.autoZakatDetails?.goldAndInvestments ?? 20000000
  );
  const [receivables, setReceivables] = useState<number>(
    existingSubscription?.autoZakatDetails?.receivables ?? 0
  );

  // 3. Parameters
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(
    existingSubscription?.autoZakatDetails?.goldPricePerGram ?? defaultGoldPrice
  );
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(
    existingSubscription?.designatedInstitution
      ? ZAKAT_INSTITUTIONS.find((i) => i.name === existingSubscription.designatedInstitution)?.id || 'baznas'
      : 'baznas'
  );
  const [billingDay, setBillingDay] = useState<number>(
    existingSubscription?.billingDay ?? 25
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'Auto-Debit BSI' | 'Bank Syariah Muamalat' | 'QRIS Autodebit' | 'GRIK Pay Kas Syariah'
  >(existingSubscription?.paymentMethod ?? 'Auto-Debit BSI');

  const [customZakatNominal, setCustomZakatNominal] = useState<string>('');
  const [showNiatZakat, setShowNiatZakat] = useState<boolean>(true);

  // Sync when existingSubscription changes
  useEffect(() => {
    if (existingSubscription?.autoZakatDetails) {
      const details = existingSubscription.autoZakatDetails;
      setMonthlyIncome(details.monthlyIncome);
      setAdditionalIncome(details.additionalIncome);
      setMonthlyExpenses(details.monthlyExpenses);
      setSavingsAndCash(details.savingsAndCash);
      setGoldAndInvestments(details.goldAndInvestments);
      setReceivables(details.receivables);
      setGoldPricePerGram(details.goldPricePerGram);
      setBillingDay(existingSubscription.billingDay);
      setPaymentMethod(existingSubscription.paymentMethod);
      const matchedInst = ZAKAT_INSTITUTIONS.find((i) => i.name === details.designatedInstitution);
      if (matchedInst) {
        setSelectedInstitutionId(matchedInst.id);
      }
    }
  }, [existingSubscription]);

  if (!isOpen) return null;

  // --- CALCULATION LOGIC ---
  // Nisab standard: 85 grams of gold
  const annualNisab = 85 * goldPricePerGram; // e.g. 85 * 1.420.000 = Rp 120.700.000
  const monthlyNisab = Math.round(annualNisab / 12); // ~ Rp 10.058.333

  // Net Monthly Income = Gross - Essential Monthly Living Expenses & Debt
  const grossMonthlyIncome = monthlyIncome + additionalIncome;
  const netMonthlyIncome = Math.max(0, grossMonthlyIncome - monthlyExpenses);

  // Total Liquid Assets = Tabungan + Emas/Investasi + Piutang Lancar
  const totalAssets = savingsAndCash + goldAndInvestments + receivables;

  // Is Nisab reached?
  // Method A (Income-based Zakat Profesi): Net monthly income >= monthly nisab
  // Method B (Comprehensive Zakat Mal): (Net monthly income * 12 + Total Assets) >= annual nisab
  const isNisabReached =
    calculationMethod === 'income'
      ? netMonthlyIncome >= monthlyNisab
      : totalAssets >= annualNisab || netMonthlyIncome >= monthlyNisab;

  // Monthly zakatable base calculation
  let zakatableBaseMonthly = 0;
  if (calculationMethod === 'income') {
    zakatableBaseMonthly = netMonthlyIncome;
  } else {
    // Comprehensive: Net monthly income + monthly share of assets (totalAssets / 12)
    zakatableBaseMonthly = netMonthlyIncome + Math.round(totalAssets / 12);
  }

  // Monthly Zakat Obligation = 2.5% of zakatable base
  const calculatedZakatMonthly = Math.round(zakatableBaseMonthly * 0.025);

  const finalZakatAmount = customZakatNominal
    ? parseInt(customZakatNominal.replace(/\D/g, '') || '0', 10)
    : calculatedZakatMonthly;

  const selectedInst =
    ZAKAT_INSTITUTIONS.find((i) => i.id === selectedInstitutionId) || ZAKAT_INSTITUTIONS[0];

  // Find appropriate campaign for Zakat Mal
  const zakatCampaign =
    campaigns.find((c) => c.category === 'Zakat') ||
    campaigns.find((c) => c.id === 'cmp-03') ||
    campaigns[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (finalZakatAmount < 10000) {
      alert('Nominal zakat minimal adalah Rp 10.000');
      return;
    }

    const nextBillingDateStr = `${billingDay < 10 ? `0${billingDay}` : billingDay} Oktober 2026`;

    const autoZakatDetails: AutoZakatDetails = {
      monthlyIncome,
      additionalIncome,
      monthlyExpenses,
      savingsAndCash,
      goldAndInvestments,
      receivables,
      goldPricePerGram,
      nisabMonthly: monthlyNisab,
      isNisabReached,
      totalAssets,
      netMonthlyIncome,
      zakatableBaseMonthly,
      calculatedZakatMonthly,
      designatedInstitution: selectedInst.name,
      autoDebitDay: billingDay,
    };

    onSaveAutoZakat({
      campaignId: zakatCampaign?.id || 'cmp-03',
      campaignTitle: `${zakatCampaign?.title || 'Zakat Mal Pengentasan Kemiskinan'} [${selectedInst.shortName}]`,
      category: 'Zakat',
      monthlyAmount: finalZakatAmount,
      frequency: 'Bulanan',
      billingDay,
      nextBillingDate: nextBillingDateStr,
      paymentMethod,
      status: 'Aktif',
      autoDeduct: true,
      isAutoZakat: true,
      designatedInstitution: selectedInst.name,
      autoZakatDetails,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 my-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. Header with Auto-Zakat branding */}
        <div className="flex items-start justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-xs shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">
                  {t.autoZakatTitle || 'Fitur Auto-Zakat Mal'}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  · Nisab 85g Emas (2.5%)
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                Hitung kewajiban zakat mal dari total aset & penghasilan, lalu otomatiskan penyalurannya ke lembaga amil zakat terverifikasi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Step Navigation Tabs (Zero-pill button group) */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setCalcTab('calculator')}
            className={`py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              calcTab === 'calculator'
                ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>1. Kalkulator Aset</span>
          </button>

          <button
            type="button"
            onClick={() => setCalcTab('institution')}
            className={`py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              calcTab === 'institution'
                ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>2. Lembaga Zakat</span>
          </button>

          <button
            type="button"
            onClick={() => setCalcTab('schedule')}
            className={`py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              calcTab === 'schedule'
                ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>3. Jadwal & Autodebit</span>
          </button>
        </div>

        {/* 3. Tab Contents */}
        {calcTab === 'calculator' && (
          <div className="space-y-4">
            {/* Calculation Method Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Metode Perhitungan Zakat:
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {calculationMethod === 'income'
                    ? 'Zakat Profesi/Penghasilan bulanan bersih (Gaji & Tambahan - Beban Pokok).'
                    : 'Zakat Komprehensif: Penghasilan bulanan + prorata harta tabungan & simpanan per bulan.'}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setCalculationMethod('income')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    calculationMethod === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  Penghasilan
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationMethod('comprehensive')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    calculationMethod === 'comprehensive'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  Komprehensif (Aset + Gaji)
                </button>
              </div>
            </div>

            {/* Section A: Monthly Income */}
            <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3 bg-white dark:bg-stone-900">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>A. Arus Penghasilan & Pengeluaran Bulanan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    Gaji Pokok Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    step={500000}
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    Penghasilan Tambahan (Rp)
                  </label>
                  <input
                    type="number"
                    step={250000}
                    value={additionalIncome}
                    onChange={(e) => setAdditionalIncome(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    Pengeluaran Pokok & Utang (Rp)
                  </label>
                  <input
                    type="number"
                    step={250000}
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="text-right text-xs text-stone-600 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
                Penghasilan Bersih Bulanan:{' '}
                <strong className="text-stone-900 dark:text-stone-100 font-mono">
                  {formatIDR(netMonthlyIncome)}
                </strong>
              </div>
            </div>

            {/* Section B: Liquid Assets & Wealth */}
            <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3 bg-white dark:bg-stone-900">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>B. Harta Simpanan & Total Aset Likuid</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    Tabungan, Kas & Deposito (Rp)
                  </label>
                  <input
                    type="number"
                    step={1000000}
                    value={savingsAndCash}
                    onChange={(e) => setSavingsAndCash(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    Emas & Investasi Likuid (Rp)
                  </label>
                  <input
                    type="number"
                    step={1000000}
                    value={goldAndInvestments}
                    onChange={(e) => setGoldAndInvestments(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    Piutang Lancar Tagih (Rp)
                  </label>
                  <input
                    type="number"
                    step={500000}
                    value={receivables}
                    onChange={(e) => setReceivables(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span>Harga Acuan Emas:</span>
                  <input
                    type="number"
                    step={10000}
                    value={goldPricePerGram}
                    onChange={(e) => setGoldPricePerGram(Number(e.target.value) || defaultGoldPrice)}
                    className="w-24 px-2 py-0.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-[11px]"
                  />
                  <span>/gram</span>
                </div>
                <div>
                  Total Harta Simpanan:{' '}
                  <strong className="text-stone-900 dark:text-stone-100 font-mono">
                    {formatIDR(totalAssets)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Section C: Nisab & Resulting Obligation Summary */}
            <div className="p-4 rounded-2xl bg-emerald-950 text-white border border-emerald-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Status Nisab Syariah (85g Emas)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-emerald-200">
                      Nisab Bulanan: {formatIDR(monthlyNisab)}/bln · Tahunan: {formatIDR(annualNisab)}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        isNisabReached
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-400 text-stone-900'
                      }`}
                    >
                      {isNisabReached ? 'Wajib Zakat (Mencapai Nisab)' : 'Belum Wajib Zakat'}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Kewajiban Zakat Mal (2.5%)
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                    {formatIDR(calculatedZakatMonthly)}
                    <span className="text-xs font-sans font-medium text-emerald-200 ml-1">/bulan</span>
                  </div>
                </div>
              </div>

              {/* Custom Override Option */}
              <div className="pt-2 border-t border-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-200">
                <span>Atau sesuaikan nominal bulanan jika ingin menggenapkan:</span>
                <input
                  type="text"
                  placeholder={`Default: ${formatIDR(calculatedZakatMonthly)}`}
                  value={customZakatNominal}
                  onChange={(e) => setCustomZakatNominal(e.target.value)}
                  className="w-48 px-3 py-1.5 rounded-xl border border-emerald-700 bg-emerald-900/60 text-white text-xs font-mono placeholder:text-emerald-400/60 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCalcTab('institution')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjut: Pilih Lembaga Penyalur</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. Tab 2: Designated Zakat Institutions */}
        {calcTab === 'institution' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Pilih Lembaga Amil Zakat Tujuan Penyaluran
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Dana zakat mal Anda akan diautodebit dan disalurkan langsung ke amil zakat resmi terverifikasi Kemenag RI / BAZNAS.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ZAKAT_INSTITUTIONS.map((inst) => {
                const isSelected = selectedInstitutionId === inst.id;
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedInstitutionId(inst.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {inst.logoText.slice(0, 3)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {inst.shortName}
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400">
                            {inst.category}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {inst.description}
                    </p>

                    <div className="text-[10px] text-stone-400 font-mono">
                      Legalitas: {inst.skKemenag}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setCalcTab('calculator')}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
              >
                ← Kembali ke Hitung Aset
              </button>

              <button
                type="button"
                onClick={() => setCalcTab('schedule')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjut: Atur Jadwal Autodebit</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. Tab 3: Schedule, Niat & Automation */}
        {calcTab === 'schedule' && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Konfirmasi Jadwal Autodebit & Niat Zakat Mal
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Setiap bulan pada tanggal yang ditentukan, kewajiban zakat mal Anda akan didebit dan disalurkan secara otomatis.
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">Lembaga Amil Zakat Tujuan:</span>
                <strong className="text-stone-900 dark:text-stone-100">
                  {selectedInst.name}
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">Total Komitmen Zakat Mal:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  {formatIDR(finalZakatAmount)} / bulan
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">Dasar Perhitungan (2.5%):</span>
                <span className="text-stone-600 dark:text-stone-300">
                  Basis zakatable {formatIDR(zakatableBaseMonthly)}/bln (Nisab Terpenuhi)
                </span>
              </div>
            </div>

            {/* Debit Day & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Tanggal Autodebit Bulanan
                </label>
                <select
                  value={billingDay}
                  onChange={(e) => setBillingDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={25}>Tanggal 25 (Setelah Hari Gajian)</option>
                  <option value={1}>Tanggal 1 (Awal Bulan Hijriah/Masehi)</option>
                  <option value={5}>Tanggal 5 tiap bulan</option>
                  <option value={10}>Tanggal 10 tiap bulan</option>
                  <option value={15}>Tanggal 15 tiap bulan</option>
                  <option value={20}>Tanggal 20 tiap bulan</option>
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
                  <option value="Bank Syariah Muamalat">Bank Syariah Muamalat Autodebit</option>
                  <option value="QRIS Autodebit">QRIS Autodebit Rekening Mandiri</option>
                  <option value="GRIK Pay Kas Syariah">GRIK Pay Kas Syariah Komunitas</option>
                </select>
              </div>
            </div>

            {/* Lafaz Niat Zakat Mal Digital */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-stone-100">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Lafaz Niat Zakat Mal (Fardhu)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNiatZakat(!showNiatZakat)}
                  className="text-emerald-700 dark:text-emerald-400 text-[11px] cursor-pointer"
                >
                  {showNiatZakat ? 'Ringkas' : 'Tampilkan Lengkap'}
                </button>
              </div>

              {showNiatZakat && (
                <div className="space-y-1.5 pt-1 text-xs">
                  <p className="font-serif text-right text-stone-900 dark:text-stone-100 text-base leading-relaxed tracking-wide">
                    نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى
                  </p>
                  <p className="text-stone-600 dark:text-stone-400 italic text-[11px]">
                    &quot;Nawaitu an ukhrija zakaatal maali fardhan lillaahi ta&apos;aala&quot;
                  </p>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                    Artinya: &quot;Aku niat mengeluarkan zakat hartaku fardhu karena Allah Ta&apos;ala.&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Syariah Note */}
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Sistem memberikan bukti setor Zakat (BSZ) resmi yang diakui pengurang pajak penghasilan (Pph 21) sesuai regulasi BAZNAS & Dirjen Pajak.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setCalcTab('institution')}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
              >
                ← Kembali ke Lembaga
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {existingSubscription ? 'Simpan Perubahan Auto-Zakat' : 'Aktifkan Auto-Zakat Bulanan'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
