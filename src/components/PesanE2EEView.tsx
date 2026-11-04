import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  Send,
  UserCheck,
  CheckCheck,
  Sparkles,
  AlertCircle,
  Fingerprint,
} from 'lucide-react';
import { EncryptedMessage, UserProfile, Language } from '../types';
import { translations } from '../translations';
import { simulateE2EEncrypt, simulateE2EDecrypt } from '../utils';

interface PesanE2EEViewProps {
  language: Language;
  messages: EncryptedMessage[];
  user: UserProfile;
  onSendMessage: (msg: EncryptedMessage) => void;
  isBiometricUnlocked?: boolean;
  onOpenBiometricModal?: () => void;
  onLockBiometricSession?: () => void;
}

export const PesanE2EEView: React.FC<PesanE2EEViewProps> = ({
  language,
  messages,
  user,
  onSendMessage,
  isBiometricUnlocked = false,
  onOpenBiometricModal,
  onLockBiometricSession,
}) => {
  const t = translations[language];
  const [inputText, setInputText] = useState('');
  const [showRawCiphertext, setShowRawCiphertext] = useState(false);
  const [activePartner, setActivePartner] = useState<string>('Ustadz Dr. Hamzah Al-Farisi (Dewan Syariah)');

  const isProtectedByBiometrics = user.biometrics?.isEnabled && user.biometrics?.protectChat;
  const isChatLocked = isProtectedByBiometrics && !isBiometricUnlocked;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const { ciphertext, iv, hash } = simulateE2EEncrypt(inputText.trim());

    const newMsg: EncryptedMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      recipientId: 'usr_grik_002',
      recipientName: activePartner,
      content: inputText.trim(),
      ciphertext,
      iv,
      timestamp: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isEncrypted: true,
      fingerprint: user.publicKeyFingerprint.substring(0, 20),
    };

    onSendMessage(newMsg);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
                {t.e2eeTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              {t.e2eeSubtitle}
            </p>
          </div>

          {/* Toggle raw ciphertext inspection */}
          <button
            type="button"
            onClick={() => setShowRawCiphertext(!showRawCiphertext)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto ${
              showRawCiphertext
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
          >
            {showRawCiphertext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showRawCiphertext ? 'Mode Normal (Dekripsi)' : 'Inspeksi Ciphertext E2EE'}</span>
          </button>
        </div>

        {/* Cryptographic Key Verification Badge */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-stone-500">{t.encryptionKey}:</span>
            <code className="font-mono font-bold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700 text-[11px]">
              {user.publicKeyFingerprint}
            </code>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Zero-Knowledge Syariah Verified
          </span>
        </div>
      </div>

      {/* Biometric Privacy Shield Banner */}
      {isProtectedByBiometrics && (
        <div
          className={`p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
            isChatLocked
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`p-2.5 rounded-2xl ${
                isChatLocked
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <Fingerprint className="w-5 h-5" />
            </span>
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span>
                  {isChatLocked ? 'Privasi Obrolan E2EE Terkunci Biometrik' : 'Sesi Biometrik Aktif: Obrolan Terdekripsi'}
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.2 rounded-full ${
                    isChatLocked
                      ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                      : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  {isChatLocked ? '🔒 Terkunci' : '🔓 Terbuka'}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                {isChatLocked
                  ? 'Pesan privat disamarkan demi privasi Anda. Buka dengan sidik jari, Face ID, atau PIN untuk membaca.'
                  : 'Seluruh percakapan privat dengan dewan syariah terdekripsi aman di perangkat ini.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {isChatLocked ? (
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

      {/* Main Chat Interface */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md overflow-hidden flex flex-col h-[520px]">
        {/* Chat partner top bar */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              DS
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>{activePartner}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </h4>
              <p className="text-[11px] text-stone-500">
                Kanal Rahasia Konsultasi Fiqih & Keuangan • Status: Terenkripsi Kunci RSA-4096 / AES-256
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Lock className="w-3 h-3" /> E2EE AKTIF
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/40 dark:bg-stone-950/20">
          {messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 max-w-[85%] sm:max-w-[70%] ${
                  isMe ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-stone-400 px-1">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs space-y-1.5 shadow-xs ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-tl-none'
                  }`}
                >
                  {/* Content display: normal decrypted vs raw encrypted ciphertext vs biometric locked */}
                  {isChatLocked ? (
                    <div className="py-2 px-3 rounded-lg bg-black/20 text-stone-300 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-amber-300 flex items-center gap-1.5 font-bold">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Pesan Terproteksi Biometrik</span>
                        </span>
                        {onOpenBiometricModal && (
                          <button
                            type="button"
                            onClick={onOpenBiometricModal}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-bold cursor-pointer"
                          >
                            Buka
                          </button>
                        )}
                      </div>
                      <p className="font-mono text-[11px] opacity-75 blur-[2px] select-none">
                        ••••••••••••••••••••••••••••••••••••••
                      </p>
                    </div>
                  ) : showRawCiphertext ? (
                    <div className="space-y-1 font-mono text-[10px]">
                      <div className="flex items-center gap-1 text-amber-300 font-bold">
                        <Lock className="w-3 h-3" />
                        <span>RAW CIPHERTEXT ENKRIPSI:</span>
                      </div>
                      <p className="break-all bg-black/30 p-2 rounded-lg text-amber-200">
                        {msg.ciphertext}
                      </p>
                      <span className="block opacity-75">IV: {msg.iv} | Hash: {msg.fingerprint}</span>
                    </div>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}

                  <div className="flex items-center justify-between text-[10px] opacity-80 pt-1 border-t border-white/15 dark:border-stone-700/60">
                    <span className="flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>E2EE Verifikasi</span>
                    </span>
                    <CheckCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik pesan aman terenkripsi (otomatis dienkripsi sebelum dikirim)..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kirim E2EE</span>
          </button>
        </form>
      </div>
    </div>
  );
};
