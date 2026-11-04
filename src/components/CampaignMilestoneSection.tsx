import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  TrendingUp,
  HeartHandshake,
  QrCode,
  ChevronDown,
  ChevronUp,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Coins,
  Check,
} from 'lucide-react';
import { DonationCampaign, CampaignMilestone, Language } from '../types';
import { translations } from '../translations';
import { formatIDR, formatCompactNumber } from '../utils';
import { DynamicCampaignProgressBar } from './DynamicCampaignProgressBar';

interface CampaignMilestoneSectionProps {
  campaign: DonationCampaign;
  language: Language;
  onOpenDonateModal: (campaign?: DonationCampaign, initialAmount?: number) => void;
  onOpenQRModal?: (campaign: DonationCampaign) => void;
  compact?: boolean;
}

export const CampaignMilestoneSection: React.FC<CampaignMilestoneSectionProps> = ({
  campaign,
  language,
  onOpenDonateModal,
  onOpenQRModal,
  compact = false,
}) => {
  const t = translations[language];
  const [showMilestoneDetails, setShowMilestoneDetails] = useState(false);

  // Financial goal calculations
  const targetAmount = campaign.targetAmount;
  const collectedAmount = campaign.collectedAmount;
  const remainingAmount = Math.max(0, targetAmount - collectedAmount);
  const percentNumber = (collectedAmount / targetAmount) * 100;
  const percent = Math.min(100, Math.round(percentNumber * 10) / 10);
  const remainingPercent = Math.max(0, Math.round((100 - percent) * 10) / 10);
  const isGoalReached = collectedAmount >= targetAmount;

  // Days left calculation
  const deadlineDate = new Date(campaign.deadline);
  const currentDate = new Date('2026-09-25'); // Anchored application time
  const timeDiff = deadlineDate.getTime() - currentDate.getTime();
  const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));

  // Fallback / standard milestones if not set on campaign
  const milestones: CampaignMilestone[] = campaign.milestones && campaign.milestones.length > 0
    ? campaign.milestones
    : [
        {
          id: `${campaign.id}-ms-1`,
          targetPercent: 25,
          targetAmount: Math.round(targetAmount * 0.25),
          title: 'Tahap 1: Inisiasi & Persiapan Lapangan',
          description: 'Pematangan konsep, pemenuhan berkas legalitas syariah, dan pembentukan tim pengawas amanah.',
          impactBadge: 'Fase Fondasi',
          achieved: collectedAmount >= targetAmount * 0.25,
          achievedDate: 'Juli 2026',
        },
        {
          id: `${campaign.id}-ms-2`,
          targetPercent: 50,
          targetAmount: Math.round(targetAmount * 0.50),
          title: 'Tahap 2: Pengadaan & Konstruksi Awal',
          description: 'Realisasi fisik tahap awal dan pengadaan instrumen kerja langsung ke penerima manfaat.',
          impactBadge: 'Fisik 50% Berjalan',
          achieved: collectedAmount >= targetAmount * 0.50,
          achievedDate: 'Agustus 2026',
        },
        {
          id: `${campaign.id}-ms-3`,
          targetPercent: 75,
          targetAmount: Math.round(targetAmount * 0.75),
          title: 'Tahap 3: Uji Operasional & Pelatihan',
          description: 'Pelatihan pendampingan penerima zakat/wakaf hingga siap menjalankan program mandiri.',
          impactBadge: 'Kesiapan 75%',
          achieved: collectedAmount >= targetAmount * 0.75,
          achievedDate: 'September 2026',
        },
        {
          id: `${campaign.id}-ms-4`,
          targetPercent: 100,
          targetAmount: targetAmount,
          title: 'Tahap 4: Kemandirian Kaffah 100%',
          description: 'Program berjalan penuh berkesinambungan dan menghasilkan dampak ekonomi berdaya bagi umat.',
          impactBadge: 'Realisasi Penuh',
          achieved: isGoalReached,
        },
      ];

  // Identify the current in-progress milestone (the first unachieved one)
  const currentMilestoneIndex = milestones.findIndex((m) => !m.achieved);
  const nextMilestone = currentMilestoneIndex !== -1 ? milestones[currentMilestoneIndex] : null;
  const amountToNextMilestone = nextMilestone ? Math.max(0, nextMilestone.targetAmount - collectedAmount) : 0;

  // Preset chips for instant donation
  const presetAmounts = [50000, 100000, 250000, 500000];

  return (
    <div className="space-y-3.5 pt-3 border-t border-stone-200/80 dark:border-stone-800">
      {/* 1 & 2. DYNAMIC CAMPAIGN PROGRESS BAR (Collected vs Goal & Visual Percentage Indicator) */}
      <DynamicCampaignProgressBar
        collectedAmount={collectedAmount}
        targetAmount={targetAmount}
        category={campaign.category}
        donorCount={campaign.donorCount}
        deadline={campaign.deadline}
        language={language}
        showMilestones={true}
      />

      {/* 3. MILESTONE TRACKER STEPPER */}
      <div className="rounded-2xl p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Pelacak Milestone Program
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowMilestoneDetails(!showMilestoneDetails)}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition"
          >
            <span>{showMilestoneDetails ? 'Tutup Rincian' : 'Rincian Tahapan'}</span>
            {showMilestoneDetails ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Milestone Steps Mini Stepper */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {milestones.map((m, idx) => {
            const isCompleted = m.achieved;
            const isCurrent = !m.achieved && (idx === 0 || milestones[idx - 1].achieved);

            return (
              <div
                key={m.id}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-100/70 dark:bg-emerald-900/30 border-emerald-300/80 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                    : isCurrent
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 shadow-xs ring-1 ring-amber-400/40'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700/40 text-stone-400 dark:text-stone-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 animate-spin" />
                  ) : (
                    <Target className="w-3 h-3 text-stone-400 shrink-0" />
                  )}
                  <span className="text-[10px] font-black">{m.targetPercent}%</span>
                </div>
                <div className="text-[10px] font-bold truncate leading-tight" title={m.title}>
                  {m.title.replace(/^Tahap \d+:? ?/i, '')}
                </div>
                <div className="text-[9px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
                  {formatCompactNumber(m.targetAmount)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Next milestone prompt */}
        {nextMilestone && (
          <div className="p-2 rounded-xl bg-amber-100/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
              <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Milestone Berikutnya ({nextMilestone.targetPercent}%):</strong> {nextMilestone.title}
              </span>
            </div>
            <span className="font-black text-amber-700 dark:text-amber-300 shrink-0">
              Butuh {formatIDR(amountToNextMilestone)} lagi
            </span>
          </div>
        )}

        {/* Detailed Milestone Roadmap Drawer */}
        {showMilestoneDetails && (
          <div className="space-y-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/50">
            <h4 className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
              Roadmap & Dampak Tiap Milestone:
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                    m.achieved
                      ? 'bg-white dark:bg-stone-900 border-emerald-200 dark:border-emerald-800'
                      : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          m.achieved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {m.title} ({m.targetPercent}%)
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.achieved
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {m.achieved ? `Tercapai ${m.achievedDate || ''}` : 'Target Terbuka'}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-400 pl-6.5">
                    {m.description}
                  </p>

                  {m.impactBadge && (
                    <div className="pl-6.5 pt-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                        <Sparkles className="w-2.5 h-2.5" />
                        {m.impactBadge}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. DIRECT 'DONATE' CALL-TO-ACTION INSIDE THE PROGRESS SECTION */}
      <div className="rounded-2xl p-3 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-200" />
            <span className="text-xs font-black tracking-wide">
              {nextMilestone
                ? `Bantu Capai Milestone ${nextMilestone.targetPercent}%`
                : 'Salurkan Donasi untuk Kampanye Ini'}
            </span>
          </div>

          <span className="text-[10px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full font-bold">
            Amanah 100%
          </span>
        </div>

        {/* Quick nominal preset chips directly in progress section */}
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-100/90 font-medium">
            Pilih Donasi Cepat:
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => onOpenDonateModal(campaign, amt)}
                className="py-1 px-1.5 rounded-lg bg-white/10 hover:bg-white/25 active:bg-white/30 border border-white/20 text-white text-[10px] font-bold transition text-center cursor-pointer hover:scale-105 active:scale-95"
                title={`Berdonasi ${formatIDR(amt)}`}
              >
                +{formatCompactNumber(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button Row inside progress section */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => onOpenDonateModal(campaign)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
            <span>Salurkan Donasi</span>
            <ArrowRight className="w-3 h-3 text-emerald-700" />
          </button>

          {onOpenQRModal && (
            <button
              type="button"
              onClick={() => onOpenQRModal(campaign)}
              className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
              title="Tampilkan Kode QRIS Cepat"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QRIS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
