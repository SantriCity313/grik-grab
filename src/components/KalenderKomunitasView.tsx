import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  PlusCircle,
  CalendarPlus,
  Download,
  Bell,
  CheckCircle,
  Search,
  ExternalLink,
} from 'lucide-react';
import { CommunityEvent, Language } from '../types';
import { translations } from '../translations';
import { generateICS, downloadFile } from '../utils';

interface KalenderKomunitasViewProps {
  language: Language;
  events: CommunityEvent[];
  onAddEvent: (event: CommunityEvent) => void;
  onToggleReminder: (eventId: string) => void;
}

export const KalenderKomunitasView: React.FC<KalenderKomunitasViewProps> = ({
  language,
  events,
  onAddEvent,
  onToggleReminder,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New event form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CommunityEvent['category']>('Dakwah');
  const [date, setDate] = useState('2026-10-05');
  const [time, setTime] = useState('09:00 - 11:30 WIB');
  const [location, setLocation] = useState('Masjid Raya Islamic Center');
  const [isOnline, setIsOnline] = useState(false);
  const [speakerOrLead, setSpeakerOrLead] = useState('');

  const categories = ['Semua', 'Dakwah', 'Pelatihan Bisnis', 'Sosial/Baksos', 'Rapat Komunitas'];

  const filteredEvents = events.filter((evt) => {
    const matchCat = selectedCategory === 'Semua' || evt.category === selectedCategory;
    const matchQuery =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.speakerOrLead.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleDownloadICS = (evt: CommunityEvent) => {
    const icsContent = generateICS({
      title: evt.title,
      description: `Penyelenggara: ${evt.speakerOrLead} | Lokasi: ${evt.location} | Kategori: ${evt.category} GRIK Kaffah`,
      location: evt.location,
      startDate: evt.date,
      time: evt.time,
    });
    downloadFile(icsContent, `${evt.title.replace(/\s+/g, '_')}.ics`, 'text/calendar;charset=utf-8');
  };

  const handleOpenGoogleCalendar = (evt: CommunityEvent) => {
    const cleanDate = evt.date.replace(/-/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      evt.title
    )}&details=${encodeURIComponent(
      `Penyelenggara: ${evt.speakerOrLead} - Komunitas GRIK Kaffah`
    )}&location=${encodeURIComponent(evt.location)}&dates=${cleanDate}T090000Z/${cleanDate}T120000Z`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSubmitNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newEvt: CommunityEvent = {
      id: `evt-${Date.now()}`,
      title,
      category,
      date,
      time,
      location,
      isOnline,
      attendeesCount: 50,
      speakerOrLead: speakerOrLead || 'Pengurus GRIK',
      reminderSet: true,
    };

    onAddEvent(newEvt);
    setIsModalOpen(false);
    setTitle('');
    setSpeakerOrLead('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
                {t.tabKalender}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Jadwal kegiatan dakwah, pelatihan bisnis mikro, baksos, dan rapat pengurus dengan integrasi kalender perangkat & Google Calendar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Jadwal Agenda</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
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
            placeholder="Cari kegiatan atau lokasi..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-stone-900 dark:text-stone-100 shadow-xs"
          />
        </div>
      </div>

      {/* Events List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {evt.category}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleReminder(evt.id)}
                  title={evt.reminderSet ? 'Pengingat Aktif' : 'Pasang Pengingat'}
                  className={`p-1.5 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1 ${
                    evt.reminderSet
                      ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/60'
                      : 'bg-stone-50 text-stone-400 border-stone-200 dark:bg-stone-800'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold">{evt.reminderSet ? 'Diingatkan' : 'Ingatkan'}</span>
                </button>
              </div>

              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                {evt.title}
              </h3>

              <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{evt.date}</span>
                  <span>({evt.time})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{evt.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{evt.attendeesCount} Jamaah Terdaftar • Pemateri: {evt.speakerOrLead}</span>
                </div>
              </div>
            </div>

            {/* Action buttons: Download .ICS & Open Google Calendar */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadICS(evt)}
                className="flex-1 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Unduh File .ICS</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenGoogleCalendar(evt)}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google Calendar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Kegiatan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <form
            onSubmit={handleSubmitNewEvent}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Jadwalkan Kegiatan Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Nama Kegiatan</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Kajian Fiqih Pasar Modal Syariah"
                  className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  >
                    <option value="Dakwah">Dakwah</option>
                    <option value="Pelatihan Bisnis">Pelatihan Bisnis</option>
                    <option value="Sosial/Baksos">Sosial/Baksos</option>
                    <option value="Rapat Komunitas">Rapat Komunitas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Waktu</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="08:30 - 11:00 WIB"
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Narasumber / Penanggungjawab</label>
                  <input
                    type="text"
                    value={speakerOrLead}
                    onChange={(e) => setSpeakerOrLead(e.target.value)}
                    placeholder="Nama Ustadz / Ketua"
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Lokasi Kegiatan</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Nama Masjid, Gedung, atau Ruang Zoom"
                  className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Simpan Jadwal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
