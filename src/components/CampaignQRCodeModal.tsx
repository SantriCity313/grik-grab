import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  HeartHandshake,
  Smartphone,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Coins,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { DonationCampaign, Language } from '../types';
import { translations } from '../translations';
import { formatIDR } from '../utils';

interface CampaignQRCodeModalProps {
  language: Language;
  campaign: DonationCampaign | null;
  campaigns: DonationCampaign[];
  isOpen: boolean;
  onClose: () => void;
  onOpenDonateModal: (campaign?: DonationCampaign, initialAmount?: number) => void;
}

export const CampaignQRCodeModal: React.FC<CampaignQRCodeModalProps> = ({
  language,
  campaign,
  campaigns,
  isOpen,
  onClose,
  onOpenDonateModal,
}) => {
  const t = translations[language];

  // Active campaign in modal (defaults to prop campaign or first available)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaign?.id || (campaigns[0]?.id ?? '')
  );

  useEffect(() => {
    if (campaign?.id) {
      setSelectedCampaignId(campaign.id);
    }
  }, [campaign]);

  const activeCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaign || campaigns[0];

  // Nominal presets: 0 means open/custom
  const [selectedNominal, setSelectedNominal] = useState<number>(0);
  const [customNominal, setCustomNominal] = useState<string>('');
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const qrCanvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !activeCampaign) return null;

  const currentAmount = selectedNominal === -1 ? parseFloat(customNominal) || 0 : selectedNominal;

  // Generate standardized QRIS / GRIK Kaffah Payload
  const nmid = `ID1026${activeCampaign.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().padStart(8, '0')}`;
  const qrPayload = JSON.stringify({
    standard: 'QRIS-GRIK-KAFFAH',
    nmid,
    campaignId: activeCampaign.id,
    campaignTitle: activeCampaign.title,
    category: activeCampaign.category,
    amount: currentAmount > 0 ? currentAmount : 'OPEN_AMOUNT',
    currency: 'IDR',
    merchant: `GRIK - ${activeCampaign.title.slice(0, 25)}`,
    transparencyScore: `${activeCampaign.transparencyScore}%`,
    timestamp: new Date().toISOString(),
    verifyUrl: `https://grik.islamicity.org/donasi/${activeCampaign.id}`,
  });

  const shareableUrl = `https://grik.islamicity.org/donasi/${activeCampaign.id}${
    currentAmount > 0 ? `?nominal=${currentAmount}` : ''
  }`;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Donasi GRIK: ${activeCampaign.title}`,
          text: `Salurkan ZISWAF/Infaq via QRIS untuk program "${activeCampaign.title}". Transparan & terverifikasi kaffah.`,
          url: shareableUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    // Render custom canvas with QRIS frame, merchant info, and crisp resolution
    const canvas = document.createElement('canvas');
    const width = 600;
    const height = 800;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // QRIS Red Banner Header
    ctx.fillStyle = '#C81E1E';
    ctx.fillRect(0, 0, width, 110);

    // QRIS Logo Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QRIS', width / 2, 50);

    ctx.font = '14px sans-serif';
    ctx.fillText('STANDAR PEMBAYARAN NASIONAL • ZISWAF GRIK', width / 2, 75);
    ctx.font = '12px sans-serif';
    ctx.fillText(`NMID: ${nmid}`, width / 2, 95);

    // Merchant Name
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 20px serif';
    ctx.fillText(activeCampaign.title.slice(0, 36), width / 2, 145);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`[ ${activeCampaign.category.toUpperCase()} • AUDIT WTP ${activeCampaign.transparencyScore}% ]`, width / 2, 170);

    // Find the rendered QR code canvas from the DOM
    const qrCanvasElement = qrCanvasRef.current?.querySelector('canvas');
    if (qrCanvasElement) {
      // Draw QR Canvas in center
      const qrSize = 340;
      const qrX = (width - qrSize) / 2;
      const qrY = 195;

      // Draw subtle border around QR
      ctx.fillStyle = '#F5F5F4';
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      ctx.drawImage(qrCanvasElement, qrX, qrY, qrSize, qrSize);
    }

    // Nominal Info
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 16px sans-serif';
    const amountText = currentAmount > 0 ? `Nominal: ${formatIDR(currentAmount)}` : 'Nominal: Bebas / Input di Mobile App';
    ctx.fillText(amountText, width / 2, 580);

    // Footer Info
    ctx.fillStyle = '#78716C';
    ctx.font = '13px sans-serif';
    ctx.fillText('Dapat discan dengan GoPay, OVO, DANA, BSI Mobile, Livin, BCA, ShopeePay', width / 2, 615);
    ctx.fillText('Gerakan Rakyat Islamicity Kaffah (GRIK) • Terenkripsi & Akuntabel', width / 2, 640);

    // Bottom Decorative Bar
    ctx.fillStyle = '#059669';
    ctx.fillRect(30, 680, width - 60, 4);

    ctx.fillStyle = '#A8A29E';
    ctx.font = 'italic 12px sans-serif';
    ctx.fillText('Dicetak secara otomatis dari Platform Cerdas Berdaya GRIK', width / 2, 720);

    // Trigger download
    const link = document.createElement('a');
    link.download = `QRIS-GRIK-${activeCampaign.id}-${currentAmount > 0 ? currentAmount : 'open'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSimulateMobileScan = () => {
    setIsSimulatingScan(true);
    setScanSuccess(false);

    setTimeout(() => {
      setIsSimulatingScan(false);
      setScanSuccess(true);
      setTimeout(() => {
        setScanSuccess(false);
        onClose();
        onOpenDonateModal(activeCampaign, currentAmount > 0 ? currentAmount : undefined);
      }, 1200);
    }, 1400);
  };

  const presetAmounts = [
    { label: 'Bebas', value: 0 },
    { label: '25 Rb', value: 25000 },
    { label: '50 Rb', value: 50000 },
    { label: '100 Rb', value: 100000 },
    { label: '250 Rb', value: 250000 },
    { label: '500 Rb', value: 50000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400">
              <QrCode className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 font-serif">
                {t.qrDonasiTitle}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {t.qrDonasiSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-lg font-bold p-1 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Campaign Switcher Dropdown if multiple campaigns */}
        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
            <span>Pilih Program Kampanye Donasi:</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              Audit {activeCampaign.transparencyScore}% Terverifikasi
            </span>
          </label>
          <select
            value={activeCampaign.id}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-semibold cursor-pointer"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.category}] {c.title} — Target: {formatIDR(c.targetAmount)}
              </option>
            ))}
          </select>
        </div>

        {/* Nominal Selector for Dynamic QR Generation */}
        <div className="space-y-2 text-xs">
          <label className="font-semibold text-stone-700 dark:text-stone-300 block">
            {t.qrNominalChoice}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {presetAmounts.map((p) => {
              const isSelected = selectedNominal === p.value;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setSelectedNominal(p.value);
                    if (p.value !== -1) setCustomNominal('');
                  }}
                  className={`py-1.5 px-2 rounded-xl font-bold text-center border transition cursor-pointer text-[11px] ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-400'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setSelectedNominal(-1)}
              className={`py-1.5 px-2 rounded-xl font-bold text-center border transition cursor-pointer text-[11px] col-span-3 sm:col-span-6 ${
                selectedNominal === -1
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-400'
              }`}
            >
              Kustom Nominal Lainnya
            </button>
          </div>

          {selectedNominal === -1 && (
            <div className="pt-1">
              <input
                type="number"
                value={customNominal}
                onChange={(e) => setCustomNominal(e.target.value)}
                placeholder="Masukkan nominal kustom (contoh: 75000)"
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          )}
        </div>

        {/* QR Code Presentation Frame (QRIS Standard Visual Style) */}
        <div className="relative rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 p-4 sm:p-5 shadow-sm text-center space-y-3">
          {/* QRIS Header */}
          <div className="bg-red-600 text-white py-1.5 px-4 rounded-xl flex items-center justify-between shadow-xs">
            <span className="font-black text-sm tracking-wider">QRIS</span>
            <span className="text-[10px] font-semibold opacity-90">PEMBAYARAN ZISWAF NASIONAL</span>
            <span className="text-[10px] font-mono opacity-80">GRIK ID</span>
          </div>

          <div className="space-y-0.5">
            <h4 className="font-serif font-black text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-tight">
              {activeCampaign.title}
            </h4>
            <p className="text-[11px] text-stone-500 font-mono">
              NMID: {nmid} • {activeCampaign.category}
            </p>
          </div>

          {/* Render QR Code (SVG for crisp display, Hidden Canvas for PNG export) */}
          <div className="flex justify-center p-3 bg-stone-50 dark:bg-white rounded-2xl border border-stone-200 dark:border-stone-300 max-w-[260px] mx-auto relative group">
            <QRCodeSVG
              value={qrPayload}
              size={210}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23059669"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
                x: undefined,
                y: undefined,
                height: 28,
                width: 28,
                excavate: true,
              }}
            />

            {/* Hidden canvas for high-res PNG export */}
            <div ref={qrCanvasRef} className="hidden">
              <QRCodeCanvas
                value={qrPayload}
                size={340}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Scanner simulation overlay animation */}
            {isSimulatingScan && (
              <div className="absolute inset-0 bg-emerald-950/80 rounded-2xl flex flex-col items-center justify-center text-white space-y-2 animate-in fade-in">
                <Camera className="w-8 h-8 text-emerald-400 animate-bounce" />
                <span className="text-xs font-bold">Membaca QR Kamera Mobile...</span>
                <div className="w-32 h-1 bg-emerald-400 rounded-full animate-pulse" />
              </div>
            )}

            {scanSuccess && (
              <div className="absolute inset-0 bg-emerald-600 rounded-2xl flex flex-col items-center justify-center text-white space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-10 h-10 text-white" />
                <span className="text-xs font-black">QR Terverifikasi! Membuka Pembayaran...</span>
              </div>
            )}
          </div>

          {/* Nominal Display Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {currentAmount > 0
                ? `Nominal Ditargetkan: ${formatIDR(currentAmount)}`
                : t.openAmount}
            </span>
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Kompatibel dengan semua m-Banking (BSI, BCA, Mandiri, Muamalat) & e-Wallet (GoPay, OVO, Dana, LinkAja).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <button
            type="button"
            onClick={handleDownloadQR}
            className="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Download QRIS PNG siap cetak / bagikan"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{t.downloadQr}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyPayload}
            className="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            {copiedPayload ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-500" />
                <span>Salin Data QR</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4 text-teal-600" />
            <span>{copiedLink ? 'Link Tersalin!' : t.shareQr}</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateMobileScan}
            disabled={isSimulatingScan}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md col-span-2 sm:col-span-1"
          >
            <Smartphone className="w-4 h-4" />
            <span>Scan via HP</span>
          </button>
        </div>

        {/* Quick Direct Donation Launcher */}
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950 dark:text-emerald-200">
                Mau langsung berdonasi melalui form web?
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Pilih metode pembayaran QRIS atau Bank Syariah dengan bukti tanda terima digital.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDonateModal(activeCampaign, currentAmount > 0 ? currentAmount : undefined);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
          >
            Buka Form Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
};
