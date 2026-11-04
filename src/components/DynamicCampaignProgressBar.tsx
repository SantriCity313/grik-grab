import React, { useState } from 'react';
import {
  Coins,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  Flame,
  HeartHandshake,
  Percent,
} from 'lucide-react';
import { Language } from '../types';
import { formatIDR, formatCompactNumber } from '../utils';

export interface DynamicCampaignProgressBarProps {
  collectedAmount: number;
  targetAmount: number;
  campaignTitle?: string;
  category?: string;
  donorCount?: number;
  deadline?: string;
  language?: Language;
  variant?: 'card' | 'detailed' | 'compact' | 'minimal';
  showMilestones?: boolean;
  showQuickDonate?: boolean;
  onDonateClick?: (amount?: number) => void;
  className?: string;
}

export const DynamicCampaignProgressBar: React.FC<DynamicCampaignProgressBarProps> = ({
  collectedAmount: initialCollected,
  targetAmount,
  campaignTitle,
  category,
  donorCount,
  deadline,
  language = 'id',
  variant = 'card',
  showMilestones = true,
  showQuickDonate = false,
  onDonateClick,
  className = '',
}) => {
  // Interactive simulation state to allow dynamic testing of progress bar
  const [simulatedAddedAmount, setSimulatedAddedAmount] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const collectedAmount = initialCollected + simulatedAddedAmount;
  const remainingAmount = Math.max(0, targetAmount - collectedAmount);

  // Exact percentage calculation with 1 decimal place
  const rawPercentage = targetAmount > 0 ? (collectedAmount / targetAmount) * 100 : 0;
  const percentage = Math.min(100, Math.round(rawPercentage * 10) / 10);
  const remainingPercentage = Math.max(0, Math.round((100 - percentage) * 10) / 10);
  const isGoalReached = collectedAmount >= targetAmount;

  // Deadline calculation
  const getDaysRemaining = (deadlineStr?: string) => {
    if (!deadlineStr) return 0;
    const targetDate = new Date(deadlineStr);
    const today = new Date('2026-09-25'); // Anchored app timeline
    const diff = targetDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };
  const daysLeft = getDaysRemaining(deadline);

  // Dynamic color palette based on progress percentage
  const getGradientClass = (pct: number) => {
    if (pct >= 100) {
      return 'from-emerald-500 via-teal-400 to-amber-400';
    }
    if (pct >= 75) {
      return 'from-emerald-600 via-emerald-500 to-teal-400';
    }
    if (pct >= 50) {
      return 'from-emerald-600 via-teal-500 to-emerald-400';
    }
    if (pct >= 25) {
      return 'from-teal-600 via-emerald-600 to-teal-500';
    }
    return 'from-stone-500 via-teal-700 to-emerald-600';
  };

  // Milestone marks
  const milestoneMarks = [25, 50, 75, 100];

  // Quick preset donation chips
  const quickChips = [50000, 100000, 250000, 500000];

  // MINIMAL VARIANT
  if (variant === 'minimal') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatIDR(collectedAmount)}
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-[10px]">
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getGradientClass(percentage)} rounded-full transition-all duration-700`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-stone-500">
          <span>Target: {formatIDR(targetAmount)}</span>
          <span>{isGoalReached ? 'Tercapai!' : `Sisa ${formatIDR(remainingAmount)}`}</span>
        </div>
      </div>
    );
  }

  // COMPACT VARIANT (Great for rows and summaries)
  if (variant === 'compact') {
    return (
      <div className={`p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          {campaignTitle && (
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate flex-1">
              {campaignTitle}
            </h4>
          )}
          {/* Visual Percentage Indicator Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 text-xs font-black shadow-xs shrink-0">
            <Percent className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
            <span>{percentage}%</span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative w-full bg-stone-200 dark:bg-stone-700 h-2.5 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full bg-gradient-to-r ${getGradientClass(percentage)} rounded-full transition-all duration-500 relative`}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatIDR(collectedAmount)}
          </span>
          <span className="text-stone-500 dark:text-stone-400">
            Target: <strong className="text-stone-700 dark:text-stone-200">{formatIDR(targetAmount)}</strong>
          </span>
        </div>
      </div>
    );
  }

  // DEFAULT & DETAILED VARIANT (Standard for Campaign Card & Featured Matrix)
  return (
    <div
      className={`rounded-2xl p-3.5 bg-stone-50/80 dark:bg-stone-850 border border-stone-200/90 dark:border-stone-750 shadow-xs space-y-3 transition-all ${className}`}
    >
      {/* 1. HEADER: Title/Category & Visual Percentage Indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          {category && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-white dark:bg-emerald-900 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
              {category}
            </span>
          )}
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Progres Penggalangan</span>
          </span>
        </div>

        {/* PROMINENT VISUAL PERCENTAGE INDICATOR PILL */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-black text-xs shadow-xs border transition-all ${
              isGoalReached
                ? 'bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-500/20'
                : percentage >= 75
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700'
            }`}
          >
            {/* Circular mini gauge icon */}
            <div className="relative w-3.5 h-3.5 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-stone-300 dark:stroke-stone-600"
                  strokeWidth="4"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className={isGoalReached ? 'stroke-white' : 'stroke-emerald-600 dark:stroke-emerald-400'}
                  strokeWidth="4"
                  strokeDasharray="100"
                  strokeDashoffset={Math.max(0, 100 - percentage)}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-mono tracking-tight">{percentage}%</span>
          </div>
        </div>
      </div>

      {/* 2. FINANCIAL METRICS COMPARISON (Collected vs Goal Amount) */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs">
        {/* Collected */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            <Coins className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Terkumpul</span>
          </div>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 truncate">
            {formatIDR(collectedAmount)}
          </div>
        </div>

        {/* Goal Amount */}
        <div className="space-y-0.5 text-right">
          <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            <Target className="w-3 h-3 text-stone-500 dark:text-stone-400" />
            <span>Target Finansial</span>
          </div>
          <div className="text-sm font-black text-stone-900 dark:text-stone-100 truncate">
            {formatIDR(targetAmount)}
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC PROGRESS BAR TRACK WITH TICK MARKERS */}
      <div className="space-y-2">
        <div className="relative pt-1 pb-3">
          {/* Main Bar Track */}
          <div className="relative w-full bg-stone-200 dark:bg-stone-700/80 h-3 rounded-full overflow-hidden shadow-inner">
            {/* Animated filled bar */}
            <div
              className={`h-full bg-gradient-to-r ${getGradientClass(
                percentage
              )} rounded-full transition-all duration-700 relative shadow-sm`}
              style={{ width: `${percentage}%` }}
            >
              {/* Shimmer light reflection effect */}
              <div className="absolute inset-0 bg-white/25 animate-pulse rounded-full" />
              {/* Active edge glow point */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 rounded-full shadow-[0_0_8px_#ffffff]" />
            </div>
          </div>

          {/* Milestone Tick Markers at 25%, 50%, 75%, 100% */}
          {showMilestones && (
            <div className="absolute top-1 left-0 right-0 h-3 pointer-events-none flex justify-between">
              {milestoneMarks.map((mark) => {
                const isPassed = percentage >= mark;
                return (
                  <div
                    key={mark}
                    className="relative flex flex-col items-center"
                    style={{ left: `${mark}%`, transform: 'translateX(-50%)', position: 'absolute' }}
                  >
                    {/* Tick Node */}
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center -mt-0.25 shadow-xs ${
                        isPassed
                          ? 'bg-emerald-500 border-white dark:border-stone-900 text-white'
                          : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-400'
                      }`}
                    >
                      {isPassed ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-stone-400" />
                      )}
                    </div>
                    {/* Tick Label */}
                    <span
                      className={`text-[9px] mt-0.5 font-bold tracking-tight transition-colors ${
                        isPassed
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-stone-400 dark:text-stone-500'
                      }`}
                    >
                      {mark}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. DEFICIT & STATUS CALLOUT */}
        <div className="flex items-center justify-between pt-1 text-[11px]">
          <div className="flex items-center gap-1 font-semibold">
            {isGoalReached ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Target 100% Terpenuhi!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/60 px-2 py-0.5 rounded-md font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Sisa {formatIDR(remainingAmount)} lagi</span>
                <span className="text-[10px] font-normal text-stone-500 dark:text-stone-400">
                  ({remainingPercentage}% tersisa)
                </span>
              </span>
            )}
          </div>

          {/* Additional auxiliary indicators: Donor count & days left */}
          <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400">
            {donorCount !== undefined && (
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-3 h-3 text-stone-400" />
                <span>{donorCount} Donatur</span>
              </span>
            )}
            {deadline && (
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>{daysLeft} hr</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. OPTIONAL: QUICK DONATE CHIPS OR SIMULATOR */}
      {showQuickDonate && onDonateClick && (
        <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Donasi Cepat Tambah Progres:</span>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {quickChips.map((chipAmt) => (
              <button
                key={chipAmt}
                type="button"
                onClick={() => onDonateClick(chipAmt)}
                className="py-1 px-1.5 rounded-lg bg-white dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-[10px] font-bold transition text-center cursor-pointer hover:border-emerald-400"
              >
                +{formatCompactNumber(chipAmt)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onDonateClick()}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Salurkan Donasi Langsung</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 6. DETAILED VARIANT EXTRA: DYNAMIC SIMULATOR SLIDER */}
      {variant === 'detailed' && (
        <div className="pt-2.5 border-t border-stone-200 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setIsSimulating(!isSimulating);
                if (isSimulating) setSimulatedAddedAmount(0);
              }}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isSimulating ? 'Tutup Simulator Dinamis' : 'Coba Simulasi Progres Donasi'}</span>
            </button>
            {isSimulating && simulatedAddedAmount > 0 && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                +Simulasi: {formatIDR(simulatedAddedAmount)}
              </span>
            )}
          </div>

          {isSimulating && (
            <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300">
                <span>Geser slider untuk melihat perubahan persentase:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  {formatIDR(simulatedAddedAmount)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(50000000, remainingAmount)}
                step={500000}
                value={simulatedAddedAmount}
                onChange={(e) => setSimulatedAddedAmount(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-stone-400">
                <span>Rp 0</span>
                <span>+{formatCompactNumber(Math.max(50000000, remainingAmount))}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
