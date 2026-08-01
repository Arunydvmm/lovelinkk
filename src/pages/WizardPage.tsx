import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { AwardType, MemoryImage, MusicData, SurpriseData } from '../types';
import { PRESET_MUSIC_TRACKS, SAMPLE_MEMORY_IMAGES, AWARD_OPTIONS, SAMPLE_REASONS } from '../presets';
import { CertificateComponent } from '../components/CertificateComponent';
import { QRCodeModal } from '../components/QRCodeModal';
import {
  validateImageFile,
  validateAudioFile,
  compressImage,
  readFileAsDataUrl,
  withUploadRetry,
} from '../utils/mediaUpload';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Plus,
  Trash2,
  Music,
  Check,
  Heart,
  Sparkles,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Disc,
  Info,
  RefreshCw,
  ImageOff,
  Repeat
} from 'lucide-react';

interface PendingUpload {
  localId: string;
  file: File;
  previewUrl: string;
  status: 'compressing' | 'uploading' | 'error';
  error?: string;
}

interface WizardPageProps {
  editSurpriseId?: string;
  onNavigate: (tab: string, id?: string) => void;
}

export const WizardPage: React.FC<WizardPageProps> = ({ editSurpriseId, onNavigate }) => {
  const { user, token } = useAuth();

  // Active step (1 to 8)
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [uploadingMusic, setUploadingMusic] = useState<boolean>(false);
  const [cloudinaryEnabled, setCloudinaryEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    api.getUploadStatus()
      .then(s => setCloudinaryEnabled(s.cloudinaryEnabled))
      .catch(() => setCloudinaryEnabled(false));
  }, []);

  // Form State
  const [creatorName, setCreatorName] = useState<string>(user?.name.split(' ')[0] || '');
  const [partnerName, setPartnerName] = useState<string>('');
  const [title, setTitle] = useState<string>('Our Love Story ❤️');
  const [coverImage, setCoverImage] = useState<string>('');
  const [memoryImages, setMemoryImages] = useState<MemoryImage[]>(SAMPLE_MEMORY_IMAGES.map((img, i) => ({ id: `mem_${i}`, ...img })));
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Messages
  const [welcomeMessage, setWelcomeMessage] = useState<string>('Welcome to our quiet magical corner of the universe. Every moment spent with you is a gift.');
  const [loveLetter, setLoveLetter] = useState<string>(
    `From the moment you entered my life, everything became warmer and brighter.\n\nThank you for every shared laugh, late-night talk, and unconditioned hug. I love you today, tomorrow, and forever!`
  );
  const [finalMessage, setFinalMessage] = useState<string>('Thank you for being mine. I love you endlessly! ❤️');

  // Reasons
  const [reasons, setReasons] = useState<string[]>(SAMPLE_REASONS);
  const [newReasonInput, setNewReasonInput] = useState<string>('');

  // Certificate
  const [award, setAward] = useState<AwardType>('Best Partner ❤️');

  // Music
  const [music, setMusic] = useState<MusicData>({
    type: 'preset',
    url: PRESET_MUSIC_TRACKS[0].url,
    name: PRESET_MUSIC_TRACKS[0].name,
  });

  // Result state after Step 8
  const [generatedSurprise, setGeneratedSurprise] = useState<SurpriseData | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // If editing existing surprise, load data
  useEffect(() => {
    if (editSurpriseId) {
      setLoading(true);
      fetch(`/api/surprises/${editSurpriseId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then(res => res.json())
        .then(data => {
          if (data.surprise) {
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
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [editSurpriseId]);

  // Update default names when user changes
  useEffect(() => {
    if (user && !creatorName) {
      setCreatorName(user.name.split(' ')[0]);
    }
  }, [user]);

  // Processes one File end-to-end: validate -> preview -> compress -> upload (with retry).
  // Tracked as a "pending" card in the UI until it either lands in memoryImages or errors out.
  const processMemoryFile = async (file: File, localId: string) => {
    setPendingUploads(prev =>
      prev.map(p => (p.localId === localId ? { ...p, status: 'compressing' } : p))
    );

    try {
      const compressed = await compressImage(file);

      setPendingUploads(prev =>
        prev.map(p => (p.localId === localId ? { ...p, status: 'uploading' } : p))
      );

      const dataUrl = await readFileAsDataUrl(compressed);
      const { url } = await withUploadRetry(() => api.uploadMedia(dataUrl, 'image'));

      setMemoryImages(prev =>
        [
          ...prev,
          {
            id: 'mem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            url,
            caption: 'Special Memory',
            date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          },
        ].slice(0, 20)
      );

      setPendingUploads(prev => {
        const target = prev.find(p => p.localId === localId);
        if (target) URL.revokeObjectURL(target.previewUrl);
        return prev.filter(p => p.localId !== localId);
      });
    } catch (err: any) {
      setPendingUploads(prev =>
        prev.map(p =>
          p.localId === localId
            ? { ...p, status: 'error', error: err.message || 'Upload failed. Please try again.' }
            : p
        )
      );
    }
  };

  const queueMemoryFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const slotsLeft = 20 - memoryImages.length - pendingUploads.length;

    if (slotsLeft <= 0) {
      setError('Maximum 20 memory images allowed.');
      return;
    }

    setError('');
    const filesToQueue = files.slice(0, slotsLeft);
    if (files.length > filesToQueue.length) {
      setError(`Only ${slotsLeft} more image${slotsLeft === 1 ? '' : 's'} can be added (20 max).`);
    }

    filesToQueue.forEach(file => {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const localId = 'pending_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      const previewUrl = URL.createObjectURL(file);

      setPendingUploads(prev => [...prev, { localId, file, previewUrl, status: 'compressing' }]);
      processMemoryFile(file, localId);
    });
  };

  // Handle Image Upload (file picker) — validates, compresses, and uploads to Cloudinary
  const handleMemoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = ''; // allow re-selecting the same file later
    if (!files || files.length === 0) return;
    queueMemoryFiles(files);
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
  const handleReplaceMemoryImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const targetId = memoryImages[index]?.id;
    setError('');

    (async () => {
      try {
        const compressed = await compressImage(file);
        const dataUrl = await readFileAsDataUrl(compressed);
        const { url } = await withUploadRetry(() => api.uploadMedia(dataUrl, 'image'));
        setMemoryImages(prev => prev.map(img => (img.id === targetId ? { ...img, url } : img)));
      } catch (err: any) {
        setError(err.message || 'Failed to replace the image. Please try again.');
      }
    })();
  };

  const handleAddSampleImage = () => {
    const sample = SAMPLE_MEMORY_IMAGES[memoryImages.length % SAMPLE_MEMORY_IMAGES.length];
    if (memoryImages.length < 20) {
      setMemoryImages(prev => [
        ...prev,
        { id: 'mem_' + Date.now(), url: sample.url, caption: sample.caption, date: sample.date }
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
      setError(validationError);
      return;
    }

    setUploadingMusic(true);
    setError('');
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const { url } = await withUploadRetry(() => api.uploadMedia(dataUrl, 'audio'));
      setMusic({
        type: 'upload',
        url,
        name: file.name,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to upload the music file. Please try again.');
    } finally {
      setUploadingMusic(false);
    }
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!creatorName.trim() || !partnerName.trim() || !title.trim()) {
        setError('Please enter your name, partner name, and surprise title.');
        return false;
      }
    } else if (step === 2) {
      if (memoryImages.length < 1) {
        setError('Please upload at least 1 memory photo (5-20 recommended).');
        return false;
      }
    } else if (step === 3) {
      if (!welcomeMessage.trim() || !loveLetter.trim() || !finalMessage.trim()) {
        setError('Please complete all message fields.');
        return false;
      }
    } else if (step === 4) {
      if (reasons.length === 0) {
        setError('Please add at least 1 reason why you love them.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 7) {
        setStep(prev => prev + 1);
      } else if (step === 7) {
        // Submit to API
        handleGenerateSurprise();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
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
        setStep(8); // Move to final completion step
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

  return (
    <div className="flex-1 bg-gradient-to-br from-pink-100/90 via-rose-50/80 to-pink-100/90 py-10 px-4 sm:px-8 max-w-5xl mx-auto w-full flex flex-col">
      {/* Wizard Progress Header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center text-xs font-bold font-serif">
              {step}
            </div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">
              Step {step} of 8
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-serif italic text-[#1A1A1A]">
            {step === 1 && 'Basic Details'}
            {step === 2 && 'Upload Memories'}
            {step === 3 && 'Love Messages'}
            {step === 4 && 'Why I Love You'}
            {step === 5 && 'Dynamic Certificate'}
            {step === 6 && 'Background Music'}
            {step === 7 && 'Interactive Preview'}
            {step === 8 && 'Your Website is Ready! 🎉'}
          </h1>
        </div>

        {/* 8-Step Breadcrumb Bar */}
        <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i < step
                  ? 'bg-rose-600'
                  : i === step
                  ? 'bg-[#1A1A1A]'
                  : 'bg-[#1A1A1A]/10'
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
        
        {/* STEP 1: ABOUT YOU */}
        {step === 1 && (
          <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">About You & Your Partner</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Fill in the names for the personalized surprise website.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80 mb-1">
                  Your Name (Creator)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya"
                  value={creatorName}
                  onChange={e => setCreatorName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/20 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80 mb-1">
                  Partner's Name (Recipient)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kabir"
                  value={partnerName}
                  onChange={e => setPartnerName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/20 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80 mb-1">
                  Surprise Website Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Our Love Story ❤️"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/20 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: UPLOAD MEMORIES */}
        {step === 2 && (
          <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
            {cloudinaryEnabled === false && (
              <div className="px-4 py-3 bg-amber-50 border border-amber-400 text-amber-800 text-xs rounded-2xl space-y-1">
                <p className="font-bold">⚠️ Photo uploads not available</p>
                <p>Cloudinary is not configured on the server. Set <strong>CLOUDINARY_CLOUD_NAME</strong>, <strong>CLOUDINARY_API_KEY</strong>, and <strong>CLOUDINARY_API_SECRET</strong> in your Render environment, then redeploy.</p>
              </div>
            )}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Upload Your Memories</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Upload 5–20 photos of your best moments together.
              </p>
            </div>

            {/* Optional Cover Image Picker */}
            <div className="p-4 bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Cover Image (Optional)
                  </h4>
                  <p className="text-[11px] text-[#1A1A1A]/50">
                    If left empty, we auto-use your first memory photo with blur overlay.
                  </p>
                </div>
                {coverImage && (
                  <button
                    onClick={() => setCoverImage('')}
                    className="text-[10px] text-rose-600 underline font-bold uppercase"
                  >
                    Clear Custom Cover
                  </button>
                )}
              </div>

              {coverImage ? (
                <div className="aspect-[21/9] rounded-xl overflow-hidden relative border border-[#1A1A1A]/10">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="p-3 bg-white border border-dashed border-[#1A1A1A]/20 rounded-xl text-center">
                  <span className="text-xs text-[#1A1A1A]/60 italic font-serif">
                    Auto-cover active using 1st uploaded photo with dark romantic overlay
                  </span>
                </div>
              )}
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
                <p className="text-xs text-[#1A1A1A]/50 mt-0.5">JPG, PNG, WEBP — up to {`${20}`} images, 10MB each.</p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <label className="px-5 py-2.5 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-rose-700 transition-colors shadow-sm">
                  Choose Files
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleMemoryUpload}
                    className="hidden"
                  />
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

            {/* In-flight uploads (compressing / uploading / errored) */}
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
                            <button
                              type="button"
                              onClick={() => handleRetryPendingUpload(pending.localId)}
                              className="px-2.5 py-1 bg-white text-[#1A1A1A] rounded-full text-[10px] font-bold uppercase"
                            >
                              Retry
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePendingUpload(pending.localId)}
                              className="px-2.5 py-1 bg-black/60 text-white rounded-full text-[10px] font-bold uppercase"
                            >
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
                Uploaded Memories ({memoryImages.length}/20)
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {memoryImages.map((img, index) => (
                  <div
                    key={img.id}
                    className="relative bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-xl overflow-hidden group"
                  >
                    <div className="aspect-square relative">
                      <img src={img.url} alt={`Memory ${index}`} className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 right-1.5 flex gap-1.5">
                        <label
                          className="p-1 bg-black/70 text-white rounded-full hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Replace photo"
                        >
                          <Repeat className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleReplaceMemoryImage(index, e)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setMemoryImages(prev => prev.filter((_, i) => i !== index))}
                          className="p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                          title="Remove photo"
                        >
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
                          setMemoryImages(prev =>
                            prev.map((m, i) => (i === index ? { ...m, caption: val } : m))
                          );
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

        {/* STEP 3: MESSAGES */}
        {step === 3 && (
          <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Add Messages & Love Letter</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Express your feelings with personalized messages.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80 mb-1">
                  Welcome Message
                </label>
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/20 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80 mb-1">
                  Love Letter
                </label>
                <textarea
                  rows={6}
                  value={loveLetter}
                  onChange={e => setLoveLetter(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/20 rounded-xl text-sm font-serif leading-relaxed focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80 mb-1">
                  Final Farewell Message
                </label>
                <input
                  type="text"
                  value={finalMessage}
                  onChange={e => setFinalMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/20 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: WHY I LOVE YOU */}
        {step === 4 && (
          <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Why I Love You</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Add up to 5 personalized reasons why they are so special to you.
              </p>
            </div>

            <div className="space-y-3">
              {reasons.map((reason, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-xl gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      ❤️
                    </div>
                    <span className="text-xs text-[#1A1A1A] font-medium leading-relaxed">
                      {reason}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveReason(index)}
                    className="text-rose-600 hover:text-rose-800 p-1 shrink-0"
                  >
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
                  <button
                    type="button"
                    onClick={handleAddReason}
                    className="px-4 py-2.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-rose-900 transition-colors"
                  >
                    + Add
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: CERTIFICATE */}
        {step === 5 && (
          <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Dynamic Certificate of Love</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Choose the official award title for {partnerName || 'your partner'}.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              {AWARD_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAward(opt)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    award === opt
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-white border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Real-time Certificate Component Preview */}
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

        {/* STEP 6: MUSIC */}
        {step === 6 && (
          <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Select Background Music</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Pick a romantic ambient soundtrack or upload your favorite MP3 track.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/70">
                Preset Audio Tracks
              </p>

              {PRESET_MUSIC_TRACKS.map(track => (
                <div
                  key={track.id}
                  onClick={() =>
                    setMusic({
                      type: 'preset',
                      url: track.url,
                      name: track.name,
                    })
                  }
                  className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    music.name === track.name
                      ? 'border-rose-600 bg-rose-50/60 shadow-xs'
                      : 'border-[#1A1A1A]/15 bg-white hover:border-[#1A1A1A]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Disc className={`w-5 h-5 ${music.name === track.name ? 'text-rose-600 animate-spin' : 'text-[#1A1A1A]/40'}`} style={{ animationDuration: '4s' }} />
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80 mb-2">
                  Or Upload Custom MP3 File
                </label>
                <input
                  type="file"
                  accept="audio/mp3,audio/*"
                  onChange={handleMusicUpload}
                  disabled={uploadingMusic}
                  className="block w-full text-xs text-[#1A1A1A]/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1A1A1A] file:text-white hover:file:bg-rose-900 cursor-pointer disabled:opacity-50"
                />
                {uploadingMusic && (
                  <p className="text-xs text-rose-600 font-bold mt-1 animate-pulse">Uploading to Cloudinary…</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: PREVIEW */}
        {step === 7 && (
          <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn text-center">
            <div>
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Preview Your Love Website</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Review how your partner will experience the surprise on mobile.
              </p>
            </div>

            {/* Mobile Phone Mockup Frame */}
            <div className="w-[300px] h-[520px] mx-auto bg-black rounded-[40px] p-3 shadow-2xl border-4 border-neutral-800 relative overflow-hidden flex flex-col justify-between text-white">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20"></div>

              {/* Inside Mobile Screen Content */}
              <div className="w-full h-full bg-[#1A1A1A] rounded-[30px] overflow-y-auto p-4 flex flex-col justify-between relative text-center">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40"
                  style={{
                    backgroundImage: `url(${coverImage || (memoryImages[0] ? memoryImages[0].url : '')})`
                  }}
                />
                <div className="relative z-10 pt-8 space-y-2">
                  <span className="bg-rose-600/90 text-white text-[9px] uppercase tracking-widest px-2 py-0.5 rounded font-bold">
                    Interactive Surprise
                  </span>
                  <h3 className="text-2xl font-serif italic text-white font-bold">
                    {partnerName} & {creatorName}
                  </h3>
                  <p className="text-xs font-serif italic text-rose-300">{title}</p>
                </div>

                <div className="relative z-10 space-y-2 my-auto bg-black/60 p-3 rounded-2xl backdrop-blur-xs">
                  <p className="text-[10px] text-white/90 italic">"{welcomeMessage}"</p>
                  <div className="text-[9px] uppercase tracking-widest text-rose-300 font-bold">
                    🎵 {music.name}
                  </div>
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

        {/* STEP 8: GENERATED COMPLETION */}
        {step === 8 && generatedSurprise && (
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

            {/* Share Link Input */}
            <div className="bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-xl p-3 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-[#1A1A1A] truncate pl-2">{fullShareUrl}</span>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="w-full py-3.5 bg-rose-600 text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-rose-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Print QR Code
              </button>

              <button
                onClick={() => onNavigate('s', generatedSurprise.id)}
                className="w-full py-3.5 border border-[#1A1A1A] text-[#1A1A1A] bg-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Website
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className="text-xs text-[#1A1A1A]/60 underline uppercase font-bold tracking-widest pt-2 block mx-auto"
              >
                Go to My Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Wizard Controls Footer (For Steps 1 to 7) */}
        {step <= 7 && (
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
              className="px-7 py-3 bg-rose-600 text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-rose-700 transition-colors shadow-md flex items-center gap-2"
            >
              {loading ? (
                'Generating...'
              ) : step === 7 ? (
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
