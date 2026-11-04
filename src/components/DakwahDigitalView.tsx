import React, { useState } from 'react';
import {
  Radio,
  Play,
  Volume2,
  Calendar,
  Clock,
  Search,
  BookOpen,
  Share2,
  CheckCircle,
  Sparkles,
  MessageSquare,
  Send,
} from 'lucide-react';
import { DakwahItem, Language } from '../types';
import { translations } from '../translations';

interface DakwahDigitalViewProps {
  language: Language;
  dakwahList: DakwahItem[];
}

export const DakwahDigitalView: React.FC<DakwahDigitalViewProps> = ({
  language,
  dakwahList,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMedia, setActiveMedia] = useState<DakwahItem | null>(dakwahList[0] || null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [liveComments, setLiveComments] = useState<{ id: string; user: string; text: string; time: string }[]>([
    { id: '1', user: 'Ust. Farhan', text: 'MasyaAllah barakallahu fiikum materi sangat aplikatif.', time: '20:12' },
    { id: '2', user: 'Ahmad Fauzi', text: 'Semoga sentra grosir halal GRIK segera terealisasi di daerah kami.', time: '20:14' },
    { id: '3', user: 'Dewi Anggraini', text: 'Bagaimana cara mendaftar pendamping PPH sertifikasi halal?', time: '20:15' },
  ]);
  const [newComment, setNewComment] = useState('');

  const categories = ['Semua', 'Live Streaming', 'Fiqih Bisnis', 'Kajian Rutin', 'Tafsir Tematik', 'Keluarga Sakinah'];

  const filteredItems = dakwahList.filter((item) => {
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLiveComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: 'Anda (Jamaah GRIK)',
        text: newComment.trim(),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Prayer Times Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
                {t.tabDakwah}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Pusat kajian Islamicity Kaffah: live streaming, audio podcast taushiyah, dan fikih muamalah kontemporer.
            </p>
          </div>

          {/* Prayer Times Bar */}
          <div className="bg-stone-50 dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700">
            <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>{t.prayerTimes} (WIB)</span>
            </p>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                <span className="block text-[10px] text-stone-400 font-medium">{t.subuh}</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">04:38</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                <span className="block text-[10px] text-stone-400 font-medium">{t.dzuhur}</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">11:58</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                <span className="block text-[10px] text-stone-400 font-medium">{t.ashar}</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">15:10</span>
              </div>
              <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                <span className="block text-[10px] text-emerald-200 font-medium">{t.maghrib}</span>
                <span className="font-bold">18:02</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                <span className="block text-[10px] text-stone-400 font-medium">{t.isya}</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">19:11</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Media Player & Interactive Live Chat */}
      {activeMedia && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Media Player Screen */}
          <div className="lg:col-span-2 rounded-3xl bg-stone-950 text-white overflow-hidden border border-stone-800 shadow-xl flex flex-col justify-between">
            <div className="relative aspect-video bg-stone-900 flex items-center justify-center p-6 text-center">
              {/* Live Streaming or Video Backdrop */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent pointer-events-none" />
              
              <div className="relative z-10 space-y-3 max-w-lg">
                {activeMedia.isLive && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    SIARAN LANGSUNG DAKWAH INTERAKTIF
                  </span>
                )}
                <h3 className="text-lg sm:text-2xl font-bold font-serif leading-snug">
                  {activeMedia.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300">
                  Bersama: <span className="text-emerald-400 font-semibold">{activeMedia.speaker}</span>
                </p>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    {isPlayingAudio ? <Volume2 className="w-4 h-4 animate-bounce" /> : <Play className="w-4 h-4" />}
                    <span>{isPlayingAudio ? 'Jeda Siaran' : 'Putar Audio/Video'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Tautan siaran dakwah "${activeMedia.title}" disalin ke clipboard!`)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm transition flex items-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Video Controls & Summary Bar */}
            <div className="p-4 sm:p-5 bg-stone-900/90 border-t border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kategori: {activeMedia.category}
                </span>
                <span>Durasi: {activeMedia.duration}</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {activeMedia.summary}
              </p>
            </div>
          </div>

          {/* Real-time Live Dakwah Chat / Forum Jamaah */}
          <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between h-[360px] sm:h-[420px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                    Ruang Interaksi Jamaah
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Moderasi Syariah
                </span>
              </div>

              {/* Chat Message Stream */}
              <div className="space-y-2.5 overflow-y-auto max-h-[240px] pr-1 scrollbar-thin text-xs">
                {liveComments.map((cmt) => (
                  <div key={cmt.id} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">{cmt.user}</span>
                      <span className="text-[9px] text-stone-400">{cmt.time}</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 text-[11px]">{cmt.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Message Form */}
            <form onSubmit={handleSendComment} className="pt-3 border-t border-stone-200 dark:border-stone-800 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis tanggapan atau pertanyaan..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-stone-100"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kajian atau ustadz..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 shadow-xs"
          />
        </div>
      </div>

      {/* Dakwah Library Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveMedia(item)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
              activeMedia?.id === item.id
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {item.category}
              </span>
              <span className="text-[11px] text-stone-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {item.date} • {item.time}
              </span>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                {item.title}
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                Narasumber: {item.speaker}
              </p>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/80 text-xs">
              <span className="text-stone-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {item.duration}
              </span>
              <button
                type="button"
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Buka Kajian</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
