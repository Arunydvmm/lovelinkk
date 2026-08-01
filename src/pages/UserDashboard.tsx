import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SurpriseData } from '../types';
import { QRCodeModal } from '../components/QRCodeModal';
import { Plus, Eye, Edit3, Trash2, Copy, QrCode, Heart, Sparkles, ExternalLink, Check, RefreshCw } from 'lucide-react';

interface UserDashboardProps {
  onNavigate: (tab: string, surpriseId?: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const [surprises, setSurprises] = useState<SurpriseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurpriseForQR, setSelectedSurpriseForQR] = useState<SurpriseData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSurprises = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/surprises', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSurprises(data.surprises || []);
      }
    } catch (err) {
      console.error('Failed to load surprises', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurprises();
  }, [token]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this love surprise? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/surprises/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSurprises(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete surprise', err);
    }
  };

  const getShareUrl = (s: SurpriseData) =>
    `${window.location.origin}/s/${s.id}?token=${encodeURIComponent((s as any).viewToken || '')}`;

  const handleCopyLink = (s: SurpriseData, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(getShareUrl(s));
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-gradient-to-br from-pink-100/90 via-rose-50/80 to-pink-100/90">
      {/* Sidebar - User Stats & Quick Actions */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-[#1A1A1A]/10 p-8 flex flex-col justify-between bg-white/40 shrink-0 space-y-8">
        <div className="space-y-8">
          {/* User Info Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#1A1A1A]/10">
            <img
              src={user?.picture}
              alt={user?.name}
              className="w-12 h-12 rounded-full object-cover border border-[#1A1A1A]/20 shadow-xs"
            />
            <div className="truncate">
              <h3 className="font-bold text-sm text-[#1A1A1A] truncate">{user?.name}</h3>
              <p className="text-[11px] text-[#1A1A1A]/50 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold">
              Surprise Stats
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-end border-b border-[#1A1A1A]/10 pb-2">
                <span className="text-sm italic font-serif text-[#1A1A1A]">My Surprises</span>
                <span className="text-lg font-light text-[#1A1A1A]">{surprises.length}</span>
              </div>
              <div className="flex justify-between items-end border-b border-[#1A1A1A]/10 pb-2">
                <span className="text-sm italic font-serif text-[#1A1A1A]">Total Gift Views</span>
                <span className="text-lg font-light text-rose-600">
                  {surprises.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Storage Meter */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold mb-2">
              Media Storage
            </p>
            <div className="w-full h-1.5 bg-[#1A1A1A]/10 rounded-full overflow-hidden">
              <div className="w-1/4 h-full bg-rose-600"></div>
            </div>
            <p className="text-[10px] mt-2 text-[#1A1A1A]/60">
              {surprises.length * 12}MB of 500MB used
            </p>
          </div>
        </div>

        {/* Big Create Button */}
        <button
          onClick={() => onNavigate('create')}
          className="w-full py-6 border border-[#1A1A1A] flex flex-col items-center justify-center gap-2 group hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors rounded-2xl shadow-sm mt-6"
        >
          <Plus className="w-8 h-8 text-rose-500 group-hover:text-rose-300 transition-colors" />
          <span className="text-xs uppercase tracking-widest font-bold">Create New Surprise</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-12 flex flex-col">
        <header className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1A1A1A]/10 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">
              Welcome Back, {user?.name.split(' ')[0]} 👋
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif italic text-[#1A1A1A] leading-none mt-2">
              The Archive of Moments
            </h1>
            <p className="text-sm text-[#1A1A1A]/60 max-w-md leading-relaxed mt-2">
              Manage your interactive surprises and track the emotional journeys you've created for your special someone.
            </p>
          </div>

          <button
            onClick={fetchSurprises}
            className="p-2.5 border border-[#1A1A1A]/15 rounded-xl hover:bg-[#1A1A1A]/5 text-xs text-[#1A1A1A]/70 flex items-center gap-2 self-start"
            title="Refresh List"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </header>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-widest font-bold">Loading your surprises...</p>
          </div>
        ) : surprises.length === 0 ? (
          <div className="flex-1 border-2 border-dashed border-[#1A1A1A]/15 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 bg-white/50">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <h3 className="text-2xl font-serif italic text-[#1A1A1A]">No surprises created yet</h3>
            <p className="text-xs text-[#1A1A1A]/60 max-w-xs leading-relaxed">
              Surprise your partner today with a personalized romantic gift website complete with memories, love letter, and audio.
            </p>
            <button
              onClick={() => onNavigate('create')}
              className="px-6 py-3 bg-[#1A1A1A] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-rose-900 transition-colors shadow-md"
            >
              Create Your First Surprise
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {surprises.map(s => {
              const cover = s.coverImage || (s.memoryImages && s.memoryImages[0] ? s.memoryImages[0].url : '');
              return (
                <div
                  key={s.id}
                  onClick={() => onNavigate('s', s.id)}
                  className="group cursor-pointer bg-white border border-[#1A1A1A]/15 rounded-2xl overflow-hidden hover:shadow-xl transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="aspect-[16/9] bg-[#E5E2D9] relative rounded-xl overflow-hidden">
                    <img
                      src={cover}
                      alt={s.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 text-[#1A1A1A] px-2.5 py-1 rounded text-[10px] uppercase tracking-widest font-bold shadow-xs">
                      {s.viewsCount || 0} Views
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] group-hover:text-rose-700 transition-colors">
                      {s.partnerName} & {s.creatorName}
                    </h3>
                    <p className="text-xs font-serif italic text-rose-600 mt-0.5">{s.title}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/50 mt-1">
                      {s.memoryImages?.length || 0} Memories • Created {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                    <div className="flex gap-3">
                      <button
                        onClick={e => handleCopyLink(s, e)}
                        className="hover:text-rose-600 flex items-center gap-1 transition-colors"
                        title="Copy Link"
                      >
                        {copiedId === s.id ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Link
                          </>
                        )}
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedSurpriseForQR(s);
                        }}
                        className="hover:text-rose-600 flex items-center gap-1 transition-colors"
                        title="Get QR Code"
                      >
                        <QrCode className="w-3 h-3" /> QR Code
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onNavigate('edit', s.id);
                        }}
                        className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-md transition-colors"
                        title="Edit Surprise"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={e => handleDelete(s.id, e)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-md transition-colors"
                        title="Delete Surprise"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* QR Modal */}
      <QRCodeModal
        surprise={selectedSurpriseForQR}
        onClose={() => setSelectedSurpriseForQR(null)}
        onView={id => {
          setSelectedSurpriseForQR(null);
          onNavigate('s', id);
        }}
      />
    </div>
  );
};
