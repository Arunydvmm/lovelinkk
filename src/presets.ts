import { AwardType, CertificateType } from './types';

export interface MusicPreset {
  id: string;
  name: string;
  artist: string;
  url: string;
  duration: string;
}

export interface StoryTemplate {
  id: string;
  badge: string;
  badgeBg: string;
  title: string;
  description: string;
  creatorName: string;
  partnerName: string;
  coverImage: string;
  welcomeMessage: string;
  loveLetter: string;
  finalMessage: string;
  reasons: string[];
  award: AwardType;
  musicTrackName: string;
  musicTrackUrl: string;
  memoryImages: {
    url: string;
    caption: string;
    date: string;
  }[];
}

// Romantic royalty-free audio tracks
export const PRESET_MUSIC_TRACKS: MusicPreset[] = [
  {
    id: 'preset-1',
    name: 'Acoustic Piano Serenade',
    artist: 'LoveLink Romantic Collection',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=piano-moment-114227.mp3',
    duration: '2:15',
  },
  {
    id: 'preset-2',
    name: 'Sweet Ukulele & Strings',
    artist: 'LoveLink Acoustic Beats',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b7468161.mp3?filename=romantic-acoustic-guitar-10822.mp3',
    duration: '2:40',
  },
  {
    id: 'preset-3',
    name: 'Dreamy Lofi Love Melodies',
    artist: 'Chill Valentines',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=sweet-love-12128.mp3',
    duration: '2:05',
  },
  {
    id: 'preset-4',
    name: 'Violin Love Story',
    artist: 'Classic Romance Orchestra',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9932785d1d.mp3?filename=romantic-piano-and-strings-124806.mp3',
    duration: '3:10',
  },
  {
    id: 'preset-5',
    name: 'Cinematic Sunset Romance',
    artist: 'LoveLink Symphonic',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8b18a6e84.mp3?filename=soft-piano-romantic-10237.mp3',
    duration: '2:30',
  },
  {
    id: 'preset-6',
    name: 'Midnight Acoustic Reverie',
    artist: 'Moonlight Duet',
    url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_c6f2a8397a.mp3?filename=romantic-guitar-11933.mp3',
    duration: '2:50',
  }
];

export const SAMPLE_MEMORY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop',
    caption: 'Our first romantic sunset walk by the beach',
    date: 'Summer 2024',
  },
  {
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop',
    caption: 'Cozy coffee dates on rainy Sunday mornings',
    date: 'Autumn 2024',
  },
  {
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop',
    caption: 'The unforgettable weekend stargazing trip',
    date: 'Winter 2024',
  },
  {
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop',
    caption: 'Laughing together at our favorite rooftop restaurant',
    date: 'Spring 2025',
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
    caption: 'Your glowing smile that makes my heart skip a beat every time',
    date: 'Recent Memory',
  },
  {
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop',
    caption: 'Holding hands while exploring hidden city alleyways',
    date: 'Summer 2024',
  },
  {
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop',
    caption: 'Celebrating our sweet milestones with cake & candlelight',
    date: 'Anniversary Special',
  },
  {
    url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1000&auto=format&fit=crop',
    caption: 'Dancing under fairy lights in the garden',
    date: 'Magical Night',
  },
  {
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1000&auto=format&fit=crop',
    caption: 'Sweet morning forehead kisses before starting the day',
    date: 'Everyday Bliss',
  },
  {
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop',
    caption: 'Sharing sweet secret promises for our future',
    date: 'Forever Memory',
  }
];

export const AWARD_OPTIONS: AwardType[] = [
  'Best Girlfriend ❤️',
  'Best Boyfriend ❤️',
  'Best Partner ❤️',
];

/** The 5 certificate types available in the wizard */
export const CERTIFICATE_TYPES: {
  type: CertificateType;
  label: string;
  emoji: string;
  description: string;
}[] = [
  { type: 'Girlfriend', label: 'Girlfriend', emoji: '❤️', description: 'Certificate of Love' },
  { type: 'Boyfriend', label: 'Boyfriend', emoji: '💙', description: 'Certificate of Love' },
  { type: 'Best Friend', label: 'Best Friend (BFF)', emoji: '🌟', description: 'Certificate of Friendship' },
  { type: 'Husband', label: 'Husband', emoji: '💍', description: 'Certificate of Forever' },
  { type: 'Wife', label: 'Wife', emoji: '💍', description: 'Certificate of Forever' },
];

export const SAMPLE_REASONS = [
  'Your smile instantly brightens even my darkest days.',
  'You always listen to me with kindness, warmth, and complete understanding.',
  'Your playful sense of humor and adorable laugh make life so joyous.',
  'You inspire me to be the best version of myself every single day.',
  'In your arms, I have found my safest home and favorite place in the world.',
];

// Pre-designed Story Templates for 1-Click Surprise Creation
export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'anniversary-romance',
    badge: '🌹 Anniversary',
    badgeBg: 'bg-rose-100 text-rose-700',
    title: 'Happy Anniversary, My Love ❤️',
    description: 'Perfect for celebrating months or years of togetherness with nostalgic photos, a romantic letter, and piano melodies.',
    creatorName: 'Priya',
    partnerName: 'Kabir',
    coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop',
    welcomeMessage: 'Welcome to our tiny magical corner of the universe. Every moment spent with you feels like a dream come true.',
    loveLetter: 'Dear Kabir,\n\nFrom the moment you entered my life, everything became brighter, kinder, and infinitely more joyful. You are my safe haven, my best friend, and my greatest blessing.\n\nThank you for every shared laugh, every comforting hug, and for loving me so unconditionally. Happy anniversary, my love!\n\nForever & Always,\nPriya',
    finalMessage: 'Thank you for being mine. I love you endlessly and look forward to building a lifetime of sweet memories together! ❤️',
    reasons: [
      'Your infectious smile instantly brightens my darkest days.',
      'You listen with pure patience, empathy, and complete understanding.',
      'Your gentle playfulness and warm hugs make me feel truly cherished.',
      'You inspire me to dream bigger and grow every single day.',
      'In your arms, I have found my home, my peace, and my heart.'
    ],
    award: 'Best Partner ❤️',
    musicTrackName: 'Acoustic Piano Serenade',
    musicTrackUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=piano-moment-114227.mp3',
    memoryImages: [
      { url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop', caption: 'Our unforgettable sunset walk along the quiet shore.', date: '14 Feb 2024' },
      { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop', caption: 'Late night laughter & warm hot chocolate in winter.', date: '02 Nov 2024' },
      { url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop', caption: 'Stargazing in the mountains on our weekend escape.', date: '20 Dec 2024' },
      { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop', caption: 'Rooftop dinner under twinkling fairy lights.', date: '12 Jan 2025' },
      { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', caption: 'Your bright radiant smile that warms my soul every single day.', date: 'Always' }
    ]
  },
  {
    id: 'birthday-sunshine',
    badge: '🎂 Birthday Special',
    badgeBg: 'bg-amber-100 text-amber-800',
    title: 'Happy Birthday My Sunshine ☀️',
    description: 'A cheerful, bright surprise filled with birthday wishes, cheerful ukulele beats, and heartfelt appreciation.',
    creatorName: 'Aarav',
    partnerName: 'Ananya',
    coverImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop',
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
    award: 'Best Girlfriend ❤️',
    musicTrackName: 'Sweet Ukulele & Strings',
    musicTrackUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b7468161.mp3?filename=romantic-acoustic-guitar-10822.mp3',
    memoryImages: [
      { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop', caption: 'Blowing out the candles together on your special day.', date: 'Birthday Milestone' },
      { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop', caption: 'Our fun weekend trip filled with smiles & road tunes.', date: 'Spring Getaway' },
      { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop', caption: 'Coffee and cake dates at our favorite cozy cafe.', date: 'Weekend Ritual' },
      { url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1000&auto=format&fit=crop', caption: 'Sweet quiet moments of pure happiness together.', date: 'Pure Joy' },
      { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', caption: 'The smile that captured my heart forever.', date: 'Always & Forever' }
    ]
  },
  {
    id: 'long-distance-love',
    badge: '✈️ Long Distance',
    badgeBg: 'bg-indigo-100 text-indigo-800',
    title: 'Miles Apart, Hearts Connected ✈️❤️',
    description: 'Designed for couples bridging the gap across oceans or cities with comforting lofi beats and sweet promises.',
    creatorName: 'Rohan',
    partnerName: 'Maya',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
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
    award: 'Best Partner ❤️',
    musicTrackName: 'Dreamy Lofi Love Melodies',
    musicTrackUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=sweet-love-12128.mp3',
    memoryImages: [
      { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop', caption: 'Our emotional airport embrace before boarding.', date: 'Farewell Hug' },
      { url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop', caption: 'Watching the same sunset from two different cities.', date: 'Shared Sky' },
      { url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop', caption: 'The magical reunion trip when we finally held hands again.', date: 'Reunion Day' },
      { url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop', caption: 'Sweet handwritten notes sent across the miles.', date: 'Letters of Love' },
      { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', caption: 'Your beautiful face smiling on my screen every night.', date: 'Late Night Call' }
    ]
  },
  {
    id: 'proposal-forever',
    badge: '💍 Proposal & Forever',
    badgeBg: 'bg-purple-100 text-purple-800',
    title: 'Will You Marry Me? 💍',
    description: 'An elegant, high-romance proposal theme set to emotional orchestral strings and lifelong promises.',
    creatorName: 'Vikram',
    partnerName: 'Neha',
    coverImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop',
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
    award: 'Best Partner ❤️',
    musicTrackName: 'Violin Love Story',
    musicTrackUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9932785d1d.mp3?filename=romantic-piano-and-strings-124806.mp3',
    memoryImages: [
      { url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop', caption: 'The magical night under the stars where I knew you were the one.', date: 'Magic Night' },
      { url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop', caption: 'Walking hand in hand toward our shared future.', date: 'Walk of Love' },
      { url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1000&auto=format&fit=crop', caption: 'Dancing in the candlelight surrounded by sweet music.', date: 'Slow Dance' },
      { url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop', caption: 'A ring, a promise, and a lifetime of love.', date: 'Forever Promise' },
      { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', caption: 'Your tears of joy that I will cherish forever.', date: 'The Big Yes!' }
    ]
  },
  {
    id: 'valentine-special',
    badge: '💖 Valentine Special',
    badgeBg: 'bg-pink-100 text-pink-800',
    title: 'Be My Valentine Forever 💖',
    description: 'A sweet, adorable surprise perfect for Valentine\'s Day or spontaneous romantic gestures.',
    creatorName: 'Karan',
    partnerName: 'Sofia',
    coverImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop',
    welcomeMessage: 'A sweet Valentine surprise made just for you with love, songs, and all our cute memories.',
    loveLetter: 'Sweet Sofia,\n\nYou are my favorite hello, my morning sunshine, and my sweetest dream come true. Life with you is an unending celebration of love.\n\nThank you for choosing me every single day. Happy Valentine\'s Day, my gorgeous girl!\n\nAll my love,\nKaran',
    finalMessage: 'You hold the key to my heart today, tomorrow, and for all eternity! 💖',
    reasons: [
      'Your cute adorable smile that melts my heart instantly.',
      'How you remember the tiny little details about what I love.',
      'Your hilarious jokes and contagious laughter.',
      'The sweet warm hugs you give me when I need them most.',
      'Because being your Valentine is the best gift in the world.'
    ],
    award: 'Best Girlfriend ❤️',
    musicTrackName: 'Cinematic Sunset Romance',
    musicTrackUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8b18a6e84.mp3?filename=soft-piano-romantic-10237.mp3',
    memoryImages: [
      { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop', caption: 'Our sweet coffee & flower date on Valentine morning.', date: 'Valentine Day' },
      { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop', caption: 'Laughing over desserts at our favorite candlelit restaurant.', date: 'Sweet Date' },
      { url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop', caption: 'Watching the sunset with chocolate strawberries.', date: 'Sunset Sweets' },
      { url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1000&auto=format&fit=crop', caption: 'A cozy evening wrapped in warm blankets watching movies.', date: 'Movie Night' },
      { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', caption: 'The look in your eyes that says everything words cannot.', date: 'Pure Romance' }
    ]
  }
];

