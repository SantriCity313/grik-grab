export type Language = 'id' | 'en' | 'ar';
export type Theme = 'light' | 'dark';
export type ViewMode = 'web' | 'mobile';

export type NavigationTab =
  | 'dashboard'
  | 'dakwah'
  | 'ekonomi'
  | 'pelatihan'
  | 'donasi'
  | 'analitik'
  | 'kalender'
  | 'pesan'
  | 'keamanan'
  | 'asisten'
  | 'backup'
  | 'pesan_e2ee'
  | 'keamanan_2fa'
  | 'asisten_ai'
  | 'backup_ekspor';

export type NavTab = NavigationTab;

export type BiometricType = 'fingerprint' | 'face_id' | 'security_pin';

export interface BiometricSecuritySettings {
  isEnabled: boolean;
  biometricType: BiometricType;
  protectChat: boolean;
  protectFinancial: boolean;
  autoLockMinutes: number;
  securityPin: string;
  isUnlocked: boolean;
  lastUnlockedTime?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Pengurus' | 'Donatur' | 'Pelaku UMKM' | 'Anggota Kaffah';
  avatarUrl: string;
  is2FAEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes: string[];
  publicKeyFingerprint: string;
  lastLogin: string;
  biometrics?: BiometricSecuritySettings;
}

export interface CampaignMilestone {
  id: string;
  targetPercent: number; // e.g. 25, 50, 75, 100
  targetAmount: number;
  title: string;
  description: string;
  impactBadge?: string;
  achieved: boolean;
  achievedDate?: string;
}

export interface DonationCampaign {
  id: string;
  title: string;
  category: 'Zakat' | 'Infaq' | 'Wakaf Produktif' | 'Kemanusiaan' | 'Modal UMKM';
  description: string;
  targetAmount: number;
  collectedAmount: number;
  donorCount: number;
  deadline: string;
  imageUrl: string;
  transparencyScore: number;
  disbursements: DisbursementRecord[];
  milestones?: CampaignMilestone[];
}

export interface DisbursementRecord {
  id: string;
  date: string;
  recipient: string;
  amount: number;
  purpose: string;
  proofDocument: string;
  auditStatus: 'Terverifikasi' | 'Dalam Audit' | 'Tersalurkan';
}

export interface DonationTransaction {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donorName: string;
  amount: number;
  type: 'Zakat Mal' | 'Infaq Dakwah' | 'Sedekah Subuh' | 'Wakaf Produktif' | 'Modal Mikro';
  timestamp: string;
  isAnonymous: boolean;
  paymentMethod: 'QRIS' | 'Bank Syariah' | 'BSI' | 'Muamalat' | 'GRIK Pay';
  status: 'Berhasil' | 'Menunggu' | 'Diverifikasi';
  e2eeReceiptHash: string;
  isRecurring?: boolean;
  subscriptionId?: string;
}

export interface SadaqahSubscription {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignCategory: string;
  donorName: string;
  isAnonymous: boolean;
  amount: number;
  frequency: 'monthly';
  dayOfMonth: number;
  type: 'Zakat Mal' | 'Infaq Dakwah' | 'Sedekah Subuh' | 'Wakaf Produktif' | 'Modal Mikro';
  paymentMethod: string;
  status: 'active' | 'paused' | 'cancelled';
  createdAt: string;
  nextDebitDate: string;
  lastDebitDate?: string;
  totalDebitedCount?: number;
  totalDebitedAmount?: number;
  autoDebitReminder?: boolean;
  notes?: string;
}

export interface AutoZakatDetails {
  monthlyIncome: number;
  additionalIncome: number;
  monthlyExpenses: number;
  savingsAndCash: number;
  goldAndInvestments: number;
  receivables: number;
  goldPricePerGram: number;
  nisabMonthly: number;
  isNisabReached: boolean;
  totalAssets: number;
  netMonthlyIncome: number;
  zakatableBaseMonthly: number;
  calculatedZakatMonthly: number;
  designatedInstitution: string;
  autoDebitDay: number;
}

export interface RecurringDonationSubscription {
  id: string;
  campaignId: string;
  campaignTitle: string;
  category: 'Zakat' | 'Infaq' | 'Wakaf Produktif' | 'Kemanusiaan' | 'Modal UMKM';
  monthlyAmount: number;
  frequency: 'Bulanan' | 'Monthly';
  billingDay: number;
  nextBillingDate: string;
  paymentMethod: 'Auto-Debit BSI' | 'Bank Syariah Muamalat' | 'QRIS Autodebit' | 'GRIK Pay Kas Syariah';
  status: 'Aktif' | 'Dijeda';
  startDate: string;
  totalDonatedSoFar: number;
  autoDeduct: boolean;
  isAutoZakat?: boolean;
  designatedInstitution?: string;
  autoZakatDetails?: AutoZakatDetails;
}

export interface AutoGiftCategoryAllocation {
  category: 'Zakat' | 'Infaq' | 'Wakaf Produktif' | 'Kemanusiaan' | 'Modal UMKM';
  percentage: number;
  designatedCampaignId?: string;
  notes?: string;
}

export interface AutoGiftExecutionLog {
  id: string;
  date: string;
  totalAmount: number;
  status: 'Berhasil' | 'Menunggu' | 'Diproses';
  allocations: {
    category: string;
    campaignTitle: string;
    amount: number;
    percentage: number;
  }[];
  receiptHash: string;
}

export interface AutoGiftConfig {
  id: string;
  isEnabled: boolean;
  totalMonthlyBudget: number;
  billingDay: number;
  paymentMethod: 'Auto-Debit BSI' | 'Bank Syariah Muamalat' | 'QRIS Autodebit' | 'GRIK Pay Kas Syariah';
  allocations: AutoGiftCategoryAllocation[];
  lastDisbursedDate?: string;
  nextExecutionDate: string;
  totalDisbursedLifetime: number;
  historyLogs: AutoGiftExecutionLog[];
}

export type ProgramCategoryType =
  | 'Modal UMKM'
  | 'Ketahanan Pangan'
  | 'Zakat Vokasi'
  | 'Kesehatan & Kemanusiaan'
  | 'Wakaf Produktif';

export type ProgramRegionType =
  | 'Sumatera'
  | 'Jawa'
  | 'Bali & Nusa Tenggara'
  | 'Kalimantan'
  | 'Sulawesi'
  | 'Maluku & Papua';

export interface BeneficiaryProgramLocation {
  id: string;
  title: string;
  province: string;
  regencyCity: string;
  region: ProgramRegionType;
  category: ProgramCategoryType;
  coordinates: [number, number]; // [longitude, latitude]
  beneficiariesCount: number;
  beneficiaryUnit: string;
  fundsDisbursed: number;
  targetBudget: number;
  progressPercent: number;
  status: 'Aktif Berjalan' | 'Mandiri Penuh' | 'Tahap Ekspansi';
  partnerInstitution: string;
  leadCoordinator: string;
  coordinatorContact: string;
  impactMetric: string;
  impactHighlight: string;
  story: string;
  photoUrl?: string;
  launchedDate: string;
  verifiedAuditHash: string;
}

export interface MicroBusiness {
  id: string;
  name: string;
  ownerName: string;
  sector: 'Kuliner Halal' | 'Busana Muslim' | 'Agrobisnis' | 'Kerajinan' | 'Jasa Syariah' | 'Teknologi';
  description: string;
  location: string;
  employees: number;
  monthlyTurnover: number;
  fundingNeeded: number;
  fundingRaised: number;
  halalCertified: boolean;
  status: 'Inkubasi' | 'Mandiri' | 'Ekspansi';
  qardhEligible: boolean;
  rating: number;
  contact: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  level: 'Dasar' | 'Menengah' | 'Lanjutan';
  durationMinutes: number;
  category: 'Fiqih Muamalah' | 'Manajemen Keuangan' | 'Digital Marketing' | 'Sertifikasi Halal' | 'Kemitraan Syariah';
  description: string;
  lessonsCount: number;
  completedLessons: number;
  instructor: string;
  badge: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface DakwahItem {
  id: string;
  title: string;
  speaker: string;
  category: 'Kajian Rutin' | 'Tafsir Tematik' | 'Fiqih Bisnis' | 'Keluarga Sakinah' | 'Live Streaming';
  date: string;
  time: string;
  duration: string;
  isLive: boolean;
  liveViewers?: number;
  audioUrl?: string;
  videoUrl?: string;
  summary: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  category: 'Dakwah' | 'Pelatihan Bisnis' | 'Sosial/Baksos' | 'Rapat Komunitas';
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  attendeesCount: number;
  speakerOrLead: string;
  reminderSet: boolean;
}

export interface EncryptedMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  recipientName: string;
  content: string;
  ciphertext: string;
  iv: string;
  timestamp: string;
  isEncrypted: boolean;
  fingerprint: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'dakwah' | 'donasi' | 'bisnis' | 'keamanan' | 'sistem';
  timestamp: string;
  isRead: boolean;
  actionTab?: NavigationTab;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'dakwah' | 'donasi' | 'bisnis' | 'keamanan' | 'sistem' | 'kalender';
  timestamp: string;
  isRead: boolean;
  targetView?: NavigationTab;
  actionTab?: NavigationTab;
}

export interface CloudBackupSnapshot {
  id: string;
  timestamp: string;
  sizeBytes: number;
  version: string;
  deviceInfo: string;
  recordCounts: {
    donations: number;
    businesses: number;
    events: number;
    messages: number;
  };
}
