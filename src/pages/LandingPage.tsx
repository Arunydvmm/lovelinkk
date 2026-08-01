import React from 'react';
import { motion } from 'framer-motion';
import { ProgressiveImage } from '../components/ProgressiveImage';
import { RomanticBackground } from '../components/RomanticBackground';
import heroCoupleImage from '../assets/images/hero_romantic_couple_1785488549450.jpg';
import coupleFlowersImage from '../assets/images/romantic_couple_flowers_1785488847354.jpg';
import { 
  Heart, Sparkles, Gift, Play, ShieldCheck, Zap, 
  FileText, Image as ImageIcon, Wand2, Share2, 
  Music, Award, Smartphone, QrCode, Star, ArrowRight, Quote
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string, surpriseId?: string) => void;
}

// Framer Motion Stagger Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const handleStart = () => {
    onNavigate('create');
  };

  return (
    <RomanticBackground variant="warm">
      <div className="flex-1 flex flex-col text-slate-800 font-sans overflow-x-hidden">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        
        {/* Soft Background Floating Hearts */}
        <div className="absolute top-10 left-10 text-rose-300/30 animate-pulse pointer-events-none">
          <Heart size={64} className="fill-rose-200/40" />
        </div>
        <div className="absolute top-1/3 right-8 text-pink-300/40 pointer-events-none">
          <Heart size={96} className="fill-pink-200/40" />
        </div>
        <div className="absolute bottom-10 left-1/4 text-rose-400/20 pointer-events-none">
          <Heart size={48} className="fill-rose-300/30" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* LEFT COLUMN: Main Hero Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6 sm:space-y-8"
          >
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-600 text-xs font-semibold shadow-xs">
              <Heart size={14} className="fill-rose-500 text-rose-500" />
              <span>Create. Surprise. Make Memories Last Forever</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08]">
              Create Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 inline-flex items-center gap-3">
                Love Story
                <svg className="w-10 h-10 sm:w-14 sm:h-14 text-rose-400 inline-block fill-none stroke-current stroke-[2.5]" viewBox="0 0 50 50">
                  <path d="M25 38 C10 25, 5 15, 12 8 C18 2, 23 8, 25 12 C27 8, 32 2, 38 8 C45 15, 40 25, 25 38 Z" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
              Make a beautiful, personalized love website in minutes. Share your memories, messages, and make your special one feel truly loved.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={handleStart}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-sm shadow-xl shadow-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
              >
                <Gift size={20} className="group-hover:rotate-12 transition-transform" />
                <span>Create Your Love Website</span>
              </button>

              <button
                onClick={() => onNavigate('s', 'priya-kabir')}
                className="px-7 py-4 rounded-full bg-white border border-slate-200 text-slate-800 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Play size={16} className="fill-slate-800 text-slate-800" />
                <span>See Example</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-slate-500 border-t border-rose-100/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-rose-500" /> 100% Secure
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={16} className="text-rose-500" /> Super Fast
              </span>
              <span className="flex items-center gap-1.5">
                <Heart size={16} className="text-rose-500 fill-rose-500" /> Made with Love
              </span>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Romantic Couple with Flowers Hero Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-[32px] overflow-hidden bg-white p-3 shadow-2xl shadow-rose-200/60 border border-rose-100">
              <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden group">
                <ProgressiveImage
                  src={coupleFlowersImage}
                  alt="Couple Surrounded by Roses and Blooming Flowers"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Romantic Gradient & Glow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                {/* Floating Hearts & Flowers Accent Badges */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-rose-600 shadow-md flex items-center gap-1.5 animate-bounce">
                  <Sparkles size={14} className="text-rose-500" />
                  <span>Your Love, Beautifully Framed</span>
                </div>

                <div className="absolute top-1/2 left-6 text-rose-300 fill-rose-300 opacity-80 animate-pulse">
                  <Heart size={26} />
                </div>

                {/* Floating Secondary Sunset Couple Badge */}
                <div className="absolute top-6 left-6 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-xl hidden sm:block transform -rotate-6 hover:rotate-0 transition-transform">
                  <ProgressiveImage
                    src={heroCoupleImage}
                    alt="Sunset Couple Memory"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Glassmorphism Bottom Card Overlay */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center gap-3 shadow-xl">
                  <div className="w-10 h-10 rounded-full bg-rose-500/90 flex items-center justify-center shrink-0 shadow-md">
                    <Heart size={20} className="fill-white text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Every Love Story Deserves A Beautiful Surprise</h4>
                    <p className="text-xs text-rose-100/90 font-light">Surround your precious memories with flowers & music...</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <section 
        id="how-it-works" 
        className="py-20 bg-white/70 border-y border-rose-100/60"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-16">
          
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-bold uppercase tracking-widest">
              Simple Step-by-Step
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How It Works</h2>
            <p className="text-sm sm:text-base text-slate-500">
              Create a priceless digital love gift in four simple steps.
            </p>
          </motion.div>

          {/* Connected Step Cards Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="relative grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            
            {/* Subtle Dotted Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-rose-200 z-0" />

            {/* Step 1 */}
            <motion.div 
              variants={itemVariants}
              className="relative z-10 bg-white p-6 rounded-3xl border border-rose-100/80 shadow-md shadow-rose-100/50 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
                <FileText size={26} />
              </div>
              <h3 className="text-base font-bold text-slate-900">1. Add Your Details</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add names, messages, and your special personal touch.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              variants={itemVariants}
              className="relative z-10 bg-white p-6 rounded-3xl border border-rose-100/80 shadow-md shadow-rose-100/50 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shadow-inner">
                <ImageIcon size={26} />
              </div>
              <h3 className="text-base font-bold text-slate-900">2. Upload Memories</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload photos and moments you want to cherish forever.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              variants={itemVariants}
              className="relative z-10 bg-white p-6 rounded-3xl border border-rose-100/80 shadow-md shadow-rose-100/50 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
                <Wand2 size={26} />
              </div>
              <h3 className="text-base font-bold text-slate-900">3. We Create Magic</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We turn your memories and words into a beautiful love website.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              variants={itemVariants}
              className="relative z-10 bg-white p-6 rounded-3xl border border-rose-100/80 shadow-md shadow-rose-100/50 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shadow-inner">
                <Share2 size={26} />
              </div>
              <h3 className="text-base font-bold text-slate-900">4. Share Your Love</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get your unique link & QR code and make them smile forever.
              </p>
            </motion.div>

          </motion.div>

          {/* ================= STATS BAR ================= */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border border-rose-200/60 rounded-3xl p-8 shadow-sm"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-rose-600">10K+</p>
                <p className="text-xs font-medium text-slate-600">Happy Users</p>
              </div>
              <div className="space-y-1 border-l border-rose-200/60">
                <p className="text-3xl font-extrabold text-rose-600">25K+</p>
                <p className="text-xs font-medium text-slate-600">Love Websites Created</p>
              </div>
              <div className="space-y-1 border-l border-rose-200/60">
                <p className="text-3xl font-extrabold text-rose-600">4.9 ★</p>
                <p className="text-xs font-medium text-slate-600">User Rating</p>
              </div>
              <div className="space-y-1 border-l border-rose-200/60">
                <p className="text-3xl font-extrabold text-rose-600">100%</p>
                <p className="text-xs font-medium text-slate-600">Made with Love</p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================= FEATURES GRID SECTION ================= */}
      <section 
        id="features"
        className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full space-y-16"
      >
        
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Everything You Need To Express Love</h2>
          <p className="text-sm sm:text-base text-slate-500">
            Crafted with passion to deliver an unforgettable digital gift unboxing experience.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          
          <motion.div 
            variants={itemVariants}
            className="bg-white p-8 rounded-3xl border border-rose-100 shadow-md shadow-rose-100/30 space-y-4 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Gift size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Interactive Gift Unboxing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Recipient starts with a cute sleeping cat guarding a gift box. Tap to open with animated confetti!
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white p-8 rounded-3xl border border-rose-100 shadow-md shadow-rose-100/30 space-y-4 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Automated Photo Gallery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload 5–20 favorite photos. Our algorithm creates elegant masonry layouts with fullscreen lightboxes.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white p-8 rounded-3xl border border-rose-100 shadow-md shadow-rose-100/30 space-y-4 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Digital Certificate of Love</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Award your partner with an official Best Girlfriend/Boyfriend/Partner digital certificate with PNG download.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white p-8 rounded-3xl border border-rose-100 shadow-md shadow-rose-100/30 space-y-4 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Music size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Background Music</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your special song or choose from romantic default instrumentals that autoplay softly.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white p-8 rounded-3xl border border-rose-100 shadow-md shadow-rose-100/30 space-y-4 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <QrCode size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant QR Code</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download high-resolution print-ready QR codes to attach to physical flower bouquets, chocolates, or letters.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white p-8 rounded-3xl border border-rose-100 shadow-md shadow-rose-100/30 space-y-4 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Smartphone size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Mobile Responsive</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Flawless responsive layout crafted for iPhone, Android, tablets, and desktop displays.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* ================= INTERACTIVE WEBSITE GALLERY SHOWCASE ================= */}
      <motion.section 
        id="examples"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full space-y-16 bg-gradient-to-b from-white via-rose-50/40 to-white rounded-3xl border border-rose-100/70 shadow-sm"
      >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold uppercase tracking-widest shadow-xs">
            <Sparkles size={14} className="text-pink-600" />
            <span>Visual Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Explore Generated Love Websites</h2>
          <p className="text-sm sm:text-base text-slate-500">
            Take a sneak peek at what your personalized love website will look like with custom memories, music, and gifts.
          </p>
        </div>

        {/* 5 Showcase Cards with High Quality Images & Live Sample Links */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Showcase Card 1 */}
          <motion.div 
            variants={itemVariants}
            className="group bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-lg shadow-rose-100/50 hover:shadow-2xl hover:border-rose-300 transition-all duration-500 flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <ProgressiveImage
                src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop"
                alt="Anniversary Romance"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-bold text-rose-600 shadow-sm">
                🌹 Anniversary Romance
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  Our Love Story ❤️
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  A romantic gift box experience with piano serenade music, heartfelt letter, and memory photos.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate('s', 'priya-kabir')}
                  className="flex-1 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View Live Sample</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Showcase Card 2 */}
          <motion.div 
            variants={itemVariants}
            className="group bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-lg shadow-rose-100/50 hover:shadow-2xl hover:border-rose-300 transition-all duration-500 flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <ProgressiveImage
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop"
                alt="You & Me Forever"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-bold text-pink-600 shadow-sm">
                💖 Sweet Romance
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                  You & Me Forever
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  A digital treasure box with acoustic guitar tunes, 5 reasons why I love you, and award badge.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate('s', 'you-and-me')}
                  className="flex-1 py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View Live Sample</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Showcase Card 3 */}
          <motion.div 
            variants={itemVariants}
            className="group bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-lg shadow-rose-100/50 hover:shadow-2xl hover:border-rose-300 transition-all duration-500 flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <ProgressiveImage
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop"
                alt="Birthday Sunshine"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-bold text-amber-600 shadow-sm">
                🎂 Birthday Sunshine
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Happy Birthday Sunshine ☀️
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Bright cheerful birthday celebration website with ukulele background beats & Best Girlfriend award.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate('s', 'birthday-surprise')}
                  className="flex-1 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View Live Sample</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Showcase Card 4 */}
          <motion.div 
            variants={itemVariants}
            className="group bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-lg shadow-rose-100/50 hover:shadow-2xl hover:border-rose-300 transition-all duration-500 flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <ProgressiveImage
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop"
                alt="Long Distance Love"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-bold text-indigo-600 shadow-sm">
                ✈️ Long Distance
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Miles Apart, Hearts Connected ✈️
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Heartfelt long-distance surprise featuring chill lofi beats, memory timeline, and comforting note.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate('s', 'long-distance-love')}
                  className="flex-1 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View Live Sample</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Showcase Card 5 */}
          <motion.div 
            variants={itemVariants}
            className="group bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-lg shadow-rose-100/50 hover:shadow-2xl hover:border-rose-300 transition-all duration-500 flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <ProgressiveImage
                src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop"
                alt="Proposal & Forever"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-bold text-purple-600 shadow-sm">
                💍 Proposal & Forever
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Will You Marry Me? 💍
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  An elegant marriage proposal experience set to orchestral violin strings & lifelong promises.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate('s', 'forever-yours')}
                  className="flex-1 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View Live Sample</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ================= FEATURED STORIES SECTION ================= */}
      <motion.section 
        id="testimonials"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full space-y-16"
      >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-block px-3.5 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-bold uppercase tracking-widest shadow-xs">
            Real Moments • Real Emotions
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Featured Love Stories</h2>
          <p className="text-sm sm:text-base text-slate-500">
            Read anonymous snippets from thousands of couples who celebrated their love with LoveLink Builder.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Story 1 */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-rose-100/80 shadow-md shadow-rose-100/40 space-y-5 hover:-translate-y-1 transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400" />
                ))}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">
                1st Anniversary
              </span>
            </div>

            <div className="relative">
              <Quote className="w-8 h-8 text-rose-200/60 mb-2" />
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light italic">
                "When Kabir scanned the QR code on his morning coffee card, the music started playing our favorite song. Watching him open the gift box and read the 20 reasons why I love him brought happy tears to both of us."
              </p>
            </div>

            {/* Blurred Snippet Preview Badge */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  P & K
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Priya & Kabir</h4>
                  <p className="text-[10px] text-slate-400">Created 2 months ago</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('s', 'priya-kabir')}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2 flex items-center gap-1"
              >
                Preview Story <ArrowRight size={12} />
              </button>
            </div>
          </motion.div>

          {/* Story 2 */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-rose-100/80 shadow-md shadow-rose-100/40 space-y-5 hover:-translate-y-1 transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400" />
                ))}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-pink-50 text-pink-600">
                Long Distance
              </span>
            </div>

            <div className="relative">
              <Quote className="w-8 h-8 text-pink-200/60 mb-2" />
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light italic">
                "We live 4,000 miles apart. Sending a simple link felt so much more intimate than a standard text. The interactive gallery with our trip photos made us feel like we were sitting in the same room again."
              </p>
            </div>

            {/* Blurred Snippet Preview Badge */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  A & M
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Aarav & Meera</h4>
                  <p className="text-[10px] text-slate-400">Created 3 weeks ago</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 italic">
                Verified Love Story
              </span>
            </div>
          </motion.div>

          {/* Story 3 */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-rose-100/80 shadow-md shadow-rose-100/40 space-y-5 hover:-translate-y-1 transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400" />
                ))}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">
                Birthday Surprise
              </span>
            </div>

            <div className="relative">
              <Quote className="w-8 h-8 text-rose-200/60 mb-2" />
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light italic">
                "The Best Partner Certificate at the end was the highlight! I printed out the certificate and framed it after downloading. Best digital surprise builder ever."
              </p>
            </div>

            {/* Blurred Snippet Preview Badge */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  R & S
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Rohan & Sneha</h4>
                  <p className="text-[10px] text-slate-400">Created 1 month ago</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 italic">
                Verified Love Story
              </span>
            </div>
          </motion.div>

        </motion.div>
      </motion.section>

      {/* ================= EXAMPLE THEMES SHOWCASE SECTION ================= */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full space-y-16"
      >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-widest shadow-xs">
            <Sparkles size={14} className="text-rose-600" />
            <span>Curated Aesthetics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Explore Example Themes</h2>
          <p className="text-sm sm:text-base text-slate-500">
            Choose from beautiful, handcrafted aesthetic themes tailored for every love story.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Theme 1: Romantic Rose */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl border border-rose-100/90 shadow-md shadow-rose-100/30 overflow-hidden hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-rose-50">
                <ProgressiveImage
                  src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop"
                  alt="Romantic Rose Theme"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                  Classic • Best Seller
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">Romantic Rose</h3>
                  <div className="flex gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-white shadow-xs" />
                    <span className="w-3.5 h-3.5 rounded-full bg-pink-400 ring-2 ring-white shadow-xs" />
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-200 ring-2 ring-white shadow-xs" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Soft floating rose petals, warm candlelit feel, and classic love letter styling.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={handleStart}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Use Theme</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>

          {/* Theme 2: Midnight Starlight */}
          <motion.div 
            variants={itemVariants}
            className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                <ProgressiveImage
                  src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop"
                  alt="Midnight Starlight Theme"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                  Celestial • Dark
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-base">Midnight Starlight</h3>
                  <div className="flex gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-950 ring-2 ring-slate-800 shadow-xs" />
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 ring-2 ring-slate-800 shadow-xs" />
                    <span className="w-3.5 h-3.5 rounded-full bg-violet-400 ring-2 ring-slate-800 shadow-xs" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Deep night sky backdrop with twinkling stars and ambient glowing cards.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={handleStart}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Use Theme</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>

          {/* Theme 3: Pastel Bloom */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl border border-pink-100 shadow-md shadow-pink-100/30 overflow-hidden hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-pink-50">
                <ProgressiveImage
                  src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop"
                  alt="Pastel Bloom Theme"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-pink-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                  Cute & Playful
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">Pastel Bloom</h3>
                  <div className="flex gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-pink-200 ring-2 ring-white shadow-xs" />
                    <span className="w-3.5 h-3.5 rounded-full bg-orange-200 ring-2 ring-white shadow-xs" />
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-400 ring-2 ring-white shadow-xs" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Whimsical pastel hues, adorable cat animations, and vibrant memory cards.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={handleStart}
                className="w-full py-2.5 rounded-xl bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Use Theme</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>

          {/* Theme 4: Golden Hour Glow */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl border border-amber-100 shadow-md shadow-amber-100/30 overflow-hidden hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-amber-50">
                <ProgressiveImage
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600&auto=format&fit=crop"
                  alt="Golden Hour Theme"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                  Sunset Luxury
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">Golden Hour Glow</h3>
                  <div className="flex gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-white shadow-xs" />
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-white shadow-xs" />
                    <span className="w-3.5 h-3.5 rounded-full bg-yellow-300 ring-2 ring-white shadow-xs" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Golden hour lighting effects, opulent gold borders, and warm acoustic vibe.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={handleStart}
                className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Use Theme</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ================= CALL TO ACTION SECTION ================= */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="py-12 sm:py-16 px-6 sm:px-12 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white text-center relative overflow-hidden"
      >
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
            <Heart size={32} className="fill-white text-white" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Surprise Someone Special?
          </h2>

          <p className="text-sm sm:text-base text-rose-100 max-w-lg mx-auto font-light">
            Create a magical digital gift in just a few minutes. No coding or design skills required.
          </p>

          <button
            onClick={handleStart}
            className="px-10 py-4 rounded-full bg-white text-rose-600 font-extrabold text-sm uppercase tracking-wider shadow-2xl hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <Gift size={20} />
            <span>Create My Love Website</span>
          </button>
        </div>
      </motion.section>

    </div>
    </RomanticBackground>
  );
};

