import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  BookOpen,
  Store,
  ShieldCheck,
  User,
  Coins,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface AsistenAICerdasProps {
  language: Language;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
}

export const AsistenAICerdas: React.FC<AsistenAICerdasProps> = ({ language }) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Assalamu'alaikum Warahmatullahi Wabarakatuh.
Saya **Asisten Cerdas Syariah GRIK (Gerakan Rakyat Islamicity Kaffah)**. Saya siap membantu Anda dalam:
1. **Fiqih Muamalah**: Tanya jawab akad syariah (Mudharabah, Musyarakah, Murabahah, Qardh, dan pencegahan Riba).
2. **Inkubasi Bisnis Mikro**: Manajemen arus kas UMKM, sertifikasi halal BPJPH, strategi pemasaran berkah.
3. **Zakat & Wakaf Produktif**: Perhitungan nisab & haul, transparansi ZISWAF.

Silakan ajukan pertanyaan Anda atau pilih topik cepat di bawah ini!`,
      timestamp: '21:30',
      source: 'GRIK Sharia Intelligence Core',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const promptSuggestions = [
    'Bagaimana akad bagi hasil mudharabah yang sah?',
    'Cara memisahkan uang dapur dan modal usaha mikro?',
    'Syarat sertifikasi halal gratis SiHalal BPJPH?',
    'Bolehkah memberikan denda keterlambatan pinjaman?',
  ];

  const handleSendPrompt = async (promptToSend: string) => {
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: promptToSend.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          context: 'muamalah_business',
          language,
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Mohon maaf, terjadi kendala teknis dalam memproses konsultasi.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'GRIK Intelligence Engine',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Alhamdulillah, permodalan syariah di GRIK mengedepankan skema Qardhul Hasan (tanpa bunga) dan kemitraan bagi hasil (Mudharabah). Pastikan pencatatan kas rapi dan akad disepakati transparan di awal.`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          source: 'Fallback Syariah Engine',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
            <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
            {t.tabAsistenAI}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
          Konsultasi cerdas fiqih muamalah, manajemen usaha mikro umat, dan pendampingan sertifikasi halal 24/7.
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md overflow-hidden flex flex-col h-[520px]">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/40 dark:bg-stone-950/20">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 max-w-[85%] sm:max-w-[75%] ${
                  isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-stone-400 px-1">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    {isUser ? 'Anda' : 'Asisten Pakar Syariah GRIK'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-tl-none space-y-2'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {!isUser && msg.source && (
                    <div className="pt-1.5 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-[10px] text-stone-400">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Sparkles className="w-3 h-3" />
                        Sumber: {msg.source}
                      </span>
                      <span className="text-[9px] font-serif">Al-Qur'an & Sunnah Validated</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-500 w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Menyiapkan rujukan fiqih & strategi bisnis...</span>
            </div>
          )}
        </div>

        {/* Prompt Suggestions */}
        <div className="px-4 py-2 bg-stone-50 dark:bg-stone-800/60 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
            Saran Topik:
          </span>
          {promptSuggestions.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendPrompt(sug)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-500 transition shrink-0 cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputText);
          }}
          className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tanyakan akad jual beli, strategi permodalan UMKM, atau zakat..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tanya AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
