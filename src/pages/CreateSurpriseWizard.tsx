import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Upload, Music, Sparkles, ChevronRight, ChevronLeft,
  X, Plus, Trash2, Check, Image as ImageIcon, Save, Loader2,
  Calendar, Quote, Smile, Palette, Volume2, Play, Pause,
  Monitor, Tablet, Smartphone, Eye, Gift, Zap, Star,
  AlignLeft, User, Link, Clock, Camera,
} from 'lucide-react';
import { motion as m } from 'framer-motion';
import {
  MemoryImage, SurpriseData, AwardType, CertificateType,
  TimelineEvent, QuoteEntry, InteractiveModuleId,
} from '../types';
import {
  PRESET_MUSIC_TRACKS, SAMPLE_REASONS, STORY_TEMPLATES,
  CERTIFICATE_TYPES, StoryTemplate,
} from '../presets';
import { SurpriseThemeView } from '../components/SurpriseThemeView';
import { SmartImage } from '../components/SmartImage';
import { api } from '../api';
import {
  validateImageFile, compressImage, readFileAsDataUrl, withUploadRetry,
} from '../utils/mediaUpload';

// ─── Constants ────────────────────────────────────────────────

const OCCASIONS = [
  { id: 'anniversary', label: 'Anniversary', emoji: '💑', color: 'from-rose-500 to-pink-500' },
  { id: 'birthday',    label: 'Birthday',    emoji: '🎂', color: 'from-amber-500 to-orange-500' },
  { id: 'valentine',   label: "Valentine's", emoji: '💝', color: 'from-pink-500 to-rose-500' },
  { id: 'proposal',    label: 'Proposal',    emoji: '💍', color: 'from-purple-500 to-indigo-500' },
  { id: 'friendship',  label: 'Friendship',  emoji: '🌟', color: 'from-yellow-500 to-amber-500' },
  { id: 'long-distance', label: 'Long Distance', emoji: '✈️', color: 'from-blue-500 to-cyan-500' },
  { id: 'just-because', label: 'Just Because', emoji: '🌹', color: 'from-rose-400 to-red-500' },
  { id: 'apology',     label: 'Apology',     emoji: '🙏', color: 'from-teal-500 to-green-500' },
];

const RELATIONSHIP_TYPES = ['Girlfriend', 'Boyfriend', 'Wife', 'Husband', 'Best Friend', 'Partner', 'Fiancé', 'Fiancée'];

const INTERACTIVE_MODULES: { id: InteractiveModuleId; label: string; emoji: string; desc: string }[] = [
  { id: 'scratch-card',    label: 'Scratch Card',      emoji: '🎰', desc: 'Recipients scratch to reveal a hidden message' },
  { id: 'flip-cards',      label: 'Flip Cards',        emoji: '🃏', desc: 'Animated reason cards with flip effect' },
  { id: 'confetti',        label: 'Confetti Burst',    emoji: '🎉', desc: 'Celebratory confetti on special moments' },
  { id: 'countdown',       label: 'Countdown Timer',   emoji: '⏳', desc: 'Countdown to your next special date' },
  { id: 'polaroid-stack',  label: 'Polaroid Stack',    emoji: '📷', desc: 'Photos appear as stacked polaroids' },
  { id: 'emoji-rain',      label: 'Emoji Rain',        emoji: '❤️', desc: 'Hearts and emojis rain down the screen' },
  { id: 'typing-animation',label: 'Typing Animation',  emoji: '⌨️', desc: 'Messages appear with a typewriter effect' },
  { id: 'certificate',     label: 'Love Certificate',  emoji: '📜', desc: 'Official certificate of love & affection' },
  { id: 'promise-wall',    label: 'Promise Wall',       emoji: '🤝', desc: 'A wall of sweet promises to your person' },
  { id: 'fireworks',       label: 'Fireworks Finale',  emoji: '🎆', desc: 'Spectacular fireworks at the end' },
  { id: 'photo-carousel',  label: 'Photo Carousel',    emoji: '🎠', desc: 'Auto-rotating memory gallery' },
  { id: 'letter-opening',  label: 'Letter Opening',    emoji: '💌', desc: 'Animated envelope opening experience' },
];

const QUOTE_TYPES: { type: QuoteEntry['type']; label: string; emoji: string }[] = [
  { type: 'quote',       label: 'Favorite Quote', emoji: '💬' },
  { type: 'inside-joke', label: 'Inside Joke',    emoji: '😄' },
  { type: 'promise',     label: 'A Promise',      emoji: '🤞' },
  { type: 'goal',        label: 'Future Goal',    emoji: '🌟' },
];

const TIMELINE_ICONS = ['💑', '🌹', '🎂', '✈️', '🏡', '💍', '🎉', '🌊', '🎵', '🌙', '⭐', '🤝'];

const WIZARD_STEPS = [
  { id: 1, label: 'Details',      icon: '👋', desc: 'Names, occasion & relationship' },
  { id: 2, label: 'Memories',     icon: '📸', desc: 'Upload your photos & cover' },
  { id: 3, label: 'Letter',       icon: '💌', desc: 'Personal message & love letter' },
  { id: 4, label: 'Reasons',      icon: '❤️', desc: 'Why you love them' },
  { id: 5, label: 'Timeline',     icon: '📅', desc: 'Your journey together' },
  { id: 6, label: 'Quotes',       icon: '💬', desc: 'Quotes, jokes & promises' },
  { id: 7, label: 'Music',        icon: '🎵', desc: 'Set the mood with music' },
  { id: 8, label: 'Experiences',  icon: '✨', desc: 'Interactive elements' },
  { id: 9, label: 'Preview',      icon: '🎁', desc: 'Review & publish' },
] as const;

const TOTAL_STEPS = WIZARD_STEPS.length;
const AUTOSAVE_KEY = 'lovelink_wizard_draft_v2';

// ─── Types ────────────────────────────────────────────────────

interface WizardState {
  occasion: string;
  creatorName: string;
  partnerName: string;
  nickname: string;
  relationship: string;
  yearsTogether: string;
  specialDate: string;
  title: string;
  profilePicture: string;
  coverImage: string;
  memories: MemoryImage[];
  welcomeMessage: string;
  headline: string;
  loveLetter: string;
  letterSignature: string;
  finalMessage: string;
  reasons: string[];
  timeline: TimelineEvent[];
  quotes: QuoteEntry[];
  selectedMusic: { type: string; name: string; url: string };
  certificateType: CertificateType;
  recipientName: string;
  presentedBy: string;
  award: AwardType;
  personalMessage: string;
  enabledModules: InteractiveModuleId[];
  countdownDate: string;
}

interface Props {
  initialData?: SurpriseData | null;
  onNavigate: (path: string) => void;
  onGeneratedSuccess: (surprise: SurpriseData) => void;
}

// ─── Helpers ──────────────────────────────────────────────────

function loadDraft(): Partial<WizardState> | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Sub-components ───────────────────────────────────────────

function StepNav({
  onBack, onNext, nextLabel = 'Continue', loading = false, nextDisabled = false,
}: {
  onBack: () => void; onNext: () => void; nextLabel?: string;
  loading?: boolean; nextDisabled?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-5 mt-2 border-t border-slate-800/60">
      <button onClick={onBack}
        className="w-1/4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold flex items-center justify-center gap-1.5 min-h-[48px] transition-colors">
        <ChevronLeft size={14} /> Back
      </button>
      <button onClick={onNext} disabled={nextDisabled || loading}
        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 min-h-[48px] shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? 'Uploading…' : nextLabel}
        {!loading && <ChevronRight size={16} />}
      </button>
    </div>
  );
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
      {children}
      {optional && <span className="text-slate-500 font-normal ml-1">(optional)</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 input-glow transition-all ${className}`} />
  );
}

// ─── Main Component ───────────────────────────────────────────

export const CreateSurpriseWizard: React.FC<Props> = ({
  initialData, onNavigate, onGeneratedSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [autosaveTs, setAutosaveTs] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingMemories, setUploadingMemories] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadDone, setUploadDone] = useState(0);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const [memoriesDragOver, setMemoriesDragOver] = useState(false);
  const [cloudinaryEnabled, setCloudinaryEnabled] = useState<boolean | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [musicPreviewId, setMusicPreviewId] = useState<string | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // Always-mounted file input refs
  const coverInputRef    = useRef<HTMLInputElement>(null);
  const profileInputRef  = useRef<HTMLInputElement>(null);
  const memoriesInputRef = useRef<HTMLInputElement>(null);
  const timelinePhotoRef = useRef<HTMLInputElement>(null);
  const [activeTimelinePhotoIdx, setActiveTimelinePhotoIdx] = useState<number | null>(null);

  const memoriesRef = useRef<MemoryImage[]>([]);

  useEffect(() => {
    api.getUploadStatus()
      .then(s => setCloudinaryEnabled(s.cloudinaryEnabled))
      .catch(() => setCloudinaryEnabled(false));
  }, []);

  const draft = initialData ? null : loadDraft();

  // ─── State ────────────────────────────────────────────────
  const [occasion,       setOccasion]       = useState(initialData?.occasion    ?? draft?.occasion    ?? '');
  const [creatorName,    setCreatorName]    = useState(initialData?.creatorName  ?? draft?.creatorName ?? '');
  const [partnerName,    setPartnerName]    = useState(initialData?.partnerName  ?? draft?.partnerName ?? '');
  const [nickname,       setNickname]       = useState(initialData?.nickname     ?? draft?.nickname    ?? '');
  const [relationship,   setRelationship]   = useState(initialData?.relationship ?? draft?.relationship ?? 'Partner');
  const [yearsTogether,  setYearsTogether]  = useState(String(initialData?.yearsTogether ?? draft?.yearsTogether ?? ''));
  const [specialDate,    setSpecialDate]    = useState(initialData?.specialDate  ?? draft?.specialDate ?? '');
  const [title,          setTitle]          = useState(initialData?.title        ?? draft?.title       ?? 'Our Love Story ❤️');
  const [profilePicture, setProfilePicture] = useState(initialData?.profilePicture ?? draft?.profilePicture ?? '');
  const [coverImage,     setCoverImage]     = useState(initialData?.coverImage   ?? draft?.coverImage  ?? '');
  const [memories,       setMemories]       = useState<MemoryImage[]>(initialData?.memoryImages ?? draft?.memories ?? []);
  const [welcomeMessage, setWelcomeMessage] = useState(initialData?.welcomeMessage ?? draft?.welcomeMessage ?? 'Welcome to our special digital surprise ❤️');
  const [headline,       setHeadline]       = useState(initialData?.headline     ?? draft?.headline    ?? '');
  const [loveLetter,     setLoveLetter]     = useState(initialData?.loveLetter   ?? draft?.loveLetter  ?? 'You are the best part of my life. Every single moment spent with you is a treasure I hold close to my heart.\n\nThank you for choosing me, every single day.');
  const [letterSignature, setLetterSignature] = useState(initialData?.letterSignature ?? draft?.letterSignature ?? '');
  const [finalMessage,   setFinalMessage]   = useState(initialData?.finalMessage ?? draft?.finalMessage ?? 'Thank you for being mine. I love you endlessly! ❤️');
  const [reasons,        setReasons]        = useState<string[]>(initialData?.reasons ?? draft?.reasons ?? SAMPLE_REASONS.slice(0, 5));
  const [timeline,       setTimeline]       = useState<TimelineEvent[]>(initialData?.timeline ?? draft?.timeline ?? []);
  const [quotes,         setQuotes]         = useState<QuoteEntry[]>(initialData?.quotes ?? draft?.quotes ?? []);
  const [certificateType, setCertificateType] = useState<CertificateType>(initialData?.certificate?.certificateType ?? draft?.certificateType ?? 'Girlfriend');
  const [recipientName,  setRecipientName]  = useState(initialData?.certificate?.recipientName ?? draft?.recipientName ?? '');
  const [presentedBy,    setPresentedBy]    = useState(initialData?.certificate?.presentedBy ?? draft?.presentedBy ?? '');
  const [award,          setAward]          = useState<AwardType>(initialData?.certificate?.award ?? draft?.award ?? 'Best Girlfriend ❤️');
  const [personalMessage, setPersonalMessage] = useState(initialData?.certificate?.personalMessage ?? draft?.personalMessage ?? '');
  const [selectedMusic,  setSelectedMusic]  = useState(initialData?.music ?? draft?.selectedMusic ?? { type: 'preset', name: PRESET_MUSIC_TRACKS[0].name, url: PRESET_MUSIC_TRACKS[0].url });
  const [enabledModules, setEnabledModules] = useState<InteractiveModuleId[]>(initialData?.enabledModules ?? draft?.enabledModules ?? ['flip-cards', 'confetti', 'certificate', 'fireworks']);
  const [countdownDate,  setCountdownDate]  = useState(initialData?.countdownDate ?? draft?.countdownDate ?? '');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // keep memoriesRef fresh
  useEffect(() => { memoriesRef.current = memories; }, [memories]);

  // ─── Autosave ────────────────────────────────────────────
  useEffect(() => {
    if (initialData) return;
    const s: WizardState = {
      occasion, creatorName, partnerName, nickname, relationship,
      yearsTogether, specialDate, title, profilePicture, coverImage, memories,
      welcomeMessage, headline, loveLetter, letterSignature, finalMessage, reasons,
      timeline, quotes, selectedMusic, certificateType, recipientName,
      presentedBy, award, personalMessage, enabledModules, countdownDate,
    };
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(s));
      setAutosaveTs(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch { /* quota */ }
  }, [
    occasion, creatorName, partnerName, nickname, relationship,
    yearsTogether, specialDate, title, profilePicture, coverImage, memories,
    welcomeMessage, headline, loveLetter, letterSignature, finalMessage, reasons,
    timeline, quotes, selectedMusic, certificateType, recipientName,
    presentedBy, award, personalMessage, enabledModules, countdownDate, initialData,
  ]);

  // ─── Template apply ──────────────────────────────────────
  const handleApplyTemplate = (tmpl: StoryTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setTitle(tmpl.title);
    setWelcomeMessage(tmpl.welcomeMessage);
    setLoveLetter(tmpl.loveLetter);
    setFinalMessage(tmpl.finalMessage);
    setReasons([...tmpl.reasons]);
    setAward(tmpl.award);
    if (!creatorName) setCreatorName(tmpl.creatorName);
    if (!partnerName) setPartnerName(tmpl.partnerName);
    setRecipientName(partnerName || tmpl.partnerName);
    setPresentedBy(creatorName || tmpl.creatorName);
    setSelectedMusic({ type: 'preset', name: tmpl.musicTrackName, url: tmpl.musicTrackUrl });
  };

  // ─── Upload helpers ───────────────────────────────────────
  const uploadSingleImage = useCallback(async (
    file: File,
    onUrl: (url: string) => void,
    setUploading: (v: boolean) => void,
  ) => {
    const err = validateImageFile(file);
    if (err) { setUploadError(err); return; }
    setUploadError('');
    setUploading(true);
    setUploadProgress(5);
    try {
      const compressed = await compressImage(file);
      const dataUrl    = await readFileAsDataUrl(compressed);
      const { url }    = await withUploadRetry(() => api.uploadMedia(dataUrl, 'image'));
      onUrl(url);
      setUploadProgress(100);
    } catch (e: any) {
      setUploadError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 400);
    }
  }, []);

  const uploadMemoryFiles = useCallback(async (files: File[]) => {
    setUploadError('');
    const slotsLeft = 20 - memoriesRef.current.length;
    const toUpload  = files.slice(0, slotsLeft);
    if (toUpload.length === 0) { setUploadError('Maximum 20 photos already added.'); return; }
    for (const f of toUpload) {
      const e = validateImageFile(f);
      if (e) { setUploadError(e); return; }
    }
    setUploadTotal(toUpload.length);
    setUploadDone(0);
    setUploadProgress(2);
    setUploadingMemories(true);
    try {
      const uploaded: MemoryImage[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        const compressed = await compressImage(toUpload[i]);
        const dataUrl    = await readFileAsDataUrl(compressed);
        const { url }    = await withUploadRetry(() => api.uploadMedia(dataUrl, 'image'));
        uploaded.push({ id: `mem_${uid()}`, url, caption: 'Our special memory', date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) });
        setUploadDone(i + 1);
        setUploadProgress(Math.round(((i + 1) / toUpload.length) * 100));
      }
      setMemories(prev => [...prev, ...uploaded]);
    } catch (e: any) {
      setUploadError(e.message || 'Upload failed');
    } finally {
      setUploadingMemories(false);
      setTimeout(() => { setUploadProgress(0); setUploadTotal(0); setUploadDone(0); }, 400);
    }
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (f) uploadSingleImage(f, setCoverImage, setUploadingCover);
  };
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (f) uploadSingleImage(f, setProfilePicture, setUploadingProfile);
  };
  const handleMemoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []); e.target.value = '';
    if (files.length) uploadMemoryFiles(files);
  };
  const handleTimelinePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f || activeTimelinePhotoIdx === null) return;
    const idx = activeTimelinePhotoIdx;
    uploadSingleImage(f, (url) => {
      setTimeline(prev => prev.map((ev, i) => i === idx ? { ...ev, photo: url } : ev));
    }, setUploadingCover);
  };

  // Music preview
  const toggleMusicPreview = (track: typeof PRESET_MUSIC_TRACKS[0]) => {
    if (musicPreviewId === track.id) {
      musicAudioRef.current?.pause();
      setMusicPreviewId(null);
    } else {
      if (musicAudioRef.current) musicAudioRef.current.pause();
      const audio = new Audio(track.url);
      audio.volume = 0.5;
      audio.play().catch(() => {});
      musicAudioRef.current = audio;
      setMusicPreviewId(track.id);
      audio.onended = () => setMusicPreviewId(null);
    }
  };

  useEffect(() => () => { musicAudioRef.current?.pause(); }, []);

  // ─── Navigation ───────────────────────────────────────────
  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setStep(s => Math.max(s - 1, 1));

  const validateAndNext = () => {
    if (step === 1) {
      if (!creatorName.trim() || !partnerName.trim()) {
        return alert('Please enter your name and your partner\'s name.');
      }
    }
    if (step === 2 && memories.length === 0) {
      return alert('Please upload at least 1 memory photo before continuing.');
    }
    goNext();
  };

  // ─── Publish ──────────────────────────────────────────────
  const handlePublish = async () => {
    setLoading(true);
    try {
      const payload: Partial<SurpriseData> = {
        creatorName: creatorName || 'Someone Special',
        partnerName: partnerName || 'You',
        title: title || 'Our Love Story ❤️',
        coverImage: coverImage || memories[0]?.url || '',
        memoryImages: memories,
        welcomeMessage,
        loveLetter,
        finalMessage,
        reasons: reasons.slice(0, 15),
        certificate: {
          recipientName: recipientName || partnerName || 'My Love',
          presentedBy:   presentedBy   || creatorName  || 'Me',
          award,
          certificateType,
          personalMessage: personalMessage || undefined,
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        },
        music: selectedMusic,
        // extended
        nickname,
        relationship,
        occasion,
        specialDate,
        yearsTogether: yearsTogether ? Number(yearsTogether) : undefined,
        profilePicture: profilePicture || undefined,
        headline: headline || undefined,
        letterSignature: letterSignature || undefined,
        timeline:  timeline.length  ? timeline  : undefined,
        quotes:    quotes.length    ? quotes    : undefined,
        enabledModules,
        countdownDate: countdownDate || undefined,
      };
      let result: SurpriseData;
      if (initialData?.id) {
        result = await api.updateSurprise(initialData.id, payload);
      } else {
        result = await api.createSurprise(payload);
        try { localStorage.removeItem(AUTOSAVE_KEY); } catch { /**/ }
      }
      onGeneratedSuccess(result);
    } catch (e: any) {
      alert(e.message || 'Failed to publish. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Live preview data ────────────────────────────────────
  const draftSurprise: SurpriseData = {
    id: 'draft', userId: 'current',
    creatorName: creatorName || 'Priya',
    partnerName: partnerName || 'Kabir',
    title: title || 'Our Love Story ❤️',
    coverImage: coverImage || memories[0]?.url,
    memoryImages: memories,
    welcomeMessage, loveLetter, finalMessage, reasons,
    certificate: {
      recipientName: recipientName || partnerName || 'Kabir',
      presentedBy:   presentedBy   || creatorName  || 'Priya',
      award, certificateType,
      personalMessage: personalMessage || undefined,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    },
    music: selectedMusic,
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nickname, relationship, occasion, specialDate,
    yearsTogether: yearsTogether ? Number(yearsTogether) : undefined,
    profilePicture: profilePicture || undefined,
    headline: headline || undefined,
    letterSignature: letterSignature || undefined,
    timeline, quotes, enabledModules, countdownDate: countdownDate || undefined,
  };

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Always-mounted hidden file inputs */}
      <input ref={coverInputRef}    type="file" accept="image/*"                                  className="hidden" onChange={handleCoverChange} />
      <input ref={profileInputRef}  type="file" accept="image/*"                                  className="hidden" onChange={handleProfileChange} />
      <input ref={memoriesInputRef} type="file" accept="image/*" multiple                         className="hidden" onChange={handleMemoriesChange} />
      <input ref={timelinePhotoRef} type="file" accept="image/*"                                  className="hidden" onChange={handleTimelinePhotoChange} />

      {/* ─── Header Progress Bar ─── */}
      <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          {/* Mobile: compact step label */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{WIZARD_STEPS[step - 1].icon}</span>
              <div>
                <p className="text-xs font-bold text-white leading-tight">{WIZARD_STEPS[step - 1].label}</p>
                <p className="text-[10px] text-slate-500 hidden sm:block">{WIZARD_STEPS[step - 1].desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {autosaveTs && !initialData && (
                <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500">
                  <Save size={9} /> {autosaveTs}
                </span>
              )}
              <span className="text-xs font-bold text-rose-400">{step}/{TOTAL_STEPS}</span>
            </div>
          </div>

          {/* Step dots + progress bar */}
          <div className="flex items-center gap-1 mb-1.5">
            {WIZARD_STEPS.map(s => (
              <button key={s.id} onClick={() => s.id < step && setStep(s.id)}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  s.id < step  ? 'bg-rose-600 cursor-pointer hover:bg-rose-500' :
                  s.id === step ? 'bg-gradient-to-r from-rose-500 to-pink-500' :
                  'bg-slate-800'
                }`} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Step Content ─── */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">

          {/* ═══════════ STEP 1: DETAILS ═══════════ */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="max-w-xl mx-auto space-y-6">

              {/* Occasion chooser */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-extrabold text-white flex items-center justify-center gap-2">
                    <Gift size={20} className="text-rose-400" /> Choose Occasion
                  </h2>
                  <p className="text-xs text-slate-400">What's the special reason?</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {OCCASIONS.map(occ => (
                    <button key={occ.id} type="button" onClick={() => setOccasion(occ.id)}
                      className={`occasion-card p-3 rounded-2xl border-2 text-center transition-all ${
                        occasion === occ.id
                          ? `border-rose-500 bg-rose-950/60 shadow-lg shadow-rose-900/30 selected`
                          : 'border-slate-700 bg-slate-800/60 hover:border-rose-500/40'
                      }`}>
                      <div className="text-2xl mb-1">{occ.emoji}</div>
                      <p className={`text-[11px] font-bold ${occasion === occ.id ? 'text-rose-300' : 'text-slate-300'}`}>
                        {occ.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Names & details */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User size={16} className="text-rose-400" /> About You & Your Person
                </h3>

                {/* Quick-start templates */}
                <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-rose-500/20 space-y-2.5">
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={11} /> Quick-start Templates
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STORY_TEMPLATES.map(tmpl => (
                      <button key={tmpl.id} type="button" onClick={() => handleApplyTemplate(tmpl)}
                        className={`p-2.5 rounded-xl text-left border transition-all text-xs space-y-1 ${
                          selectedTemplateId === tmpl.id
                            ? 'bg-rose-950/60 border-rose-500 text-white scale-[1.02]'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-rose-400'
                        }`}>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tmpl.badgeBg}`}>{tmpl.badge}</span>
                        <p className="font-semibold leading-tight line-clamp-1">{tmpl.title}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Your Name *</FieldLabel>
                    <TextInput value={creatorName} onChange={v => { setCreatorName(v); if (!presentedBy) setPresentedBy(v); }} placeholder="e.g. Priya" />
                  </div>
                  <div>
                    <FieldLabel>Their Name *</FieldLabel>
                    <TextInput value={partnerName} onChange={v => { setPartnerName(v); if (!recipientName) setRecipientName(v); }} placeholder="e.g. Kabir" />
                  </div>
                  <div>
                    <FieldLabel optional>Nickname / Pet Name</FieldLabel>
                    <TextInput value={nickname} onChange={setNickname} placeholder="e.g. Pookie, Babe" />
                  </div>
                  <div>
                    <FieldLabel>Relationship</FieldLabel>
                    <select value={relationship} onChange={e => setRelationship(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white input-glow transition-all">
                      {RELATIONSHIP_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <FieldLabel optional>Years Together</FieldLabel>
                    <TextInput value={yearsTogether} onChange={setYearsTogether} placeholder="e.g. 3" />
                  </div>
                  <div>
                    <FieldLabel optional>Special Date</FieldLabel>
                    <input type="date" value={specialDate} onChange={e => setSpecialDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white input-glow transition-all" />
                  </div>
                </div>
                <div>
                  <FieldLabel>Website Title</FieldLabel>
                  <TextInput value={title} onChange={setTitle} placeholder="Our Love Story ❤️" />
                </div>
                <div>
                  <FieldLabel>Welcome Message</FieldLabel>
                  <TextInput value={welcomeMessage} onChange={setWelcomeMessage} placeholder="Welcome to our special place ❤️" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => onNavigate('/dashboard')}
                  className="w-1/3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold min-h-[48px] transition-colors">
                  Cancel
                </button>
                <button onClick={validateAndNext}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-sm font-bold text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 min-h-[48px] transition-all active:scale-[0.98]">
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════ STEP 2: MEMORIES & COVER ═══════════ */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto space-y-5">

              {cloudinaryEnabled === false && (
                <div className="px-4 py-3 bg-slate-800/80 border border-amber-500/30 text-amber-300 text-xs rounded-xl">
                  ℹ️ <strong>Dev mode</strong> — Cloudinary not configured. Uploads work but are saved as base64 data.
                </div>
              )}
              {uploadError && (
                <div className="px-4 py-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs rounded-xl">{uploadError}</div>
              )}

              {/* Cover + Profile side by side */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Camera size={16} className="text-rose-400" /> Cover & Profile Photo
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cover image */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-semibold">Cover Photo <span className="text-slate-600">(optional)</span></p>
                    <div onDrop={e => { e.preventDefault(); setCoverDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) uploadSingleImage(f, setCoverImage, setUploadingCover); }}
                      onDragOver={e => { e.preventDefault(); setCoverDragOver(true); }}
                      onDragLeave={() => setCoverDragOver(false)}
                      onClick={() => !uploadingCover && !coverImage && coverInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all ${
                        coverDragOver ? 'border-rose-400 bg-rose-950/30' :
                        coverImage    ? 'border-rose-500/40 cursor-default' :
                        'border-slate-700 hover:border-rose-500/50 cursor-pointer'
                      }`} style={{ aspectRatio: '16/9' }}>
                      {uploadingCover ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                          <Loader2 size={24} className="animate-spin text-rose-400" />
                        </div>
                      ) : coverImage ? (
                        <>
                          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                          <button type="button" onClick={e => { e.stopPropagation(); setCoverImage(''); }}
                            className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full shadow-md">
                            <X size={12} />
                          </button>
                          <button type="button" onClick={e => { e.stopPropagation(); coverInputRef.current?.click(); }}
                            className="absolute bottom-2 right-2 px-2.5 py-1.5 bg-black/60 text-white text-[10px] font-bold rounded-full">
                            Change
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
                          <ImageIcon size={28} className="text-rose-400/60" />
                          <p className="text-xs text-slate-400">Tap to upload cover</p>
                          <p className="text-[10px] text-slate-600">Defaults to first memory photo</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile picture */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-semibold">Profile Picture <span className="text-slate-600">(optional)</span></p>
                    <div onClick={() => !uploadingProfile && profileInputRef.current?.click()}
                      className="relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer hover:border-rose-500/50 transition-all border-slate-700"
                      style={{ aspectRatio: '1/1', maxWidth: '160px' }}>
                      {uploadingProfile ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                          <Loader2 size={20} className="animate-spin text-rose-400" />
                        </div>
                      ) : profilePicture ? (
                        <>
                          <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                          <button type="button" onClick={e => { e.stopPropagation(); setProfilePicture(''); }}
                            className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full">
                            <X size={10} />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2 p-3 text-center">
                          <User size={24} className="text-rose-400/60" />
                          <p className="text-[11px] text-slate-400">Profile photo</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory photos upload zone */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon size={16} className="text-rose-400" /> Memory Photos
                  </h3>
                  <span className="text-xs text-slate-400">{memories.length}/20 photos</span>
                </div>

                <div onDrop={e => { e.preventDefault(); setMemoriesDragOver(false); const files = Array.from(e.dataTransfer.files ?? []); if (files.length) uploadMemoryFiles(files); }}
                  onDragOver={e => { e.preventDefault(); setMemoriesDragOver(true); }}
                  onDragLeave={() => setMemoriesDragOver(false)}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center space-y-3 transition-all ${
                    memoriesDragOver     ? 'border-rose-400 bg-rose-950/30 scale-[1.01]' :
                    uploadingMemories    ? 'border-rose-500/40 bg-slate-800/40' :
                    'border-rose-500/30 bg-rose-950/10 hover:border-rose-500/60'
                  }`}>
                  {uploadingMemories ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-white">
                          {uploadDone < uploadTotal ? `Photo ${uploadDone + 1} of ${uploadTotal}` : `${uploadTotal} photos uploaded ✓`}
                        </span>
                        <span className="text-rose-400 font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-rose-600 to-pink-500 rounded-full"
                          animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
                      </div>
                      <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                        <Loader2 size={12} className="animate-spin text-rose-400" /> Compressing & uploading…
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="mx-auto text-rose-400/70" />
                      <div>
                        <p className="text-sm font-bold text-white">
                          {memoriesDragOver ? '✦ Drop photos here!' : 'Drag & drop your photos here'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP — up to 20 photos, 10MB each</p>
                      </div>
                      <button type="button" onClick={() => memoriesInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md min-h-[40px] transition-colors">
                        <Upload size={14} /> Choose Photos
                      </button>
                    </>
                  )}
                </div>

                {/* Photo grid */}
                {memories.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {memories.map((mem, idx) => (
                      <div key={mem.id || idx} className="relative group rounded-xl overflow-hidden bg-slate-800 border border-slate-700" style={{ aspectRatio: '1' }}>
                        <SmartImage src={mem.url} alt="Memory" className="w-full h-full" rootMargin="200px" />
                        <button type="button" onClick={() => setMemories(memories.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                          <X size={10} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent">
                          <input value={mem.caption || ''} onChange={e => {
                            const updated = [...memories]; updated[idx].caption = e.target.value; setMemories(updated);
                          }} placeholder="Caption…"
                            className="w-full bg-transparent text-[10px] text-white placeholder-white/40 border-b border-white/20 focus:outline-none focus:border-white/60" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <StepNav onBack={goBack} onNext={validateAndNext} loading={uploadingMemories || uploadingCover} />
            </motion.div>
          )}

          {/* ═══════════ STEP 3: LOVE LETTER ═══════════ */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="max-w-xl mx-auto space-y-5">

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Heart size={20} className="text-rose-400 fill-rose-400" /> Personal Message
                </h2>

                <div>
                  <FieldLabel optional>Headline / Tagline</FieldLabel>
                  <TextInput value={headline} onChange={setHeadline} placeholder="e.g. Every moment with you is magic ✨" />
                </div>

                <div>
                  <FieldLabel>Love Letter *</FieldLabel>
                  <textarea rows={8} value={loveLetter} onChange={e => setLoveLetter(e.target.value)}
                    placeholder={`My Dearest ${partnerName || 'Love'},\n\nFrom the moment you walked into my life…`}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 resize-none input-glow font-serif leading-relaxed" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel optional>Signature</FieldLabel>
                    <TextInput value={letterSignature} onChange={setLetterSignature}
                      placeholder={`With love, ${creatorName || 'Me'}`} />
                  </div>
                  <div>
                    <FieldLabel optional>Final Closing Message</FieldLabel>
                    <TextInput value={finalMessage} onChange={setFinalMessage}
                      placeholder="Thank you for being mine ❤️" />
                  </div>
                </div>
              </div>

              <StepNav onBack={goBack} onNext={goNext} />
            </motion.div>
          )}

          {/* ═══════════ STEP 4: REASONS ═══════════ */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="max-w-xl mx-auto space-y-5">

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Heart size={20} className="text-rose-400 fill-rose-400" /> Reasons I Love You
                  </h2>
                  <span className="text-xs text-slate-400">{reasons.length}/15</span>
                </div>
                <p className="text-xs text-slate-400">These appear as animated flash cards. Add up to 15 reasons.</p>

                <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                  {reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 group">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-600 to-pink-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-2.5 shadow-sm">
                        {idx + 1}
                      </span>
                      <textarea rows={2} value={reason}
                        onChange={e => { const u = [...reasons]; u[idx] = e.target.value; setReasons(u); }}
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white resize-none input-glow focus:border-rose-500 transition-all" />
                      <button onClick={() => setReasons(reasons.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-600 hover:text-rose-400 mt-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {reasons.length < 15 && (
                  <button onClick={() => setReasons([...reasons, 'You make my world a better place every single day.'])}
                    className="w-full py-2.5 rounded-xl border border-dashed border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-950/30 hover:border-rose-500/50 flex items-center justify-center gap-1.5 transition-all">
                    <Plus size={14} /> Add Reason ({reasons.length}/15)
                  </button>
                )}
              </div>

              <StepNav onBack={goBack} onNext={goNext} />
            </motion.div>
          )}

          {/* ═══════════ STEP 5: TIMELINE ═══════════ */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="max-w-xl mx-auto space-y-5">

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Calendar size={20} className="text-rose-400" /> Our Journey
                  </h2>
                  <button onClick={() => {
                    const newEv: TimelineEvent = { id: uid(), title: '', date: '', description: '', icon: '💑', color: 'rose' };
                    setTimeline(prev => [...prev, newEv]);
                  }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors">
                    <Plus size={14} /> Add Event
                  </button>
                </div>
                <p className="text-xs text-slate-400">Add unlimited events. Each appears as an animated timeline entry.</p>

                {timeline.length === 0 && (
                  <div className="text-center py-8 space-y-3">
                    <Calendar size={36} className="mx-auto text-slate-600" />
                    <p className="text-sm text-slate-400">No events yet. Add your first milestone!</p>
                    <button onClick={() => setTimeline([
                      { id: uid(), title: 'The Day We Met', date: '', description: 'The beginning of our beautiful story…', icon: '💑', color: 'rose' },
                    ])}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-rose-300 font-bold transition-colors">
                      + Add First Event
                    </button>
                  </div>
                )}

                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                  {timeline.map((ev, idx) => (
                    <div key={ev.id} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3 relative">
                      <button onClick={() => setTimeline(timeline.filter(e => e.id !== ev.id))}
                        className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-rose-400 transition-colors">
                        <X size={14} />
                      </button>

                      {/* Icon picker */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-400">Icon:</span>
                        {TIMELINE_ICONS.map(icon => (
                          <button key={icon} type="button" onClick={() => setTimeline(timeline.map((e, i) => i === idx ? { ...e, icon } : e))}
                            className={`text-lg p-1 rounded-lg transition-all ${ev.icon === icon ? 'bg-rose-600/30 ring-2 ring-rose-500' : 'hover:bg-slate-700'}`}>
                            {icon}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <FieldLabel>Event Title</FieldLabel>
                          <TextInput value={ev.title} onChange={v => setTimeline(timeline.map((e, i) => i === idx ? { ...e, title: v } : e))} placeholder="e.g. First Date" />
                        </div>
                        <div>
                          <FieldLabel>Date</FieldLabel>
                          <input type="date" value={ev.date}
                            onChange={e => setTimeline(timeline.map((ev2, i) => i === idx ? { ...ev2, date: e.target.value } : ev2))}
                            className="w-full px-3 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white input-glow transition-all" />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Description</FieldLabel>
                        <textarea rows={2} value={ev.description}
                          onChange={e => setTimeline(timeline.map((ev2, i) => i === idx ? { ...ev2, description: e.target.value } : ev2))}
                          placeholder="Describe this special moment…"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white resize-none input-glow transition-all" />
                      </div>

                      {/* Event photo */}
                      <div>
                        <FieldLabel optional>Photo</FieldLabel>
                        {ev.photo ? (
                          <div className="relative h-24 rounded-xl overflow-hidden">
                            <img src={ev.photo} alt="Event" className="w-full h-full object-cover" />
                            <button onClick={() => setTimeline(timeline.map((e, i) => i === idx ? { ...e, photo: undefined } : e))}
                              className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full">
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => { setActiveTimelinePhotoIdx(idx); timelinePhotoRef.current?.click(); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 font-semibold transition-colors">
                            <Camera size={12} /> Add Photo
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <StepNav onBack={goBack} onNext={goNext} nextLabel={timeline.length === 0 ? 'Skip Timeline' : 'Continue'} />
            </motion.div>
          )}

          {/* ═══════════ STEP 6: QUOTES ═══════════ */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="max-w-xl mx-auto space-y-5">

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Quote size={20} className="text-rose-400" /> Quotes & Promises
                  </h2>
                </div>
                <p className="text-xs text-slate-400">Add your favorite quotes, inside jokes, sweet promises and future goals.</p>

                {/* Type pills */}
                <div className="flex flex-wrap gap-2">
                  {QUOTE_TYPES.map(qt => (
                    <button key={qt.type} onClick={() => {
                      const newQ: QuoteEntry = { id: uid(), type: qt.type, text: '', emoji: qt.emoji };
                      setQuotes(prev => [...prev, newQ]);
                    }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-rose-600/30 border border-slate-700 hover:border-rose-500/50 text-xs font-semibold text-slate-300 hover:text-white transition-all">
                      <span>{qt.emoji}</span> + {qt.label}
                    </button>
                  ))}
                </div>

                {quotes.length === 0 && (
                  <div className="text-center py-8 space-y-2">
                    <Quote size={36} className="mx-auto text-slate-600" />
                    <p className="text-sm text-slate-400">No entries yet. Add a quote, joke or promise above!</p>
                  </div>
                )}

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {quotes.map((q, idx) => {
                    const qType = QUOTE_TYPES.find(qt => qt.type === q.type);
                    return (
                      <div key={q.id} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                            {qType?.emoji} {qType?.label}
                          </span>
                          <button onClick={() => setQuotes(quotes.filter(e => e.id !== q.id))}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                        <textarea rows={3} value={q.text}
                          onChange={e => setQuotes(quotes.map((qe, i) => i === idx ? { ...qe, text: e.target.value } : qe))}
                          placeholder={
                            q.type === 'quote'       ? 'Enter your favorite quote…' :
                            q.type === 'inside-joke' ? 'Our funniest memory or inside joke…' :
                            q.type === 'promise'     ? 'I promise to always…' :
                            'One day we will…'
                          }
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white resize-none input-glow font-serif italic" />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <FieldLabel optional>Author / Source</FieldLabel>
                            <TextInput value={q.author || ''} onChange={v => setQuotes(quotes.map((qe, i) => i === idx ? { ...qe, author: v } : qe))} placeholder="— Author" />
                          </div>
                          <div>
                            <FieldLabel optional>Emoji</FieldLabel>
                            <TextInput value={q.emoji || ''} onChange={v => setQuotes(quotes.map((qe, i) => i === idx ? { ...qe, emoji: v } : qe))} placeholder="💬" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <StepNav onBack={goBack} onNext={goNext} nextLabel={quotes.length === 0 ? 'Skip Quotes' : 'Continue'} />
            </motion.div>
          )}

          {/* ═══════════ STEP 7: MUSIC ═══════════ */}
          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="max-w-xl mx-auto space-y-5">

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Music size={20} className="text-rose-400" /> Background Music
                </h2>
                <p className="text-xs text-slate-400">Choose a romantic track that plays throughout the surprise.</p>

                <div className="space-y-2.5">
                  {PRESET_MUSIC_TRACKS.map(track => {
                    const isSelected = selectedMusic.name === track.name;
                    const isPreviewing = musicPreviewId === track.id;
                    return (
                      <div key={track.id} onClick={() => setSelectedMusic({ type: 'preset', name: track.name, url: track.url })}
                        className={`group p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-rose-950/60 border-rose-500 shadow-lg shadow-rose-900/30'
                            : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600'
                        }`}>
                        <button type="button"
                          onClick={e => { e.stopPropagation(); toggleMusicPreview(track); }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-rose-600 hover:text-white'
                          }`}>
                          {isPreviewing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-white truncate">{track.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{track.artist} · {track.duration}</p>
                        </div>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center flex-shrink-0">
                            <Check size={14} className="text-white" />
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {musicPreviewId && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-950/60 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                    <Volume2 size={14} className="animate-pulse" />
                    Previewing — click track again to stop
                  </motion.div>
                )}
              </div>

              <StepNav onBack={goBack} onNext={goNext} />
            </motion.div>
          )}

          {/* ═══════════ STEP 8: INTERACTIVE EXPERIENCES ═══════════ */}
          {step === 8 && (
            <motion.div key="s8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto space-y-5">

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Sparkles size={20} className="text-rose-400" /> Interactive Experiences
                </h2>
                <p className="text-xs text-slate-400">Toggle the interactive elements you want included in the surprise.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {INTERACTIVE_MODULES.map(mod => {
                    const active = enabledModules.includes(mod.id);
                    return (
                      <button key={mod.id} type="button"
                        onClick={() => setEnabledModules(prev =>
                          active ? prev.filter(m => m !== mod.id) : [...prev, mod.id]
                        )}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                          active
                            ? 'bg-rose-950/50 border-rose-500 shadow-md'
                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                        }`}>
                        <span className="text-2xl flex-shrink-0">{mod.emoji}</span>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold leading-tight ${active ? 'text-white' : 'text-slate-300'}`}>
                            {mod.label}
                          </p>
                          <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{mod.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${active ? 'bg-rose-600' : 'bg-slate-700'}`}>
                          {active && <Check size={10} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Countdown date if countdown module is enabled */}
                {enabledModules.includes('countdown') && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-2">
                    <FieldLabel>Countdown Target Date</FieldLabel>
                    <input type="datetime-local" value={countdownDate}
                      onChange={e => setCountdownDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white input-glow transition-all" />
                    <p className="text-[10px] text-slate-500">The countdown timer will count down to this date/time.</p>
                  </motion.div>
                )}

                <div className="flex items-center justify-between px-2">
                  <span className="text-xs text-slate-400">{enabledModules.length} experiences selected</span>
                  <button onClick={() => setEnabledModules(INTERACTIVE_MODULES.map(m => m.id))}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                    Select All
                  </button>
                </div>
              </div>

              <StepNav onBack={goBack} onNext={goNext} nextLabel="Preview & Publish" />
            </motion.div>
          )}

          {/* ═══════════ STEP 9: PREVIEW & PUBLISH ═══════════ */}
          {step === 9 && (
            <motion.div key="s9" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="space-y-6 max-w-5xl mx-auto">

              {/* Device switcher */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Eye size={20} className="text-rose-400" /> Live Preview
                </h2>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  {(['mobile', 'tablet', 'desktop'] as const).map(d => {
                    const Icon = d === 'mobile' ? Smartphone : d === 'tablet' ? Tablet : Monitor;
                    return (
                      <button key={d} onClick={() => setPreviewDevice(d)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          previewDevice === d
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}>
                        <Icon size={14} />
                        <span className="hidden sm:inline capitalize">{d}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Preview frame */}
                <div className="flex-1 flex items-start justify-center overflow-hidden">
                  {previewDevice === 'mobile' && (
                    <div className="device-phone bg-slate-950 overflow-hidden"
                      style={{ width: '320px', height: '620px' }}>
                      <div className="w-full h-full overflow-y-auto">
                        <SurpriseThemeView surprise={draftSurprise} isMobilePreview={true} />
                      </div>
                    </div>
                  )}
                  {previewDevice === 'tablet' && (
                    <div className="device-tablet bg-slate-950 overflow-hidden"
                      style={{ width: '600px', height: '500px' }}>
                      <div className="w-full h-full overflow-y-auto">
                        <SurpriseThemeView surprise={draftSurprise} isMobilePreview={false} />
                      </div>
                    </div>
                  )}
                  {previewDevice === 'desktop' && (
                    <div className="device-desktop bg-slate-950 overflow-hidden w-full"
                      style={{ height: '480px' }}>
                      <div className="w-full h-full overflow-y-auto">
                        <SurpriseThemeView surprise={draftSurprise} isMobilePreview={false} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary + publish panel */}
                <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 flex-shrink-0">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Ready to publish?</span>
                    <h3 className="text-lg font-extrabold text-white">Final Summary</h3>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300">
                    {[
                      { label: 'From',        value: `${creatorName || '—'} → ${partnerName || '—'}` },
                      { label: 'Occasion',    value: OCCASIONS.find(o => o.id === occasion)?.label || 'General' },
                      { label: 'Memories',    value: `${memories.length} photos` },
                      { label: 'Reasons',     value: `${reasons.length} flash cards` },
                      { label: 'Timeline',    value: timeline.length ? `${timeline.length} events` : 'None' },
                      { label: 'Quotes',      value: quotes.length ? `${quotes.length} entries` : 'None' },
                      { label: 'Music',       value: selectedMusic.name },
                      { label: 'Experiences', value: `${enabledModules.length} modules` },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 flex-shrink-0">{r.label}:</span>
                        <span className="font-semibold text-right text-rose-300 truncate max-w-[160px]">{r.value}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={handlePublish} disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/40 flex items-center justify-center gap-2 disabled:opacity-60 min-h-[52px] transition-all active:scale-[0.98]">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {loading ? 'Publishing…' : initialData?.id ? 'Update Surprise ❤️' : 'Publish Love Website ❤️'}
                  </button>

                  <button onClick={goBack}
                    className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors">
                    ← Go Back & Edit
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ─── Upload Progress Toast ─── */}
      <AnimatePresence>
        {(uploadingMemories) && (
          <motion.div key="upload-toast"
            initial={{ opacity: 0, y: 48, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,380px)] bg-[#0f172a] border border-rose-500/50 rounded-2xl shadow-2xl overflow-hidden">
            <motion.div className="h-1 bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400"
              animate={{ width: `${uploadProgress || 2}%` }} transition={{ duration: 0.35 }} />
            <div className="p-4 flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-rose-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">
                  {uploadDone < uploadTotal
                    ? `Uploading photo ${uploadDone + 1} of ${uploadTotal}…`
                    : `Processing ${uploadTotal} photo${uploadTotal > 1 ? 's' : ''}…`}
                </p>
                <p className="text-[11px] text-slate-500">Compressing & uploading · {uploadProgress}%</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Simple key-value summary row */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-slate-500 flex-shrink-0">{label}:</span>
      <span className="font-semibold text-right text-rose-300 truncate max-w-[180px]">{value}</span>
    </div>
  );
}
