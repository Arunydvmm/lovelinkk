import React, { useState } from 'react';
import { 
  Heart, Sparkles, ShieldCheck, Mail, MapPin, 
  MessageCircle, Send, X, CheckCircle2, Globe, Github, Instagram, Twitter
} from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: string, id?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage || !contactEmail) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactMessage('');
      setContactEmail('');
      setShowContactModal(false);
    }, 2500);
  };

  return (
    <footer id="contact" className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800/80 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 border-b border-slate-800/60">
        
        {/* Column 1: Brand & Bio */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-400 flex items-center justify-center shadow-md shadow-rose-900/30">
              <Heart size={16} className="fill-white text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">LoveLink Builder</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-light max-w-sm">
            Empowering creators to curate unforgettable interactive love surprises, custom memory galleries, love letters, and romantic certificates in minutes.
          </p>
          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-1">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={15} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={15} />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
              aria-label="GitHub"
            >
              <Github size={15} />
            </a>
            <button 
              onClick={() => setShowContactModal(true)}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
              aria-label="Send Message"
            >
              <Mail size={15} />
            </button>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wider font-bold text-rose-400 flex items-center gap-1.5">
            <Sparkles size={13} />
            Quick Links
          </p>
          <ul className="text-xs space-y-2 text-slate-400">
            <li>
              <button onClick={() => onNavigate?.('home')} className="hover:text-white transition-colors text-left">
                Home Page
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate?.('s', 'priya-kabir')} className="hover:text-white transition-colors text-left">
                Live Sample Demo
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate?.('create')} className="hover:text-white transition-colors text-left font-medium text-rose-300">
                + Create Love Website
              </button>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-white transition-colors">
                Features & Music
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Us */}
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wider font-bold text-rose-400 flex items-center gap-1.5">
            <MessageCircle size={13} />
            Contact Us
          </p>
          <ul className="text-xs space-y-2.5 text-slate-400 font-light">
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-rose-500 shrink-0" />
              <a href="mailto:support@lovelinkbuilder.com" className="hover:text-white transition-colors">
                support@lovelink.app
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} className="text-rose-500 shrink-0" />
              <span>San Francisco, CA & Global</span>
            </li>
            <li className="pt-1">
              <button 
                onClick={() => setShowContactModal(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5"
              >
                <Send size={12} />
                Send Us a Message
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Privacy & Security */}
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wider font-bold text-rose-400 flex items-center gap-1.5">
            <ShieldCheck size={14} />
            Trust & Security
          </p>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            Google Auth & SSL Encrypted. Private custom links ensure your secret love gifts remain visible only to you and your partner.
          </p>
          <div className="flex flex-col gap-1.5 pt-1">
            <button 
              onClick={() => setShowLegalModal('privacy')} 
              className="text-left text-xs text-slate-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setShowLegalModal('terms')} 
              className="text-left text-xs text-slate-400 hover:text-white transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
        <p className="flex items-center gap-1.5">
          <span>© {new Date().getFullYear()} LoveLink Builder. All rights reserved.</span>
          <span className="hidden sm:inline">|</span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            Made with <Heart size={12} className="fill-rose-500 text-rose-500 inline" /> for lovers worldwide.
          </span>
        </p>

        <div className="flex items-center gap-5 text-slate-400">
          <button onClick={() => setShowLegalModal('privacy')} className="hover:text-white transition-colors">
            Privacy
          </button>
          <span>•</span>
          <button onClick={() => setShowLegalModal('terms')} className="hover:text-white transition-colors">
            Terms
          </button>
          <span>•</span>
          <button onClick={() => setShowContactModal(true)} className="hover:text-white transition-colors">
            Contact
          </button>
        </div>
      </div>

      {/* ================= CONTACT MODAL ================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-slate-200 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowContactModal(false)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Contact LoveLink Team</h3>
                <p className="text-xs text-slate-400">We'd love to hear your feedback or support queries!</p>
              </div>
            </div>

            {contactSent ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={44} className="text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Message Received!</h4>
                <p className="text-xs text-slate-400">Thank you for reaching out. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Your Email</label>
                  <input 
                    type="email" 
                    required 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Message</label>
                  <textarea 
                    required 
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="How can we help make your romantic surprise special?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= LEGAL MODAL ================= */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-slate-300 max-h-[80vh] overflow-y-auto space-y-4">
            <button 
              onClick={() => setShowLegalModal(null)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {showLegalModal === 'privacy' ? (
              <>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={20} className="text-rose-500" />
                  Privacy Policy
                </h3>
                <div className="text-xs leading-relaxed space-y-3 text-slate-400">
                  <p>
                    At <strong className="text-white">LoveLink Builder</strong>, we take your privacy and romantic surprise confidentiality with the utmost care.
                  </p>
                  <h4 className="text-sm font-semibold text-slate-200">1. Information We Store</h4>
                  <p>
                    When you create a Love Website, we store the photos, names, messages, and optional song preferences you explicitly upload to generate your gift.
                  </p>
                  <h4 className="text-sm font-semibold text-slate-200">2. Link Confidentiality</h4>
                  <p>
                    Your generated websites are accessible via unique custom URLs or QR codes. We do not expose private websites in public search indexes without your consent.
                  </p>
                  <h4 className="text-sm font-semibold text-slate-200">3. Data Protection</h4>
                  <p>
                    All communication is encrypted via SSL/TLS. You can delete or edit your love websites anytime through your account dashboard.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Globe size={20} className="text-rose-500" />
                  Terms of Service
                </h3>
                <div className="text-xs leading-relaxed space-y-3 text-slate-400">
                  <p>
                    Welcome to <strong className="text-white">LoveLink Builder</strong>. By creating or sharing love websites on our platform, you agree to these terms.
                  </p>
                  <h4 className="text-sm font-semibold text-slate-200">1. Acceptable Use</h4>
                  <p>
                    LoveLink Builder is intended for personal, non-commercial romantic surprises, anniversary celebrations, and gift sharing. Content containing hate speech or copyright infringement is strictly prohibited.
                  </p>
                  <h4 className="text-sm font-semibold text-slate-200">2. Content Ownership</h4>
                  <p>
                    You retain full ownership of all personal photos and messages uploaded to your love website.
                  </p>
                  <h4 className="text-sm font-semibold text-slate-200">3. Service Availability</h4>
                  <p>
                    We strive to maintain 99.9% uptime so your special someone can view your love website anytime, anywhere on mobile and desktop.
                  </p>
                </div>
              </>
            )}

            <div className="pt-2">
              <button 
                onClick={() => setShowLegalModal(null)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
};


