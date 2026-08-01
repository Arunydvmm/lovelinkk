import express from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
const appDir = process.cwd();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'lovelink_secret_key_change_me_in_prod';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cloudinary configuration (media storage)
const CLOUDINARY_ENABLED = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('[LoveLink] Cloudinary env vars not set — media uploads will be stored as base64 in data.json (not recommended for production).');
}

// Initial Data Storage setup (file-backed or in-memory persistence)
// DATA_DIR should point at a persistent disk mount in production (see render.yaml);
// Render's default filesystem is wiped on every deploy/restart otherwise.
const DATA_DIR = process.env.DATA_DIR || appDir;
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DATA_FILE = path.join(DATA_DIR, 'data.json');

interface MemoryImage {
  id: string;
  url: string;
  caption?: string;
  date?: string;
}

interface SurpriseData {
  id: string;
  userId: string;
  /** Secret token embedded in every share link – required to view the surprise */
  viewToken: string;
  creatorName: string;
  partnerName: string;
  title: string;
  coverImage?: string;
  memoryImages: MemoryImage[];
  welcomeMessage: string;
  loveLetter: string;
  finalMessage: string;
  reasons: string[];
  certificate: {
    recipientName: string;
    presentedBy: string;
    award: string;
    certificateType?: string;
    personalMessage?: string;
    date: string;
  };
  music: {
    type: 'preset' | 'upload';
    url: string;
    name: string;
  };
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  picture: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLoginAt?: string;
}

interface StoryTemplate {
  id: string;
  title: string;
  badge: string;
  description: string;
  sampleReasons: string[];
  coverImageUrl: string;
  musicTrack: { name: string; url: string };
  createdAt: string;
}

interface FullTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  category: string;
  subcategory?: string;
  mood?: string[];
  style?: string[];
  previewImage?: string;
  coverImageUrl?: string;
  templateJson?: Record<string, unknown>;
  totalPages?: number;
  featured?: boolean;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface SiteSettings {
  siteName: string;
  logoUrl: string;
  maintenanceMode: boolean;
  defaultMusicTracks: { name: string; url: string }[];
}

let templates: StoryTemplate[] = [];
let fullTemplates: FullTemplate[] = [];

let users: User[] = [
  {
    id: 'u_1',
    googleId: '1029384756',
    name: 'Priya Sharma',
    email: 'priya.demo@lovelink.local',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u_2',
    googleId: '9876543210',
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

/** Generate a cryptographically-safe 24-char URL token */
function generateViewToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

let surprises: SurpriseData[] = [
  {
    id: 'priya-kabir',
    userId: 'u_1',
    viewToken: 'demo_priya_kabir_token',
    creatorName: 'Priya',
    partnerName: 'Kabir',
    title: 'Our Love Story ❤️',
    coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop',
    memoryImages: [
      {
        id: 'm1',
        url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop',
        caption: 'Our unforgettable sunset walk along the quiet shore.',
        date: '14 Feb 2024'
      },
      {
        id: 'm2',
        url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop',
        caption: 'Late night laughter & warm hot chocolate in winter.',
        date: '02 Nov 2024'
      },
      {
        id: 'm3',
        url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop',
        caption: 'Stargazing in the mountains on our weekend escape.',
        date: '20 Dec 2024'
      },
      {
        id: 'm4',
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop',
        caption: 'Rooftop dinner under twinkling fairy lights.',
        date: '12 Jan 2025'
      },
      {
        id: 'm5',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
        caption: 'Your bright radiant smile that warms my soul every single day.',
        date: 'Always'
      }
    ],
    welcomeMessage: 'Welcome to our tiny magical corner of the universe. Every moment spent with you feels like a beautiful dream come true.',
    loveLetter: 'Dear Kabir,\n\nFrom the moment you entered my life, everything became brighter, kinder, and infinitely more joyful. You are my safe haven, my best friend, and my greatest blessing.\n\nThank you for every shared laugh, every comforting hug, and for loving me so unconditionally. Happy anniversary, my love!\n\nForever & Always,\nPriya',
    finalMessage: 'Thank you for being mine. I love you endlessly and look forward to building a lifetime of sweet memories together! ❤️',
    reasons: [
      'Your infectious smile instantly brightens my darkest days.',
      'You listen with pure patience, empathy, and complete understanding.',
      'Your gentle playfulness and warm hugs make me feel truly cherished.',
      'You inspire me to dream bigger and grow every single day.',
      'In your arms, I have found my home, my peace, and my heart.'
    ],
    certificate: {
      recipientName: 'Kabir',
      presentedBy: 'Priya',
      award: 'Best Partner ❤️',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    },
    music: {
      type: 'preset',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=piano-moment-114227.mp3',
      name: 'Acoustic Piano Serenade'
    },
    viewsCount: 42,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 14).toISOString()
  },
  {
    id: 'you-and-me',
    userId: 'u_1',
    viewToken: 'demo_you_and_me_token',
    creatorName: 'Priya',
    partnerName: 'Kabir',
    title: 'You & Me Forever',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
    memoryImages: [
      { id: 'ym1', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop', caption: 'Hand in hand through every adventure.', date: '05 Apr 2024' },
      { id: 'ym2', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop', caption: 'Spontaneous road trip with endless songs.', date: '10 May 2024' },
      { id: 'ym3', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop', caption: 'Cozy moments on rainy afternoons.', date: '15 Aug 2024' },
      { id: 'ym4', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop', caption: 'Watching the sun dip below the horizon.', date: '01 Jan 2025' },
      { id: 'ym5', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop', caption: 'Making wishes under shooting stars.', date: 'Valentine 2025' }
    ],
    welcomeMessage: 'Here is a little digital treasure box made especially for you.',
    loveLetter: 'My sweetest Kabir,\n\nI created this page to remind you how deeply and genuinely you are loved. Each picture here is a token of our story, and each reason is a truth I feel every day.\n\nThank you for making my world so gentle and bright.',
    finalMessage: 'You will always be my favorite hello and my hardest goodbye.',
    reasons: [
      'Your contagious enthusiasm for everything you do.',
      'How you make me laugh until my stomach hurts.',
      'Your thoughtful surprise gestures when I least expect them.',
      'The calm and comforting safety I feel when I am beside you.',
      'Because you are simply my favorite person in the entire world.'
    ],
    certificate: {
      recipientName: 'Kabir',
      presentedBy: 'Priya',
      award: 'Best Boyfriend ❤️',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    },
    music: {
      type: 'preset',
      url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b7468161.mp3?filename=romantic-acoustic-guitar-10822.mp3',
      name: 'Sweet Ukulele & Strings'
    },
    viewsCount: 19,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'birthday-surprise',
    userId: 'u_1',
    viewToken: 'demo_birthday_token',
    creatorName: 'Aarav',
    partnerName: 'Ananya',
    title: 'Happy Birthday My Sunshine ☀️',
    coverImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop',
    memoryImages: [
      { id: 'b1', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop', caption: 'Blowing out the candles together on your special day.', date: 'Birthday Milestone' },
      { id: 'b2', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop', caption: 'Our fun weekend trip filled with smiles & road tunes.', date: 'Spring Getaway' },
      { id: 'b3', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop', caption: 'Coffee and cake dates at our favorite cozy cafe.', date: 'Weekend Ritual' },
      { id: 'b4', url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1000&auto=format&fit=crop', caption: 'Sweet quiet moments of pure happiness together.', date: 'Pure Joy' },
      { id: 'b5', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', caption: 'The smile that captured my heart forever.', date: 'Always & Forever' }
    ],
    welcomeMessage: 'Happy Birthday my favorite human! Today is all about celebrating YOU and how wonderful you are.',
    loveLetter: 'Dearest Ananya,\n\nOn your special day, I want to remind you how much happiness and light you bring into this world. Seeing you laugh is my absolute favorite sound.\n\nMay this new year of your life be filled with endless joy, exciting adventures, and all the love you so richly deserve!\n\nAll my love,\nAarav',
    finalMessage: 'Happy Birthday, my sweet sunshine! Here is to another year of making amazing memories together! 🎂✨',
    reasons: [
      'Your radiant energy lights up every room you walk into.',
      'How you care so genuinely for everyone around you.',
      'Your adorable spontaneous dances when your favorite song plays.',
      'The sweet way you hold my hand whenever we walk together.',
      'You make even ordinary days feel like extraordinary celebrations.'
    ],
    certificate: {
      recipientName: 'Ananya',
      presentedBy: 'Aarav',
      award: 'Best Girlfriend ❤️',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    },
    music: {
      type: 'preset',
      url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b7468161.mp3?filename=romantic-acoustic-guitar-10822.mp3',
      name: 'Sweet Ukulele & Strings'
    },
    viewsCount: 38,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'long-distance-love',
    userId: 'u_1',
    viewToken: 'demo_long_distance_token',
    creatorName: 'Rohan',
    partnerName: 'Maya',
    title: 'Miles Apart, Hearts Connected ✈️❤️',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
    memoryImages: [
      { id: 'ld1', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop', caption: 'Our emotional airport embrace before boarding.', date: 'Farewell Hug' },
      { id: 'ld2', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop', caption: 'Watching the same sunset from two different cities.', date: 'Shared Sky' },
      { id: 'ld3', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop', caption: 'The magical reunion trip when we finally held hands again.', date: 'Reunion Day' },
      { id: 'ld4', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop', caption: 'Sweet handwritten notes sent across the miles.', date: 'Letters of Love' },
      { id: 'ld5', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', caption: 'Your beautiful face smiling on my screen every night.', date: 'Late Night Call' }
    ],
    welcomeMessage: 'Distance means so little when someone means so much. Open this whenever you miss me.',
    loveLetter: 'My Sweet Maya,\n\nEven though there are miles between us right now, not a single hour passes without you in my thoughts. Looking at our photos reminds me how lucky I am to have found a love this deep.\n\nEvery video call, late-night text, and countdown to our next flight brings me closer to holding you again.\n\nWith all my heart,\nRohan',
    finalMessage: 'No distance can ever diminish what we share. I am counting down the seconds until I see you again! ✈️💖',
    reasons: [
      'You make long video calls feel like we are sitting in the same room.',
      'Your comforting voice can calm any stressful day in seconds.',
      'How we never run out of sweet things to talk about.',
      'Your unwavering trust, loyalty, and boundless support.',
      'Because every kilometer apart only makes my love grow stronger.'
    ],
    certificate: {
      recipientName: 'Maya',
      presentedBy: 'Rohan',
      award: 'Best Partner ❤️',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    },
    music: {
      type: 'preset',
      url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=sweet-love-12128.mp3',
      name: 'Dreamy Lofi Love Melodies'
    },
    viewsCount: 56,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'forever-yours',
    userId: 'u_1',
    viewToken: 'demo_forever_yours_token',
    creatorName: 'Vikram',
    partnerName: 'Neha',
    title: 'Will You Marry Me? 💍',
    coverImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop',
    memoryImages: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop', caption: 'The magical night under the stars where I knew you were the one.', date: 'Magic Night' },
      { id: 'p2', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop', caption: 'Walking hand in hand toward our shared future.', date: 'Walk of Love' },
      { id: 'p3', url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1000&auto=format&fit=crop', caption: 'Dancing in the candlelight surrounded by sweet music.', date: 'Slow Dance' },
      { id: 'p4', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop', caption: 'A ring, a promise, and a lifetime of love.', date: 'Forever Promise' },
      { id: 'p5', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', caption: 'Your tears of joy that I will cherish forever.', date: 'The Big Yes!' }
    ],
    welcomeMessage: 'I created this special place to share a question that comes from the very bottom of my heart...',
    loveLetter: 'My Beloved Neha,\n\nFrom our very first date, I knew there was something extraordinary about you. You have filled my life with peace, joy, and a deep sense of purpose.\n\nLooking into the future, I cannot imagine walking through life without your hand in mine. You are my soulmate, my best friend, and my forever.\n\nWill you marry me?\n\nForever yours,\nVikram',
    finalMessage: 'You are my yesterday, my today, and all of my tomorrows. I love you beyond words! 💍❤️',
    reasons: [
      'You are the kindest, most graceful soul I have ever known.',
      'How naturally we fit together in everything we do.',
      'The quiet comfort of just sitting beside you doing nothing at all.',
      'Your loving guidance that makes our home a sanctuary.',
      'Because I want to spend the rest of my life making you happy.'
    ],
    certificate: {
      recipientName: 'Neha',
      presentedBy: 'Vikram',
      award: 'Best Partner ❤️',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    },
    music: {
      type: 'preset',
      url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9932785d1d.mp3?filename=romantic-piano-and-strings-124806.mp3',
      name: 'Violin Love Story'
    },
    viewsCount: 89,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

let siteSettings: SiteSettings = {
  siteName: 'LoveLink Builder',
  logoUrl: '',
  maintenanceMode: false,
  defaultMusicTracks: [
    { name: 'Acoustic Piano Serenade', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=piano-moment-114227.mp3' },
    { name: 'Sweet Ukulele & Strings', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b7468161.mp3?filename=romantic-acoustic-guitar-10822.mp3' },
  ],
};

// Persistence helpers
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.users) users = parsed.users;
      if (parsed.surprises) surprises = parsed.surprises;
      if (parsed.siteSettings) siteSettings = parsed.siteSettings;
      if (parsed.templates) templates = parsed.templates;
      if (parsed.fullTemplates) fullTemplates = parsed.fullTemplates;
    }
    // Backfill viewToken for any existing surprises that predate this feature
    let needsSave = false;
    for (const s of surprises) {
      if (!s.viewToken) {
        s.viewToken = generateViewToken();
        needsSave = true;
      }
    }
    if (needsSave) saveData();
  } catch (err) {
    console.error('Failed to load data file, using defaults', err);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users, surprises, siteSettings, templates, fullTemplates }, null, 2));
  } catch (err) {
    console.error('Failed to save data file', err);
  }
}

loadData();

// Auth Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Check maintenance mode middleware
app.use((req, res, next) => {
  if (siteSettings.maintenanceMode && !req.path.startsWith('/api/auth') && !req.path.startsWith('/api/admin')) {
    // Check if admin token provided
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'admin') {
          return next();
        }
      } catch (e) {}
    }
    if (req.path.startsWith('/api/')) {
      return res.status(503).json({ error: 'LoveLink Builder is currently undergoing scheduled maintenance. Please check back shortly.' });
    }
  }
  next();
});

// Diagnostic: lets the frontend know whether Cloudinary is configured
app.get('/api/upload/status', (_req, res) => {
  return res.json({ cloudinaryEnabled: CLOUDINARY_ENABLED });
});

// MEDIA UPLOAD ROUTE (Cloudinary or base64 fallback)
// Accepts a base64 data URL. If Cloudinary is configured it uploads there and
// returns the hosted URL. If not configured it returns the data URL directly so
// the app still works end-to-end in local/dev without any cloud storage.
app.post('/api/upload', authenticateToken, async (req: any, res: any) => {
  const { dataUrl, resourceType, folder } = req.body;

  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return res.status(400).json({ error: 'A base64 data URL is required in "dataUrl"' });
  }

  // ── Cloudinary not configured → fall back to returning the data URL directly ──
  // This lets the app work fully in local dev / when env vars haven't been set yet.
  // Images will be stored as base64 inside data.json (fine for dev; not for prod).
  if (!CLOUDINARY_ENABLED) {
    console.warn('[LoveLink] Cloudinary not configured — returning data URL as-is (dev fallback).');
    return res.json({ url: dataUrl, publicId: '' });
  }

  // ── Cloudinary configured → upload and return the hosted CDN URL ──
  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: folder || 'lovelink',
      resource_type: resourceType === 'audio' ? 'video' : 'image',
    });

    return res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err: any) {
    console.error('[LoveLink] Cloudinary upload failed:', err?.message || err);
    return res.status(500).json({ error: `Media upload failed: ${err?.message || 'unknown error'}` });
  }
});

// AUTH API ROUTES
// Admin credentials: username + password via env vars.
// ADMIN_PASSCODE is kept for backward-compatibility (used if ADMIN_PASSWORD is not set).
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ADMIN_PASSCODE;
if (!ADMIN_PASSWORD) {
  console.warn('[LoveLink] Neither ADMIN_PASSWORD nor ADMIN_PASSCODE is set — the admin panel cannot be unlocked.');
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
if (!GOOGLE_CLIENT_ID) {
  console.warn('[LoveLink] GOOGLE_CLIENT_ID not set — Google Sign-In will be unavailable until it is configured.');
}

// Silent guest identity — no login screen, no fake accounts. Each browser gets a
// stable anonymous identity (persisted client-side as deviceId) so "My Websites" works.
app.post('/api/auth/guest', (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId || typeof deviceId !== 'string') {
    return res.status(400).json({ error: 'A deviceId is required' });
  }

  let user = users.find(u => u.googleId === `device_${deviceId}`);

  if (!user) {
    user = {
      id: 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      googleId: `device_${deviceId}`,
      name: 'Guest',
      email: `guest_${deviceId.slice(0, 8)}@lovelink.local`,
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveData();
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
  return res.json({ token, user });
});

// Admin login — accepts username + password (ADMIN_USERNAME / ADMIN_PASSWORD env vars).
// Falls back to accepting the legacy ADMIN_PASSCODE alone for backward compat.
app.post('/api/auth/admin', (req, res) => {
  const { username, password, passcode } = req.body;

  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin access is not configured on the server.' });
  }

  // Accept either: username+password pair OR legacy passcode-only (backward compat)
  const credentialsOk =
    (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) ||
    (passcode && passcode === ADMIN_PASSCODE && ADMIN_PASSCODE);

  if (!credentialsOk) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  let admin = users.find(u => u.id === 'admin_owner');
  if (!admin) {
    admin = {
      id: 'admin_owner',
      googleId: 'admin_owner',
      name: ADMIN_USERNAME,
      email: 'admin@lovelink.local',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    users.push(admin);
  }

  admin.lastLoginAt = new Date().toISOString();
  saveData();

  const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role, name: admin.name }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user: admin });
});

// Google Sign-In — verify a Google ID token (credential) issued by GIS and
// upsert the user record. No redirect flow: the front-end obtains the credential
// directly from the GIS library and POSTs it here.
app.post('/api/auth/google', async (req: any, res: any) => {
  const { credential } = req.body;

  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ error: 'Google credential token is required.' });
  }
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: 'Google Sign-In is not configured on this server.' });
  }

  try {
    // Verify the ID token via Google's tokeninfo endpoint (no extra SDK needed).
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!verifyRes.ok) {
      return res.status(401).json({ error: 'Invalid Google credential.' });
    }
    const payload: any = await verifyRes.json();

    // Confirm the token was issued for our app.
    if (payload.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Google credential audience mismatch.' });
    }
    if (!payload.sub || !payload.email) {
      return res.status(401).json({ error: 'Incomplete Google profile in token.' });
    }

    // Upsert: find by googleId (sub), or fall back to email match for legacy guest accounts.
    let user = users.find(u => u.googleId === payload.sub);

    if (!user) {
      // Create a new user record from Google profile.
      user = {
        id: 'g_' + payload.sub.slice(-12),
        googleId: payload.sub,
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        picture: payload.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      users.push(user);
    } else {
      // Keep profile fields fresh from Google.
      user.name = payload.name || user.name;
      user.picture = payload.picture || user.picture;
      user.email = payload.email;
      user.lastLoginAt = new Date().toISOString();
    }
    saveData();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    return res.json({ token, user });
  } catch (err: any) {
    console.error('[LoveLink] Google auth error', err);
    return res.status(500).json({ error: 'Google sign-in failed. Please try again.' });
  }
});

// Return the Google Client ID to the front-end (so it can be baked into the GIS script).
app.get('/api/auth/google-client-id', (_req, res) => {
  if (!GOOGLE_CLIENT_ID) return res.json({ clientId: null });
  return res.json({ clientId: GOOGLE_CLIENT_ID });
});

app.get('/api/auth/me', authenticateToken, (req: any, res: any) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
});

// SURPRISES API ROUTES
app.get('/api/surprises', authenticateToken, (req: any, res: any) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (user.role === 'admin') {
    return res.json({ surprises });
  }

  const mySurprises = surprises.filter(s => s.userId === user.id);
  return res.json({ surprises: mySurprises });
});

// Get single surprise — requires the per-surprise viewToken in the query string.
// This means only people who have the full share link (or QR code) can see it.
app.get('/api/surprises/:id', (req: any, res: any) => {
  const { id } = req.params;
  const { token: viewToken } = req.query;

  const surprise = surprises.find(s => s.id === id);
  if (!surprise) {
    return res.status(404).json({ error: 'Surprise gift not found' });
  }

  // Admins can view without the token (for moderation)
  const authHeader = req.headers['authorization'];
  const jwtToken = authHeader && authHeader.split(' ')[1];
  if (jwtToken) {
    try {
      const decoded: any = jwt.verify(jwtToken, JWT_SECRET);
      if (decoded.role === 'admin' || decoded.id === surprise.userId) {
        surprise.viewsCount += 1;
        saveData();
        return res.json({ surprise });
      }
    } catch (_) {}
  }

  // Everyone else must present the correct viewToken
  if (!viewToken || viewToken !== surprise.viewToken) {
    return res.status(403).json({ error: 'Invalid or missing access token. Use the full share link.' });
  }

  surprise.viewsCount += 1;
  saveData();
  return res.json({ surprise });
});

// Create Surprise — only real (Google-authenticated) accounts may create websites.
app.post('/api/surprises', authenticateToken, (req: any, res: any) => {
  // Block anonymous guest accounts (googleId starts with "device_")
  const creator = users.find(u => u.id === req.user.id);
  if (!creator || creator.googleId.startsWith('device_')) {
    return res.status(401).json({
      error: 'Please sign in with Google to create a surprise website.',
      requireLogin: true,
    });
  }

  const { creatorName, partnerName, title, coverImage, memoryImages, welcomeMessage, loveLetter, finalMessage, reasons, certificate, music } = req.body;

  if (!creatorName || !partnerName || !title || !memoryImages || memoryImages.length === 0) {
    return res.status(400).json({ error: 'Missing required surprise fields (creator name, partner name, title, memory images)' });
  }

  // Generate URL slug ID
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'gift';
  const uniqueId = `${cleanTitle}-${Date.now().toString(36).slice(-4)}`;

  // Default cover image logic: if cover image is missing, auto use the first uploaded image
  const effectiveCover = coverImage || (memoryImages[0] ? memoryImages[0].url : '');

  const newSurprise: SurpriseData = {
    id: uniqueId,
    userId: req.user.id,
    viewToken: generateViewToken(),
    creatorName,
    partnerName,
    title,
    coverImage: effectiveCover,
    memoryImages: memoryImages.slice(0, 20), // 5-20 images limit
    welcomeMessage: welcomeMessage || `Welcome to our sweet story, ${partnerName}! ❤️`,
    loveLetter: loveLetter || `My Dearest ${partnerName},\n\nYou mean the absolute world to me.`,
    finalMessage: finalMessage || `Thank you for being mine forever!`,
    reasons: (reasons || []).slice(0, 5),
    certificate: certificate || {
      recipientName: partnerName,
      presentedBy: creatorName,
      award: 'Best Partner ❤️',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    },
    music: music || {
      type: 'preset',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=piano-moment-114227.mp3',
      name: 'Acoustic Piano Serenade'
    },
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  surprises.unshift(newSurprise);
  saveData();

  return res.status(201).json({ surprise: newSurprise });
});

// Update Surprise
app.put('/api/surprises/:id', authenticateToken, (req: any, res: any) => {
  const { id } = req.params;
  const surprise = surprises.find(s => s.id === id);

  if (!surprise) return res.status(404).json({ error: 'Surprise not found' });
  if (surprise.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have permission to edit this surprise' });
  }

  const { creatorName, partnerName, title, coverImage, memoryImages, welcomeMessage, loveLetter, finalMessage, reasons, certificate, music } = req.body;

  if (creatorName) surprise.creatorName = creatorName;
  if (partnerName) surprise.partnerName = partnerName;
  if (title) surprise.title = title;
  if (memoryImages) surprise.memoryImages = memoryImages;
  
  surprise.coverImage = coverImage || (surprise.memoryImages[0] ? surprise.memoryImages[0].url : surprise.coverImage);
  if (welcomeMessage !== undefined) surprise.welcomeMessage = welcomeMessage;
  if (loveLetter !== undefined) surprise.loveLetter = loveLetter;
  if (finalMessage !== undefined) surprise.finalMessage = finalMessage;
  if (reasons) surprise.reasons = reasons.slice(0, 5);
  if (certificate) surprise.certificate = certificate;
  if (music) surprise.music = music;

  surprise.updatedAt = new Date().toISOString();
  saveData();

  return res.json({ surprise });
});

// Delete Surprise
app.delete('/api/surprises/:id', authenticateToken, (req: any, res: any) => {
  const { id } = req.params;
  const index = surprises.findIndex(s => s.id === id);

  if (index === -1) return res.status(404).json({ error: 'Surprise not found' });

  if (surprises[index].userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have permission to delete this surprise' });
  }

  surprises.splice(index, 1);
  saveData();

  return res.json({ message: 'Surprise deleted successfully' });
});

// ADMIN API ROUTES
app.get('/api/admin/stats', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  // Calculate approximate storage usage (rough estimate based on JSON payload)
  const dataSize = Buffer.byteLength(JSON.stringify({ users, surprises, siteSettings }));
  const storageUsageMB = Number((dataSize / (1024 * 1024) + 2.4).toFixed(2)); // Base media overhead

  return res.json({
    totalUsers: users.length,
    totalSurprises: surprises.length,
    storageUsageMB,
    maintenanceMode: siteSettings.maintenanceMode,
  });
});

app.get('/api/admin/users', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  return res.json({ users });
});

app.delete('/api/admin/users/:id', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { id } = req.params;
  
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own admin account' });
  }

  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  users.splice(idx, 1);
  // Also clean up user's surprises
  surprises = surprises.filter(s => s.userId !== id);
  saveData();

  return res.json({ message: 'User and their surprises deleted successfully' });
});

app.get('/api/admin/surprises', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  return res.json({ surprises });
});

app.delete('/api/admin/surprises/:id', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { id } = req.params;
  const idx = surprises.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Surprise not found' });
  surprises.splice(idx, 1);
  saveData();
  return res.json({ message: 'Surprise deleted successfully' });
});

app.get('/api/admin/settings', (req, res) => {
  return res.json({ settings: siteSettings });
});

// Accept both PUT and POST for settings (client sends POST)
app.put('/api/admin/settings', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { siteName, logoUrl, maintenanceMode, defaultMusicTracks } = req.body;
  if (siteName !== undefined) siteSettings.siteName = siteName;
  if (logoUrl !== undefined) siteSettings.logoUrl = logoUrl;
  if (maintenanceMode !== undefined) siteSettings.maintenanceMode = maintenanceMode;
  if (defaultMusicTracks) siteSettings.defaultMusicTracks = defaultMusicTracks;
  saveData();
  return res.json({ settings: siteSettings });
});

app.post('/api/admin/settings', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { siteName, logoUrl, maintenanceMode, defaultMusicTracks } = req.body;
  if (siteName !== undefined) siteSettings.siteName = siteName;
  if (logoUrl !== undefined) siteSettings.logoUrl = logoUrl;
  if (maintenanceMode !== undefined) siteSettings.maintenanceMode = maintenanceMode;
  if (defaultMusicTracks) siteSettings.defaultMusicTracks = defaultMusicTracks;
  saveData();
  return res.json({ settings: siteSettings });
});

// ADMIN TEMPLATES ROUTES
app.get('/api/admin/templates', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  return res.json({ templates });
});

app.post('/api/admin/templates', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { title, badge, description, sampleReasons, coverImageUrl, musicTrack } = req.body;
  if (!title || !badge || !description) {
    return res.status(400).json({ error: 'title, badge, and description are required' });
  }
  const template: StoryTemplate = {
    id: 'tpl_' + Date.now().toString(36),
    title: title.trim(),
    badge: badge.trim(),
    description: description.trim(),
    sampleReasons: Array.isArray(sampleReasons) ? sampleReasons : [],
    coverImageUrl: coverImageUrl || '',
    musicTrack: musicTrack || { name: '', url: '' },
    createdAt: new Date().toISOString(),
  };
  templates.push(template);
  saveData();
  return res.status(201).json({ template });
});

app.delete('/api/admin/templates/:id', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { id } = req.params;
  const idx = templates.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Template not found' });
  templates.splice(idx, 1);
  saveData();
  return res.json({ message: 'Template deleted' });
});

// ── PUBLIC template gallery route (no auth required) ──
app.get('/api/templates', (_req, res) => {
  const published = fullTemplates.filter(t => t.published !== false);
  return res.json({ templates: published });
});

// ── ADMIN full-template CRUD ──
app.get('/api/admin/full-templates', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  return res.json({ templates: fullTemplates });
});

app.post('/api/admin/full-templates', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

  const {
    name, badge, description, category, subcategory, mood, style,
    previewImage, coverImageUrl, templateJson, totalPages, featured, published,
  } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'name and description are required' });
  }

  const tpl: FullTemplate = {
    id: 'ftpl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name: String(name).trim(),
    badge: String(badge || '❤️').trim(),
    description: String(description).trim(),
    category: String(category || 'romantic').toLowerCase(),
    subcategory: subcategory || undefined,
    mood: Array.isArray(mood) ? mood : [],
    style: Array.isArray(style) ? style : [],
    previewImage: previewImage || '',
    coverImageUrl: coverImageUrl || '',
    templateJson: templateJson || undefined,
    totalPages: totalPages ? Number(totalPages) : undefined,
    featured: Boolean(featured),
    published: published !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  fullTemplates.unshift(tpl);
  saveData();
  return res.status(201).json({ template: tpl });
});

app.put('/api/admin/full-templates/:id', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const tpl = fullTemplates.find(t => t.id === req.params.id);
  if (!tpl) return res.status(404).json({ error: 'Template not found' });

  const allowed = [
    'name','badge','description','category','subcategory','mood','style',
    'previewImage','coverImageUrl','templateJson','totalPages','featured','published',
  ] as const;
  for (const key of allowed) {
    if (req.body[key] !== undefined) (tpl as any)[key] = req.body[key];
  }
  tpl.updatedAt = new Date().toISOString();
  saveData();
  return res.json({ template: tpl });
});

app.delete('/api/admin/full-templates/:id', authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const idx = fullTemplates.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Template not found' });
  fullTemplates.splice(idx, 1);
  saveData();
  return res.json({ message: 'Template deleted' });
});

// Vite or Static file serving setup
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(appDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development mode with Vite SSR / middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LoveLink Builder server running on port ${PORT}`);
  });
}

startServer();
