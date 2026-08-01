import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Upload,
  Music,
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Trash2,
  Check,
  Image as ImageIcon,
  Save,
  Ribbon,
  Star,
  Loader2,
  CloudUpload,
} from 'lucide-react';
import { MemoryImage, SurpriseData, AwardType, CertificateType } from '../types';
import {
  PRESET_MUSIC_TRACKS,
  SAMPLE_MEMORY_IMAGES,
  SAMPLE_REASONS,
  AWARD_OPTIONS,
  STORY_TEMPLATES,
  CERTIFICATE_TYPES,
  StoryTemplate,
} from '../presets';
import { SurpriseThemeView } from '../components/SurpriseThemeView';
import { SmartImage } from '../components/SmartImage';
import { api } from '../api';
import {
  validateImageFile,
  compressImage,
  readFileAsDataUrl,
  withUploadRetry,
} from '../utils/mediaUpload';

interface Props {
  initialData?: SurpriseData | null;
  onNavigate: (path: string) => void;
  onGeneratedSuccess: (surprise: SurpriseData) => void;
}

const WIZARD_STEPS = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Cover' },
  { id: 3, label: 'Letter' },
  { id: 4, label: 'Reasons' },
  { id: 5, label: 'Memories' },
  { id: 6, label: 'Music' },
  { id: 7, label: 'Certificate' },
  { id: 8, label: 'Preview' },
  { id: 9, label: 'Publish' },
] as const;

const TOTAL_WIZARD_STEPS = WIZARD_STEPS.length;
const AUTOSAVE_KEY = 'lovelink_wizard_draft';

/** Load a previously saved draft from localStorage */
function loadDraft(): Partial<WizardState> | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** The shape of everything we want to persist */
interface WizardState {
  creatorName: string;
  partnerName: string;
  title: string;
  coverImage: string;
  memories: MemoryImage[];
  welcomeMessage: string;
  loveLetter: string;
  finalMessage: string;
  reasons: string[];
  certificateType: CertificateType;
  recipientName: string;
  presentedBy: string;
  award: AwardType;
  personalMessage: string;
  selectedMusic: { type: string; name: string; url: string };
}

export const CreateSurpriseWizard: React.FC<Props> = ({
  initialData,
  onNavigate,
  onGeneratedSuccess,
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [autosaveTs, setAutosaveTs] = useState<string>('');
  const [uploadingCover, setUploadingCover] = useState<boolean>(false);
  const [uploadingMemories, setUploadingMemories] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [cloudinaryEnabled, setCloudinaryEnabled] = useState<boolean | null>(null);
  // drag-over highlight state
  const [coverDragOver, setCoverDragOver] = useState<boolean>(false);
  const [memoriesDragOver, setMemoriesDragOver] = useState<boolean>(false);
  // upload progress (0-100) and file count tracking
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadTotal, setUploadTotal] = useState<number>(0);
  const [uploadDone, setUploadDone] = useState<number>(0);

  // Check once on mount whether Cloudinary is configured on the server
  useEffect(() => {
    api.getUploadStatus()
      .then(s => setCloudinaryEnabled(s.cloudinaryEnabled))
      .catch(() => setCloudinaryEnabled(false));
  }, []);

  // Load draft on first mount (only when creating new)
  const draft = initialData ? null : loadDraft();

  // Form State (with draft recovery)
  const [creatorName, setCreatorName] = useState<string>(initialData?.creatorName ?? draft?.creatorName ?? '');
  const [partnerName, setPartnerName] = useState<string>(initialData?.partnerName ?? draft?.partnerName ?? '');
  const [title, setTitle] = useState<string>(initialData?.title ?? draft?.title ?? 'Our Love Story ❤️');
  const [coverImage, setCoverImage] = useState<string>(initialData?.coverImage ?? draft?.coverImage ?? '');

  const [memories, setMemories] = useState<MemoryImage[]>(
    initialData?.memoryImages ??
      draft?.memories ??
      SAMPLE_MEMORY_IMAGES.slice(0, 5).map((s, i) => ({
        id: `default_${i}`,
        url: s.url,
        caption: s.caption,
        date: s.date,
      }))
  );
  // ref always points at the latest memories array — used by upload callbacks
  // so they don't capture a stale closure value for the slot-count check
  const memoriesRef = React.useRef(memories);

  const [welcomeMessage, setWelcomeMessage] = useState<string>(
    initialData?.welcomeMessage ?? draft?.welcomeMessage ?? 'Welcome to our special place ❤️ Every moment spent with you feels like magic.'
  );
  const [loveLetter, setLoveLetter] = useState<string>(
    initialData?.loveLetter ?? draft?.loveLetter ?? 'You are the best part of my life. Every single moment spent with you is a blessing. I love you today, tomorrow, and forever.'
  );
  const [finalMessage, setFinalMessage] = useState<string>(
    initialData?.finalMessage ?? draft?.finalMessage ?? 'Thank you for being mine. I love you endlessly! ❤️'
  );

  const [reasons, setReasons] = useState<string[]>(
    initialData?.reasons ?? draft?.reasons ?? SAMPLE_REASONS.slice(0, 5)
  );

  // Certificate
  const [certificateType, setCertificateType] = useState<CertificateType>(
    initialData?.certificate?.certificateType ?? draft?.certificateType ?? 'Girlfriend'
  );
  const [recipientName, setRecipientName] = useState<string>(
    initialData?.certificate?.recipientName ?? draft?.recipientName ?? ''
  );
  const [presentedBy, setPresentedBy] = useState<string>(
    initialData?.certificate?.presentedBy ?? draft?.presentedBy ?? ''
  );
  const [award, setAward] = useState<AwardType>(
    initialData?.certificate?.award ?? draft?.award ?? 'Best Girlfriend ❤️'
  );
  const [personalMessage, setPersonalMessage] = useState<string>(
    initialData?.certificate?.personalMessage ?? draft?.personalMessage ?? ''
  );

  // Music
  const [selectedMusic, setSelectedMusic] = useState(
    initialData?.music ??
      draft?.selectedMusic ?? {
        type: 'preset',
        name: PRESET_MUSIC_TRACKS[0].name,
        url: PRESET_MUSIC_TRACKS[0].url,
      }
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // keep memoriesRef in sync
  React.useEffect(() => { memoriesRef.current = memories; }, [memories]);

  // ─── Autosave to localStorage ───
  useEffect(() => {
    if (initialData) return; // don't autosave when editing existing
    const state: WizardState = {
      creatorName, partnerName, title, coverImage, memories,
      welcomeMessage, loveLetter, finalMessage, reasons,
      certificateType, recipientName, presentedBy, award, personalMessage,
      selectedMusic,
    };
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAutosaveTs(ts);
    } catch { /* quota exceeded or private mode */ }
  }, [
    creatorName, partnerName, title, coverImage, memories,
    welcomeMessage, loveLetter, finalMessage, reasons,
    certificateType, recipientName, presentedBy, award, personalMessage,
    selectedMusic, initialData,
  ]);

  const clearDraft = () => {
    try { localStorage.removeItem(AUTOSAVE_KEY); } catch {}
  };

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
    setCoverImage(tmpl.coverImage);
    setSelectedMusic({ type: 'preset', name: tmpl.musicTrackName, url: tmpl.musicTrackUrl });
    setMemories(
      tmpl.memoryImages.map((m, idx) => ({
        id: `tmpl_${idx}_${Date.now()}`,
        url: m.url,
        caption: m.caption,
        date: m.date,
      }))
    );
  };

  const handleAddSampleMemory = (sample: (typeof SAMPLE_MEMORY_IMAGES)[0]) => {
    if (memories.length >= 20) return alert('Maximum 20 memories allowed');
    setMemories(prev => [
      ...prev,
      {
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        url: sample.url,
        caption: sample.caption,
        date: sample.date,
      },
    ]);
  };

  // ─── shared helper: upload an array of Files as memory images ───
  const uploadMemoryFiles = useCallback(async (files: File[]) => {
    setUploadError('');
    // read from ref so we always have the latest count, even from drag-drop closure
    const slotsLeft = 20 - memoriesRef.current.length;
    const toUpload = files.slice(0, slotsLeft);

    if (toUpload.length === 0) {
      setUploadError('Maximum 20 memory photos already added.');
      return;
    }

    for (const file of toUpload) {
      const err = validateImageFile(file);
      if (err) { setUploadError(err); return; }
    }

    setUploadTotal(toUpload.length);
    setUploadDone(0);
    setUploadProgress(2); // start at 2% so the bar is visible immediately
    setUploadingMemories(true);
    try {
      const uploaded: MemoryImage[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        const compressed = await compressImage(file);
        const dataUrl = await readFileAsDataUrl(compressed);
        const { url } = await withUploadRetry(() => api.uploadMedia(dataUrl, 'image'));
        uploaded.push({
          id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          url,
          caption: 'Our special memory',
          date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        });
        const done = i + 1;
        setUploadDone(done);
        setUploadProgress(Math.round((done / toUpload.length) * 100));
      }
      setMemories(prev => [...prev, ...uploaded]);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingMemories(false);
      // small delay so the popup can animate out at 100% rather than snapping to 0
      setTimeout(() => { setUploadProgress(0); setUploadTotal(0); setUploadDone(0); }, 400);
    }
  }, []); // no deps — reads memories via ref

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[];
    if (files.length === 0) return;
    e.target.value = '';
    await uploadMemoryFiles(files);
  };

  // ─── shared helper: upload a single File as cover ───
  const uploadCoverFile = useCallback(async (file: File) => {
    const err = validateImageFile(file);
    if (err) { setUploadError(err); return; }

    setUploadError('');
    setUploadTotal(1);
    setUploadDone(0);
    setUploadProgress(2); // start visible immediately
    setUploadingCover(true);
    try {
      const compressed = await compressImage(file);
      const dataUrl = await readFileAsDataUrl(compressed);
      const { url } = await withUploadRetry(() => api.uploadMedia(dataUrl, 'image'));
      setCoverImage(url);
      setUploadDone(1);
      setUploadProgress(100);
    } catch (err: any) {
      setUploadError(err.message || 'Cover upload failed. Please try again.');
    } finally {
      setUploadingCover(false);
      setTimeout(() => { setUploadProgress(0); setUploadTotal(0); setUploadDone(0); }, 400);
    }
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    await uploadCoverFile(file);
  };

  // ─── Drag-and-drop handlers ───
  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCoverDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadCoverFile(file);
  };

  const handleMemoriesDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setMemoriesDragOver(false);
    const files = Array.from(e.dataTransfer.files ?? []) as File[];
    if (files.length > 0) uploadMemoryFiles(files);
  };

  const handleAddReason = () => {
    if (reasons.length >= 15) return alert('Maximum 15 reasons allowed');
    setReasons([...reasons, 'You bring immense happiness to my heart.']);
  };

  const handleRemoveReason = (index: number) => {
    setReasons(reasons.filter((_, i) => i !== index));
  };

  const handleGenerateWebsite = async () => {
    setLoading(true);
    try {
      const payload: Partial<SurpriseData> = {
        creatorName: creatorName || 'Priya',
        partnerName: partnerName || 'Kabir',
        title: title || 'Our Love Story ❤️',
        coverImage: coverImage || memories[0]?.url || '',
        memoryImages: memories,
        welcomeMessage,
        loveLetter,
        finalMessage,
        reasons: reasons.slice(0, 15),
        certificate: {
          recipientName: recipientName || partnerName || 'My Love',
          presentedBy: presentedBy || creatorName || 'Me',
          award,
          certificateType,
          personalMessage: personalMessage || undefined,
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        },
        music: selectedMusic,
      };

      let result: SurpriseData;
      if (initialData?.id) {
        result = await api.updateSurprise(initialData.id, payload);
      } else {
        result = await api.createSurprise(payload);
        clearDraft();
      }

      onGeneratedSuccess(result);
    } catch (err: any) {
      alert(err.message || 'Failed to generate website');
    } finally {
      setLoading(false);
    }
  };

  // Live draft preview object
  const draftSurprise: SurpriseData = {
    id: 'draft',
    userId: 'current',
    creatorName: creatorName || 'Priya',
    partnerName: partnerName || 'Kabir',
    title: title || 'Our Love Story ❤️',
    coverImage: coverImage || memories[0]?.url,
    memoryImages: memories,
    welcomeMessage,
    loveLetter,
    finalMessage,
    reasons,
    certificate: {
      recipientName: recipientName || partnerName || 'Kabir',
      presentedBy: presentedBy || creatorName || 'Priya',
      award,
      certificateType,
      personalMessage: personalMessage || undefined,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    },
    music: selectedMusic,
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_WIZARD_STEPS));
  const goBack = () => setStep(s => Math.max(s - 1, 1));

  // Step-level validation before advancing
  const validateAndNext = () => {
    if (step === 1 && (!creatorName.trim() || !partnerName.trim())) {
      return alert('Please enter both your name and partner name');
    }
    if (step === 5 && memories.length === 0) {
      return alert('Please add at least 1 memory photo');
    }
    goNext();
  };

  const wizardProgressPct = Math.round((step / TOTAL_WIZARD_STEPS) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans py-8 px-4 max-w-5xl mx-auto">

      {/* ─── Progress Header ─── */}
      <div className="mb-6 max-w-2xl mx-auto">
        {/* Step labels — hidden on mobile, visible on sm+ */}
        <div className="hidden sm:flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-2 overflow-hidden">
          {WIZARD_STEPS.map(s => (
            <span
              key={s.id}
              className={`transition-colors ${step === s.id ? 'text-rose-400 font-bold' : step > s.id ? 'text-rose-600/60' : ''}`}
            >
              {s.id}. {s.label}
            </span>
          ))}
        </div>
        {/* Mobile: just show "Step N of 9 — Label" */}
        <div className="sm:hidden flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
          <span>Step {step} of {TOTAL_WIZARD_STEPS}: <span className="text-rose-400">{WIZARD_STEPS[step - 1]?.label}</span></span>
          {autosaveTs && !initialData && (
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Save size={10} /> {autosaveTs}
            </span>
          )}
        </div>

        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-600 to-pink-500 rounded-full"
            animate={{ width: `${wizardProgressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {autosaveTs && !initialData && (
          <div className="hidden sm:flex items-center justify-end mt-1 gap-1 text-[10px] text-slate-500">
            <Save size={10} /> Draft autosaved at {autosaveTs}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* ════════════════════ STEP 1: BASIC DETAILS ════════════════════ */}
        {step === 1 && (
          <motion.div
            key="ws1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 max-w-xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Basic Information</h2>
              <p className="text-xs text-slate-400">Choose a template or fill in the details to build your love website</p>
            </div>

            {/* Quick Start Templates */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-rose-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles size={14} className="text-pink-400" /> Quick Start Templates
                </span>
                <span className="text-[10px] text-slate-400">1-Click Auto-Fill</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STORY_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between space-y-1.5 ${
                      selectedTemplateId === tmpl.id
                        ? 'bg-rose-950/60 border-rose-500 text-white shadow-md shadow-rose-900/40 scale-[1.02]'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-rose-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-max ${tmpl.badgeBg}`}>
                      {tmpl.badge}
                    </span>
                    <span className="font-semibold line-clamp-1">{tmpl.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={creatorName}
                    onChange={e => {
                      setCreatorName(e.target.value);
                      if (!presentedBy) setPresentedBy(e.target.value);
                    }}
                    placeholder="Priya"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Partner / Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={e => {
                      setPartnerName(e.target.value);
                      if (!recipientName) setRecipientName(e.target.value);
                    }}
                    placeholder="Kabir"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Our Love Story ❤️"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Welcome Message</label>
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  placeholder="Welcome to our special place ❤️"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigate('/dashboard')}
                className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={validateAndNext}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1 min-h-[44px]"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ════════════════════ STEP 2: COVER IMAGE ════════════════════ */}
        {step === 2 && (
          <motion.div
            key="ws2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 max-w-xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Cover Image</h2>
              <p className="text-xs text-slate-400">Upload a special cover photo (shown on the welcome screen). Optional — defaults to first memory.</p>
            </div>

            {cloudinaryEnabled === false && (
              <div className="px-4 py-3 bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs rounded-xl space-y-1">
                <p className="font-bold">⚠️ Cloudinary not configured</p>
                <p>Photo uploads won't work until you set <code className="bg-black/30 px-1 rounded">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-black/30 px-1 rounded">CLOUDINARY_API_KEY</code>, and <code className="bg-black/30 px-1 rounded">CLOUDINARY_API_SECRET</code> in your Render environment variables.</p>
              </div>
            )}

            {uploadError && (
              <div className="px-4 py-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {uploadError}
              </div>
            )}

            <div
              onDrop={handleCoverDrop}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); setCoverDragOver(true); }}
              onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setCoverDragOver(true); }}
              onDragLeave={e => { e.stopPropagation(); setCoverDragOver(false); }}
              className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-200 ${
                coverDragOver
                  ? 'border-rose-400 bg-rose-950/40 scale-[1.02]'
                  : uploadingCover
                  ? 'border-rose-500/60 bg-slate-800/60'
                  : 'border-slate-700 hover:border-rose-500/50'
              }`}
            >
              {uploadingCover ? (
                /* ── uploading state shown inside the zone ── */
                <div className="h-52 flex flex-col items-center justify-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="6" />
                      <circle
                        cx="32" cy="32" r="28"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - (uploadProgress || 2) / 100)}`}
                        style={{ transition: 'stroke-dashoffset 0.35s ease' }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-rose-400">
                      {uploadProgress || 0}%
                    </span>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-white">Uploading cover…</p>
                    <p className="text-[11px] text-slate-400">Compressing &amp; sending to Cloudinary</p>
                  </div>
                </div>
              ) : coverImage ? (
                <div className="relative h-52 w-full rounded-xl overflow-hidden group">
                  <SmartImage
                    src={coverImage}
                    alt="Cover"
                    className="h-52 w-full rounded-xl"
                    rootMargin="0px"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="absolute top-2 right-2 p-2 bg-rose-600 text-white rounded-full shadow-md min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer space-y-3 block py-6">
                  <ImageIcon size={40} className="mx-auto text-rose-400" />
                  <p className="text-sm text-slate-300 font-medium">
                    {coverDragOver ? '✦ Drop to upload!' : 'Click or drag & drop cover photo'}
                  </p>
                  <p className="text-[11px] text-slate-500">JPG, PNG, WebP — if skipped, first memory photo is used automatically</p>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} className="hidden" />
                </label>
              )}
            </div>

            <StepNav onBack={goBack} onNext={goNext} />
          </motion.div>
        )}

        {/* ════════════════════ STEP 3: LOVE LETTER ════════════════════ */}
        {step === 3 && (
          <motion.div
            key="ws3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 max-w-xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Love Letter</h2>
              <p className="text-xs text-slate-400">Write a heartfelt letter to your recipient</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Love Letter *</label>
                <textarea
                  rows={6}
                  value={loveLetter}
                  onChange={e => setLoveLetter(e.target.value)}
                  placeholder="You are the best part of my life..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Final Surprise Message</label>
                <input
                  type="text"
                  value={finalMessage}
                  onChange={e => setFinalMessage(e.target.value)}
                  placeholder="Thank you for being mine. I love you endlessly! ❤️"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <StepNav onBack={goBack} onNext={goNext} />
          </motion.div>
        )}

        {/* ════════════════════ STEP 4: REASONS WHY I LOVE YOU ════════════════════ */}
        {step === 4 && (
          <motion.div
            key="ws4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 max-w-xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Reasons Why I Love You</h2>
              <p className="text-xs text-slate-400">Add up to 15 personalized reasons — displayed as animated flash cards</p>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-2.5">
                    {idx + 1}
                  </span>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={e => {
                      const updated = [...reasons];
                      updated[idx] = e.target.value;
                      setReasons(updated);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                  />
                  <button
                    onClick={() => handleRemoveReason(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 mt-2 min-w-[32px] min-h-[32px] flex items-center justify-center"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {reasons.length < 15 && (
                <button
                  onClick={handleAddReason}
                  className="w-full py-2.5 rounded-xl border border-dashed border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-950/30 flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> Add Reason ({reasons.length}/15)
                </button>
              )}
            </div>

            <StepNav onBack={goBack} onNext={goNext} />
          </motion.div>
        )}

        {/* ════════════════════ STEP 5: MEMORIES ════════════════════ */}
        {step === 5 && (
          <motion.div
            key="ws5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 max-w-2xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Memory Photos</h2>
              <p className="text-xs text-slate-400">Upload 5–20 photos of your beautiful moments together</p>
            </div>

            {cloudinaryEnabled === false && (
              <div className="px-4 py-3 bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs rounded-xl space-y-1">
                <p className="font-bold">⚠️ Cloudinary not configured</p>
                <p>Photo uploads won't work until you set <code className="bg-black/30 px-1 rounded">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-black/30 px-1 rounded">CLOUDINARY_API_KEY</code>, and <code className="bg-black/30 px-1 rounded">CLOUDINARY_API_SECRET</code> in your Render environment variables.</p>
              </div>
            )}

            {uploadError && (
              <div className="px-4 py-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {uploadError}
              </div>
            )}

            <div
              onDrop={handleMemoriesDrop}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); setMemoriesDragOver(true); }}
              onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setMemoriesDragOver(true); }}
              onDragLeave={e => { e.stopPropagation(); setMemoriesDragOver(false); }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center space-y-3 transition-all duration-200 ${
                memoriesDragOver
                  ? 'border-rose-400 bg-rose-950/50 scale-[1.02]'
                  : uploadingMemories
                  ? 'border-rose-500/60 bg-slate-800/60'
                  : 'border-rose-500/30 bg-rose-950/20 hover:border-rose-500/60'
              }`}
            >
              {uploadingMemories ? (
                /* ── uploading state inside the zone ── */
                <div className="flex flex-col items-center gap-3 py-2">
                  {/* animated bar */}
                  <div className="w-full max-w-xs mx-auto">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span className="font-semibold text-white">
                        {uploadDone < uploadTotal
                          ? `Photo ${uploadDone + 1} of ${uploadTotal}`
                          : `${uploadTotal} photo${uploadTotal > 1 ? 's' : ''} uploaded ✓`}
                      </span>
                      <span className="font-bold text-rose-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 rounded-full"
                        animate={{ width: `${uploadProgress || 2}%` }}
                        transition={{ duration: 0.35 }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin text-rose-400" />
                    Compressing &amp; uploading to Cloudinary…
                  </p>
                </div>
              ) : (
                <>
                  <Upload size={36} className="mx-auto text-rose-400" />
                  <div>
                    <p className="text-sm font-bold text-white">
                      {memoriesDragOver ? '✦ Drop your photos!' : 'Drag & drop your photos here'}
                    </p>
                    <p className="text-xs text-slate-400">JPG, PNG, WebP — up to 20 photos</p>
                  </div>
                  <label className="inline-block px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer min-h-[40px]">
                    Choose Files
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} disabled={uploadingMemories} className="hidden" />
                  </label>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Uploaded ({memories.length} / 20)</span>
                <span className="text-rose-400 text-[10px]">Min 5 recommended</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                {memories.map((mem, idx) => (
                  <div key={mem.id || idx} className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-1.5 space-y-1">
                    <SmartImage
                      src={mem.url}
                      alt="Memory"
                      className="h-24 w-full rounded-lg"
                      rootMargin="200px"
                    />
                    <button
                      type="button"
                      onClick={() => setMemories(memories.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full shadow-md min-w-[24px] min-h-[24px] flex items-center justify-center"
                    >
                      <X size={11} />
                    </button>
                    <input
                      type="text"
                      value={mem.caption || ''}
                      onChange={e => {
                        const updated = [...memories];
                        updated[idx].caption = e.target.value;
                        setMemories(updated);
                      }}
                      placeholder="Caption..."
                      className="w-full bg-slate-900 border border-slate-800 text-[10px] text-slate-200 px-2 py-1 rounded focus:outline-none focus:border-rose-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-xs font-bold text-slate-400">Need samples? Tap to add preset photos:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SAMPLE_MEMORY_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddSampleMemory(sample)}
                    className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-slate-700 hover:border-rose-400 relative group"
                  >
                    <img src={sample.url} alt="Preset" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={16} className="text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <StepNav onBack={goBack} onNext={validateAndNext} />
          </motion.div>
        )}

        {/* ════════════════════ STEP 6: MUSIC ════════════════════ */}
        {step === 6 && (
          <motion.div
            key="ws6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 max-w-xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Background Serenade</h2>
              <p className="text-xs text-slate-400">Choose romantic music that plays during the surprise</p>
            </div>

            <div className="space-y-3">
              {PRESET_MUSIC_TRACKS.map((track) => {
                const isSelected = selectedMusic.name === track.name;
                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedMusic({ type: 'preset', name: track.name, url: track.url })}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        <Music size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">{track.name}</p>
                        <p className="text-[10px] text-slate-400">{track.artist} ({track.duration})</p>
                      </div>
                    </div>
                    {isSelected && <Check size={18} className="text-rose-400 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>

            <StepNav onBack={goBack} onNext={goNext} />
          </motion.div>
        )}

        {/* ════════════════════ STEP 7: CERTIFICATE ════════════════════ */}
        {step === 7 && (
          <motion.div
            key="ws7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 max-w-xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Certificate Type</h2>
              <p className="text-xs text-slate-400">Choose the certificate type — determines the title, theme, and wording</p>
            </div>

            {/* ── Certificate Type Selector (5 options) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CERTIFICATE_TYPES.map(ct => {
                const isSelected = certificateType === ct.type;
                return (
                  <button
                    key={ct.type}
                    type="button"
                    onClick={() => {
                      setCertificateType(ct.type);
                      // Auto-set award based on type
                      if (ct.type === 'Girlfriend') setAward('Best Girlfriend ❤️');
                      else if (ct.type === 'Boyfriend') setAward('Best Boyfriend ❤️');
                      else setAward('Best Partner ❤️');
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-950/60 border-rose-400 text-white shadow-lg scale-[1.02]'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-rose-500/50'
                    }`}
                  >
                    <span className="text-2xl">{ct.emoji}</span>
                    <span className="font-bold text-xs">{ct.label}</span>
                    <span className="text-[10px] text-slate-400 leading-tight">{ct.description}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Recipient & Sender ── */}
            <div className="space-y-4 border-t border-slate-800 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  value={recipientName || partnerName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder={partnerName || 'e.g. Kabir'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sender Name *</label>
                <input
                  type="text"
                  value={presentedBy || creatorName}
                  onChange={e => setPresentedBy(e.target.value)}
                  placeholder={creatorName || 'e.g. Priya'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Personal Message <span className="text-slate-500 font-normal">(optional — appears on certificate)</span>
                </label>
                <textarea
                  rows={2}
                  value={personalMessage}
                  onChange={e => setPersonalMessage(e.target.value)}
                  placeholder="You are my forever and always…"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>
            </div>

            <StepNav onBack={goBack} onNext={goNext} />
          </motion.div>
        )}

        {/* ════════════════════ STEP 8: PREVIEW ════════════════════ */}
        {step === 8 && (
          <motion.div
            key="ws8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-5xl mx-auto"
          >
            {/* Phone Frame Mockup */}
            <div className="relative w-[320px] sm:w-[340px] h-[640px] sm:h-[680px] rounded-[48px] border-[10px] border-slate-900 bg-slate-950 shadow-2xl overflow-hidden flex-shrink-0 ring-1 ring-slate-800">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-800 rounded-full" />
              </div>
              <div className="w-full h-full overflow-y-auto">
                <SurpriseThemeView surprise={draftSurprise} isMobilePreview={true} />
              </div>
            </div>

            {/* Summary Panel */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 max-w-md w-full shadow-2xl">
              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Step 8 of 9</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">Preview Your Surprise</h2>
                <p className="text-xs text-slate-400">Scroll through the phone preview to check everything looks great</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300">
                <p className="font-bold text-white text-sm border-b border-slate-800 pb-2">Summary</p>
                <Row label="For" value={`${partnerName} from ${creatorName}`} />
                <Row label="Memories" value={`${memories.length} photos`} />
                <Row label="Reasons" value={`${reasons.length} flash cards`} />
                <Row label="Music" value={selectedMusic.name} />
                <Row label="Certificate" value={`${certificateType} — ${CERTIFICATE_TYPES.find(c => c.type === certificateType)?.description ?? ''}`} />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="w-1/3 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 min-h-[48px]"
                >
                  Back
                </button>
                <button
                  onClick={goNext}
                  className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg min-h-[48px]"
                >
                  <Sparkles size={16} /> Looks Great — Publish!
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════ STEP 9: PUBLISH ════════════════════ */}
        {step === 9 && (
          <motion.div
            key="ws9"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg mx-auto space-y-6 shadow-2xl text-center"
          >
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center mx-auto shadow-lg">
                <Heart fill="white" size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Almost There!</h2>
              <p className="text-xs text-slate-400">Review & confirm then publish your love surprise to get a shareable link</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300 text-left">
              <p className="font-bold text-white text-sm border-b border-slate-800 pb-2">Final Check</p>
              <Row label="Creator" value={creatorName || '—'} />
              <Row label="Recipient" value={partnerName || '—'} />
              <Row label="Title" value={title || '—'} />
              <Row label="Memories" value={`${memories.length} photos`} />
              <Row label="Reasons" value={`${reasons.length} reasons`} />
              <Row label="Certificate" value={`${certificateType}`} />
              <Row label="Music" value={selectedMusic.name} />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleGenerateWebsite}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-base shadow-xl shadow-rose-600/40 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 min-h-[52px]"
              >
                <Sparkles size={20} />
                {loading ? 'Publishing…' : initialData?.id ? 'Update Surprise Website' : 'Publish Love Website ❤️'}
              </button>
              <button
                onClick={goBack}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 min-h-[44px]"
              >
                ← Go Back & Edit
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ─── Global Upload Progress Toast ─── */}
      <AnimatePresence>
        {(uploadingCover || uploadingMemories) && (
          <motion.div
            key="upload-toast"
            initial={{ opacity: 0, y: 48, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48, scale: 0.94 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,380px)] bg-[#0f172a] border border-rose-500/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* animated rose top-bar that fills as progress increases */}
            <motion.div
              className="h-1 bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400"
              animate={{ width: `${uploadProgress || 2}%` }}
              transition={{ duration: 0.35 }}
            />

            <div className="p-4 flex items-center gap-3">
              {/* spinning ring icon */}
              <div className="relative w-11 h-11 flex-shrink-0">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#1e293b" strokeWidth="4" />
                  <motion.circle
                    cx="22" cy="22" r="18"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 18}`}
                    animate={{ strokeDashoffset: 2 * Math.PI * 18 * (1 - (uploadProgress || 2) / 100) }}
                    transition={{ duration: 0.35 }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-rose-400">
                  {uploadProgress || 0}%
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white leading-tight">
                  {uploadingCover
                    ? 'Uploading cover photo…'
                    : uploadDone < uploadTotal
                    ? `Uploading photo ${uploadDone + 1} of ${uploadTotal}…`
                    : `Processing ${uploadTotal} photo${uploadTotal > 1 ? 's' : ''}…`}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Compressing &amp; sending to Cloudinary
                </p>
              </div>
            </div>

            {/* progress bar */}
            <div className="mx-4 mb-4 h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 rounded-full"
                animate={{ width: `${uploadProgress || 2}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Reusable Back/Next footer for wizard steps */
function StepNav({ onBack, onNext, nextLabel = 'Next' }: { onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="flex gap-3 pt-4 border-t border-slate-800">
      <button
        onClick={onBack}
        className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold flex items-center justify-center gap-1 min-h-[44px]"
      >
        <ChevronLeft size={14} /> Back
      </button>
      <button
        onClick={onNext}
        className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1 min-h-[44px]"
      >
        {nextLabel} <ChevronRight size={14} />
      </button>
    </div>
  );
}

/** Simple key-value row for summary display */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-slate-500 flex-shrink-0">{label}:</span>
      <span className="font-semibold text-right text-rose-300 truncate max-w-[180px]">{value}</span>
    </div>
  );
}
