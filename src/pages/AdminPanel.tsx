import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  HardDrive,
  Settings,
  LayoutDashboard,
  LogOut,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  ChevronRight,
  LayoutTemplate,
  Plus,
  Clock,
  Chrome,
  UserCircle,
  Check,
  X,
} from 'lucide-react';
import { AdminStats, SurpriseData, User, SiteSettings, StoryTemplate } from '../types';
import { api } from '../api';

interface Props {
  user: User;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

const EMPTY_TEMPLATE: Omit<StoryTemplate, 'id' | 'createdAt'> = {
  title: '',
  badge: '',
  description: '',
  sampleReasons: ['', '', '', '', ''],
  coverImageUrl: '',
  musicTrack: { name: '', url: '' },
};

export const AdminPanel: React.FC<Props> = ({ user, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'surprises' | 'settings' | 'templates'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [surprisesList, setSurprisesList] = useState<SurpriseData[]>([]);
  const [templatesList, setTemplatesList] = useState<StoryTemplate[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'LoveLink',
    logoUrl: '',
    maintenanceMode: false,
    defaultMusicTracks: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Templates form state
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ ...EMPTY_TEMPLATE });
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sData, uData, surpData, setRes, tplData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminSurprises(),
        api.getPublicSettings(),
        api.getAdminTemplates(),
      ]);
      setStats(sData);
      setUsersList(uData);
      setSurprisesList(surpData);
      setSiteSettings(setRes);
      setTemplatesList(tplData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user and all their surprises?')) return;
    try {
      await api.deleteAdminUser(id);
      setUsersList(usersList.filter(u => u.id !== id));
      if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteSurprise = async (id: string) => {
    if (!confirm('Delete this love website?')) return;
    try {
      await api.deleteAdminSurprise(id);
      setSurprisesList(surprisesList.filter(s => s.id !== id));
      if (stats) setStats({ ...stats, totalSurprises: stats.totalSurprises - 1 });
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleMaintenance = async () => {
    const updated = !siteSettings.maintenanceMode;
    setSavingSettings(true);
    try {
      const res = await api.updateAdminSettings({ maintenanceMode: updated });
      setSiteSettings(res);
      if (stats) setStats({ ...stats, maintenanceMode: updated });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.updateAdminSettings(siteSettings);
      setSiteSettings(res);
      alert('Settings saved!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.title.trim() || !newTemplate.badge.trim() || !newTemplate.description.trim()) return;
    setSavingTemplate(true);
    try {
      const tpl = await api.createAdminTemplate({
        ...newTemplate,
        sampleReasons: newTemplate.sampleReasons.filter(r => r.trim()),
      });
      setTemplatesList([...templatesList, tpl]);
      setNewTemplate({ ...EMPTY_TEMPLATE });
      setShowTemplateForm(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await api.deleteAdminTemplate(id);
      setTemplatesList(templatesList.filter(t => t.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const updateReason = (idx: number, val: string) => {
    const reasons = [...newTemplate.sampleReasons];
    reasons[idx] = val;
    setNewTemplate({ ...newTemplate, sampleReasons: reasons });
  };

  /** Detect if a user logged in via Google or is a guest device */
  const authType = (u: User) => {
    if (u.id === 'admin_owner') return 'admin';
    if (u.googleId.startsWith('device_')) return 'guest';
    return 'google';
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col md:flex-row">

      {/* ─── Sidebar ─── */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
              <Heart size={18} fill="currentColor" />
            </div>
            <span className="font-extrabold text-lg text-white">LoveLink Admin</span>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            {(
              [
                { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
                { id: 'users', label: `Users (${usersList.length})`, icon: <Users size={16} /> },
                { id: 'surprises', label: `Websites (${surprisesList.length})`, icon: <Heart size={16} /> },
                { id: 'templates', label: `Templates (${templatesList.length})`, icon: <LayoutTemplate size={16} /> },
                { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
              ] as { id: typeof activeTab; label: string; icon: React.ReactNode }[]
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold flex items-center gap-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">

        {/* ══════════ DASHBOARD ══════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-white">Dashboard Overview</h1>
              <button
                onClick={loadAdminData}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1.5"
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Users</p>
                  <p className="text-2xl font-extrabold text-white">{stats?.totalUsers ?? '—'}</p>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                  <Heart size={24} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Websites</p>
                  <p className="text-2xl font-extrabold text-white">{stats?.totalSurprises ?? '—'}</p>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <HardDrive size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Storage Used</p>
                  <p className="text-2xl font-extrabold text-white">{stats?.storageUsageMB ?? '—'} MB</p>
                </div>
              </div>
            </div>

            {/* Recent websites */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Recent Love Websites</h3>
                <button onClick={() => setActiveTab('surprises')} className="text-xs text-rose-400 hover:underline flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Creator & Partner</th>
                      <th className="p-3">Views</th>
                      <th className="p-3">Created</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {surprisesList.slice(0, 5).map(surp => (
                      <tr key={surp.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-bold text-white">{surp.title}</td>
                        <td className="p-3">{surp.creatorName} & {surp.partnerName}</td>
                        <td className="p-3 font-semibold text-rose-400">{surp.viewsCount || 0}</td>
                        <td className="p-3 text-slate-400">{new Date(surp.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => onNavigate(`/s/${surp.id}`)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleDeleteSurprise(surp.id)} className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ USERS ══════════ */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-white">User Activity</h1>

            <div className="grid gap-4">
              {loading ? (
                <p className="text-slate-400 text-sm">Loading users…</p>
              ) : usersList.length === 0 ? (
                <p className="text-slate-400 text-sm">No users yet.</p>
              ) : (
                usersList.map(u => {
                  const type = authType(u);
                  return (
                    <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-4">
                      {/* Avatar */}
                      <img
                        src={u.picture}
                        alt={u.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-slate-700"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'; }}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-sm">{u.name}</span>
                          {/* Role badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.role}
                          </span>
                          {/* Auth-type badge */}
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            type === 'google'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
                              : type === 'guest'
                              ? 'bg-slate-700/60 text-slate-400'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                          }`}>
                            {type === 'google' && <Chrome size={10} />}
                            {type === 'guest' && <UserCircle size={10} />}
                            {type === 'admin' && <Check size={10} />}
                            {type === 'google' ? 'Google' : type === 'guest' ? 'Guest' : 'Admin'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 truncate">{u.email}</p>

                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> Joined {formatTime(u.createdAt)}
                          </span>
                          {u.lastLoginAt && (
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> Last login {formatTime(u.lastLoginAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === 'admin_owner'}
                        className="p-2 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                        title={u.id === 'admin_owner' ? 'Cannot delete admin account' : 'Delete user'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ══════════ SURPRISES ══════════ */}
        {activeTab === 'surprises' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-white">Generated Surprises</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Couple</th>
                      <th className="p-3">Views</th>
                      <th className="p-3">Created</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {surprisesList.map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-bold text-white">{s.title}</td>
                        <td className="p-3">{s.creatorName} & {s.partnerName}</td>
                        <td className="p-3 font-bold text-rose-400">{s.viewsCount || 0}</td>
                        <td className="p-3 text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => onNavigate(`/s/${s.id}`)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleDeleteSurprise(s.id)} className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ TEMPLATES ══════════ */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-white">Story Templates</h1>
              <button
                onClick={() => setShowTemplateForm(v => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors"
              >
                {showTemplateForm ? <X size={14} /> : <Plus size={14} />}
                {showTemplateForm ? 'Cancel' : 'New Template'}
              </button>
            </div>

            {/* Create template form */}
            {showTemplateForm && (
              <form onSubmit={handleCreateTemplate} className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 space-y-5 shadow-xl">
                <h3 className="font-bold text-white text-sm">Create New Template</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Title *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Anniversary Surprise"
                      value={newTemplate.title}
                      onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Badge *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 💍 Anniversary"
                      value={newTemplate.badge}
                      onChange={e => setNewTemplate({ ...newTemplate, badge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Description *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="A brief description shown on the template picker…"
                    value={newTemplate.description}
                    onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-2">Sample Reasons (up to 5)</label>
                  <div className="space-y-2">
                    {newTemplate.sampleReasons.map((r, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={`Reason ${i + 1}…`}
                        value={r}
                        onChange={e => updateReason(i, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cover Image URL</label>
                    <input
                      type="url"
                      placeholder="https://…"
                      value={newTemplate.coverImageUrl}
                      onChange={e => setNewTemplate({ ...newTemplate, coverImageUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Music Track Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Piano Serenade"
                      value={newTemplate.musicTrack.name}
                      onChange={e => setNewTemplate({ ...newTemplate, musicTrack: { ...newTemplate.musicTrack, name: e.target.value } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Music Track URL</label>
                  <input
                    type="url"
                    placeholder="https://…"
                    value={newTemplate.musicTrack.url}
                    onChange={e => setNewTemplate({ ...newTemplate, musicTrack: { ...newTemplate.musicTrack, url: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingTemplate || !newTemplate.title.trim() || !newTemplate.badge.trim() || !newTemplate.description.trim()}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {savingTemplate ? 'Saving…' : 'Save Template'}
                </button>
              </form>
            )}

            {/* Template cards */}
            {templatesList.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-2">
                <LayoutTemplate size={32} className="mx-auto text-slate-600" />
                <p className="text-slate-400 text-sm">No custom templates yet.</p>
                <p className="text-slate-500 text-xs">Create one above to appear in the wizard template picker.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templatesList.map(tpl => (
                  <div key={tpl.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    {tpl.coverImageUrl && (
                      <div className="h-28 overflow-hidden">
                        <img src={tpl.coverImageUrl} alt={tpl.title} className="w-full h-full object-cover opacity-70" />
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-300">{tpl.badge}</span>
                        <button onClick={() => handleDeleteTemplate(tpl.id)} className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <h4 className="font-bold text-white text-sm">{tpl.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.description}</p>
                      {tpl.sampleReasons.length > 0 && (
                        <p className="text-[10px] text-slate-500">{tpl.sampleReasons.length} sample reason{tpl.sampleReasons.length !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════ SETTINGS ══════════ */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl">
            <h1 className="text-2xl font-extrabold text-white">System Settings</h1>

            <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website Brand Name</label>
                <input
                  type="text"
                  value={siteSettings.siteName}
                  onChange={e => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-white">Maintenance Mode</p>
                  <p className="text-xs text-slate-400">Non-admin visitors see maintenance notice</p>
                </div>
                <button type="button" onClick={handleToggleMaintenance} className="text-rose-500" disabled={savingSettings}>
                  {siteSettings.maintenanceMode
                    ? <ToggleRight size={32} className="text-rose-500" />
                    : <ToggleLeft size={32} className="text-slate-600" />
                  }
                </button>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 disabled:opacity-60"
              >
                {savingSettings ? 'Saving…' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};
