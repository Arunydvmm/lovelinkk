import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Award, Download, Heart, Ribbon, Star } from 'lucide-react';
import { CertificateData, CertificateType } from '../types';

interface CertificateComponentProps {
  data: CertificateData;
  allowDownload?: boolean;
}

/** Derives all visual + textual properties from the chosen type */
function getCertConfig(type?: CertificateType) {
  switch (type) {
    case 'Girlfriend':
      return {
        title: 'Certificate of Love',
        subtitle: 'Official Award of Love',
        body: 'is hereby recognized and celebrated as the most wonderful',
        award: 'Best Girlfriend ❤️',
        tagline: 'For infinite love, endless smiles, and everlasting companionship.',
        icon: <Heart className="w-6 h-6 text-rose-600 fill-rose-200" />,
        borderColor: 'border-rose-300',
        outerBg: '#FFFDF9',
        sealFrom: 'from-rose-400',
        sealVia: 'via-pink-400',
        sealTo: 'to-rose-200',
        badgeBg: 'bg-rose-600',
        accentText: 'text-rose-900',
        borderClass: 'border-rose-200',
        innerGradient: 'from-rose-50/30 to-pink-50/20',
      };
    case 'Boyfriend':
      return {
        title: 'Certificate of Love',
        subtitle: 'Official Award of Love',
        body: 'is hereby recognized and celebrated as the most wonderful',
        award: 'Best Boyfriend ❤️',
        tagline: 'For courage, loyalty, and the warmth that fills every room.',
        icon: <Heart className="w-6 h-6 text-blue-600 fill-blue-200" />,
        borderColor: 'border-blue-300',
        outerBg: '#F8FAFF',
        sealFrom: 'from-blue-400',
        sealVia: 'via-indigo-400',
        sealTo: 'to-blue-200',
        badgeBg: 'bg-indigo-600',
        accentText: 'text-indigo-900',
        borderClass: 'border-indigo-200',
        innerGradient: 'from-blue-50/30 to-indigo-50/20',
      };
    case 'Best Friend':
      return {
        title: 'Certificate of Friendship',
        subtitle: 'Official BFF Recognition',
        body: 'is hereby celebrated and honored as the most incredible',
        award: 'Best Friend Forever 🌟',
        tagline: 'For laughter, loyalty, and a bond that time cannot break.',
        icon: <Star className="w-6 h-6 text-amber-600 fill-amber-200" />,
        borderColor: 'border-amber-300',
        outerBg: '#FFFEF5',
        sealFrom: 'from-amber-400',
        sealVia: 'via-yellow-400',
        sealTo: 'to-amber-200',
        badgeBg: 'bg-amber-600',
        accentText: 'text-amber-900',
        borderClass: 'border-amber-200',
        innerGradient: 'from-amber-50/30 to-yellow-50/20',
      };
    case 'Husband':
      return {
        title: 'Certificate of Forever',
        subtitle: 'Official Lifetime Recognition',
        body: 'is hereby honored and cherished forever as the most devoted',
        award: 'Best Husband 💍',
        tagline: 'For a lifetime of devotion, strength, and unconditional love.',
        icon: <Ribbon className="w-6 h-6 text-purple-600 fill-purple-100" />,
        borderColor: 'border-purple-300',
        outerBg: '#FAF8FF',
        sealFrom: 'from-purple-400',
        sealVia: 'via-violet-400',
        sealTo: 'to-purple-200',
        badgeBg: 'bg-purple-700',
        accentText: 'text-purple-900',
        borderClass: 'border-purple-200',
        innerGradient: 'from-purple-50/30 to-violet-50/20',
      };
    case 'Wife':
      return {
        title: 'Certificate of Forever',
        subtitle: 'Official Lifetime Recognition',
        body: 'is hereby honored and cherished forever as the most devoted',
        award: 'Best Wife 💍',
        tagline: 'For a lifetime of grace, warmth, and eternal partnership.',
        icon: <Ribbon className="w-6 h-6 text-rose-600 fill-rose-100" />,
        borderColor: 'border-rose-300',
        outerBg: '#FFF8FC',
        sealFrom: 'from-rose-400',
        sealVia: 'via-fuchsia-400',
        sealTo: 'to-pink-200',
        badgeBg: 'bg-rose-700',
        accentText: 'text-rose-900',
        borderClass: 'border-rose-200',
        innerGradient: 'from-rose-50/30 to-fuchsia-50/20',
      };
    default:
      // Fallback — generic love certificate
      return {
        title: 'Certificate of Love',
        subtitle: 'Official Award of Love',
        body: 'is hereby honored with the highest recognition as the',
        award: 'Best Partner ❤️',
        tagline: 'For infinite love, endless smiles, and everlasting companionship.',
        icon: <Ribbon className="w-6 h-6 text-rose-600 fill-rose-100" />,
        borderColor: 'border-amber-300',
        outerBg: '#FAF9F6',
        sealFrom: 'from-amber-400',
        sealVia: 'via-rose-400',
        sealTo: 'to-amber-200',
        badgeBg: 'bg-rose-600',
        accentText: 'text-rose-900',
        borderClass: 'border-amber-200',
        innerGradient: 'from-amber-50/30 to-rose-50/20',
      };
  }
}

export const CertificateComponent: React.FC<CertificateComponentProps> = ({
  data,
  allowDownload = true,
}) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<'png' | 'pdf' | null>(null);

  const cfg = getCertConfig(data.certificateType);
  // override award label if the config provides a better one
  const displayAward = data.award || cfg.award;

  const captureCanvas = async () => {
    if (!certRef.current) throw new Error('No ref');
    return html2canvas(certRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: cfg.outerBg,
      logging: false,
    });
  };

  const handleDownloadPNG = async () => {
    setDownloading('png');
    try {
      const canvas = await captureCanvas();
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `LoveLink_Certificate_${(data.recipientName || 'Love').replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('PNG capture failed', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading('pdf');
    try {
      const canvas = await captureCanvas();
      const imgData = canvas.toDataURL('image/png');
      // Dynamically import jsPDF so it only loads when needed
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`LoveLink_Certificate_${(data.recipientName || 'Love').replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto my-4 space-y-4">
      {/* ─── Certificate Graphic ─── */}
      <div
        ref={certRef}
        className={`relative rounded-2xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden selection:bg-rose-100 border-[12px] ${cfg.borderColor}`}
        style={{ backgroundColor: cfg.outerBg }}
      >
        {/* Decorative Corner Ornaments */}
        <div className={`absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-600/60 rounded-tl-lg`} />
        <div className={`absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-600/60 rounded-tr-lg`} />
        <div className={`absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-600/60 rounded-bl-lg`} />
        <div className={`absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-600/60 rounded-br-lg`} />

        {/* Subtle background watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]"
          aria-hidden="true"
        >
          <Heart className="w-64 h-64 fill-current text-rose-900" />
        </div>

        {/* Inner foil border */}
        <div className={`border ${cfg.borderClass} p-5 sm:p-6 rounded-xl bg-gradient-to-b ${cfg.innerGradient} relative z-10`}>

          {/* Seal Badge */}
          <div className="flex justify-center mb-3">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${cfg.sealFrom} ${cfg.sealVia} ${cfg.sealTo} p-0.5 shadow-lg`}>
              <div
                className="w-full h-full rounded-full flex flex-col items-center justify-center border border-white/40"
                style={{ backgroundColor: cfg.outerBg }}
              >
                {cfg.icon}
              </div>
            </div>
          </div>

          {/* LoveLink branding */}
          <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-amber-700/60 mb-0.5">
            LoveLink Official
          </p>

          <p className={`text-[11px] uppercase tracking-[0.3em] font-bold ${cfg.accentText}/80 mb-1`}>
            {cfg.subtitle}
          </p>

          <h2 className={`text-3xl sm:text-4xl font-serif italic font-bold mb-2 tracking-tight ${cfg.accentText}`}>
            {cfg.title}
          </h2>

          <p className={`text-xs italic font-serif mb-4 ${cfg.accentText}/60`}>
            This is to certify that
          </p>

          {/* Recipient Name */}
          <div className={`my-2 py-1 border-b-2 border-amber-300 max-w-xs mx-auto`}>
            <h3 className={`text-2xl sm:text-3xl font-serif font-bold tracking-wide ${cfg.accentText}`}>
              {data.recipientName || 'Your Name'}
            </h3>
          </div>

          <p className={`text-xs ${cfg.accentText}/70 my-3 leading-relaxed`}>
            {cfg.body}
          </p>

          {/* Award Badge */}
          <div className={`my-4 inline-block px-5 py-2.5 ${cfg.badgeBg} text-white font-serif text-lg sm:text-xl font-bold rounded-full shadow-md border-2 border-white/20`}>
            {displayAward}
          </div>

          {/* Personal Message (optional) */}
          {data.personalMessage && (
            <div className={`mx-auto max-w-xs my-3 px-4 py-2 rounded-xl bg-white/60 border ${cfg.borderClass}`}>
              <p className={`text-xs italic font-serif leading-relaxed ${cfg.accentText}/80`}>
                "{data.personalMessage}"
              </p>
            </div>
          )}

          <p className={`text-xs italic font-serif mt-2 ${cfg.accentText}/60`}>
            {cfg.tagline}
          </p>

          {/* Signatures & Date */}
          <div className="grid grid-cols-3 gap-2 mt-8 pt-4 border-t border-amber-200 text-left items-end">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                Presented By
              </p>
              <p className={`font-serif italic font-semibold text-sm ${cfg.accentText} mt-0.5`}>
                {data.presentedBy || 'With Love'}
              </p>
            </div>

            {/* Center official seal */}
            <div className="flex flex-col items-center justify-center">
              <div className={`w-12 h-12 rounded-full border-2 border-amber-500/60 flex flex-col items-center justify-center`}
                style={{ backgroundColor: cfg.outerBg }}
              >
                <Award className="w-5 h-5 text-amber-600" />
                <p className="text-[7px] font-extrabold text-amber-700 uppercase leading-none mt-0.5">Official</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                Date Issued
              </p>
              <p className="font-mono text-xs text-slate-700 mt-0.5">
                {data.date || new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Download Buttons ─── */}
      {allowDownload && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownloadPNG}
            disabled={!!downloading}
            className="flex-1 py-3 bg-[#1A1A1A] text-[#FAF9F6] text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-rose-900 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-rose-300" />
            {downloading === 'png' ? 'Saving…' : 'Save PNG'}
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={!!downloading}
            className="flex-1 py-3 bg-amber-700 text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-amber-200" />
            {downloading === 'pdf' ? 'Saving…' : 'Save PDF'}
          </button>
        </div>
      )}
    </div>
  );
};
