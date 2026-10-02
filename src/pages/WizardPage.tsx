import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  AwardType, FullTemplate, MemoryImage, MusicData, QuoteEntry, SurpriseData, TimelineEvent,
} from '../types';
import { PRESET_MUSIC_TRACKS, SAMPLE_MEMORY_IMAGES, AWARD_OPTIONS, SAMPLE_REASONS } from '../presets';
import { CertificateComponent } from '../components/CertificateComponent';
import { QRCodeModal } from '../components/QRCodeModal';
import { useUploadToasts, UploadToasts } from '../components/UploadToast';
import {
  validateImageFile,
  validateAudioFile,
  compressImage,
  readFileAsDataUrl,
  withUploadRetry,
  runWithUploadLimit,
  IMAGE_INPUT_ACCEPT,
  AUDIO_INPUT_ACCEPT,
} from '../utils/mediaUpload';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Copy,
  Download,
  ExternalLink,
  Disc,
  RefreshCw,
  ImageOff,
  Repeat,
  Heart,
  Camera,
  LayoutTemplate,
  X,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Step numbers. Step 10 is the "your website is ready" screen. */
const STEP_TEMPLATE = 1;
const STEP_DETAILS = 2;
const STEP_MEMORIES = 3;
const STEP_MESSAGES = 4;
const STEP_REASONS = 5;
const STEP_STORY = 6;
const STEP_CERTIFICATE = 7;
const STEP_MUSIC = 8;
const STEP_PREVIEW = 9;
const STEP_DONE = 10;
const TOTAL_STEPS = 10;

const STEP_TITLES: Record<number, string> = {
  [STEP_TEMPLATE]: 'Choose a Style',
  [STEP_DETAILS]: 'Basic Details',
  [STEP_MEMORIES]: 'Upload Memories',
  [STEP_MESSAGES]: 'Love Messages',
  [STEP_REASONS]: 'Why I Love You',
  [STEP_STORY]: 'Your Story',
  [STEP_CERTIFICATE]: 'Dynamic Certificate',
  [STEP_MUSIC]: 'Background Music',
  [STEP_PREVIEW]: 'Preview',
  [STEP_DONE]: 'Your Website is Ready! 🎉',
};

const MAX_MEMORY_IMAGES = 20;
const MAX_TIMELINE_EVENTS = 10;
const MAX_QUOTES = 10;

const RELATIONSHIPS = ['Girlfriend', 'Boyfriend', 'Wife', 'Husband', 'Best Friend', 'Partner'];
const OCCASIONS = ['Anniversary', 'Birthday', "Valentine's", 'Proposal', 'Friendship', 'Long Distance', 'Just Because', 'Apology'];
const TIMELINE_ICONS = ['💑', '💕', '🌹', '🎂', '✈️', '🏡', '💍', '🌟'];
const QUOTE_TYPES: { type: QuoteEntry['type']; label: string; emoji: string }[] = [
  { type: 'quote', label: 'Quote', emoji: '💬' },
  { type: 'inside-joke', label: 'Inside Joke', emoji: '😄' },
  { type: 'promise', label: 'Promise', emoji: '🤞' },
  { type: 'goal', label: 'Goal', emoji: '🌟' },
];

const inputCls =
  'w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/20 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-500';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80 mb-1';

const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingUpload {
  localId: string;
  file: File;
  previewUrl: string;
  status: 'queued' | 'compressing' | 'uploading' | 'error';
  error?: string;
}

interface WizardPageProps {
  editSurpriseId?: string;
  /** Template id from ?template=<id> (set by the Template Gallery) */
  initialTemplateId?: string;
  onNavigate: (tab: string, id?: string) => void;
}

/** What the picker shows for "no template chosen" (the built-in Classic Romantic). */
const BUILT_IN_TEMPLATE_ID = '';

// ─── Single-image upload control (cover, profile picture, timeline photos) ────

interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  /** Uploads the file; resolves to the hosted URL, or null if it failed (already reported to the user). */
  upload: (file: File, label: string) => Promise<string | null>;
  label: string;
  shape?: 'wide' | 'round' | 'thumb';
  emptyText?: string;
  disabled?: boolean;
}

const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  value, onChange, upload, label, shape = 'wide', emptyText, disabled,
}) => {
  const [busy, setBusy] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const url = await upload(file, label);
      if (url) onChange(url);
    } finally {
      setBusy(false);
    }
  };

  const frame =
    shape === 'round'
      ? 'w-24 h-24 rounded-full'
      : shape === 'thumb'
      ? 'w-20 h-14 rounded-lg'
      : 'w-full aspect-[21/9] rounded-xl';

  return (
    <div className={shape === 'wide' ? 'space-y-2' : 'flex items-center gap-3'}>
      <div className={`${frame} relative overflow-hidden border border-[#1A1A1A]/15 bg-white shrink-0 flex items-center justify-center`}>
        {value ? (
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center px-2">
            <Camera className="w-5 h-5 text-[#1A1A1A]/30 mx-auto" />
            {emptyText && shape === 'wide' && (
              <span className="text-xs text-[#1A1A1A]/60 italic font-serif block mt-1">{emptyText}</span>
            )}
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label
          className={`px-3.5 py-2 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors ${
            busy || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-rose-900'
          }`}
        >
          {busy ? 'Uploading…' : value ? 'Change' : 'Upload'}
          <input
            type="file"
            accept={IMAGE_INPUT_ACCEPT}
            onChange={handleFile}
            disabled={busy || disabled}
            className="hidden"
          />
        </label>
        {value && !busy && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-rose-600 underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Wizard ───────────────────────────────────────────────────────────────────

export const WizardPage: React.FC<WizardPageProps> = ({ editSurpriseId, initialTemplateId, onNavigate }) => {
  const { user, token } = useAuth();
  const { notifyUploaded, notifyError } = useUploadToasts();

  const [step, setStep] = useState<number>(STEP_TEMPLATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [uploadingMusic, setUploadingMusic] = useState<boolean>(false);
  const [cloudinaryEnabled, setCloudinaryEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    api.getUploadStatus()
      .then(s => setCloudinaryEnabled(s.cloudinaryEnabled))
      .catch(() => setCloudinaryEnabled(false));
  }, []);

  // ── Template picker state ──
  const [templateId, setTemplateId] = useState<string>(initialTemplateId || BUILT_IN_TEMPLATE_ID);
  const [templates, setTemplates] = useState<FullTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(true);
  const [templatesFailed, setTemplatesFailed] = useState<boolean>(false);
  const [templateNotice, setTemplateNotice] = useState<string>('');

  // ── Core form state ──
  const [creatorName, setCreatorName] = useState<string>(user?.name.split(' ')[0] || '');
  const [partnerName, setPartnerName] = useState<string>('');
  const [title, setTitle] = useState<string>('Our Love Story ❤️');
  const [coverImage, setCoverImage] = useState<string>('');
  const [memoryImages, setMemoryImages] = useState<MemoryImage[]>(
    SAMPLE_MEMORY_IMAGES.map((img, i) => ({ id: `mem_${i}`, ...img }))
  );
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // ── Extended details ──
  const [nickname, setNickname] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('');
  const [specialDate, setSpecialDate] = useState<string>('');
  const [yearsTogether, setYearsTogether] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string>('');

  // ── Messages ──
  const [headline, setHeadline] = useState<string>('');
  const [welcomeMessage, setWelcomeMessage] = useState<string>('Welcome to our quiet magical corner of the universe. Every moment spent with you is a gift.');
  const [loveLetter, setLoveLetter] = useState<string>(
    `From the moment you entered my life, everything became warmer and brighter.\n\nThank you for every shared laugh, late-night talk, and unconditioned hug. I love you today, tomorrow, and forever!`
  );
  const [letterSignature, setLetterSignature] = useState<string>('');
  const [finalMessage, setFinalMessage] = useState<string>('Thank you for being mine. I love you endlessly! ❤️');

  // ── Reasons ──
  const [reasons, setReasons] = useState<string[]>(SAMPLE_REASONS);
  const [newReasonInput, setNewReasonInput] = useState<string>('');

  // ── Story extras ──
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [quotes, setQuotes] = useState<QuoteEntry[]>([]);
  const [countdownDate, setCountdownDate] = useState<string>('');

  // ── Certificate / music ──
  const [award, setAward] = useState<AwardType>('Best Partner ❤️');
  const [music, setMusic] = useState<MusicData>({
    type: 'preset',
    url: PRESET_MUSIC_TRACKS[0].url,
    name: PRESET_MUSIC_TRACKS[0].name,
  });

  // ── Result ──
  const [generatedSurprise, setGeneratedSurprise] = useState<SurpriseData | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Keep a ref of pending uploads so preview object-URLs are always released on unmount.
  const pendingRef = useRef<PendingUpload[]>([]);
  useEffect(() => { pendingRef.current = pendingUploads; }, [pendingUploads]);
  useEffect(() => () => { pendingRef.current.forEach(p => URL.revokeObjectURL(p.previewUrl)); }, []);

  // ── Load templates for the picker ──
  useEffect(() => {
    let cancelled = false;
    api.getPublicTemplates()
      .then(list => { if (!cancelled) setTemplates(list.filter(t => t.published !== false)); })
      .catch(() => { if (!cancelled) setTemplatesFailed(true); })
      .finally(() => { if (!cancelled) setTemplatesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // If the chosen template (from ?template= or an edited surprise) isn't in the public list
  // (e.g. unpublished), look it up directly; if it doesn't exist at all, fall back to the default.
  useEffect(() => {
    if (templatesLoading || !templateId) return;
    if (templates.some(t => t.id === templateId)) return;
    let cancelled = false;
    fetch(`/api/templates/${encodeURIComponent(templateId)}`)
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('not found'))))
      .then(data => {
        if (cancelled || !data?.template) return;
        const { templateJson: _omit, ...card } = data.template as FullTemplate;
        setTemplates(prev => (prev.some(t => t.id === card.id) ? prev : [...prev, card as FullTemplate]));
      })
      .catch(() => {
        if (cancelled) return;
        setTemplateId(BUILT_IN_TEMPLATE_ID);
        setTemplateNotice("That template isn't available any more, so we switched you to the built-in Classic style.");
      });
    return () => { cancelled = true; };
  }, [templatesLoading, templates, templateId]);

  // ── Edit mode: load every field, including templateId and the extended ones ──
  useEffect(() => {
    if (!editSurpriseId) return;
    setLoading(true);
    fetch(`/api/surprises/${editSurpriseId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        if (!data.surprise) return;
        const s: SurpriseData = data.surprise;
        setCreatorName(s.creatorName);
        setPartnerName(s.partnerName);
        setTitle(s.title);
        setCoverImage(s.coverImage || '');
        setMemoryImages(s.memoryImages || []);
        setWelcomeMessage(s.welcomeMessage);
        setLoveLetter(s.loveLetter);
        setFinalMessage(s.finalMessage);
        setReasons(s.reasons || []);
        setAward(s.certificate?.award || 'Best Partner ❤️');
        setMusic(s.music || { type: 'preset', url: PRESET_MUSIC_TRACKS[0].url, name: PRESET_MUSIC_TRACKS[0].name });
        // extended
        setTemplateId(initialTemplateId || s.templateId || BUILT_IN_TEMPLATE_ID);
        setNickname(s.nickname || '');
        setRelationship(s.relationship || '');
        setOccasion(s.occasion || '');
        setSpecialDate(s.specialDate || '');
        setYearsTogether(s.yearsTogether != null ? String(s.yearsTogether) : '');
        setProfilePicture(s.profilePicture || '');
        setHeadline(s.headline || '');
        setLetterSignature(s.letterSignature || '');
        setTimeline(s.timeline || []);
        setQuotes(s.quotes || []);
        setCountdownDate(s.countdownDate || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [editSurpriseId]);

  // Update default names when user changes
  useEffect(() => {
    if (user && !creatorName) {
      setCreatorName(user.name.split(' ')[0]);
    }
  }, [user]);

  // ── Uploads ──────────────────────────────────────────────────────────────────

  /**
   * Compress + upload one image. Runs inside the shared upload limiter so a big batch
   * never fires everything at once. Throws on failure.
   */
  const performImageUpload = (
    file: File,
    onStatus?: (status: 'compressing' | 'uploading') => void
  ): Promise<string> =>
    runWithUploadLimit(async () => {
      onStatus?.('compressing');
      const compressed = await compressImage(file);
      const dataUrl = await readFileAsDataUrl(compressed);
      onStatus?.('uploading');
      const { url } = await withUploadRetry(() => api.uploadMedia(dataUrl, 'image'));
      return url;
    });

  /** Validate + upload + toast. Returns the URL, or null if it failed (user already informed). */
  const uploadImage = async (file: File, label: string): Promise<string | null> => {
    const invalid = validateImageFile(file);
    if (invalid) {
      notifyError(`${label} not added`, invalid);
      return null;
    }
    try {
      const url = await performImageUpload(file);
      notifyUploaded('photo');
      return url;
    } catch (err: any) {
      notifyError(`${label} upload failed`, err?.message || 'Please try again.');
      return null;
    }
  };

  const updatePending = (localId: string, patch: Partial<PendingUpload>) =>
    setPendingUploads(prev => prev.map(p => (p.localId === localId ? { ...p, ...patch } : p)));

  // Processes one memory File end-to-end. Shown as a "pending" card until it lands in memoryImages or errors out.
  const processMemoryFile = async (file: File, localId: string) => {
    updatePending(localId, { status: 'queued', error: undefined });

    try {
      const url = await performImageUpload(file, status => updatePending(localId, { status }));

      setMemoryImages(prev =>
        [
          ...prev,
          {
            id: 'mem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            url,
            caption: 'Special Memory',
            date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          },
        ].slice(0, MAX_MEMORY_IMAGES)
      );
      notifyUploaded('photo');

      setPendingUploads(prev => {
        const target = prev.find(p => p.localId === localId);
        if (target) URL.revokeObjectURL(target.previewUrl);
        return prev.filter(p => p.localId !== localId);
      });
    } catch (err: any) {
      const message = err?.message || 'Upload failed. Please try again.';
      updatePending(localId, { status: 'error', error: message });
      notifyError('Photo upload failed', message);
    }
  };

  const queueMemoryFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const slotsLeft = MAX_MEMORY_IMAGES - memoryImages.length - pendingUploads.length;

    if (slotsLeft <= 0) {
      setError(`Maximum ${MAX_MEMORY_IMAGES} memory images allowed.`);
      return;
    }

    setError('');
    const filesToQueue = files.slice(0, slotsLeft);
    if (files.length > filesToQueue.length) {
      setError(`Only ${slotsLeft} more image${slotsLeft === 1 ? '' : 's'} can be added (${MAX_MEMORY_IMAGES} max).`);
    }

    filesToQueue.forEach(file => {
      const validationError = validateImageFile(file);
      if (validationError) {
        notifyError('Photo not added', validationError);
        return;
      }

      const localId = 'pending_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      const previewUrl = URL.createObjectURL(file);

      setPendingUploads(prev => [...prev, { localId, file, previewUrl, status: 'queued' }]);
      processMemoryFile(file, localId);
    });
  };

  const handleMemoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const picked: File[] = files ? Array.from(files) : [];
    e.target.value = ''; // allow re-selecting the same file later
    if (picked.length === 0) return;
    queueMemoryFiles(picked);
  };

  const handleMemoryDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      queueMemoryFiles(e.dataTransfer.files);
    }
  };

  const handleRetryPendingUpload = (localId: string) => {
    const pending = pendingUploads.find(p => p.localId === localId);
    if (pending) processMemoryFile(pending.file, localId);
  };

  const handleRemovePendingUpload = (localId: string) => {
    setPendingUploads(prev => {
      const target = prev.find(p => p.localId === localId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(p => p.localId !== localId);
    });
  };

  // Replace an already-uploaded memory image with a newly picked file
  const handleReplaceMemoryImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const targetId = memoryImages[index]?.id;
    setError('');
    const url = await uploadImage(file, 'Photo');
    if (url) setMemoryImages(prev => prev.map(img => (img.id === targetId ? { ...img, url } : img)));
  };

  const handleAddSampleImage = () => {
    const sample = SAMPLE_MEMORY_IMAGES[memoryImages.length % SAMPLE_MEMORY_IMAGES.length];
    if (memoryImages.length < MAX_MEMORY_IMAGES) {
      setMemoryImages(prev => [
        ...prev,
        { id: 'mem_' + Date.now(), url: sample.url, caption: sample.caption, date: sample.date },
      ]);
    }
  };

  const handleAddReason = () => {
    if (!newReasonInput.trim()) return;
    if (reasons.length >= 5) {
      setError('Maximum 5 personalized reasons allowed.');
      return;
    }
    setReasons(prev => [...prev, newReasonInput.trim()]);
    setNewReasonInput('');
    setError('');
  };

  const handleRemoveReason = (index: number) => {
    setReasons(prev => prev.filter((_, i) => i !== index));
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validationError = validateAudioFile(file);
    if (validationError) {
      notifyError('Music not added', validationError);
      return;
    }

    setUploadingMusic(true);
    setError('');
    try {
      const url = await runWithUploadLimit(async () => {
        const dataUrl = await readFileAsDataUrl(file);
        const res = await withUploadRetry(() => api.uploadMedia(dataUrl, 'audio'));
        return res.url;
      });
      setMusic({ type: 'upload', url, name: file.name });
    } catch (err: any) {
      notifyError('Music upload failed', err?.message || 'Failed to upload the music file. Please try again.');
    } finally {
      setUploadingMusic(false);
    }
  };

  // ── Timeline / quotes editing ──
  const addTimelineEvent = () => {
    if (timeline.length >= MAX_TIMELINE_EVENTS) return;
    setTimeline(prev => [...prev, { id: uid(), title: '', date: '', description: '', icon: '💑' }]);
  };
  const patchTimeline = (id: string, patch: Partial<TimelineEvent>) =>
    setTimeline(prev => prev.map(ev => (ev.id === id ? { ...ev, ...patch } : ev)));

  const addQuote = (type: QuoteEntry['type']) => {
    if (quotes.length >= MAX_QUOTES) return;
    const emoji = QUOTE_TYPES.find(q => q.type === type)?.emoji;
    setQuotes(prev => [...prev, { id: uid(), type, text: '', emoji }]);
  };
  const patchQuote = (id: string, patch: Partial<QuoteEntry>) =>
    setQuotes(prev => prev.map(q => (q.id === id ? { ...q, ...patch } : q)));

  // ── Navigation / validation ──
  const uploadsInFlight = pendingUploads.some(p => p.status !== 'error');

  const validateStep = () => {
    setError('');
    if (step === STEP_DETAILS) {
      if (!creatorName.trim() || !partnerName.trim() || !title.trim()) {
        setError('Please enter your name, partner name, and surprise title.');
        return false;
      }
    } else if (step === STEP_MEMORIES) {
      if (uploadsInFlight) {
        setError('Some photos are still uploading — please wait a moment.');
        return false;
      }
      if (memoryImages.length < 1) {
        setError('Please upload at least 1 memory photo (5-20 recommended).');
        return false;
      }
    } else if (step === STEP_MESSAGES) {
      if (!welcomeMessage.trim() || !loveLetter.trim() || !finalMessage.trim()) {
        setError('Please complete the welcome message, love letter and final message.');
        return false;
      }
    } else if (step === STEP_REASONS) {
      if (reasons.length === 0) {
        setError('Please add at least 1 reason why you love them.');
        return false;
      }
    } else if (step === STEP_MUSIC) {
      if (uploadingMusic) {
        setError('Your music is still uploading — please wait a moment.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEP_PREVIEW) {
      setStep(prev => prev + 1);
    } else if (step === STEP_PREVIEW) {
      handleGenerateSurprise();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setError('');
      setStep(prev => prev - 1);
    }
  };

  const handleGenerateSurprise = async () => {
    if (!token) {
      setError('Still setting things up — please wait a moment and try again.');
      return;
    }
    setLoading(true);
    setError('');

    // Drop blank timeline / quote rows the user added but never filled in.
    const cleanTimeline = timeline.filter(ev => ev.title.trim() || ev.description.trim());
    const cleanQuotes = quotes.filter(q => q.text.trim());
    const years = yearsTogether.trim() === '' ? undefined : Number(yearsTogether);

    const payload = {
      creatorName,
      partnerName,
      title,
      coverImage: coverImage || (memoryImages[0] ? memoryImages[0].url : ''),
      memoryImages,
      welcomeMessage,
      loveLetter,
      finalMessage,
      reasons: reasons.slice(0, 5),
      certificate: {
        recipientName: partnerName,
        presentedBy: creatorName,
        award,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      },
      music,
      // ── template + extended fields (strings are sent even when empty so edits can clear them) ──
      templateId,
      nickname: nickname.trim(),
      relationship,
      occasion,
      specialDate,
      yearsTogether: years != null && !isNaN(years) ? years : undefined,
      profilePicture,
      headline: headline.trim(),
      letterSignature: letterSignature.trim(),
      timeline: cleanTimeline,
      quotes: cleanQuotes,
      countdownDate,
    };

    try {
      const url = editSurpriseId ? `/api/surprises/${editSurpriseId}` : '/api/surprises';
      const method = editSurpriseId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedSurprise(data.surprise);
        setStep(STEP_DONE);
      } else {
        throw new Error(data.error || 'Failed to generate surprise website');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving surprise');
    } finally {
      setLoading(false);
    }
  };

  const fullShareUrl = generatedSurprise
    ? `${window.location.origin}/s/${generatedSurprise.id}?token=${encodeURIComponent((generatedSurprise as any).viewToken || '')}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const selectedTemplate = templates.find(t => t.id === templateId);
  const selectedTemplateName = templateId ? selectedTemplate?.name || 'Custom template' : 'Classic Romantic (built-in)';

  const UploadsDisabledNotice = () =>
    cloudinaryEnabled === false ? (
      <div className="px-4 py-3 bg-amber-50 border border-amber-400 text-amber-800 text-xs rounded-2xl space-y-1">
        <p className="font-bold">⚠️ Photo uploads not available</p>
        <p>Cloudinary is not configured on the server. Set <strong>CLOUDINARY_CLOUD_NAME</strong>, <strong>CLOUDINARY_API_KEY</strong>, and <strong>CLOUDINARY_API_SECRET</strong> in your environment (or Render dashboard), then restart/redeploy.</p>
      </div>
    ) : null;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 bg-gradient-to-br from-pink-100/90 via-rose-50/80 to-pink-100/90 py-10 px-4 sm:px-8 max-w-5xl mx-auto w-full flex flex-col">
      <UploadToasts />

      {/* Wizard Progress Header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center text-xs font-bold font-serif">
              {step}
            </div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-serif italic text-[#1A1A1A]">{STEP_TITLES[step]}</h1>
        </div>

        {/* Step Breadcrumb Bar */}
        <div className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: `repeat(${TOTAL_STEPS}, minmax(0, 1fr))` }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i < step ? 'bg-rose-600' : i === step ? 'bg-[#1A1A1A]' : 'bg-[#1A1A1A]/10'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Step Body Cards */}
      <div className="flex-1 bg-white border border-[#1A1A1A]/15 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">

        {/* STEP 1: TEMPLATE PICKER */}
        {step === STEP_TEMPLATE && (
          <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Pick Your Style</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Choose the look and feel of your surprise. You can change it later by editing the surprise.
              </p>
            </div>

            {templateNotice && (
              <div className="px-4 py-3 bg-amber-50 border border-amber-300 text-amber-800 text-xs rounded-xl flex items-start justify-between gap-3">
                <span>{templateNotice}</span>
                <button type="button" onClick={() => setTemplateNotice('')} className="shrink-0" aria-label="Dismiss">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {templatesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1].map(i => (
                  <div key={i} className="h-56 rounded-2xl bg-rose-50 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Built-in default */}
                <button
                  type="button"
                  onClick={() => setTemplateId(BUILT_IN_TEMPLATE_ID)}
                  className={`text-left rounded-2xl border-2 overflow-hidden transition-all ${
                    templateId === BUILT_IN_TEMPLATE_ID
                      ? 'border-rose-600 shadow-lg shadow-rose-200/60'
                      : 'border-[#1A1A1A]/10 hover:border-rose-300'
                  }`}
                >
                  <div className="h-32 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 flex items-center justify-center relative">
                    <Heart className="w-10 h-10 text-rose-400 fill-rose-300" />
                    {templateId === BUILT_IN_TEMPLATE_ID && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-sm font-bold text-[#1A1A1A]">Classic Romantic</p>
                    <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
                      The built-in soft rose style — a safe, timeless default.
                    </p>
                  </div>
                </button>

                {templates.map(tpl => {
                  const selected = templateId === tpl.id;
                  const img = tpl.previewImage || tpl.coverImageUrl;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => { setTemplateId(tpl.id); setTemplateNotice(''); }}
                      className={`text-left rounded-2xl border-2 overflow-hidden transition-all ${
                        selected
                          ? 'border-rose-600 shadow-lg shadow-rose-200/60'
                          : 'border-[#1A1A1A]/10 hover:border-rose-300'
                      }`}
                    >
                      <div className="h-32 bg-rose-50 relative">
                        {img ? (
                          <img src={img} alt={tpl.name} loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100">
                            <LayoutTemplate className="w-10 h-10 text-rose-300" />
                          </div>
                        )}
                        {tpl.badge && (
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 text-rose-700 text-[11px] font-bold">
                            {tpl.badge}
                          </span>
                        )}
                        {selected && (
                          <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-1">
                        <p className="text-sm font-bold text-[#1A1A1A]">{tpl.name}</p>
                        <p className="text-xs text-[#1A1A1A]/60 leading-relaxed line-clamp-3">{tpl.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {(templatesFailed || (!templatesLoading && templates.length === 0)) && (
              <p className="text-center text-xs text-[#1A1A1A]/50">
                {templatesFailed
                  ? "We couldn't load the template list, so the built-in Classic style will be used."
                  : 'No other templates are published yet — the built-in Classic style will be used.'}
              </p>
            )}

            <p className="text-center">
              <button
                type="button"
                onClick={() => onNavigate('templates')}
                className="text-xs text-rose-600 underline font-bold uppercase tracking-wider"
              >
                Browse the full gallery
              </button>
            </p>
          </div>
        )}

        {/* STEP 2: ABOUT YOU */}
        {step === STEP_DETAILS && (
          <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">About You & Your Partner</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Fill in the names for the personalized surprise website.
              </p>
            </div>

            <UploadsDisabledNotice />

            <div className="space-y-4 pt-2">
              <div>
                <label className={labelCls}>Your Name (Creator)</label>
                <input type="text" placeholder="e.g. Priya" value={creatorName}
                  onChange={e => setCreatorName(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Partner's Name (Recipient)</label>
                <input type="text" placeholder="e.g. Kabir" value={partnerName}
                  onChange={e => setPartnerName(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Surprise Website Title</label>
                <input type="text" placeholder="e.g. Our Love Story ❤️" value={title}
                  onChange={e => setTitle(e.target.value)} className={inputCls} />
              </div>

              <div className="pt-4 border-t border-[#1A1A1A]/10 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50">
                  Optional details — make it more personal
                </p>

                <div>
                  <label className={labelCls}>Nickname / Pet Name</label>
                  <input type="text" placeholder="e.g. Pookie" value={nickname}
                    onChange={e => setNickname(e.target.value)} className={inputCls} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Relationship</label>
                    <select value={relationship} onChange={e => setRelationship(e.target.value)} className={inputCls}>
                      <option value="">Select…</option>
                      {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Occasion</label>
                    <select value={occasion} onChange={e => setOccasion(e.target.value)} className={inputCls}>
                      <option value="">Select…</option>
                      {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Special Date</label>
                    <input type="date" value={specialDate}
                      onChange={e => setSpecialDate(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Years Together</label>
                    <input type="number" min={0} max={80} placeholder="e.g. 3" value={yearsTogether}
                      onChange={e => setYearsTogether(e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Profile Picture</label>
                  <p className="text-[11px] text-[#1A1A1A]/50 mb-2">
                    Shown in the round frame on the welcome page. Falls back to your cover photo.
                  </p>
                  <SingleImageUpload
                    value={profilePicture}
                    onChange={setProfilePicture}
                    upload={uploadImage}
                    label="Profile picture"
                    shape="round"
                    disabled={cloudinaryEnabled === false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: UPLOAD MEMORIES */}
        {step === STEP_MEMORIES && (
          <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
            <UploadsDisabledNotice />
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Upload Your Memories</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Upload 5–{MAX_MEMORY_IMAGES} photos of your best moments together.
              </p>
            </div>

            {/* Cover Image */}
            <div className="p-4 bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-2xl space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Cover Image (Optional)
                </h4>
                <p className="text-[11px] text-[#1A1A1A]/50">
                  If left empty, we auto-use your first memory photo.
                </p>
              </div>
              <SingleImageUpload
                value={coverImage}
                onChange={setCoverImage}
                upload={uploadImage}
                label="Cover photo"
                shape="wide"
                emptyText="Auto-cover active using your 1st uploaded photo"
                disabled={cloudinaryEnabled === false}
              />
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleMemoryDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center space-y-3 relative transition-colors ${
                isDraggingOver ? 'border-rose-500 bg-rose-50' : 'border-rose-300 bg-rose-50/30 hover:border-rose-500'
              }`}
            >
              <Upload className="w-8 h-8 text-rose-500 mx-auto" />
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">Drag & drop your photos here</p>
                <p className="text-xs text-[#1A1A1A]/50 mt-0.5">
                  JPG, PNG, WEBP, HEIC (iPhone) — up to {MAX_MEMORY_IMAGES} images, 10MB each.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <label className="px-5 py-2.5 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-rose-700 transition-colors shadow-sm">
                  Choose Files
                  <input type="file" multiple accept={IMAGE_INPUT_ACCEPT}
                    onChange={handleMemoryUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleAddSampleImage}
                  className="px-4 py-2.5 border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#1A1A1A]/5 disabled:opacity-50"
                >
                  + Add Preset Sample
                </button>
              </div>
            </div>

            {/* In-flight uploads (queued / compressing / uploading / errored) */}
            {pendingUploads.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {pendingUploads.map((pending) => (
                  <div
                    key={pending.localId}
                    className="relative bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-xl overflow-hidden aspect-square"
                  >
                    <img
                      src={pending.previewUrl}
                      alt="Uploading preview"
                      className={`w-full h-full object-cover ${pending.status === 'error' ? 'opacity-30' : 'opacity-70'}`}
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/20 p-2 text-center">
                      {pending.status === 'queued' && (
                        <>
                          <RefreshCw className="w-5 h-5 text-white/80" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Waiting…</span>
                        </>
                      )}
                      {pending.status === 'compressing' && (
                        <>
                          <RefreshCw className="w-5 h-5 text-white animate-spin" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Compressing…</span>
                        </>
                      )}
                      {pending.status === 'uploading' && (
                        <>
                          <RefreshCw className="w-5 h-5 text-white animate-spin" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Uploading…</span>
                        </>
                      )}
                      {pending.status === 'error' && (
                        <>
                          <ImageOff className="w-5 h-5 text-rose-100" />
                          <span className="text-[10px] font-bold text-rose-50 leading-tight">{pending.error}</span>
                          <div className="flex gap-2 pt-1">
                            <button type="button" onClick={() => handleRetryPendingUpload(pending.localId)}
                              className="px-2.5 py-1 bg-white text-[#1A1A1A] rounded-full text-[10px] font-bold uppercase">
                              Retry
                            </button>
                            <button type="button" onClick={() => handleRemovePendingUpload(pending.localId)}
                              className="px-2.5 py-1 bg-black/60 text-white rounded-full text-[10px] font-bold uppercase">
                              Remove
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Memory Thumbnails */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70">
                Uploaded Memories ({memoryImages.length}/{MAX_MEMORY_IMAGES})
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {memoryImages.map((img, index) => (
                  <div key={img.id}
                    className="relative bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-xl overflow-hidden group">
                    <div className="aspect-square relative">
                      <img src={img.url} alt={`Memory ${index}`} className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 right-1.5 flex gap-1.5">
                        <label className="p-1 bg-black/70 text-white rounded-full hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Replace photo">
                          <Repeat className="w-3.5 h-3.5" />
                          <input type="file" accept={IMAGE_INPUT_ACCEPT}
                            onChange={(e) => handleReplaceMemoryImage(index, e)} className="hidden" />
                        </label>
                        <button type="button"
                          onClick={() => setMemoryImages(prev => prev.filter((_, i) => i !== index))}
                          className="p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                          title="Remove photo">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <input
                        type="text"
                        placeholder="Caption..."
                        value={img.caption || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setMemoryImages(prev => prev.map((m, i) => (i === index ? { ...m, caption: val } : m)));
                        }}
                        className="w-full text-xs bg-transparent border-b border-transparent focus:border-rose-500 focus:outline-none truncate"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: MESSAGES */}
        {step === STEP_MESSAGES && (
          <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Add Messages & Love Letter</h2>
              <p className="text-xs text-[#1A1A1A]/60">Express your feelings with personalized messages.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Headline / Tagline (optional)</label>
                <input type="text" placeholder="e.g. Three years of us" value={headline}
                  onChange={e => setHeadline(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Welcome Message</label>
                <input type="text" value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Love Letter</label>
                <textarea rows={6} value={loveLetter} onChange={e => setLoveLetter(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/20 rounded-xl text-sm font-serif leading-relaxed focus:outline-none focus:border-rose-500" />
              </div>

              <div>
                <label className={labelCls}>Letter Signature (optional)</label>
                <input type="text" placeholder={`Defaults to "${creatorName || 'your name'}"`} value={letterSignature}
                  onChange={e => setLetterSignature(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Final Farewell Message</label>
                <input type="text" value={finalMessage}
                  onChange={e => setFinalMessage(e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: WHY I LOVE YOU */}
        {step === STEP_REASONS && (
          <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Why I Love You</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Add up to 5 personalized reasons why they are so special to you.
              </p>
            </div>

            <div className="space-y-3">
              {reasons.map((reason, index) => (
                <div key={index}
                  className="flex items-center justify-between p-3.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-xl gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      ❤️
                    </div>
                    <span className="text-xs text-[#1A1A1A] font-medium leading-relaxed">{reason}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveReason(index)}
                    className="text-rose-600 hover:text-rose-800 p-1 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {reasons.length < 5 && (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Enter reason e.g. Your beautiful contagious smile..."
                    value={newReasonInput}
                    onChange={e => setNewReasonInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#1A1A1A]/20 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddReason();
                      }
                    }}
                  />
                  <button type="button" onClick={handleAddReason}
                    className="px-4 py-2.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-rose-900 transition-colors">
                    + Add
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: YOUR STORY (timeline, quotes, countdown) — all optional */}
        {step === STEP_STORY && (
          <div className="space-y-8 max-w-xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Tell Your Story</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Everything on this page is optional — sections you leave empty are simply skipped.
              </p>
            </div>

            <UploadsDisabledNotice />

            {/* Timeline */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  📅 Timeline ({timeline.length}/{MAX_TIMELINE_EVENTS})
                </h3>
                <button type="button" onClick={addTimelineEvent} disabled={timeline.length >= MAX_TIMELINE_EVENTS}
                  className="px-3 py-1.5 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-rose-900 disabled:opacity-40 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Event
                </button>
              </div>

              {timeline.length === 0 && (
                <p className="text-xs text-[#1A1A1A]/50 italic p-4 bg-[#FAF9F6] border border-dashed border-[#1A1A1A]/20 rounded-xl text-center">
                  No events yet — we'll build a mini timeline from your photo captions instead.
                </p>
              )}

              {timeline.map(ev => (
                <div key={ev.id} className="p-4 bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {TIMELINE_ICONS.map(icon => (
                        <button key={icon} type="button" onClick={() => patchTimeline(ev.id, { icon })}
                          className={`w-8 h-8 rounded-lg text-base ${ev.icon === icon ? 'bg-rose-100 ring-2 ring-rose-400' : 'bg-white border border-[#1A1A1A]/10'}`}>
                          {icon}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => setTimeline(prev => prev.filter(e => e.id !== ev.id))}
                      className="text-rose-600 hover:text-rose-800 p-1 shrink-0" title="Remove event">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="Title, e.g. First Date" value={ev.title}
                      onChange={e => patchTimeline(ev.id, { title: e.target.value })}
                      className="px-3 py-2 bg-white border border-[#1A1A1A]/20 rounded-lg text-xs focus:outline-none focus:border-rose-500" />
                    <input type="text" placeholder="When, e.g. 14 Feb 2022" value={ev.date}
                      onChange={e => patchTimeline(ev.id, { date: e.target.value })}
                      className="px-3 py-2 bg-white border border-[#1A1A1A]/20 rounded-lg text-xs focus:outline-none focus:border-rose-500" />
                  </div>
                  <textarea rows={2} placeholder="A line or two about this moment…" value={ev.description}
                    onChange={e => patchTimeline(ev.id, { description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#1A1A1A]/20 rounded-lg text-xs focus:outline-none focus:border-rose-500" />

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1.5">Photo (optional)</p>
                    <SingleImageUpload
                      value={ev.photo || ''}
                      onChange={url => patchTimeline(ev.id, { photo: url || undefined })}
                      upload={uploadImage}
                      label="Timeline photo"
                      shape="thumb"
                      disabled={cloudinaryEnabled === false}
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* Quotes */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                💬 Quotes & Promises ({quotes.length}/{MAX_QUOTES})
              </h3>
              <div className="flex flex-wrap gap-2">
                {QUOTE_TYPES.map(qt => (
                  <button key={qt.type} type="button" onClick={() => addQuote(qt.type)} disabled={quotes.length >= MAX_QUOTES}
                    className="px-3 py-1.5 border border-[#1A1A1A]/20 bg-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-rose-50 disabled:opacity-40">
                    {qt.emoji} + {qt.label}
                  </button>
                ))}
              </div>

              {quotes.map(q => (
                <div key={q.id} className="p-4 bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                      {QUOTE_TYPES.find(t => t.type === q.type)?.emoji} {QUOTE_TYPES.find(t => t.type === q.type)?.label}
                    </span>
                    <button type="button" onClick={() => setQuotes(prev => prev.filter(e => e.id !== q.id))}
                      className="text-rose-600 hover:text-rose-800 p-1" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea rows={2} placeholder="Write it here…" value={q.text}
                    onChange={e => patchQuote(q.id, { text: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#1A1A1A]/20 rounded-lg text-xs focus:outline-none focus:border-rose-500" />
                  <input type="text" placeholder="— Author (optional)" value={q.author || ''}
                    onChange={e => patchQuote(q.id, { author: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#1A1A1A]/20 rounded-lg text-xs focus:outline-none focus:border-rose-500" />
                </div>
              ))}
            </section>

            {/* Countdown */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">⏳ Countdown (optional)</h3>
              <p className="text-[11px] text-[#1A1A1A]/50">
                Pick a future date — an anniversary, a trip, a reunion — and your surprise will count down to it.
              </p>
              <div className="flex items-center gap-2">
                <input type="date" value={countdownDate} onChange={e => setCountdownDate(e.target.value)} className={inputCls} />
                {countdownDate && (
                  <button type="button" onClick={() => setCountdownDate('')}
                    className="text-[11px] text-rose-600 underline font-bold uppercase shrink-0">
                    Clear
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        {/* STEP 7: CERTIFICATE */}
        {step === STEP_CERTIFICATE && (
          <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Dynamic Certificate of Love</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Choose the official award title for {partnerName || 'your partner'}.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {AWARD_OPTIONS.map(opt => (
                <button key={opt} type="button" onClick={() => setAward(opt)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    award === opt
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-white border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
                  }`}>
                  {opt}
                </button>
              ))}
            </div>

            <div className="scale-95 origin-top">
              <CertificateComponent
                data={{
                  recipientName: partnerName || 'Recipient',
                  presentedBy: creatorName || 'Creator',
                  award,
                  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                }}
                allowDownload={false}
              />
            </div>
          </div>
        )}

        {/* STEP 8: MUSIC */}
        {step === STEP_MUSIC && (
          <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Select Background Music</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Pick a romantic ambient soundtrack or upload your favorite track.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70">Preset Audio Tracks</p>

              {PRESET_MUSIC_TRACKS.map(track => (
                <div
                  key={track.id}
                  onClick={() => setMusic({ type: 'preset', url: track.url, name: track.name })}
                  className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    music.name === track.name
                      ? 'border-rose-600 bg-rose-50/60 shadow-xs'
                      : 'border-[#1A1A1A]/15 bg-white hover:border-[#1A1A1A]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Disc className={`w-5 h-5 ${music.name === track.name ? 'text-rose-600 animate-spin' : 'text-[#1A1A1A]/40'}`}
                      style={{ animationDuration: '4s' }} />
                    <div>
                      <p className="text-xs font-bold text-[#1A1A1A]">{track.name}</p>
                      <p className="text-[10px] text-[#1A1A1A]/50">{track.artist}</p>
                    </div>
                  </div>
                  {music.name === track.name && (
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1">
                      <Check className="w-4 h-4" /> Selected
                    </span>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-[#1A1A1A]/10">
                <label className={`${labelCls} mb-2`}>Or Upload Custom Music File</label>
                <input
                  type="file"
                  accept={AUDIO_INPUT_ACCEPT}
                  onChange={handleMusicUpload}
                  disabled={uploadingMusic}
                  className="block w-full text-xs text-[#1A1A1A]/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1A1A1A] file:text-white hover:file:bg-rose-900 cursor-pointer disabled:opacity-50"
                />
                {uploadingMusic && (
                  <p className="text-xs text-rose-600 font-bold mt-1 animate-pulse">Uploading your music…</p>
                )}
                {music.type === 'upload' && !uploadingMusic && (
                  <p className="text-xs text-[#1A1A1A]/60 mt-1">Using your upload: <strong>{music.name}</strong></p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: PREVIEW */}
        {step === STEP_PREVIEW && (
          <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn text-center">
            <div>
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Preview Your Love Website</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                A quick look at the welcome screen. The full experience opens after you publish.
              </p>
              <p className="text-[11px] text-rose-600 font-bold uppercase tracking-wider mt-2">
                Style: {selectedTemplateName}
              </p>
            </div>

            {/* Mobile Phone Mockup Frame */}
            <div className="w-[300px] h-[520px] mx-auto bg-black rounded-[40px] p-3 shadow-2xl border-4 border-neutral-800 relative overflow-hidden flex flex-col justify-between text-white">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20"></div>

              <div className="w-full h-full bg-[#1A1A1A] rounded-[30px] overflow-y-auto p-4 flex flex-col justify-between relative text-center">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40"
                  style={{ backgroundImage: `url(${coverImage || (memoryImages[0] ? memoryImages[0].url : '')})` }}
                />
                <div className="relative z-10 pt-8 space-y-2">
                  {profilePicture && (
                    <img src={profilePicture} alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/80 mx-auto" />
                  )}
                  <span className="bg-rose-600/90 text-white text-[9px] uppercase tracking-widest px-2 py-0.5 rounded font-bold">
                    Interactive Surprise
                  </span>
                  <h3 className="text-2xl font-serif italic text-white font-bold">
                    {partnerName} & {creatorName}
                  </h3>
                  <p className="text-xs font-serif italic text-rose-300">{title}</p>
                  {yearsTogether && (
                    <p className="text-[10px] text-white/80">{yearsTogether} {Number(yearsTogether) === 1 ? 'year' : 'years'} together ❤️</p>
                  )}
                </div>

                <div className="relative z-10 space-y-2 my-auto bg-black/60 p-3 rounded-2xl backdrop-blur-xs">
                  <p className="text-[10px] text-white/90 italic">"{welcomeMessage}"</p>
                  <div className="text-[9px] uppercase tracking-widest text-rose-300 font-bold">🎵 {music.name}</div>
                </div>

                <div className="relative z-10 pb-2">
                  <div className="py-2.5 bg-rose-600 text-white font-bold text-xs rounded-full uppercase tracking-widest shadow-lg">
                    Open Our Story ❤️
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-[#1A1A1A]/60">
                Click "Generate Website" below to publish and get your shareable link + QR Code!
              </p>
            </div>
          </div>
        )}

        {/* STEP 10: GENERATED COMPLETION */}
        {step === STEP_DONE && generatedSurprise && (
          <div className="space-y-6 max-w-md mx-auto animate-fadeIn text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Your Love Website is Ready!</h2>
              <p className="text-xs text-[#1A1A1A]/60 mt-1">
                Your beautiful interactive gift for {partnerName} has been generated.
              </p>
            </div>

            <div className="bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-xl p-3 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-[#1A1A1A] truncate pl-2">{fullShareUrl}</span>
              <button onClick={handleCopyLink}
                className="px-3.5 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-1.5 shrink-0">
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <button onClick={() => setIsQRModalOpen(true)}
                className="w-full py-3.5 bg-rose-600 text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-rose-700 transition-colors shadow-md flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download Print QR Code
              </button>

              <button onClick={() => onNavigate('s', generatedSurprise.id)}
                className="w-full py-3.5 border border-[#1A1A1A] text-[#1A1A1A] bg-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View Website
              </button>

              <button onClick={() => onNavigate('dashboard')}
                className="text-xs text-[#1A1A1A]/60 underline uppercase font-bold tracking-widest pt-2 block mx-auto">
                Go to My Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Wizard Controls Footer (Steps 1 to 9) */}
        {step <= STEP_PREVIEW && (
          <div className="mt-8 pt-6 border-t border-[#1A1A1A]/10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-colors ${
                step === 1
                  ? 'opacity-30 cursor-not-allowed border border-gray-200'
                  : 'border border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/5'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="px-7 py-3 bg-rose-600 text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-rose-700 transition-colors shadow-md flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                'Generating...'
              ) : step === STEP_PREVIEW ? (
                <>
                  Generate Website
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        surprise={generatedSurprise}
        onClose={() => setIsQRModalOpen(false)}
        onView={id => {
          setIsQRModalOpen(false);
          onNavigate('s', id);
        }}
      />
    </div>
  );
};
