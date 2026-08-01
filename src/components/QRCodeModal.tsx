import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Download, ExternalLink, Check, Heart } from 'lucide-react';
import { SurpriseData } from '../types';

interface QRCodeModalProps {
  surprise: SurpriseData | null;
  onClose: () => void;
  onView: (id: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ surprise, onClose, onView }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');

  const fullUrl = surprise
    ? `${window.location.origin}/s/${surprise.id}`
    : '';

  useEffect(() => {
    if (surprise && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        fullUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#881337', // Deep rose dark pixels
            light: '#FAF9F6', // Off-white background
          },
        },
        (err) => {
          if (err) console.error(err);
          if (canvasRef.current) {
            setQrUrl(canvasRef.current.toDataURL('image/png'));
          }
        }
      );
    }
  }, [surprise, fullUrl]);

  if (!surprise) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `lovelink-qr-${surprise.partnerName.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] border border-[#1A1A1A]/20 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-[#1A1A1A]/10 flex items-center justify-between bg-rose-50/50">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Your Love Website is Ready!</h3>
            <p className="text-xs text-[#1A1A1A]/60">Share with {surprise.partnerName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#1A1A1A]/5 transition-colors"
          >
            <X className="w-4 h-4 text-[#1A1A1A]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-center">
          {/* Link Container */}
          <div className="bg-white border border-[#1A1A1A]/15 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-xs">
            <span className="text-xs font-mono text-[#1A1A1A]/80 truncate pl-2">{fullUrl}</span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-sm inline-block relative group">
            <div className="p-2 border-4 border-rose-100 rounded-xl bg-[#FAF9F6]">
              <canvas ref={canvasRef} className="mx-auto rounded-lg" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-9 h-9 rounded-full border-2 border-rose-500 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            </div>
            <p className="text-[11px] uppercase tracking-widest text-[#1A1A1A]/50 font-bold mt-3">
              Scan with phone camera
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadQR}
              className="py-3 px-4 bg-rose-600 text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-rose-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </button>

            <button
              onClick={() => onView(surprise.id)}
              className="py-3 px-4 border border-[#1A1A1A] text-[#1A1A1A] bg-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
