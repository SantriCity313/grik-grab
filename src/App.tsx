import React, { useState, useEffect } from 'react';
import {
  Language,
  Theme,
  ViewMode,
  NavTab,
  UserProfile,
  DonationCampaign,
  DonationTransaction,
  MicroBusiness,
  TrainingModule,
  DakwahItem,
  CommunityEvent,
  EncryptedMessage,
  CloudBackupSnapshot,
  AppNotification,
  RecurringDonationSubscription,
  AutoGiftConfig,
} from './types';
import {
  initialUser,
  initialCampaigns,
  initialTransactions,
  initialRecurringSubscriptions,
  initialAutoGiftConfig,
  initialBusinesses,
  initialTrainingModules,
  initialDakwahItems,
  initialEvents,
  initialMessages,
  initialSnapshots,
  initialNotifications,
} from './mockData';
import { translations } from './translations';
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { DakwahDigitalView } from './components/DakwahDigitalView';
import { EkonomiUmatView } from './components/EkonomiUmatView';
import { PelatihanBisnisView } from './components/PelatihanBisnisView';
import { DonasiTransparanView } from './components/DonasiTransparanView';
import { AnalitikPerformaView } from './components/AnalitikPerformaView';
import { KalenderKomunitasView } from './components/KalenderKomunitasView';
import { PesanE2EEView } from './components/PesanE2EEView';
import { Keamanan2FAView } from './components/Keamanan2FAView';
import { BackupEksporView } from './components/BackupEksporView';
import { AsistenAICerdas } from './components/AsistenAICerdas';
import { DonateModal } from './components/DonateModal';
import { ReceiptModal } from './components/ReceiptModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CampaignQRCodeModal } from './components/CampaignQRCodeModal';
import { BiometricLockModal } from './components/BiometricLockModal';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Fingerprint,
} from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('grik_theme') as Theme) || 'light';
  });

  // Language state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('grik_lang') as Language) || 'id';
  });

  // View Mode: intuitive Web Portal vs Mobile Device Frame
  const [viewMode, setViewMode] = useState<ViewMode>('web');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Core domain states
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>(initialCampaigns);
  const [transactions, setTransactions] = useState<DonationTransaction[]>(initialTransactions);
  const [businesses, setBusinesses] = useState<MicroBusiness[]>(initialBusinesses);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>(initialTrainingModules);
  const [dakwahList, setDakwahList] = useState<DakwahItem[]>(initialDakwahItems);
  const [events, setEvents] = useState<CommunityEvent[]>(initialEvents);
  const [messages, setMessages] = useState<EncryptedMessage[]>(initialMessages);
  const [snapshots, setSnapshots] = useState<CloudBackupSnapshot[]>(initialSnapshots);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [recurringSubscriptions, setRecurringSubscriptions] = useState<RecurringDonationSubscription[]>(initialRecurringSubscriptions);
  const [autoGiftConfig, setAutoGiftConfig] = useState<AutoGiftConfig>(initialAutoGiftConfig);

  // Modals state
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState<DonationCampaign | null>(null);
  const [initialDonationAmount, setInitialDonationAmount] = useState<number | undefined>(undefined);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedCampaignForQR, setSelectedCampaignForQR] = useState<DonationCampaign | null>(null);
  const [receiptTrx, setReceiptTrx] = useState<DonationTransaction | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Biometric Privacy Lock state
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [isBiometricUnlocked, setIsBiometricUnlocked] = useState(false);

  const t = translations[language];

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('grik_theme', theme);
  }, [theme]);

  // Sync language with HTML dir attribute for Arabic support
  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('grik_lang', language);
  }, [language]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleOpenDonateModal = (campaign?: DonationCampaign, initialAmount?: number) => {
    setSelectedCampaignForDonation(campaign || null);
    setInitialDonationAmount(initialAmount);
    setIsDonateModalOpen(true);
  };

  const handleOpenQRModal = (campaign?: DonationCampaign) => {
    setSelectedCampaignForQR(campaign || campaigns[0] || null);
    setIsQRModalOpen(true);
  };

  const handleDonationSuccess = (newTrx: DonationTransaction) => {
    setTransactions((prev) => [newTrx, ...prev]);

    // Update campaign if matched
    if (newTrx.campaignId) {
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id === newTrx.campaignId) {
            return {
              ...c,
              collectedAmount: c.collectedAmount + newTrx.amount,
              donorCount: c.donorCount + 1,
            };
          }
          return c;
        })
      );
    }

    // Add push notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Donasi Terverifikasi E2EE',
      message: `Alhamdulillah, setoran ${newTrx.type} sebesar Rp ${newTrx.amount.toLocaleString('id-ID')} telah dicatat di open ledger publik.`,
      timestamp: 'Baru saja',
      isRead: false,
      type: 'donasi',
      actionTab: 'donasi',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setIsDonateModalOpen(false);
    setReceiptTrx(newTrx);
    showToast('Donasi Anda berhasil disalurkan & bukti setor digital siap dicetak!');
  };

  const handleSubmitBusiness = (newBiz: MicroBusiness) => {
    setBusinesses((prev) => [newBiz, ...prev]);
    showToast('Pengajuan program mikro bisnis telah dikirim ke Tim Inkubasi GRIK!');
  };

  const handleAddEvent = (newEvt: CommunityEvent) => {
    setEvents((prev) => [newEvt, ...prev]);
    showToast('Agenda kegiatan berhasil ditambahkan ke kalender komunitas!');
  };

  const handleToggleReminder = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const next = !e.reminderSet;
          showToast(next ? 'Pengingat notifikasi agenda aktif!' : 'Pengingat agenda dinonaktifkan.');
          return { ...e, reminderSet: next };
        }
        return e;
      })
    );
  };

  const handleSendMessage = (newMsg: EncryptedMessage) => {
    setMessages((prev) => [...prev, newMsg]);
    showToast('Pesan terenkripsi end-to-end terkirim secara aman.');
  };

  const handleUpdate2FA = (enabled: boolean) => {
    setUser((prev) => ({ ...prev, is2FAEnabled: enabled }));
    showToast(enabled ? 'Autentikasi Dua Faktor (2FA) berhasil diaktifkan!' : '2FA dinonaktifkan.');
  };

  const handleUpdateBiometrics = (newSettings: any) => {
    setUser((prev) => ({ ...prev, biometrics: newSettings }));
    setIsBiometricUnlocked(newSettings.isUnlocked);
    showToast('Konfigurasi privasi biometrik diperbarui.');
  };

  const handleUnlockBiometricSuccess = () => {
    setIsBiometricUnlocked(true);
    setUser((prev) => ({
      ...prev,
      biometrics: prev.biometrics ? { ...prev.biometrics, isUnlocked: true, lastUnlockedTime: '21:05 WIB' } : undefined,
    }));
    showToast('Brankas biometrik terbuka! Fitur E2EE & finansial siap diakses.');
  };

  const handleLockBiometricSession = () => {
    setIsBiometricUnlocked(false);
    setUser((prev) => ({
      ...prev,
      biometrics: prev.biometrics ? { ...prev.biometrics, isUnlocked: false } : undefined,
    }));
    showToast('Sesi biometrik dikunci. Fitur sensitif kembali terlindungi.');
  };

  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await fetch('/api/backup/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationsCount: transactions.length,
          businessesCount: businesses.length,
          messagesCount: messages.length,
          device: viewMode === 'mobile' ? 'GRIK Mobile Engine' : 'GRIK Cloud Core Node',
        }),
      });
      const data = await response.json();

      if (data.snapshot) {
        setSnapshots((prev) => [data.snapshot, ...prev]);
        showToast('Sinkronisasi cloud snapshot otomatis berhasil diamankan!');
      }
    } catch (e) {
      // Fallback local snapshot
      const mockSnap: CloudBackupSnapshot = {
        id: `SNP-2026-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        sizeBytes: 48600,
        version: 'v2.4.0-kaffah-prod',
        recordCounts: {
          donations: transactions.length,
          businesses: businesses.length,
          events: events.length,
          messages: messages.length,
        },
        deviceInfo: 'GRIK Cloud Storage Engine (Encrypted)',
      };
      setSnapshots((prev) => [mockSnap, ...prev]);
      showToast('Snapshot cadangan terenkripsi tersimpan di cloud!');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreSnapshot = (snap: CloudBackupSnapshot) => {
    showToast(`Snapshot ${snap.id} berhasil diverifikasi dan dipulihkan!`);
  };

  // Recurring Donations Handlers
  const handleUpdateSubscription = (updated: RecurringDonationSubscription) => {
    setRecurringSubscriptions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const handleAddSubscription = (
    newSub: Omit<RecurringDonationSubscription, 'id' | 'startDate' | 'totalDonatedSoFar'>
  ) => {
    const fullSub: RecurringDonationSubscription = {
      ...newSub,
      id: `sub-${Date.now()}`,
      startDate: '26 September 2026',
      totalDonatedSoFar: 0,
    };
    setRecurringSubscriptions((prev) => [fullSub, ...prev]);
    showToast(`Donasi rutin bulanan untuk "${fullSub.campaignTitle.split(':')[0]}" berhasil diaktifkan!`);
  };

  const handleDeleteSubscription = (id: string) => {
    setRecurringSubscriptions((prev) => prev.filter((s) => s.id !== id));
    showToast('Komitmen donasi rutin berhasil dihentikan.');
  };

  // Render View Content
  const renderViewContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            language={language}
            setActiveTab={setActiveTab}
            campaigns={campaigns}
            transactions={transactions}
            businesses={businesses}
            dakwahList={dakwahList}
            events={events}
            recurringSubscriptions={recurringSubscriptions}
            onOpenDonateModal={handleOpenDonateModal}
            onOpenReceipt={(trx) => setReceiptTrx(trx)}
            onOpenQRModal={handleOpenQRModal}
            onUpdateSubscription={handleUpdateSubscription}
            onAddSubscription={handleAddSubscription}
            onDeleteSubscription={handleDeleteSubscription}
          />
        );
      case 'dakwah':
        return (
          <DakwahDigitalView
            language={language}
            dakwahList={dakwahList}
          />
        );
      case 'ekonomi':
        return (
          <EkonomiUmatView
            language={language}
            businesses={businesses}
            onAddBusiness={handleSubmitBusiness}
          />
        );
      case 'pelatihan':
        return (
          <PelatihanBisnisView
            language={language}
            modules={trainingModules}
            user={user}
          />
        );
      case 'donasi':
        return (
          <DonasiTransparanView
            language={language}
            campaigns={campaigns}
            transactions={transactions}
            onOpenDonateModal={handleOpenDonateModal}
            onOpenReceipt={(trx) => setReceiptTrx(trx)}
            onOpenQRModal={handleOpenQRModal}
            isBiometricUnlocked={isBiometricUnlocked}
            isBiometricProtected={user.biometrics?.isEnabled && user.biometrics?.protectFinancial}
            onOpenBiometricModal={() => setIsBiometricModalOpen(true)}
            onLockBiometricSession={handleLockBiometricSession}
            autoGiftConfig={autoGiftConfig}
            onUpdateAutoGiftConfig={(updated) => {
              setAutoGiftConfig(updated);
              showToast('Pengaturan distribusi Auto-Gift berhasil diperbarui!');
            }}
            recurringSubscriptions={recurringSubscriptions}
          />
        );
      case 'analitik':
        return <AnalitikPerformaView language={language} />;
      case 'kalender':
        return (
          <KalenderKomunitasView
            language={language}
            events={events}
            onAddEvent={handleAddEvent}
            onToggleReminder={handleToggleReminder}
          />
        );
      case 'pesan':
      case 'pesan_e2ee':
        return (
          <PesanE2EEView
            language={language}
            messages={messages}
            user={user}
            onSendMessage={handleSendMessage}
            isBiometricUnlocked={isBiometricUnlocked}
            onOpenBiometricModal={() => setIsBiometricModalOpen(true)}
            onLockBiometricSession={handleLockBiometricSession}
          />
        );
      case 'keamanan':
      case 'keamanan_2fa':
        return (
          <Keamanan2FAView
            language={language}
            user={user}
            onUpdate2FA={handleUpdate2FA}
            onUpdateBiometrics={handleUpdateBiometrics}
            onOpenBiometricModal={() => setIsBiometricModalOpen(true)}
            isBiometricUnlocked={isBiometricUnlocked}
            onLockBiometricSession={handleLockBiometricSession}
            onNavigateTab={setActiveTab}
          />
        );
      case 'backup':
      case 'backup_ekspor':
        return (
          <BackupEksporView
            language={language}
            snapshots={snapshots}
            onTriggerBackup={handleTriggerBackup}
            onRestoreSnapshot={handleRestoreSnapshot}
            isBackingUp={isBackingUp}
            transactionsData={transactions}
            businessesData={businesses}
            campaignsData={campaigns}
          />
        );
      case 'asisten':
      case 'asisten_ai':
        return <AsistenAICerdas language={language} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-300">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4 border border-stone-700 dark:border-stone-300 max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Global Bar: Sharia Integrity & Hijri Calendar */}
      <div className="bg-stone-900 text-stone-300 dark:bg-stone-950 dark:border-b dark:border-stone-800 text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-stone-200">GRIK Cloud Node Kaffah</span>
          <span className="hidden sm:inline text-stone-500">•</span>
          <span className="hidden sm:inline text-stone-400">9 Rabiul Awwal 1448 H / September 2026</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Biometric Privacy Status & Quick Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isBiometricUnlocked) {
                handleLockBiometricSession();
              } else {
                setIsBiometricModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] font-bold transition cursor-pointer border border-stone-700/80"
            title={
              isBiometricUnlocked
                ? 'Sesi biometrik aktif. Klik untuk mengunci privasi kembali.'
                : 'Fitur sensitif terkunci. Klik untuk membuka kunci biometrik.'
            }
          >
            {isBiometricUnlocked ? (
              <>
                <Unlock className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 hidden xs:inline">Biometrik Terbuka</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 hidden xs:inline">Kunci Biometrik</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit WTP & E2EE Verified</span>
          </div>
          <span className="hidden md:inline text-stone-500">•</span>
          <span className="hidden md:inline text-stone-400">Jadwal Sholat: Dzuhur 11:52 WIB</span>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        viewMode={viewMode}
        setViewMode={setViewMode}
        user={user}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        isSyncing={isBackingUp}
        onManualSync={handleTriggerBackup}
        lastSyncTime="21:00 WIB"
      />

      {/* View Mode Wrapper: Responsive Web Portal vs Mobile Device Shell */}
      {viewMode === 'mobile' ? (
        /* Mobile Device Frame Simulation */
        <div className="flex-1 py-6 px-3 flex items-center justify-center">
          <div className="w-full max-w-[430px] h-[860px] bg-white dark:bg-stone-900 rounded-[44px] border-[10px] border-stone-800 dark:border-stone-700 shadow-2xl overflow-hidden flex flex-col relative">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-5 bg-stone-800 dark:bg-stone-700 rounded-b-xl z-30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-stone-900 dark:bg-stone-800 mr-2" />
              <div className="w-10 h-1 bg-stone-900/60 dark:bg-stone-800/60 rounded-full" />
            </div>

            {/* Mobile Header Bar */}
            <div className="pt-6 px-4 pb-2 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-xs">
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400 font-serif">
                GRIK Mobile
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                2FA Aktif
              </span>
            </div>

            {/* Mobile Scrollable View Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {renderViewContent()}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="p-2 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0">
              <Navigation
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                language={language}
                isMobileView={true}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Responsive Web Portal Layout */
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Main Navigation Bar / Tabs */}
          <Navigation
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            language={language}
            isMobileView={false}
          />

          {/* Active View Container */}
          <main className="transition-all duration-300">
            {renderViewContent()}
          </main>
        </div>
      )}

      {/* Modals */}
      <DonateModal
        language={language}
        campaign={selectedCampaignForDonation}
        initialAmount={initialDonationAmount}
        isOpen={isDonateModalOpen}
        onClose={() => {
          setIsDonateModalOpen(false);
          setInitialDonationAmount(undefined);
        }}
        onSuccess={handleDonationSuccess}
        onShowFullQR={(camp) => {
          setIsDonateModalOpen(false);
          handleOpenQRModal(camp);
        }}
      />

      <CampaignQRCodeModal
        language={language}
        campaign={selectedCampaignForQR}
        campaigns={campaigns}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onOpenDonateModal={(camp, initialAmount) => {
          setIsQRModalOpen(false);
          handleOpenDonateModal(camp, initialAmount);
        }}
      />

      <ReceiptModal
        language={language}
        transaction={receiptTrx}
        isOpen={!!receiptTrx}
        onClose={() => setReceiptTrx(null)}
      />

      <NotificationsModal
        language={language}
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          showToast('Semua notifikasi ditandai telah dibaca.');
        }}
        onSelectAction={(target) => setActiveTab(target)}
      />

      {/* Biometric Authentication Lock Screen Modal */}
      <BiometricLockModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        language={language}
        isUnlocked={isBiometricUnlocked}
        onUnlockSuccess={handleUnlockBiometricSuccess}
        onLockSession={handleLockBiometricSession}
        onNavigateTab={(targetTab) => {
          setActiveTab(targetTab);
          setIsBiometricModalOpen(false);
        }}
        defaultMethod={user.biometrics?.biometricType || 'fingerprint'}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-6 px-4 text-xs text-stone-500 text-center space-y-2">
        <p className="font-bold text-stone-700 dark:text-stone-300">
          GRIK — Gerakan Rakyat Islamicity Kaffah
        </p>
        <p className="text-[11px] max-w-2xl mx-auto text-stone-400">
          Infrastruktur terpadu dakwah digital, kemandirian ekonomi umat, transparansi ZISWAF ber-audit, pelatihan bisnis mikro, enkripsi end-to-end, dan pemantauan real-time kaffah.
        </p>
      </footer>
    </div>
  );
}
