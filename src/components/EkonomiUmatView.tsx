import React, { useState } from 'react';
import {
  Store,
  ShieldCheck,
  Coins,
  TrendingUp,
  PlusCircle,
  Search,
  CheckCircle,
  HelpCircle,
  MapPin,
  Phone,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { MicroBusiness, Language } from '../types';
import { translations } from '../translations';
import { formatIDR } from '../utils';

interface EkonomiUmatViewProps {
  language: Language;
  businesses: MicroBusiness[];
  onAddBusiness: (biz: MicroBusiness) => void;
}

export const EkonomiUmatView: React.FC<EkonomiUmatViewProps> = ({
  language,
  businesses,
  onAddBusiness,
}) => {
  const t = translations[language];
  const [sectorFilter, setSectorFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<MicroBusiness | null>(null);

  // New business form state
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [sector, setSector] = useState<MicroBusiness['sector']>('Kuliner Halal');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [fundingNeeded, setFundingNeeded] = useState('');
  const [monthlyTurnover, setMonthlyTurnover] = useState('');
  const [contact, setContact] = useState('');

  const sectors = ['Semua', 'Kuliner Halal', 'Busana Muslim', 'Agrobisnis', 'Jasa Syariah', 'Kerajinan', 'Teknologi'];

  const filteredBusinesses = businesses.filter((b) => {
    const matchSector = sectorFilter === 'Semua' || b.sector === sectorFilter;
    const matchQuery =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSector && matchQuery;
  });

  const handleSubmitNewBiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ownerName || !fundingNeeded) return;

    const newBiz: MicroBusiness = {
      id: `biz-${Date.now()}`,
      name,
      ownerName,
      sector,
      description: description || 'Usaha mikro syariah binaan jamaah GRIK Kaffah.',
      location: location || 'DKI Jakarta & Sekitarnya',
      employees: 2,
      monthlyTurnover: parseFloat(monthlyTurnover) || 10000000,
      fundingNeeded: parseFloat(fundingNeeded) || 5000000,
      fundingRaised: 0,
      halalCertified: true,
      status: 'Inkubasi',
      qardhEligible: true,
      rating: 5.0,
      contact: contact || '0812-0000-0000',
    };

    onAddBusiness(newBiz);
    setIsModalOpen(false);
    // Reset form
    setName('');
    setOwnerName('');
    setDescription('');
    setLocation('');
    setFundingNeeded('');
    setMonthlyTurnover('');
    setContact('');
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                <Store className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
                {t.tabEkonomi}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Pemberdayaan ekosistem bisnis mikro umat berbasis syariah: permodalan Qardhul Hasan & Mudharabah tanpa bunga.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ajukan Inkubasi / Modal Qardh</span>
          </button>
        </div>

        {/* Sharia Principles Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <Coins className="w-4 h-4" />
              <span>Qardhul Hasan 0% Riba</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              Pinjaman kebajikan murni tanpa denda atau bunga tambahan sedikitpun.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Sertifikasi Halal Terjamin</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              Pendampingan gratis PPH untuk izin edar dan label halal resmi BPJPH.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
              <span>Pasar Berjejaring Jamaah</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              Akses belanja langsung dari 48.000+ anggota komunitas GRIK seluruh Indonesia.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSectorFilter(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                sectorFilter === sec
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari UMKM binaan..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-stone-100 shadow-xs"
          />
        </div>
      </div>

      {/* Micro-business Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredBusinesses.map((biz) => {
          const fundingPercent = Math.min(100, Math.round((biz.fundingRaised / biz.fundingNeeded) * 100));
          return (
            <div
              key={biz.id}
              className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {biz.sector}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Halal BPJPH</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                    {biz.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Pengelola: <span className="font-semibold text-stone-700 dark:text-stone-300">{biz.ownerName}</span>
                  </p>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {biz.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-stone-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {biz.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    {biz.contact}
                  </span>
                </div>
              </div>

              {/* Funding & Progress Bar */}
              <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500">Omset: <strong className="text-stone-800 dark:text-stone-200">{formatIDR(biz.monthlyTurnover)}/bln</strong></span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{biz.status}</span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fundingPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-500">
                    <span>Terkumpul: {formatIDR(biz.fundingRaised)}</span>
                    <span>Target: {formatIDR(biz.fundingNeeded)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedBiz(biz)}
                    className="flex-1 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs transition cursor-pointer"
                  >
                    Rincian Profil Usaha
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Pengajuan dukungan modal usaha untuk ${biz.name} diteruskan ke Dewan Syariah GRIK.`)}
                    className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    Dukung Modal
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detail Profil UMKM */}
      {selectedBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  <Store className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Profil Usaha Binaan GRIK
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBiz(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">{selectedBiz.name}</h4>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{selectedBiz.description}</p>
              
              <div className="grid grid-cols-2 gap-2 pt-2 text-stone-700 dark:text-stone-300">
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800">
                  <span className="text-[10px] text-stone-400 block">Pemilik Usaha</span>
                  <span className="font-semibold">{selectedBiz.ownerName}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800">
                  <span className="text-[10px] text-stone-400 block">Jumlah Karyawan</span>
                  <span className="font-semibold">{selectedBiz.employees} Jamaah Binaan</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800">
                  <span className="text-[10px] text-stone-400 block">Omset Bulanan</span>
                  <span className="font-semibold">{formatIDR(selectedBiz.monthlyTurnover)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800">
                  <span className="text-[10px] text-stone-400 block">Sertifikat Halal</span>
                  <span className="font-semibold text-emerald-600">Terdaftar Resmi BPJPH</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedBiz(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Tersambung dengan kontak WhatsApp binaan: ${selectedBiz.contact}`);
                  setSelectedBiz(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
              >
                Hubungi Pengusaha (WA)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah Usaha Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <form
            onSubmit={handleSubmitNewBiz}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Pengajuan Inkubasi & Permodalan Syariah
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
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Nama Usaha Mikro</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Berkah Madinah Bakery"
                  className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Nama Pemilik / Jamaah</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Sektor Usaha</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  >
                    <option value="Kuliner Halal">Kuliner Halal</option>
                    <option value="Busana Muslim">Busana Muslim</option>
                    <option value="Agrobisnis">Agrobisnis</option>
                    <option value="Kerajinan">Kerajinan</option>
                    <option value="Jasa Syariah">Jasa Syariah</option>
                    <option value="Teknologi">Teknologi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Kebutuhan Modal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={fundingNeeded}
                    onChange={(e) => setFundingNeeded(e.target.value)}
                    placeholder="5000000"
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Omset Saat Ini (Rp/Bulan)</label>
                  <input
                    type="number"
                    value={monthlyTurnover}
                    onChange={(e) => setMonthlyTurnover(e.target.value)}
                    placeholder="10000000"
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Lokasi & Kontak WhatsApp</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Kota / Daerah"
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Deskripsi Singkat Rencana Usaha</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan produk halal dan target pasarnya..."
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
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Kirim Pengajuan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
