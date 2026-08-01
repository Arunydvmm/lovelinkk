// ─────────────────────────────────────────────────────────────
// TIMELINE & QUOTES
// ─────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  photo?: string;
  icon?: string; // emoji
  color?: string; // tailwind color key e.g. "rose"
}

export interface QuoteEntry {
  id: string;
  type: 'quote' | 'inside-joke' | 'promise' | 'goal';
  text: string;
  author?: string;
  emoji?: string;
}

// ─────────────────────────────────────────────────────────────
// INTERACTIVE MODULE IDs (enables/disables per template)
// ─────────────────────────────────────────────────────────────
export type InteractiveModuleId =
  | 'scratch-card'
  | 'flip-cards'
  | 'confetti'
  | 'countdown'
  | 'polaroid-stack'
  | 'letter-opening'
  | 'emoji-rain'
  | 'photo-carousel'
  | 'typing-animation'
  | 'certificate'
  | 'memory-book'
  | 'promise-wall'
  | 'replay'
  | 'fireworks';

// ─────────────────────────────────────────────────────────────
// EXTENDED SURPRISE DATA
// ─────────────────────────────────────────────────────────────

/** Full JSON-engine template stored in MongoDB / data.json */
export interface FullTemplate {
  id: string;
  /** display name */
  name: string;
  /** short badge label e.g. "❤️ Classic" */
  badge: string;
  description: string;
  category: string;
  subcategory?: string;
  mood?: string[];
  style?: string[];
  previewImage?: string;
  /** legacy field kept for backward compat */
  coverImageUrl?: string;
  /** full JSON engine spec (pages, theme, animations …) */
  templateJson?: Record<string, unknown>;
  totalPages?: number;
  featured?: boolean;
  /** false = draft / not shown on public gallery */
  published: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  picture: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLoginAt?: string;
}

export interface StoryTemplate {
  id: string;
  title: string;
  badge: string;
  description: string;
  sampleReasons: string[];
  coverImageUrl: string;
  musicTrack: { name: string; url: string };
  createdAt: string;
}

export interface MemoryImage {
  id: string;
  url: string;
  caption?: string;
  date?: string;
}

export type AwardType = 'Best Girlfriend ❤️' | 'Best Boyfriend ❤️' | 'Best Partner ❤️';

/** The 5 certificate types the creator chooses in the wizard */
export type CertificateType = 'Girlfriend' | 'Boyfriend' | 'Best Friend' | 'Husband' | 'Wife';

export interface CertificateData {
  recipientName: string;
  presentedBy: string;
  award: AwardType;
  /** new: chosen certificate type drives title/wording/theme */
  certificateType?: CertificateType;
  /** optional personal message from creator */
  personalMessage?: string;
  date: string;
}

export interface MusicData {
  type: 'preset' | 'upload';
  url: string;
  name: string;
}

export interface SurpriseData {
  id: string;
  userId: string;
  creatorName: string;
  partnerName: string;
  title: string;
  coverImage?: string; // If missing, defaults to memoryImages[0] with blur overlay
  memoryImages: MemoryImage[];
  welcomeMessage: string;
  loveLetter: string;
  finalMessage: string;
  reasons: string[]; // Max 15 reasons
  certificate: CertificateData;
  music: MusicData;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  // ── Enhanced fields ──
  nickname?: string;
  relationship?: string;
  occasion?: string;
  specialDate?: string;
  yearsTogether?: number;
  profilePicture?: string;
  headline?: string;
  letterSignature?: string;
  timeline?: TimelineEvent[];
  quotes?: QuoteEntry[];
  enabledModules?: InteractiveModuleId[];
  countdownDate?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalSurprises: number;
  storageUsageMB: number;
  maintenanceMode: boolean;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  maintenanceMode: boolean;
  defaultMusicTracks: { name: string; url: string }[];
}
