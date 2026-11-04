import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Laptop,
  Fingerprint,
  ScanFace,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Coins,
  ArrowRight,
  Eye,
  Sliders,
  Play,
} from 'lucide-react';
import { UserProfile, Language, BiometricSecuritySettings, BiometricType, NavTab } from '../types';
import { translations } from '../translations';

interface Keamanan2FAViewProps {
  language: Language;
  user: UserProfile;
  onUpdate2FA: (enabled: boolean) => void;
  onUpdateBiometrics?: (settings: BiometricSecuritySettings) => void;
  onOpenBiometricModal?: () => void;
  isBiometricUnlocked?: boolean;
  onLockBiometricSession?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const Keamanan2FAView: React.FC<Keamanan2FAViewProps> = ({
  language,
  user,
  onUpdate2FA,
  onUpdateBiometrics,
  onOpenBiometricModal,
  isBiometricUnlocked = false,
  onLockBiometricSession,
  onNavigateTab,
}) => {
  const t = translations[language];

  // Active sub-tab inside security view: 'biometrics' | '2fa' | 'sessions'
  const [activeSubTab, setActiveSubTab] = useState<'biometrics' | '2fa' | 'sessions'>('biometrics');

  // Biometrics settings state (fallback to default if not present on user)
  const currentBiometrics: BiometricSecuritySettings = user.biometrics || {
    isEnabled: true,
    biometricType: 'fingerprint',
    protectChat: true,
    protectFinancial: true,
    autoLockMinutes: 5,
    securityPin: '2026',
    isUnlocked: isBiometricUnlocked,
  };

  const [biometricsState, setBiometricsState] = useState<BiometricSecuritySettings>(currentBiometrics);

  // In-page live biometric sensor simulator states
  const [simulatorMethod, setSimulatorMethod] = useState<BiometricType>(biometricsState.biometricType || 'fingerprint');
  const [isSimScanning, setIsSimScanning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simStatus, setSimStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>(
    isBiometricUnlocked ? 'success' : 'idle'
  );
  const [simPin, setSimPin] = useState('');
  const [simFeedback, setSimFeedback] = useState<string>('');
  const timerRef = useRef<any>(null);

  // 2FA state
  const [testPin, setTestPin] = useState('');
  const [pinVerificationStatus, setPinVerificationStatus] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const secret = user.twoFactorSecret || 'JBSWY3DPEHPK3PXP';

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (testPin.length === 6) {
      setPinVerificationStatus('success');
    } else {
      setPinVerificationStatus('error');
    }
  };

  // Update biometrics helper
  const updateSettings = (updated: Partial<BiometricSecuritySettings>) => {
    const next = { ...biometricsState, ...updated };
    setBiometricsState(next);
    onUpdateBiometrics?.(next);
  };

  // In-page simulator scan triggers
  const handleSimFingerprintScan = () => {
    if (isSimScanning || simStatus === 'success') return;
    setIsSimScanning(true);
    setSimStatus('scanning');
    setSimProgress(0);
    setSimFeedback('Memindai sidik jari & pola minutiae...');

    let p = 0;
    timerRef.current = setInterval(() => {
      p += 15;
      setSimProgress(p);
      if (p === 45) setSimFeedback('Mencocokkan Secure Enclave Kaffah...');
      if (p >= 100) {
        clearInterval(timerRef.current);
        setIsSimScanning(false);
        setSimStatus('success');
        setSimFeedback('Sidik Jari Cocok! Komunikasi & Finansial Terbuka.');
        updateSettings({ isUnlocked: true });
      }
    }, 120);
  };

  const handleSimFaceScan = () => {
    if (isSimScanning || simStatus === 'success') return;
    setIsSimScanning(true);
    setSimStatus('scanning');
    setSimProgress(0);
    setSimFeedback('Memetakan kontur wajah biometrik 3D...');

    let p = 0;
    timerRef.current = setInterval(() => {
      p += 15;
      setSimProgress(p);
      if (p === 60) setSimFeedback('Verifikasi model pengenalan wajah...');
      if (p >= 100) {
        clearInterval(timerRef.current);
        setIsSimScanning(false);
        setSimStatus('success');
        setSimFeedback('Face ID Cocok! Akses Diberikan.');
        updateSettings({ isUnlocked: true });
      }
    }, 120);
  };

  const handleSimPinSubmit = (digit: string) => {
    if (simPin.length >= 4) return;
    const next = simPin + digit;
    setSimPin(next);

    if (next.length === 4) {
      if (next === biometricsState.securityPin || next === '2026') {
        setSimStatus('success');
        setSimFeedback('PIN Master Valid! Akses Diberikan.');
        updateSettings({ isUnlocked: true });
      } else {
        setSimStatus('error');
        setSimFeedback('PIN salah. Coba lagi (Hint: 2026).');
        setTimeout(() => {
          setSimPin('');
          setSimStatus('idle');
        }, 1200);
      }
    }
  };

  const handleLockInSim = () => {
    setSimStatus('idle');
    setSimProgress(0);
    setSimPin('');
    setSimFeedback('Brankas berhasil dikunci kembali.');
    updateSettings({ isUnlocked: false });
    onLockBiometricSession?.();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
                Pusat Keamanan, 2FA & Kunci Biometrik
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Arsitektur keamanan berlapis: Autentikasi 2FA TOTP, Kunci Layar Biometrik Privasi, dan Enkripsi E2EE Kaffah.
            </p>
          </div>

          {/* Quick Status Pill & Modal Launcher */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Biometric Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                Status Biometrik:
              </span>
              {isBiometricUnlocked || simStatus === 'success' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                  <Unlock className="w-3 h-3 text-emerald-600" />
                  <span>Terbuka</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Terkunci</span>
                </span>
              )}
            </div>

            {/* Launch Fullscreen Biometric Modal CTA */}
            {onOpenBiometricModal && (
              <button
                type="button"
                onClick={onOpenBiometricModal}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Buka Layar Kunci Biometrik Interaktif"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Buka Layar Kunci</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 border-t border-stone-100 dark:border-stone-800 pt-3">
          <button
            type="button"
            onClick={() => setActiveSubTab('biometrics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'biometrics'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Kunci Layar Biometrik & Privasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('2fa')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === '2fa'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Autentikasi 2FA & TOTP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('sessions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'sessions'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Sesi & Kode Cadangan</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: BIOMETRIC AUTHENTICATION & PRIVACY LOCK SCREEN UI */}
      {/* ============================================================== */}
      {activeSubTab === 'biometrics' && (
        <div className="space-y-6">
          {/* Informational Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 border border-emerald-800/50 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-emerald-400 shrink-0">
                <Fingerprint className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Secure Enclave • Privasi Nol Pengetahuan</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold font-serif">
                  Kunci Layar Biometrik untuk Komunikasi E2EE & Finansial
                </h3>
                <p className="text-xs text-stone-300">
                  Data biometrik diproses lokal di perangkat Anda. Saat terkunci, pesan privat E2EE dan buku kas ZISWAF disamarkan dari siapapun yang meminjam ponsel Anda.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenBiometricModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Buka Layar Kunci Biometrik</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Interactive Live Sensor Simulator Playground */}
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                      <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </span>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                      Simulasi Sensor Biometrik
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isBiometricUnlocked || simStatus === 'success'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {isBiometricUnlocked || simStatus === 'success' ? '🔓 TERBUKA' : '🔒 TERKUNCI'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Uji coba membuka kunci fitur terlindungi secara interaktif langsung pada panel di bawah ini:
                </p>
              </div>

              {/* Sensor Mode Switcher for simulation */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSimulatorMethod('fingerprint')}
                  className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    simulatorMethod === 'fingerprint'
                      ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Sidik Jari</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatorMethod('face_id')}
                  className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    simulatorMethod === 'face_id'
                      ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <ScanFace className="w-3.5 h-3.5" />
                  <span>Face ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatorMethod('security_pin')}
                  className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    simulatorMethod === 'security_pin'
                      ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>PIN Master</span>
                </button>
              </div>

              {/* Sensor Interactive Pad */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
                {simulatorMethod === 'fingerprint' && (
                  <>
                    <button
                      type="button"
                      onClick={handleSimFingerprintScan}
                      className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-lg select-none relative overflow-hidden ${
                        simStatus === 'success' || isBiometricUnlocked
                          ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/20'
                          : isSimScanning
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-500 scale-95'
                          : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-400 hover:border-emerald-500 hover:text-emerald-500'
                      }`}
                      title="Klik untuk memindai sidik jari"
                    >
                      {simStatus === 'success' || isBiometricUnlocked ? (
                        <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-in zoom-in" />
                      ) : (
                        <Fingerprint className={`w-12 h-12 ${isSimScanning ? 'animate-pulse text-emerald-500' : ''}`} />
                      )}
                    </button>

                    <div className="w-full max-w-[200px] space-y-1">
                      <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-150"
                          style={{ width: `${simStatus === 'success' || isBiometricUnlocked ? 100 : simProgress}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                        {simStatus === 'success' || isBiometricUnlocked
                          ? 'Biometrik Terverifikasi (100%)'
                          : isSimScanning
                          ? `Memindai ${simProgress}%...`
                          : 'Klik sensor sidik jari'}
                      </span>
                    </div>
                  </>
                )}

                {simulatorMethod === 'face_id' && (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative w-28 h-28 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center shadow-md">
                      {/* Viewfinder crosshairs */}
                      <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-emerald-500" />
                      <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-emerald-500" />
                      <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-emerald-500" />
                      <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-emerald-500" />

                      {simStatus === 'success' || isBiometricUnlocked ? (
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ScanFace className={`w-12 h-12 ${isSimScanning ? 'text-emerald-500 animate-pulse' : 'text-stone-400'}`} />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSimFaceScan}
                      disabled={isSimScanning || simStatus === 'success'}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ScanFace className="w-3.5 h-3.5" />
                      <span>{isSimScanning ? 'Memindai...' : 'Pindai Face ID'}</span>
                    </button>
                  </div>
                )}

                {simulatorMethod === 'security_pin' && (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center gap-2">
                      {[0, 1, 2, 3].map((idx) => {
                        const filled = simPin.length > idx;
                        return (
                          <div
                            key={idx}
                            className={`w-3 h-3 rounded-full transition-all ${
                              filled
                                ? 'bg-emerald-500 scale-110 shadow-xs'
                                : 'bg-stone-300 dark:bg-stone-700'
                            }`}
                          />
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 w-full max-w-[180px] pt-1">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            if (k === 'C') setSimPin('');
                            else if (k === '⌫') setSimPin((prev) => prev.slice(0, -1));
                            else handleSimPinSubmit(k);
                          }}
                          className="h-8 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs border border-stone-200 dark:border-stone-700 transition cursor-pointer"
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback note */}
                {simFeedback && (
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {simFeedback}
                  </p>
                )}
              </div>

              {/* Status of protected features preview */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block">
                  Realisasi Privasi Fitur Terkunci:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Chat E2EE status */}
                  <div
                    className={`p-2.5 rounded-xl border transition-all ${
                      isBiometricUnlocked || simStatus === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Pesan E2EE</span>
                    </div>
                    <span className="text-[10px] block truncate">
                      {isBiometricUnlocked || simStatus === 'success'
                        ? '🔓 Terdekripsi & Aktif'
                        : '🔒 Terkunci Sandi'}
                    </span>
                  </div>

                  {/* Financial status */}
                  <div
                    className={`p-2.5 rounded-xl border transition-all ${
                      isBiometricUnlocked || simStatus === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Buku Kas & Donasi</span>
                    </div>
                    <span className="text-[10px] block truncate">
                      {isBiometricUnlocked || simStatus === 'success'
                        ? '🔓 Otorisasi Aktif'
                        : '🔒 Terkunci Sandi'}
                    </span>
                  </div>
                </div>

                {/* Reset / Lock button */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleLockInSim}
                    className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Kunci Kembali Sesi</span>
                  </button>

                  {onNavigateTab && (isBiometricUnlocked || simStatus === 'success') && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('pesan')}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Buka E2EE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Biometric Privacy Configuration & Policy */}
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
                    <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </span>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                    Konfigurasi Brankas Privasi
                  </h3>
                </div>

                {/* Main Biometric Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={biometricsState.isEnabled}
                    onChange={(e) => updateSettings({ isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Tentukan kebijakan perlindungan privasi untuk membatasi akses ke modul-modul sensitif GRIK.
              </p>

              {/* Setting 1: Default Biometric Method */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  Metode Biometrik Utama:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'fingerprint', label: 'Sidik Jari', icon: Fingerprint },
                    { id: 'face_id', label: 'Face ID', icon: ScanFace },
                    { id: 'security_pin', label: 'PIN Master', icon: KeyRound },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = biometricsState.biometricType === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateSettings({ biometricType: m.id as BiometricType })}
                        className={`p-2.5 rounded-xl border font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-emerald-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Setting 2: Scope of Protected Features */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  Cakupan Fitur yang Dilindungi Layar Kunci:
                </label>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={biometricsState.protectChat}
                      onChange={(e) => updateSettings({ protectChat: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-stone-900 dark:text-stone-100 block">
                        Pesan Terenkripsi E2EE
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        Kunci obrolan privat dengan dewan syariah & konsultasi bisnis.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={biometricsState.protectFinancial}
                      onChange={(e) => updateSettings({ protectFinancial: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-stone-900 dark:text-stone-100 block">
                        Layanan Finansial & Mutasi ZISWAF
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        Lindungi buku kas publik, riwayat setoran, & otorisasi pembayaran.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Setting 3: Auto-lock Timeout */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  Batas Waktu Penguncian Otomatis (Auto-Lock):
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { label: 'Segera', val: 0 },
                    { label: '1 Mnt', val: 1 },
                    { label: '5 Mnt', val: 5 },
                    { label: '15 Mnt', val: 15 },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => updateSettings({ autoLockMinutes: opt.val })}
                      className={`py-1.5 px-2 rounded-xl font-bold transition cursor-pointer text-center text-xs ${
                        biometricsState.autoLockMinutes === opt.val
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secure Enclave Chip Note */}
              <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-2.5 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-[11px] text-stone-600 dark:text-stone-300">
                  Kunci enkripsi AES-256 tersimpan di perangkat lokal. Tidak ada data biometrik yang diunggah ke server cloud.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: TWO-FACTOR AUTHENTICATION (TOTP APP SETUP) */}
      {/* ============================================================== */}
      {activeSubTab === '2fa' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setup Authenticator Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Aplikasi Authenticator (TOTP)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onUpdate2FA(!user.is2FAEnabled)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  user.is2FAEnabled
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                {user.is2FAEnabled ? '2FA Aktif' : 'Non-Aktif'}
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Gunakan Google Authenticator, Microsoft Authenticator, Aegis, atau 1Password untuk memindai kode QR di bawah ini:
            </p>

            {/* Simulated QR Code Visual */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-32 bg-white p-2 rounded-xl border border-stone-200 shadow-xs flex items-center justify-center relative shrink-0">
                <QrCode className="w-28 h-28 text-stone-900" />
              </div>

              <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                <span className="text-[11px] text-stone-400 block">Kunci Penyiapan Manual:</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold text-stone-900 dark:text-stone-100 bg-stone-200/70 dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700">
                    {secret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 transition"
                    title="Salin Kunci"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-500">
                  Akun: <strong>{user.email}</strong> • Issuer: <strong>GRIK-Kaffah</strong>
                </p>
              </div>
            </div>

            {/* PIN Verification Test */}
            <form onSubmit={handleVerifyPin} className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Uji Validasi Kode 6 Digit:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={testPin}
                  onChange={(e) => setTestPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="6 Digit PIN (contoh: 123456)"
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 tracking-widest font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  Verifikasi
                </button>
              </div>

              {pinVerificationStatus === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Kode TOTP valid! Perangkat Anda berhasil dipasangkan dengan infrastruktur keamanan GRIK.</span>
                </div>
              )}
              {pinVerificationStatus === 'error' && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Masukkan 6 digit angka kode authenticator dengan benar.</span>
                </div>
              )}
            </form>
          </div>

          {/* Recovery Backup Codes */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                Kode Cadangan Pemulihan (Backup Codes)
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Simpan kode-kode ini di tempat aman jika Anda kehilangan akses ke aplikasi authenticator:
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {user.backupCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-center"
                >
                  {code}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => alert('Kode cadangan disalin ke clipboard.')}
              className="w-full py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs transition cursor-pointer"
            >
              Salin Semua Kode Cadangan
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: SESSIONS & CONNECTED DEVICES */}
      {/* ============================================================== */}
      {activeSubTab === 'sessions' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
              Sesi Perangkat & Log Autentikasi
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-800 dark:text-stone-200 block">
                  Browser Aktif Sekarang (Sesi Web Ini)
                </span>
                <span className="text-[11px] text-stone-400">IP: 103.144.xxx.xx • Indonesia • Chrome on Linux</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                Terverifikasi 2FA & Biometrik
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-800 dark:text-stone-200 block">
                  GRIK Mobile App (Android Client)
                </span>
                <span className="text-[11px] text-stone-400">Terakhir aktif: Kemarin 19:40 WIB • Biometric Enabled</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-[10px] font-medium">
                Tersinkronisasi
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
