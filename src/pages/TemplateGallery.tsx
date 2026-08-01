import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, Eye, Search, Filter, X,
  LayoutTemplate, ArrowRight, Star, Zap,
} from 'lucide-react';
import { SmartImage } from '../components/SmartImage';
import { api } from '../api';
import { FullTemplate } from '../types';

interface Props {
  onNavigate: (tab: string, id?: string) => void;
}

const CATEGORIES = ['All', 'Romantic', 'Cute', 'Birthday', 'Anniversary', 'Long Distance', 'Proposal'];

const MOOD_COLORS: Record<string, string> = {
  romantic:   'bg-rose-100 text-rose-700',
  cute:       'bg-pink-100 text-pink-700',
  birthday:   'bg-amber-100 text-amber-700',
  anniversary:'bg-purple-100 text-purple-700',
  'long distance': 'bg-indigo-100 text-indigo-700',
  proposal:   'bg-violet-100 text-violet-700',
};

function moodColor(cat: string) {
  return MOOD_COLORS[cat.toLowerCase()] ?? 'bg-slate-100 text-slate-600';
}

/* skeleton card shown while loading */
function SkeletonCard() {
  return (
    <div className="bg-white border border-rose-100 rounded-3xl overflow-hidden animate-pulse">
      <div className="h-44 bg-rose-100/60" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-rose-100 rounded-full" />
        <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
        <div className="h-3 w-full bg-slate-100 rounded-full" />
        <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
        <div className="h-9 w-full bg-rose-100 rounded-full mt-2" />
      </div>
    </div>
  );
}

export const TemplateGallery: React.FC<Props> = ({ onNavigate }) => {
  const [templates, setTemplates] = useState<FullTemplate[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState<FullTemplate | null>(null);

  useEffect(() => {
    api.getPublicTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = templates.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || t.name.toLowerCase().includes(q)
      || t.description.toLowerCase().includes(q)
      || (t.category ?? '').toLowerCase().includes(q);
    const matchCat = activeCategory === 'All'
      || (t.category ?? '').toLowerCase() === activeCategory.toLowerCase();
    return matchSearch && matchCat && t.published !== false;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6]">

      {/* ── Hero Banner ── */}
      <section className="relative py-16 sm:py-20 px-6 overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 border-b border-rose-200/60">
        {/* ambient hearts */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-300/20 pointer-events-none"
            style={{ left: `${10 + i * 16}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart fill="currentColor" size={24 + i * 6} />
          </motion.div>
        ))}

        <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={13} /> Template Gallery
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Love Story</span> Style
            </h1>
            <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Pick a beautifully crafted template and personalise it with your photos, messages and music.
            </p>
          </motion.div>

          {/* search bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-md mx-auto"
          >
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="w-full pl-10 pr-10 py-3 rounded-full bg-white border border-rose-200 text-sm text-slate-800 focus:outline-none focus:border-rose-400 shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500"
              >
                <X size={14} />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">

        {/* ── Category pills ── */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <Filter size={14} className="text-slate-400 flex-shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'bg-white border border-rose-100 text-slate-600 hover:border-rose-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <LayoutTemplate size={40} className="mx-auto text-slate-300" />
            <p className="text-slate-400 text-sm">
              {templates.length === 0
                ? 'No templates published yet. Check back soon!'
                : 'No templates match your search.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-rose-500 text-xs underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map(tpl => (
              <motion.div
                key={tpl.id}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                className="group bg-white border border-rose-100 rounded-3xl overflow-hidden shadow-md shadow-rose-100/30 hover:shadow-xl hover:shadow-rose-200/40 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* cover image */}
                <div className="relative h-44 overflow-hidden bg-rose-50">
                  {tpl.previewImage || tpl.coverImageUrl ? (
                    <SmartImage
                      src={tpl.previewImage || tpl.coverImageUrl || ''}
                      alt={tpl.name}
                      className="w-full h-full"
                      rootMargin="200px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100">
                      <Heart size={40} className="text-rose-300 fill-rose-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* hover preview btn */}
                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/90 backdrop-blur-sm text-rose-700 text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5 shadow-md"
                  >
                    <Eye size={12} /> Quick Preview
                  </button>
                  {/* badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${moodColor(tpl.category ?? 'romantic')}`}>
                      {tpl.badge || tpl.category}
                    </span>
                  </div>
                  {tpl.featured && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-400/90 text-amber-900 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Star size={9} fill="currentColor" /> Featured
                    </div>
                  )}
                </div>

                {/* body */}
                <div className="flex-1 p-5 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{tpl.description}</p>
                  {tpl.totalPages && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Zap size={10} className="text-rose-400" />
                      {tpl.totalPages} page interactive story
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                  <button
                    onClick={() => onNavigate('create')}
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-400/30 hover:shadow-lg hover:shadow-rose-400/40 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Use This Template <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Quick Preview Modal ── */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {(previewTemplate.previewImage || previewTemplate.coverImageUrl) && (
                <div className="h-48">
                  <SmartImage
                    src={previewTemplate.previewImage || previewTemplate.coverImageUrl || ''}
                    alt={previewTemplate.name}
                    className="w-full h-full"
                    rootMargin="0px"
                  />
                </div>
              )}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${moodColor(previewTemplate.category ?? 'romantic')}`}>
                    {previewTemplate.badge || previewTemplate.category}
                  </span>
                  <button onClick={() => setPreviewTemplate(null)} className="p-1.5 text-slate-400 hover:text-rose-500">
                    <X size={16} />
                  </button>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">{previewTemplate.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{previewTemplate.description}</p>
                {previewTemplate.totalPages && (
                  <p className="text-xs text-slate-400">
                    {previewTemplate.totalPages} interactive pages · {previewTemplate.mood?.join(' · ')}
                  </p>
                )}
                <button
                  onClick={() => { setPreviewTemplate(null); onNavigate('create'); }}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md mt-2"
                >
                  <Heart size={15} fill="currentColor" /> Use This Template
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
