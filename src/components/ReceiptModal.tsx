import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Download,
  Printer,
  QrCode,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { DonationTransaction, Language } from '../types';
import { translations } from '../translations';
import { formatIDR } from '../utils';

interface ReceiptModalProps {
  language: Language;
  transaction: DonationTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  language,
  transaction,
  isOpen,
  onClose,
}) => {
  const t = translations[language];

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
              Tanda Terima Resmi ZISWAF GRIK
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Printable Receipt Paper Visual */}
        <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-dashed border-stone-300 dark:border-stone-700 space-y-4 text-xs">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">
              GERAKAN RAKYAT ISLAMICITY KAFFAH
            </span>
            <h4 className="text-base font-black text-stone-900 dark:text-stone-100 font-serif">
              BUKTI SETORAN ZISWAF DIGITAL
            </h4>
            <p className="text-[11px] font-mono text-stone-400">{transaction.id}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-700">
            <div className="flex justify-between">
              <span className="text-stone-500">Tanggal & Waktu:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{transaction.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Nama Muzakki/Donatur:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{transaction.donorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Program Penyaluran:</span>
              <span className="font-medium text-stone-800 dark:text-stone-200 text-right truncate max-w-[200px]">
                {transaction.campaignTitle}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Jenis Setoran:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{transaction.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Metode Pembayaran:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{transaction.paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-stone-200 dark:border-stone-700 text-sm">
              <span className="font-bold text-stone-900 dark:text-stone-100">Jumlah Donasi:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">{formatIDR(transaction.amount)}</span>
            </div>
          </div>

          {/* QR Verification and Hash */}
          <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
            <div className="w-14 h-14 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center border border-stone-200 shadow-2xs">
              <QRCodeSVG
                value={`https://grik.islamicity.org/verify/receipt/${transaction.id}?hash=${transaction.e2eeReceiptHash}`}
                size={48}
                level="M"
              />
            </div>
            <div className="space-y-1 text-[10px] overflow-hidden">
              <div className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Sah & Akuntabel</span>
              </div>
              <p className="font-mono text-stone-400 truncate">
                Hash: {transaction.e2eeReceiptHash}
              </p>
              <p className="text-stone-400">Scan untuk verifikasi integritas audit publik.</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Tanda Terima</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
