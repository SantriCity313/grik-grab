import React, { useState, useEffect, useRef } from 'react';
import {
  Fingerprint,
  ScanFace,
  KeyRound,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Coins,
  ArrowRight,
  RefreshCw,
  X,
  Smartphone,
  Check,
} from 'lucide-react';
import { BiometricType, Language, NavTab } from '../types';
import { translations } from '../translations';

interface BiometricLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  isUnlocked: boolean;
  onUnlockSuccess: () => void;
  onLockSession: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  defaultMethod?: BiometricType;
}

export const BiometricLockModal: React.FC<BiometricLockModalProps> = ({
  isOpen,
  onClose,
  language,
  isUnlocked,
  onUnlockSuccess,
  onLockSession,
  onNavigateTab,
  defaultMethod = 'fingerprint',
}) => {
  const t = translations[language];

  // Selected method: 'fingerprint' | 'face_id' | 'security_pin'
  const [activeMethod, setActiveMethod] = useState<BiometricType>(defaultMethod);

  // Scanning animation states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [authStatus, setAuthStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>(
    isUnlocked ? 'success' : 'idle'
  );
  const [statusMessage, setStatusMessage] = useState<string>('');

  // PIN state
  const [pinDigits, setPinDigits] = useState<string>('');
  const [pinError, setPinError] = useState(false);
  const correctPin = '2026';

  const scanTimerRef = useRef<any>(null);

  // Sync with prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveMethod(defaultMethod);
      setPinDigits('');
      setPinError(false);
      if (isUnlocked) {
        setAuthStatus('success');
        setStatusMessage(t.secureChatUnlocked || 'Otentikasi Aktif: Fitur Aman Terbuka');
      } else {
        setAuthStatus('idle');
        setStatusMessage('');
      }
    }
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, [isOpen, isUnlocked, defaultMethod]);

  if (!isOpen) return null;

  // Fingerprint scan simulation
  const handleStartFingerprintScan = () => {
    if (authStatus === 'success' || isScanning) return;

    setIsScanning(true);
    setAuthStatus('scanning');
    setStatusMessage('Memindai pola minutiae sidik jari...');
    setScanProgress(0);

    let progress = 0;
    scanTimerRef.current = setInterval(() => {
      progress += 10;
      setScanProgress(progress);

      if (progress === 40) {
        setStatusMessage('Membaca kriptografi Secure Enclave...');
      } else if (progress === 70) {
        setStatusMessage('Mencocokkan template biometrik lokal...');
      }

      if (progress >= 100) {
        clearInterval(scanTimerRef.current);
        setIsScanning(false);
        setAuthStatus('success');
        setStatusMessage('Sidik Jari Cocok! Akses Diberikan.');
        onUnlockSuccess();
      }
    }, 120);
  };

  const handleCancelScan = () => {
    if (isScanning && scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      setIsScanning(false);
      setScanProgress(0);
      setAuthStatus('idle');
      setStatusMessage('Pindai dibatalkan.');
    }
  };

  // Face ID scan simulation
  const handleStartFaceIdScan = () => {
    if (authStatus === 'success' || isScanning) return;

    setIsScanning(true);
    setAuthStatus('scanning');
    setStatusMessage('Mendeteksi sensor kamera biometrik...');
    setScanProgress(0);

    let progress = 0;
    scanTimerRef.current = setInterval(() => {
      progress += 12;
      setScanProgress(progress);

      if (progress === 36) {
        setStatusMessage('Memetakan 30.000 titik inframerah wajah...');
      } else if (progress === 72) {
        setStatusMessage('Verifikasi model kontur wajah 3D...');
      }

      if (progress >= 100) {
        clearInterval(scanTimerRef.current);
        setIsScanning(false);
        setAuthStatus('success');
        setStatusMessage('Wajah Terverifikasi! Akses Diberikan.');
        onUnlockSuccess();
      }
    }, 130);
  };

  // PIN keypad handlers
  const handlePressPinKey = (num: string) => {
    if (pinDigits.length >= 4) return;
    const nextPin = pinDigits + num;
    setPinDigits(nextPin);
    setPinError(false);

    if (nextPin.length === 4) {
      if (nextPin === correctPin) {
        setAuthStatus('success');
        setStatusMessage('PIN Benar! Akses Diberikan.');
        onUnlockSuccess();
      } else {
        setPinError(true);
        setAuthStatus('error');
        setStatusMessage('PIN salah. Silakan coba lagi (Hint: 2026).');
        setTimeout(() => {
          setPinDigits('');
          setPinError(false);
          setAuthStatus('idle');
        }, 1200);
      }
    }
  };

  const handleDeletePinKey = () => {
    setPinDigits((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const handleClearPin = () => {
    setPinDigits('');
    setPinError(false);
  };

  const handleLockAgain = () => {
    onLockSession();
    setAuthStatus('idle');
    setScanProgress(0);
    setPinDigits('');
    setStatusMessage('Sesi berhasil dikunci kembali.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-[36px] shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow ambient background ring */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            authStatus === 'success'
              ? 'bg-emerald-500/25'
              : authStatus === 'error'
              ? 'bg-rose-500/25'
              : 'bg-emerald-600/15'
          }`}
        />

        {/* Modal Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-stone-800/80 shrink-0 relative z-10">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-2 rounded-xl transition-colors ${
                authStatus === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-stone-800 text-stone-300'
              }`}
            >
              {authStatus === 'success' ? (
                <Unlock className="w-5 h-5 text-emerald-400" />
              ) : (
                <Lock className="w-5 h-5 text-amber-400" />
              )}
            </span>
            <div>
              <h3 className="text-base font-bold font-serif leading-tight">
                {t.biometricLockTitle || 'Kunci Layar Biometrik & Privasi'}
              </h3>
              <p className="text-[11px] text-stone-400">
                GRIK Shield • Lapisan Privasi Tambahan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto relative z-10 flex-1">
          {/* Method Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-stone-950/70 border border-stone-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveMethod('fingerprint');
                setAuthStatus(isUnlocked ? 'success' : 'idle');
              }}
              className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMethod === 'fingerprint'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>Sidik Jari</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMethod('face_id');
                setAuthStatus(isUnlocked ? 'success' : 'idle');
              }}
              className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMethod === 'face_id'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ScanFace className="w-4 h-4" />
              <span>Face ID</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMethod('security_pin');
                setAuthStatus(isUnlocked ? 'success' : 'idle');
              }}
              className={`py-2 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMethod === 'security_pin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>PIN Master</span>
            </button>
          </div>

          {/* MAIN BIOMETRIC SENSOR STAGE */}
          <div className="py-4 px-3 rounded-3xl bg-stone-950/80 border border-stone-800/90 text-center space-y-3 relative overflow-hidden">
            {/* Status Headline */}
            <div className="space-y-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                  authStatus === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : authStatus === 'error'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-stone-800 text-amber-300 border border-stone-700'
                }`}
              >
                {authStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Brankas Terbuka (Akses Diberikan)</span>
                  </>
                ) : authStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Otentikasi Gagal</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Terkunci Demi Privasi</span>
                  </>
                )}
              </span>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                {activeMethod === 'fingerprint' &&
                  (t.touchFingerprint || 'Sentuh dan tahan sensor sidik jari di bawah untuk memverifikasi')}
                {activeMethod === 'face_id' &&
                  (t.faceScanPrompt || 'Posisikan wajah Anda menghadap layar untuk pemindaian 3D')}
                {activeMethod === 'security_pin' &&
                  (t.enterPinPrompt || 'Masukkan PIN keamanan 4-digit (PIN default: 2026)')}
              </p>
            </div>

            {/* SENSOR 1: FINGERPRINT SCANNER */}
            {activeMethod === 'fingerprint' && (
              <div className="py-2 flex flex-col items-center justify-center space-y-3">
                <div className="relative">
                  {/* Concentric pulse rings */}
                  {isScanning && (
                    <>
                      <div className="absolute inset-0 -m-3 rounded-full border-2 border-emerald-400/40 animate-ping" />
                      <div className="absolute inset-0 -m-6 rounded-full border border-emerald-400/20 animate-pulse" />
                    </>
                  )}

                  {/* Fingerprint Sensor Touch Target */}
                  <button
                    type="button"
                    onPointerDown={handleStartFingerprintScan}
                    onPointerUp={handleCancelScan}
                    onClick={handleStartFingerprintScan}
                    className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none shadow-xl relative overflow-hidden group ${
                      authStatus === 'success'
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 ring-4 ring-emerald-500/30'
                        : isScanning
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 scale-95'
                        : 'bg-stone-900 border-stone-700 text-stone-400 hover:border-emerald-500 hover:text-emerald-400'
                    }`}
                    title="Tekan & tahan untuk memindai sidik jari"
                  >
                    {/* Scanning beam line */}
                    {isScanning && (
                      <div
                        className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] transition-all duration-100"
                        style={{ top: `${scanProgress}%` }}
                      />
                    )}

                    {authStatus === 'success' ? (
                      <Check className="w-12 h-12 text-emerald-400 animate-in zoom-in" />
                    ) : (
                      <Fingerprint
                        className={`w-14 h-14 transition-transform ${
                          isScanning ? 'scale-110 text-emerald-400' : 'group-hover:scale-105'
                        }`}
                      />
                    )}
                  </button>
                </div>

                {/* Scan Progress Bar & Prompt */}
                <div className="w-full max-w-[200px] space-y-1">
                  <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-150"
                      style={{ width: `${authStatus === 'success' ? 100 : scanProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono block">
                    {authStatus === 'success'
                      ? '100% Terverifikasi'
                      : isScanning
                      ? `Memindai ${scanProgress}%`
                      : 'Tekan atau klik sensor'}
                  </span>
                </div>
              </div>
            )}

            {/* SENSOR 2: FACE ID SCANNER */}
            {activeMethod === 'face_id' && (
              <div className="py-2 flex flex-col items-center justify-center space-y-3">
                <div className="relative w-36 h-36 rounded-3xl bg-stone-900/90 border border-stone-800 flex items-center justify-center overflow-hidden">
                  {/* Viewfinder corner brackets */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                  {/* Laser Scan Beam */}
                  {isScanning && (
                    <div
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] transition-all duration-100"
                      style={{ top: `${scanProgress}%` }}
                    />
                  )}

                  {authStatus === 'success' ? (
                    <div className="flex flex-col items-center gap-1 animate-in zoom-in">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-300">Face ID Match</span>
                    </div>
                  ) : (
                    <ScanFace
                      className={`w-16 h-16 ${
                        isScanning ? 'text-emerald-400 animate-pulse' : 'text-stone-500'
                      }`}
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleStartFaceIdScan}
                  disabled={authStatus === 'success' || isScanning}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ScanFace className="w-3.5 h-3.5" />
                  <span>{isScanning ? 'Memindai Wajah...' : 'Mulai Pindai Wajah'}</span>
                </button>
              </div>
            )}

            {/* SENSOR 3: MASTER SECURITY PIN KEYPAD */}
            {activeMethod === 'security_pin' && (
              <div className="py-1 flex flex-col items-center justify-center space-y-3">
                {/* 4 Masked Digits Display */}
                <div
                  className={`flex items-center gap-3 py-2 px-4 rounded-2xl bg-stone-900 border transition-all ${
                    pinError
                      ? 'border-rose-500 animate-shake ring-2 ring-rose-500/30'
                      : authStatus === 'success'
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'border-stone-800'
                  }`}
                >
                  {[0, 1, 2, 3].map((idx) => {
                    const filled = pinDigits.length > idx;
                    return (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          filled
                            ? authStatus === 'success'
                              ? 'bg-emerald-400 scale-110 shadow-xs shadow-emerald-400'
                              : 'bg-white scale-110'
                            : 'bg-stone-700'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Keypad 1-9, C, 0, Del */}
                <div className="grid grid-cols-3 gap-2 w-full max-w-[220px]">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handlePressPinKey(num)}
                      className="h-10 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-emerald-700 text-stone-200 hover:text-white font-bold text-sm border border-stone-800 transition cursor-pointer flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearPin}
                    className="h-10 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-rose-400 font-bold text-xs border border-stone-800 transition cursor-pointer flex items-center justify-center"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePressPinKey('0')}
                    className="h-10 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-emerald-700 text-stone-200 hover:text-white font-bold text-sm border border-stone-800 transition cursor-pointer flex items-center justify-center"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePinKey}
                    className="h-10 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-400 font-bold text-xs border border-stone-800 transition cursor-pointer flex items-center justify-center"
                  >
                    ⌫
                  </button>
                </div>
              </div>
            )}

            {/* Real-time Status Message */}
            {statusMessage && (
              <p
                className={`text-xs font-medium animate-in fade-in ${
                  authStatus === 'success'
                    ? 'text-emerald-400 font-bold'
                    : authStatus === 'error'
                    ? 'text-rose-400'
                    : 'text-stone-300'
                }`}
              >
                {statusMessage}
              </p>
            )}
          </div>

          {/* SIMULATED UNLOCKED PRIVACY VAULT SHOWCASE */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Status Proteksi Fitur Sensitif:</span>
              </span>
              <span className="text-[10px] text-stone-400">
                {authStatus === 'success' ? '🔓 Akses Diberikan' : '🔒 Tertutup Sandi'}
              </span>
            </div>

            {/* Feature 1: Secure Communication E2EE */}
            <div
              className={`p-3 rounded-2xl border transition-all ${
                authStatus === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-stone-200'
                  : 'bg-stone-950/60 border-stone-800 text-stone-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl ${
                      authStatus === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-stone-800 text-stone-500'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                      <span>Komunikasi Terenkripsi (E2EE Chat)</span>
                      {authStatus === 'success' ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          Terdekripsi
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-400 font-bold">
                          Terkunci
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-stone-400 line-clamp-1">
                      {authStatus === 'success'
                        ? 'Kunci privat & riwayat pesan ustadz pembina terbuka aman.'
                        : '•••••••••••••••••••••••••••••••• (Sensor E2EE Aktif)'}
                    </p>
                  </div>
                </div>

                {authStatus === 'success' && onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateTab('pesan');
                    }}
                    className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Buka Chat</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Feature 2: Financial & ZISWAF Ledger */}
            <div
              className={`p-3 rounded-2xl border transition-all ${
                authStatus === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-stone-200'
                  : 'bg-stone-950/60 border-stone-800 text-stone-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl ${
                      authStatus === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-stone-800 text-stone-500'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                      <span>Layanan Finansial & Mutasi Kas ZISWAF</span>
                      {authStatus === 'success' ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          Otorisasi Aktif
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-400 font-bold">
                          Terkunci
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-stone-400 line-clamp-1">
                      {authStatus === 'success'
                        ? 'Saldo buku kas, otorisasi QRIS & kwitansi ZISWAF siap diakses.'
                        : 'Rp •••••••••••••• (Akses Finansial Memerlukan Biometrik)'}
                    </p>
                  </div>
                </div>

                {authStatus === 'success' && onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateTab('donasi');
                    }}
                    className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Buka Donasi</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-stone-950/90 border-t border-stone-800/80 flex items-center justify-between gap-3 shrink-0 relative z-10">
          {authStatus === 'success' ? (
            <>
              <button
                type="button"
                onClick={handleLockAgain}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Kunci Kembali Sesi</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Masuk & Lanjutkan</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeMethod === 'fingerprint') handleStartFingerprintScan();
                  else if (activeMethod === 'face_id') handleStartFaceIdScan();
                  else if (activeMethod === 'security_pin') handlePressPinKey('2');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>Otentikasi Cepat (Simulasi)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
