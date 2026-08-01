export interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  picture: string;
  role: 'user' | 'admin';
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
