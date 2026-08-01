import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Download, ExternalLink, Heart, Check, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { SurpriseData } from '../types';

interface Props {
  surprise: SurpriseData | null;
  onClose: () => void;
  onViewWebsite: (id: string) => void;
}

export const GeneratedSuccessModal: React.FC<Props> = ({ surprise, onClose, onViewWebsite }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!surprise) return;

    // Trigger celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#fb7185', '#ffffff']
    });

    const fullUrl = `${window.location.origin}/s/${surprise.id}`;

    // Generate QR Code with custom heart styling
    QRCode.toDataURL(fullUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#be123c', // deep rose
        light: '#ffffff'
      }
    }).then(url => {
      setQrDataUrl(url);
    }).catch(err => console.error(err));

  }, [surprise]);

  if (!surprise) return null;

  const fullUrl = `${window.location.origin}/s/${surprise.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `LoveLink_QR_${surprise.partnerName || 'Love'}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-white space-y-6 text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
        >
          <X size={20} />
        </button>

        {/* Celebration Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 mx-auto shadow-xl animate-bounce">
            <Sparkles size={28} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-200 via-pink-100 to-rose-300 bg-clip-text text-transparent">
            🎉 Your Love Website is Ready!
          </h2>
          <p className="text-xs text-slate-300">
            Your beautiful website has been created successfully. Share it with your special someone!
          </p>
        </div>

        {/* URL Copy Box */}
        <div className="bg-slate-950 border border-rose-500/20 rounded-2xl p-2.5 flex items-center gap-2 shadow-inner">
          <input
            type="text"
            readOnly
            value={fullUrl}
            className="bg-transparent flex-1 px-3 py-1 text-xs text-rose-300 font-mono focus:outline-none truncate"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all active:scale-95 flex-shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* QR Code Container */}
        <div className="bg-gradient-to-b from-rose-950/40 to-slate-950/60 border border-rose-500/20 rounded-2xl p-5 inline-block mx-auto relative shadow-xl">
          {qrDataUrl ? (
            <div className="relative inline-block bg-white p-3 rounded-xl shadow-lg">
              <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 object-contain mx-auto" />
              {/* Overlay Heart in center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md border-2 border-white">
                  <Heart fill="currentColor" size={16} />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-44 h-44 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-xs">
              Generating QR...
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={downloadQrCode}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            <Download size={16} /> Download QR Code
          </button>
          <button
            onClick={() => onViewWebsite(surprise.id)}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ExternalLink size={16} /> View Website
          </button>
        </div>

      </motion.div>
    </div>
  );
};
