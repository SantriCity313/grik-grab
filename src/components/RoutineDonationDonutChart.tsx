import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Coins,
  Heart,
  HandHeart,
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Eye,
  Radio,
  Play,
  Pause,
  Filter,
  Layers,
} from 'lucide-react';
import {
  DonationTransaction,
  RecurringDonationSubscription,
  AutoGiftConfig,
  DonationCampaign,
  Language,
} from '../types';
import { translations } from '../translations';
import { formatIDR, formatCompactNumber } from '../utils';

export interface RoutineDonationSegment {
  id: 'zakat' | 'infaq' | 'sedekah' | 'wakaf';
  name: string;
  shortName: string;
  category: string;
  amount: number;
  percentage: number;
  color: string;
  hoverColor: string;
  lightBg: string;
  darkBg: string;
  borderColor: string;
  donorCount: number;
  asnafOrTarget: string;
  subcategories: string[];
  description: string;
}

interface RoutineDonationDonutChartProps {
  language: Language;
  transactions?: DonationTransaction[];
  recurringSubscriptions?: RecurringDonationSubscription[];
  autoGiftConfig?: AutoGiftConfig;
  onOpenDonateModal?: (campaign?: DonationCampaign, initialAmount?: number) => void;
  campaigns?: DonationCampaign[];
  className?: string;
  isCompact?: boolean;
}

export const RoutineDonationDonutChart: React.FC<RoutineDonationDonutChartProps> = ({
  language,
  transactions = [],
  recurringSubscriptions = [],
  autoGiftConfig,
  onOpenDonateModal,
  campaigns = [],
  className = '',
  isCompact = false,
}) => {
  const t = translations[language] || translations.id;

  // Real-time live stream state
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [lastStreamUpdate, setLastStreamUpdate] = useState<string>('Baru saja');
  const [pulseKey, setPulseKey] = useState<number>(0);
  const [liveStreamAlert, setLiveStreamAlert] = useState<{
    text: string;
    amount: number;
    category: string;
  } | null>(null);

  // Filter mode: 'zis_only' (Zakat, Infaq, Sedekah) vs 'ziswaf_all' (+ Wakaf)
  const [scopeFilter, setScopeFilter] = useState<'zis_only' | 'ziswaf_all'>('zis_only');
  // Data source: 'commitments' (Monthly Subscriptions + Auto-Gift) vs 'transactions' (Ledger Real-Time) vs 'consolidated'
  const [dataSource, setDataSource] = useState<'consolidated' | 'commitments' | 'transactions'>('consolidated');

  // Interactive slice hover state
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);

  // Simulated live transactions added dynamically in real time
  const [simulatedStream, setSimulatedStream] = useState<Array<{
    id: string;
    category: 'zakat' | 'infaq' | 'sedekah';
    amount: number;
    donor: string;
    time: string;
  }>>([
    {
      id: 'live-01',
      category: 'sedekah',
      amount: 150000,
      donor: 'Hamba Allah (Sedekah Subuh Rutin)',
      time: '05:12 WIB',
    },
    {
      id: 'live-02',
      category: 'infaq',
      amount: 250000,
      donor: 'Keluarga Bpk. Hartono (Infaq Masjid)',
      time: '09:30 WIB',
    },
    {
      id: 'live-03',
      category: 'zakat',
      amount: 1250000,
      donor: 'dr. Siti Rahmawati (Zakat Penghasilan)',
      time: '14:20 WIB',
    },
  ]);

  // Handle dynamic real-time simulated stream ticks
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // Simulate sporadic incoming routine donation every 12 seconds
      const sampleDonors = [
        'Ahmad Fauzi (Autodebit BSI)',
        'Hamba Allah (Sedekah Subuh)',
        'Ibu Ratna Dewi (Infaq Jumat Rutin)',
        'H. Subhan (Zakat Profesi Bulanan)',
        'Dra. Nurhayati (Autodebit Muamalat)',
        'M. Rizki (Auto-Gift ZISWAF)',
      ];
      const categories: Array<'zakat' | 'infaq' | 'sedekah'> = ['zakat', 'infaq', 'sedekah'];
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      const randomDonor = sampleDonors[Math.floor(Math.random() * sampleDonors.length)];

      let randomAmount = 100000;
      if (randomCat === 'zakat') {
        randomAmount = [350000, 500000, 750000, 1250000][Math.floor(Math.random() * 4)];
      } else if (randomCat === 'infaq') {
        randomAmount = [50000, 100000, 200000, 300000][Math.floor(Math.random() * 4)];
      } else {
        randomAmount = [25000, 50000, 100000, 250000][Math.floor(Math.random() * 4)];
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

      const newEntry = {
        id: `live-${Date.now()}`,
        category: randomCat,
        amount: randomAmount,
        donor: randomDonor,
        time: timeStr,
      };

      setSimulatedStream((prev) => [newEntry, ...prev.slice(0, 9)]);
      setPulseKey((k) => k + 1);
      setLastStreamUpdate(timeStr);
      setLiveStreamAlert({
        text: `Donasi Rutin ${randomCat.toUpperCase()} masuk: ${randomDonor}`,
        amount: randomAmount,
        category: randomCat,
      });

      // Clear alert banner after 4 seconds
      const timeout = setTimeout(() => {
        setLiveStreamAlert((current) => (current?.text.includes(randomDonor) ? null : current));
      }, 4000);

      return () => clearTimeout(timeout);
    }, 12000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Trigger manual simulation tick on demand
  const handleTriggerSimulate = () => {
    const sampleCategories: Array<'zakat' | 'infaq' | 'sedekah'> = ['zakat', 'infaq', 'sedekah'];
    const chosenCat = sampleCategories[Math.floor(Math.random() * sampleCategories.length)];
    const amounts = {
      zakat: 850000,
      infaq: 250000,
      sedekah: 150000,
    };
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

    const newTrx = {
      id: `manual-sim-${Date.now()}`,
      category: chosenCat,
      amount: amounts[chosenCat],
      donor: 'Simulasi Donatur Rutin (GRIK Pay)',
      time: timeStr,
    };

    setSimulatedStream((prev) => [newTrx, ...prev.slice(0, 9)]);
    setPulseKey((k) => k + 1);
    setLastStreamUpdate(timeStr);
    setLiveStreamAlert({
      text: `Simulasi Transaksi ${chosenCat.toUpperCase()} Terverifikasi: Rp ${amounts[chosenCat].toLocaleString('id-ID')}`,
      amount: amounts[chosenCat],
      category: chosenCat,
    });
  };

  // Calculate aggregated nominals for Zakat, Infaq, Sedekah (and Wakaf)
  const segmentsData = useMemo(() => {
    // 1. Base values from subscriptions
    let zakatTotal = 0;
    let infaqTotal = 0;
    let sedekahTotal = 0;
    let wakafTotal = 0;

    let zakatDonors = 32;
    let infaqDonors = 58;
    let sedekahDonors = 84;
    let wakafDonors = 21;

    // A. Parse recurringSubscriptions
    recurringSubscriptions.forEach((sub) => {
      const amt = sub.monthlyAmount || 0;
      const cat = sub.category?.toLowerCase() || '';
      if (cat.includes('zakat')) {
        zakatTotal += amt;
        zakatDonors += 1;
      } else if (cat.includes('infaq')) {
        infaqTotal += amt;
        infaqDonors += 1;
      } else if (cat.includes('wakaf')) {
        wakafTotal += amt;
        wakafDonors += 1;
      } else {
        sedekahTotal += amt;
        sedekahDonors += 1;
      }
    });

    // B. Parse Auto-Gift allocations if enabled
    if (autoGiftConfig && autoGiftConfig.isEnabled && autoGiftConfig.totalMonthlyBudget) {
      const budget = autoGiftConfig.totalMonthlyBudget;
      autoGiftConfig.allocations.forEach((alloc) => {
        const allocAmt = (budget * alloc.percentage) / 100;
        const cat = alloc.category.toLowerCase();
        if (cat.includes('zakat')) {
          zakatTotal += allocAmt;
        } else if (cat.includes('infaq')) {
          infaqTotal += allocAmt;
        } else if (cat.includes('wakaf')) {
          wakafTotal += allocAmt;
        } else {
          sedekahTotal += allocAmt;
        }
      });
    }

    // C. Parse transactions if data source considers them
    if (dataSource === 'consolidated' || dataSource === 'transactions') {
      transactions.forEach((trx) => {
        const type = (trx.type || '').toLowerCase();
        const amt = trx.amount || 0;
        if (type.includes('zakat')) {
          zakatTotal += amt * 0.35; // proportional routine weight
          zakatDonors += 1;
        } else if (type.includes('infaq')) {
          infaqTotal += amt * 0.45;
          infaqDonors += 1;
        } else if (type.includes('wakaf')) {
          wakafTotal += amt * 0.3;
          wakafDonors += 1;
        } else {
          sedekahTotal += amt * 0.4;
          sedekahDonors += 1;
        }
      });
    }

    // D. Include live dynamic stream additions
    simulatedStream.forEach((entry) => {
      if (entry.category === 'zakat') {
        zakatTotal += entry.amount;
        zakatDonors += 1;
      } else if (entry.category === 'infaq') {
        infaqTotal += entry.amount;
        infaqDonors += 1;
      } else if (entry.category === 'sedekah') {
        sedekahTotal += entry.amount;
        sedekahDonors += 1;
      }
    });

    // Baseline fallbacks if data is zero so chart renders elegantly
    if (zakatTotal === 0) zakatTotal = 5625000;
    if (infaqTotal === 0) infaqTotal = 3850000;
    if (sedekahTotal === 0) sedekahTotal = 3375000;
    if (wakafTotal === 0) wakafTotal = 2150000;

    const baseList: Array<{
      id: 'zakat' | 'infaq' | 'sedekah' | 'wakaf';
      name: string;
      shortName: string;
      category: string;
      amount: number;
      color: string;
      hoverColor: string;
      lightBg: string;
      darkBg: string;
      borderColor: string;
      donorCount: number;
      asnafOrTarget: string;
      subcategories: string[];
      description: string;
    }> = [
      {
        id: 'zakat',
        name: 'Zakat (Mal & Profesi/Penghasilan)',
        shortName: 'Zakat',
        category: 'Zakat Syariah',
        amount: Math.round(zakatTotal),
        color: '#10b981', // emerald-500
        hoverColor: '#059669', // emerald-600
        lightBg: 'bg-emerald-50 text-emerald-950',
        darkBg: 'dark:bg-emerald-950/40 dark:text-emerald-200',
        borderColor: 'border-emerald-300 dark:border-emerald-800',
        donorCount: zakatDonors,
        asnafOrTarget: '8 Golongan Asnaf (Fakir, Miskin, Fisabilillah Beasiswa)',
        subcategories: ['Zakat Maal Tabungan & Emas', 'Zakat Penghasilan Rutin', 'Pendidikan Vokasi Santri Dhuafa'],
        description: 'Kewajiban syariat 2.5% yang disalurkan secara ketat kepada asnaf mustahiq terverifikasi dengan audit syariat 100%.',
      },
      {
        id: 'infaq',
        name: 'Infaq (Operasional & Sarana Dakwah)',
        shortName: 'Infaq',
        category: 'Infaq Operasional',
        amount: Math.round(infaqTotal),
        color: '#f59e0b', // amber-500
        hoverColor: '#d97706', // amber-600
        lightBg: 'bg-amber-50 text-amber-950',
        darkBg: 'dark:bg-amber-950/40 dark:text-amber-200',
        borderColor: 'border-amber-300 dark:border-amber-800',
        donorCount: infaqDonors,
        asnafOrTarget: 'Kemakmuran Masjid, Syiar Dakwah, & Sarana Digital',
        subcategories: ['Operasional Listrik & Air Rumah Ibadah', 'Streaming Dakwah Kaffah', 'Peralatan Multimedia Jamaah'],
        description: 'Dana infaq sukarela untuk kelangsungan operasional masjid, kajian ilmu berkah, dan fasilitas umat tanpa batas waktu.',
      },
      {
        id: 'sedekah',
        name: 'Sedekah (Subuh & Santunan Dhuafa)',
        shortName: 'Sedekah',
        category: 'Sedekah Terbuka',
        amount: Math.round(sedekahTotal),
        color: '#06b6d4', // cyan-500
        hoverColor: '#0891b2', // cyan-600
        lightBg: 'bg-cyan-50 text-cyan-950',
        darkBg: 'dark:bg-cyan-950/40 dark:text-cyan-200',
        borderColor: 'border-cyan-300 dark:border-cyan-800',
        donorCount: sedekahDonors,
        asnafOrTarget: 'Santunan Yatim, Pangan Dhuafa, & Kedaruratan',
        subcategories: ['Gerakan Sedekah Subuh Berkah', 'Paket Sembako Kaum Dhuafa', 'Tanggap Bencana & Darurat Kesehatan'],
        description: 'Sedekah harian dan bulanan yang mencakup program penolak bala, makan siang santri, dan santunan anak yatim piatu.',
      },
    ];

    if (scopeFilter === 'ziswaf_all') {
      baseList.push({
        id: 'wakaf',
        name: 'Wakaf Produktif & Sarana Abadi',
        shortName: 'Wakaf',
        category: 'Wakaf Produktif',
        amount: Math.round(wakafTotal),
        color: '#8b5cf6', // violet-500
        hoverColor: '#7c3aed', // violet-600
        lightBg: 'bg-violet-50 text-violet-950',
        darkBg: 'dark:bg-violet-950/40 dark:text-violet-200',
        borderColor: 'border-violet-300 dark:border-violet-800',
        donorCount: wakafDonors,
        asnafOrTarget: 'Aset Abadi, Sentra Grosir Halal, & Qardh UMKM',
        subcategories: ['Pusat Grosir Halal Umat', 'Sawah & Irigasi Beras Organik', 'Dana Bergulir Qardhul Hasan'],
        description: 'Harta wakaf yang pokoknya ditahan dan hasil manfaat ekonominya dibagikan secara terus-menerus bagi umat.',
      });
    }

    const totalSum = baseList.reduce((acc, curr) => acc + curr.amount, 0);

    return baseList.map((item) => ({
      ...item,
      percentage: totalSum > 0 ? Number(((item.amount / totalSum) * 100).toFixed(1)) : 0,
    })) as RoutineDonationSegment[];
  }, [
    recurringSubscriptions,
    autoGiftConfig,
    transactions,
    simulatedStream,
    scopeFilter,
    dataSource,
  ]);

  const grandTotal = useMemo(() => {
    return segmentsData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [segmentsData]);

  const totalDonors = useMemo(() => {
    return segmentsData.reduce((acc, curr) => acc + curr.donorCount, 0);
  }, [segmentsData]);

  // Active or spotlighted segment for donut center readout
  const activeSegment = useMemo(() => {
    if (!hoveredSegmentId) return null;
    return segmentsData.find((s) => s.id === hoveredSegmentId) || null;
  }, [hoveredSegmentId, segmentsData]);

  // Compute D3 pie and arc paths for the SVG Donut
  const chartDimension = 320;
  const radius = chartDimension / 2;
  const outerRadius = radius - 16;
  const innerRadius = radius - 70; // creates a thick, elegant donut ring

  const pieData = useMemo(() => {
    const pieGenerator = d3
      .pie<RoutineDonationSegment>()
      .value((d) => d.amount)
      .sort(null)
      .padAngle(0.028); // clean gap between slices

    return pieGenerator(segmentsData);
  }, [segmentsData]);

  const arcGenerators = useMemo(() => {
    const normalArc = d3
      .arc<d3.PieArcDatum<RoutineDonationSegment>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(8);

    const expandedArc = d3
      .arc<d3.PieArcDatum<RoutineDonationSegment>>()
      .innerRadius(innerRadius - 4)
      .outerRadius(outerRadius + 10)
      .cornerRadius(10);

    return { normalArc, expandedArc };
  }, [innerRadius, outerRadius]);

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* Top Header Bar */}
      <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/50 dark:bg-stone-900/50">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
              <PieChartIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 font-serif">
                  Proporsi Distribusi Donasi Rutin
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isLiveStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                    }`}
                  />
                  <span>{isLiveStreaming ? 'Real-Time Live' : 'Streaming Dijeda'}</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Visualisasi proporsi donasi rutin berkala (Zakat, Infaq, Sedekah) yang terverifikasi transparan.
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls & Simulation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Resume Live Ticker */}
          <button
            type="button"
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              isLiveStreaming
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
            }`}
            title={isLiveStreaming ? 'Jeda aliran update real-time' : 'Lanjutkan aliran real-time'}
          >
            {isLiveStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Live On</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Jeda</span>
              </>
            )}
          </button>

          {/* Trigger manual donation injection */}
          <button
            type="button"
            onClick={handleTriggerSimulate}
            className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-stone-200 dark:border-stone-700 shadow-2xs"
            title="Simulasikan transaksi donasi rutin baru masuk ke sistem"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Simulasi Aliran Donasi</span>
          </button>

          {/* Quick Scope Filter Toggle */}
          <div className="flex items-center p-0.5 bg-stone-200/70 dark:bg-stone-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setScopeFilter('zis_only')}
              className={`px-2.5 py-1 rounded-lg transition ${
                scopeFilter === 'zis_only'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Fokus ZIS (3 Pilar)
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('ziswaf_all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                scopeFilter === 'ziswaf_all'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              + Wakaf
            </button>
          </div>
        </div>
      </div>

      {/* Real-time incoming donation toast banner */}
      {liveStreamAlert && (
        <div className="bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-2 text-xs flex items-center justify-between animate-fadeIn transition-all">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span className="font-bold">{liveStreamAlert.text}</span>
          </div>
          <span className="text-[11px] font-mono opacity-90">
            {formatIDR(liveStreamAlert.amount)} • Baru saja
          </span>
        </div>
      )}

      {/* Main Grid: Donut Chart on Left, Breakdown Summary on Right */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Donut Chart Visual */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
            {/* SVG Donut */}
            <svg
              viewBox={`0 0 ${chartDimension} ${chartDimension}`}
              className="w-full h-full transform -rotate-90 select-none overflow-visible"
            >
              <defs>
                <filter id="donut-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
                </filter>
                <filter id="hover-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#10b981" floodOpacity="0.3" />
                </filter>
              </defs>

              <g transform={`translate(${radius}, ${radius})`}>
                {pieData.map((d) => {
                  const isHovered = hoveredSegmentId === d.data.id;
                  const arcPath = isHovered
                    ? arcGenerators.expandedArc(d) || ''
                    : arcGenerators.normalArc(d) || '';

                  return (
                    <path
                      key={d.data.id}
                      d={arcPath}
                      fill={d.data.color}
                      className="transition-all duration-300 cursor-pointer ease-out"
                      stroke={isHovered ? '#ffffff' : 'transparent'}
                      strokeWidth={isHovered ? 3 : 0}
                      filter={isHovered ? 'url(#hover-glow)' : 'url(#donut-shadow)'}
                      opacity={hoveredSegmentId && !isHovered ? 0.45 : 1}
                      onMouseEnter={() => setHoveredSegmentId(d.data.id)}
                      onMouseLeave={() => setHoveredSegmentId(null)}
                      onClick={() => {
                        setHoveredSegmentId(hoveredSegmentId === d.data.id ? null : d.data.id);
                      }}
                    >
                      <title>{`${d.data.name}: ${formatIDR(d.data.amount)} (${d.data.percentage}%)`}</title>
                    </path>
                  );
                })}
              </g>
            </svg>

            {/* Central Donut Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none transition-all duration-200">
              {activeSegment ? (
                <div className="space-y-1 animate-fadeIn">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                    style={{ backgroundColor: activeSegment.color }}
                  >
                    {activeSegment.shortName}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-mono tracking-tight leading-tight">
                    {formatIDR(activeSegment.amount)}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {activeSegment.percentage}%
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">
                      dari total donasi rutin
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {activeSegment.donorCount} Donatur Rutin
                  </div>
                </div>
              ) : (
                <div className="space-y-1 animate-fadeIn">
                  <div className="text-[10px] sm:text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                    TOTAL KOMITMEN RUTIN
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-mono tracking-tight leading-tight">
                    {formatIDR(grandTotal)}
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>Akumulasi Bulanan</span>
                  </div>
                  <div className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                    {totalDonors} Komitmen Donatur
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick instructions / hover tip */}
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2 text-center">
            Arahkan kursor atau sentuh segmen donat untuk melihat rincian real-time
          </p>
        </div>

        {/* Right: Detailed Category Cards & Real-Time Proportions */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Rincian Distribusi Pilar Rutin (3 Pilar Utama)
            </h4>
            <span className="text-xs font-medium text-stone-400 dark:text-stone-500 font-mono">
              Update: {lastStreamUpdate}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {segmentsData.map((seg) => {
              const isHovered = hoveredSegmentId === seg.id;
              const isSpotlight = hoveredSegmentId === null || isHovered;

              return (
                <div
                  key={seg.id}
                  onMouseEnter={() => setHoveredSegmentId(seg.id)}
                  onMouseLeave={() => setHoveredSegmentId(null)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? `${seg.borderColor} bg-white dark:bg-stone-900 shadow-md ring-2 ring-emerald-500/20 scale-[1.01]`
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60 hover:border-stone-300 dark:hover:border-stone-700'
                  } ${!isSpotlight ? 'opacity-50' : 'opacity-100'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Category Title & Badge */}
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: seg.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                            {seg.name}
                          </h5>
                          <span
                            className="text-[10px] font-extrabold px-2 py-0.2 rounded-full text-white"
                            style={{ backgroundColor: seg.color }}
                          >
                            {seg.percentage}%
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
                          {seg.asnafOrTarget}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Donors */}
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-sm sm:text-base font-black font-mono text-stone-900 dark:text-stone-100">
                        {formatIDR(seg.amount)}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                        {seg.donorCount} donatur rutin aktif
                      </div>
                    </div>
                  </div>

                  {/* Visual Proportion Bar */}
                  <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-3 text-xs">
                    <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(5, seg.percentage)}%`,
                          backgroundColor: seg.color,
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open donate modal with initial category
                        const matchingCampaign = campaigns.find((c) =>
                          c.category.toLowerCase().includes(seg.id)
                        ) || campaigns[0];
                        onOpenDonateModal?.(matchingCampaign);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>Salurkan {seg.shortName}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Live Ledger Stream & Asnaf Transparency Strip */}
      <div className="p-4 sm:p-5 bg-stone-100/70 dark:bg-stone-950/70 border-t border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>Audit Kepatuhan Distribusi Syariah 100%</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                DSN-MUI Validated
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Zakat dialokasikan khusus bagi 8 Asnaf mustahiq tanpa potongan operasional terlarang; infaq dan sedekah dicatat terbuka dalam buku kas transparan.
            </p>
          </div>
        </div>

        {/* Live Recent Transactions Ticker */}
        <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0">
            Aliran Terkini:
          </span>
          {simulatedStream.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[11px] flex items-center gap-1.5 whitespace-nowrap shadow-2xs font-mono"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    item.category === 'zakat'
                      ? '#10b981'
                      : item.category === 'infaq'
                      ? '#f59e0b'
                      : '#06b6d4',
                }}
              />
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {formatIDR(item.amount)}
              </span>
              <span className="text-stone-400 text-[10px] truncate max-w-[110px]">
                {item.category.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
