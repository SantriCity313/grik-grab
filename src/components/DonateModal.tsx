import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  HeartHandshake,
  QrCode,
  Building2,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Maximize2,
  Repeat,
  Calendar,
  Bell,
  CalendarCheck,
} from 'lucide-react';
import {
  DonationCampaign,
  DonationTransaction,
  SadaqahSubscription,
  Language,
} from '../types';
import { translations } from '../translations';
import { formatIDR } from '../utils';

interface DonateModalProps {
  language: Language;
  campaign?: DonationCampaign | null;
  initialAmount?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (trx: DonationTransaction, subscription?: SadaqahSubscription) => void;
  onShowFullQR?: (campaign: DonationCampaign) => void;
  defaultScheduleMonthly?: boolean;
}

export const DonateModal: React.FC<DonateModalProps> = ({
  language,
  campaign,
  initialAmount,
  isOpen,
  onClose,
  onSuccess,
  onShowFullQR,
  defaultScheduleMonthly = false,
}) => {
  const t = translations[language];
  const [donorName, setDonorName] = useState('H. Muhammad Fadhil');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [amount, setAmount] = useState('250000');
  const [donationType, setDonationType] = useState<DonationTransaction['type']>('Infaq Dakwah');
  const [paymentMethod, setPaymentMethod] = useState<DonationTransaction['paymentMethod']>('QRIS');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sadaqah Sub recurring monthly schedule state
  const [isScheduleMonthly, setIsScheduleMonthly] = useState(defaultScheduleMonthly);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [autoDebitReminder, setAutoDebitReminder] = useState<boolean>(true);
  const [subNotes, setSubNotes] = useState<string>('');

  useEffect(() => {
    if (initialAmount && initialAmount > 0) {
      setAmount(initialAmount.toString());
    }
  }, [initialAmount]);

  useEffect(() => {
    if (isOpen) {
      setIsScheduleMonthly(defaultScheduleMonthly);
    }
  }, [isOpen, defaultScheduleMonthly]);

  if (!isOpen) return null;

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = parseFloat(amount) || 50000;
    setIsProcessing(true);

    setTimeout(() => {
      const subId = isScheduleMonthly
        ? `sub-grik-${Date.now().toString().slice(-6)}`
        : undefined;

      const trxId = `TRX-GRIK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      const newTrx: DonationTransaction = {
        id: trxId,
        campaignId: campaign?.id || 'cmp-general',
        campaignTitle: campaign?.title || 'Dana Infaq & Dakwah Umum GRIK',
        donorName: isAnonymous ? 'Hamba Allah' : donorName || 'Hamba Allah',
        amount: finalAmount,
        type: donationType,
        timestamp: new Date().toLocaleString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        isAnonymous,
        paymentMethod,
        status: 'Berhasil',
        e2eeReceiptHash: '0x' + Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18),
        isRecurring: isScheduleMonthly,
        subscriptionId: subId,
      };

      let newSubscription: SadaqahSubscription | undefined = undefined;
      if (isScheduleMonthly) {
        newSubscription = {
          id: subId!,
          campaignId: campaign?.id || 'cmp-general',
          campaignTitle: campaign?.title || 'Dana Infaq & Dakwah Umum GRIK',
          campaignCategory: campaign?.category || 'Infaq',
          donorName: isAnonymous ? 'Hamba Allah' : donorName || 'Hamba Allah',
          isAnonymous,
          amount: finalAmount,
          frequency: 'monthly',
          dayOfMonth,
          type: donationType,
          paymentMethod,
          status: 'active',
          createdAt: new Date().toISOString().slice(0, 10),
          nextDebitDate: `2026-10-${dayOfMonth.toString().padStart(2, '0')}`,
          lastDebitDate: new Date().toISOString().slice(0, 10),
          totalDebitedCount: 1,
          totalDebitedAmount: finalAmount,
          autoDebitReminder,
          notes: subNotes || `Sadaqah Sub istiqomah bulanan tgl ${dayOfMonth}`,
        };
      }

      setIsProcessing(false);
      onSuccess(newTrx, newSubscription);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                Salurkan Donasi & ZISWAF
              </h3>
              <p className="text-[11px] text-stone-500">Transparansi Kaffah dengan Hash Bukti Digital</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {campaign && (
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-xs">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Program Tujuan:</span>
            <p className="font-bold text-stone-900 dark:text-stone-100">{campaign.title}</p>
          </div>
        )}

        <form onSubmit={handlePay} className="space-y-4 text-xs">
          {/* Donation Type */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Jenis Dana</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Zakat Mal', 'Infaq Dakwah', 'Modal Mikro'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDonationType(type)}
                  className={`py-2 px-2 rounded-xl font-semibold text-center border transition cursor-pointer ${
                    donationType === type
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Amounts */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Nominal Donasi (Rp)</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q.toString())}
                  className={`py-1.5 text-[11px] rounded-lg font-bold border transition cursor-pointer ${
                    amount === q.toString()
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {formatIDR(q)}
                </button>
              ))}
            </div>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nominal kustom (misal: 250000)"
              className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
            />
          </div>

          {/* Donor identity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-700 dark:text-stone-300">Nama Donatur</label>
              <label className="flex items-center gap-1.5 text-stone-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <span>Hamba Allah (Anonim)</span>
              </label>
            </div>
            {!isAnonymous && (
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
              />
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Metode Pembayaran Syariah</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                  paymentMethod === 'QRIS'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-stone-200 dark:border-stone-700'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <div className="text-left">
                  <span className="block text-xs">QRIS Nasional</span>
                  <span className="text-[10px] text-stone-400">Instan semua e-wallet</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('BSI')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                  paymentMethod === 'BSI'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-stone-200 dark:border-stone-700'
                }`}
              >
                <Building2 className="w-4 h-4 text-teal-600" />
                <div className="text-left">
                  <span className="block text-xs">Bank Syariah Indonesia</span>
                  <span className="text-[10px] text-stone-400">Virtual Account</span>
                </div>
              </button>
            </div>

            {/* QRIS Active Code Preview */}
            {paymentMethod === 'QRIS' && (
              <div className="mt-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-center space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-red-600 dark:text-red-400">QRIS Dinamis Otomatis</span>
                  {campaign && onShowFullQR && (
                    <button
                      type="button"
                      onClick={() => onShowFullQR(campaign)}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Perbesar / Simpan QR</span>
                    </button>
                  )}
                </div>

                <div className="flex justify-center p-2 bg-white rounded-xl border border-stone-200 shadow-2xs max-w-[170px] mx-auto">
                  <QRCodeSVG
                    value={JSON.stringify({
                      standard: 'QRIS',
                      campaignId: campaign?.id || 'cmp-general',
                      title: campaign?.title || 'Donasi GRIK',
                      nominal: parseFloat(amount) || 0,
                      donor: isAnonymous ? 'Hamba Allah' : donorName,
                      timestamp: Date.now(),
                    })}
                    size={140}
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <div className="text-[11px] text-stone-600 dark:text-stone-300 space-y-0.5">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    Nominal Terkunci: {formatIDR(parseFloat(amount) || 0)}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Scan via mobile banking (BSI, BCA, Livin) atau e-wallet (GoPay, OVO, Dana).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SADAQAH SUB - SCHEDULE MONTHLY RECURRING DONATION TOGGLE */}
          <div className="rounded-2xl border border-emerald-500/40 dark:border-emerald-700/60 bg-gradient-to-br from-emerald-50/70 via-stone-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:via-stone-900/40 dark:to-teal-950/20 p-3.5 space-y-3 shadow-2xs transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5 shadow-2xs">
                  <Repeat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </span>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                      Jadwalkan Rutin Bulanan ('Sadaqah Sub')
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-2xs">
                      Istiqomah
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                    Autodebet donasi secara otomatis setiap bulan untuk menjaga amalan jariyah berkesinambungan.
                  </p>
                </div>
              </div>

              {/* Styled Switch Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={isScheduleMonthly}
                onClick={() => setIsScheduleMonthly(!isScheduleMonthly)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isScheduleMonthly ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isScheduleMonthly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Expanded Sadaqah Sub Monthly Configuration */}
            {isScheduleMonthly && (
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 space-y-3 animate-in fade-in slide-in-from-top-2 text-xs">
                {/* 1. Pilih Tanggal Debet Rutin */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tanggal Debet Rutin Setiap Bulan:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      Tgl {dayOfMonth} Tiap Bulan
                    </span>
                  </label>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { day: 1, label: 'Tgl 1 (Awal)' },
                      { day: 5, label: 'Tgl 5 (Gajian)' },
                      { day: 10, label: 'Tgl 10' },
                      { day: 25, label: 'Tgl 25 (Pekan Gajian)' },
                    ].map((preset) => (
                      <button
                        key={preset.day}
                        type="button"
                        onClick={() => setDayOfMonth(preset.day)}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition text-center cursor-pointer ${
                          dayOfMonth === preset.day
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-500">
                    <span>Atau pilih tanggal custom (1-28):</span>
                    <input
                      type="number"
                      min={1}
                      max={28}
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(Math.max(1, Math.min(28, parseInt(e.target.value) || 1)))}
                      className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-center font-bold text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                {/* 2. Notification Reminder Option */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-emerald-100 dark:border-emerald-900/60">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 block text-[11px]">
                        Notifikasi Pengingat
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Kirim notifikasi pengingat H-1 sebelum autodebet bulanan dijalankan.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoDebitReminder}
                    onChange={(e) => setAutoDebitReminder(e.target.checked)}
                    className="rounded-sm text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4"
                  />
                </div>

                {/* 3. Niat / Catatan Sedekah Rutin */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                    Catatan / Doa Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    value={subNotes}
                    onChange={(e) => setSubNotes(e.target.value)}
                    placeholder="Contoh: Hajat keberkahan keluarga & kelancaran usaha"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[11px] text-stone-900 dark:text-stone-100"
                  />
                </div>

                {/* 4. Sadaqah Sub Istiqomah Summary Box */}
                <div className="p-2.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/60 border border-emerald-300/70 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Rangkuman Jadwal 'Sadaqah Sub':</span>
                  </div>
                  <p className="text-[10px] leading-relaxed opacity-90">
                    Setiap tanggal <strong>{dayOfMonth}</strong>, donasi sebesar{' '}
                    <strong>{formatIDR(parseFloat(amount) || 0)}</strong> akan dialirkan otomatis untuk{' '}
                    <strong>{campaign?.title || 'Program Pilihan'}</strong>. Anda dapat mengelola, menjeda, atau menghentikan jadwal sewaktu-waktu di tab Donasi Transparan.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Doa Ringkas */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-[11px] text-emerald-900 dark:text-emerald-200 text-center space-y-1">
            <p className="font-serif italic text-xs">"آجَرَكَ اللهُ فِيْمَا أَعْطَيْتَ، وَبَارَكَ فِيْمَا أَبْقَيْتَ"</p>
            <p className="text-[10px] opacity-80">Semoga Allah memberi pahala atas apa yang Anda infakkan dan memberkahi harta yang tersisa.</p>
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isScheduleMonthly ? (
                <>
                  <CalendarCheck className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? 'Menjadwalkan Sadaqah Sub...'
                      : `Jadwalkan Bulanan (${formatIDR(parseFloat(amount) || 0)}/bln)`}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? 'Memverifikasi Transaksi...'
                      : `Lunasi ${formatIDR(parseFloat(amount) || 0)}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
