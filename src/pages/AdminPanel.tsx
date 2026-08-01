import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Heart, HardDrive, Settings, LayoutDashboard, LogOut,
  Trash2, Eye, ToggleLeft, ToggleRight, RefreshCw, ChevronRight,
  LayoutTemplate, Plus, Clock, Chrome, UserCircle, Check, X,
  Upload, FileJson, Globe, EyeOff, Star, StarOff, Pencil, Save,
} from 'lucide-react';
import { AdminStats, SurpriseData, User, SiteSettings, StoryTemplate, FullTemplate } from '../types';
import { api } from '../api';

interface Props {
  user: User;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

const EMPTY_TEMPLATE: Omit<StoryTemplate, 'id' | 'createdAt'> = {
  title: '', badge: '', description: '',
  sampleReasons: ['', '', '', '', ''],
  coverImageUrl: '', musicTrack: { name: '', url: '' },
};

const EMPTY_FULL: Partial<FullTemplate> = {
  name: '', badge: '❤️', description: '', category: 'romantic',
  previewImage: '', published: true, featured: false, totalPages: 9,
};

/* ── tiny helpers ─────────────────────────────────── */
function formatTime(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}
function authType(u: User) {
  if (u.id === 'admin_owner') return 'admin';
  if (u.googleId.startsWith('device_')) return 'guest';
  return 'google';
}

export const AdminPanel: React.FC<Props> = ({ user, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'surprises' | 'settings' | 'templates'>('dashboard');
  const [stats, setStats]               = useState<AdminStats | null>(null);
  const [usersList, setUsersList]       = useState<User[]>([]);
  const [surprisesList, setSurprisesList] = useState<SurpriseData[]>([]);
  const [templatesList, setTemplatesList] = useState<StoryTemplate[]>([]);
  const [fullTemplates, setFullTemplates] = useState<FullTemplate[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'LoveLink', logoUrl: '', maintenanceMode: false, defaultMusicTracks: [],
  });
  const [loading, setLoading]           = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  /* legacy template form */
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newTemplate, setNewTemplate]   = useState({ ...EMPTY_TEMPLATE });
  const [savingTemplate, setSavingTemplate] = useState(false);

  /* full-template panel state */
  const [ftTab, setFtTab] = useState<'list' | 'new'>('list');
  const [ftForm, setFtForm] = useState<Partial<FullTemplate>>({ ...EMPTY_FULL });
  const [ftJsonText, setFtJsonText]     = useState('');
  const [ftJsonError, setFtJsonError]   = useState('');
  const [ftInputMode, setFtInputMode]   = useState<'form' | 'json' | 'paste'>('form');
  const [savingFt, setSavingFt]         = useState(false);
  const [editingFtId, setEditingFtId]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadAdminData(); }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sData, uData, surpData, setRes, tplData, ftData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminSurprises(),
        api.getPublicSettings(),
        api.getAdminTemplates(),
        api.getAdminFullTemplates(),
      ]);
      setStats(sData);
      setUsersList(uData);
      setSurprisesList(surpData);
      setSiteSettings(setRes);
      setTemplatesList(tplData);
      setFullTemplates(ftData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── legacy handlers ─────────────────────────── */
  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user and all their surprises?')) return;
    try {
      await api.deleteAdminUser(id);
      setUsersList(usersList.filter(u => u.id !== id));
      if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
    } catch (e: any) { alert(e.message); }
  };

  const handleDeleteSurprise = async (id: string) => {
    if (!confirm('Delete this love website?')) return;
    try {
      await api.deleteAdminSurprise(id);
      setSurprisesList(surprisesList.filter(s => s.id !== id));
      if (stats) setStats({ ...stats, totalSurprises: stats.totalSurprises - 1 });
    } catch (e: any) { alert(e.message); }
  };

  const handleToggleMaintenance = async () => {
    setSavingSettings(true);
    try {
      const res = await api.updateAdminSettings({ maintenanceMode: !siteSettings.maintenanceMode });
      setSiteSettings(res);
      if (stats) setStats({ ...stats, maintenanceMode: !siteSettings.maintenanceMode });
    } catch (e: any) { alert(e.message); }
    finally { setSavingSettings(false); }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.updateAdminSettings(siteSettings);
      setSiteSettings(res);
      alert('Settings saved!');
    } catch (e: any) { alert(e.message); }
    finally { setSavingSettings(false); }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.title.trim() || !newTemplate.badge.trim() || !newTemplate.description.trim()) return;
    setSavingTemplate(true);
    try {
      const tpl = await api.createAdminTemplate({
        ...newTemplate, sampleReasons: newTemplate.sampleReasons.filter(r => r.trim()),
      });
      setTemplatesList([...templatesList, tpl]);
      setNewTemplate({ ...EMPTY_TEMPLATE });
      setShowTemplateForm(false);
    } catch (e: any) { alert(e.message); }
    finally { setSavingTemplate(false); }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await api.deleteAdminTemplate(id);
      setTemplatesList(templatesList.filter(t => t.id !== id));
    } catch (e: any) { alert(e.message); }
  };

  const updateReason = (idx: number, val: string) => {
    const r = [...newTemplate.sampleReasons]; r[idx] = val;
    setNewTemplate({ ...newTemplate, sampleReasons: r });
  };

  /* ── full-template handlers ─────────────────── */
  const parseFtJson = (): Partial<FullTemplate> | null => {
    try {
      const parsed = JSON.parse(ftJsonText);
      setFtJsonError('');
      // accept either a raw template object or a wrapped { template: … }
      const obj = parsed.metadata ? parsed : parsed.template ?? parsed;
      return {
        name:        obj.metadata?.name  ?? obj.name  ?? '',
        badge:       obj.metadata?.badge ?? obj.badge ?? '❤️',
        description: obj.metadata?.description ?? obj.description ?? '',
        category:    obj.metadata?.category    ?? obj.category    ?? 'romantic',
        subcategory: obj.metadata?.subcategory ?? obj.subcategory,
        mood:        obj.metadata?.mood  ?? obj.mood  ?? [],
        style:       obj.metadata?.style ?? obj.style ?? [],
        previewImage:obj.metadata?.previewImage ?? obj.previewImage ?? '',
        totalPages:  obj.metadata?.totalPages   ?? obj.totalPages,
        templateJson: obj,
        published: true,
        featured: false,
      };
    } catch {
      setFtJsonError('Invalid JSON — please check and try again.');
      return null;
    }
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setFtJsonText(text);
      setFtJsonError('');
      setFtInputMode('json');
    };
    reader.readAsText(file);
  };

  const handleSaveFullTemplate = async () => {
    setSavingFt(true);
    setFtJsonError('');
    try {
      let payload: Partial<FullTemplate>;

      if (ftInputMode === 'form') {
        if (!ftForm.name?.trim() || !ftForm.description?.trim()) {
          setSavingFt(false);
          return alert('Name and description are required.');
        }
        payload = { ...ftForm };
      } else {
        // json or paste mode
        const parsed = parseFtJson();
        if (!parsed) { setSavingFt(false); return; }
        // merge any form-level overrides
        payload = {
          ...parsed,
          name:        ftForm.name?.trim()        || parsed.name,
          badge:       ftForm.badge?.trim()       || parsed.badge,
          description: ftForm.description?.trim() || parsed.description,
          category:    ftForm.category            || parsed.category,
          previewImage:ftForm.previewImage        || parsed.previewImage,
          published:   ftForm.published ?? true,
          featured:    ftForm.featured  ?? false,
        };
      }

      if (editingFtId) {
        const updated = await api.updateFullTemplate(editingFtId, payload);
        setFullTemplates(ft => ft.map(t => t.id === editingFtId ? updated : t));
        setEditingFtId(null);
      } else {
        const created = await api.createFullTemplate(payload);
        setFullTemplates(ft => [created, ...ft]);
      }

      setFtForm({ ...EMPTY_FULL });
      setFtJsonText('');
      setFtTab('list');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingFt(false);
    }
  };

  const handleTogglePublish = async (tpl: FullTemplate) => {
    try {
      const updated = await api.updateFullTemplate(tpl.id, { published: !tpl.published });
      setFullTemplates(ft => ft.map(t => t.id === tpl.id ? updated : t));
    } catch (e: any) { alert(e.message); }
  };

  const handleToggleFeatured = async (tpl: FullTemplate) => {
    try {
      const updated = await api.updateFullTemplate(tpl.id, { featured: !tpl.featured });
      setFullTemplates(ft => ft.map(t => t.id === tpl.id ? updated : t));
    } catch (e: any) { alert(e.message); }
  };

  const handleDeleteFullTemplate = async (id: string) => {
    if (!confirm('Permanently delete this template?')) return;
    try {
      await api.deleteFullTemplate(id);
      setFullTemplates(ft => ft.filter(t => t.id !== id));
    } catch (e: any) { alert(e.message); }
  };

  const startEditFt = (tpl: FullTemplate) => {
    setFtForm({
      name: tpl.name, badge: tpl.badge, description: tpl.description,
      category: tpl.category, previewImage: tpl.previewImage,
      published: tpl.published, featured: tpl.featured, totalPages: tpl.totalPages,
    });
    setFtJsonText(tpl.templateJson ? JSON.stringify(tpl.templateJson, null, 2) : '');
    setFtInputMode(tpl.templateJson ? 'json' : 'form');
    setEditingFtId(tpl.id);
    setFtTab('new');
  };

  /* ─────────────────────────────────────────────── RENDER */
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col md:flex-row">

      {/* ── Sidebar ── */}
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
                { id: 'dashboard',  label: 'Dashboard',                  icon: <LayoutDashboard size={16} /> },
                { id: 'users',      label: `Users (${usersList.length})`, icon: <Users size={16} /> },
                { id: 'surprises',  label: `Websites (${surprisesList.length})`, icon: <Heart size={16} /> },
                { id: 'templates',  label: `Templates (${fullTemplates.length})`, icon: <LayoutTemplate size={16} /> },
                { id: 'settings',   label: 'Settings',                   icon: <Settings size={16} /> },
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

      {/* ── Main ── */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">

        {/* ════ DASHBOARD ════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-white">Dashboard Overview</h1>
              <button onClick={loadAdminData} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1.5">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Users',    value: stats?.totalUsers,    icon: <Users size={24} />,                  ring: 'rose' },
                { label: 'Total Websites', value: stats?.totalSurprises, icon: <Heart size={24} fill="currentColor"/>, ring: 'rose' },
                { label: 'Storage Used',   value: stats ? `${stats.storageUsageMB} MB` : '—', icon: <HardDrive size={24}/>, ring: 'amber' },
              ].map(card => (
                <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-xl">
                  <div className={`w-12 h-12 rounded-2xl bg-${card.ring}-500/10 text-${card.ring}-400 border border-${card.ring}-500/20 flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">{card.label}</p>
                    <p className="text-2xl font-extrabold text-white">{card.value ?? '—'}</p>
                  </div>
                </div>
              ))}
            </div>

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
                      <th className="p-3">Title</th><th className="p-3">Creator & Partner</th>
                      <th className="p-3">Views</th><th className="p-3">Created</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {surprisesList.slice(0, 5).map(surp => (
                      <tr key={surp.id} className="hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-white">{surp.title}</td>
                        <td className="p-3">{surp.creatorName} & {surp.partnerName}</td>
                        <td className="p-3 font-semibold text-rose-400">{surp.viewsCount || 0}</td>
                        <td className="p-3 text-slate-400">{new Date(surp.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => onNavigate(`/s/${surp.id}`)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg"><Eye size={14} /></button>
                          <button onClick={() => handleDeleteSurprise(surp.id)} className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════ USERS ════ */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-white">User Activity</h1>
            <div className="grid gap-4">
              {loading ? (
                <p className="text-slate-400 text-sm">Loading users…</p>
              ) : usersList.length === 0 ? (
                <p className="text-slate-400 text-sm">No users yet.</p>
              ) : usersList.map(u => {
                const type = authType(u);
                return (
                  <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-4">
                    <img src={u.picture} alt={u.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-slate-700"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'; }} />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">{u.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>{u.role}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${type === 'google' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25' : type === 'guest' ? 'bg-slate-700/60 text-slate-400' : 'bg-rose-500/15 text-rose-300 border border-rose-500/25'}`}>
                          {type === 'google' && <Chrome size={10} />}
                          {type === 'guest' && <UserCircle size={10} />}
                          {type === 'admin' && <Check size={10} />}
                          {type === 'google' ? 'Google' : type === 'guest' ? 'Guest' : 'Admin'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={10} /> Joined {formatTime(u.createdAt)}</span>
                        {u.lastLoginAt && <span className="flex items-center gap-1"><Clock size={10} /> Last login {formatTime(u.lastLoginAt)}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteUser(u.id)} disabled={u.id === 'admin_owner'}
                      className="p-2 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"><Trash2 size={15} /></button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ SURPRISES ════ */}
        {activeTab === 'surprises' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-white">Generated Surprises</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Title</th><th className="p-3">Couple</th>
                      <th className="p-3">Views</th><th className="p-3">Created</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {surprisesList.map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-white">{s.title}</td>
                        <td className="p-3">{s.creatorName} & {s.partnerName}</td>
                        <td className="p-3 font-bold text-rose-400">{s.viewsCount || 0}</td>
                        <td className="p-3 text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => onNavigate(`/s/${s.id}`)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg"><Eye size={14} /></button>
                          <button onClick={() => handleDeleteSurprise(s.id)} className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════ TEMPLATES ════ */}
        {activeTab === 'templates' && (
          <div className="space-y-8">

            {/* ── Section header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Template Gallery Manager</h1>
                <p className="text-xs text-slate-400 mt-0.5">Publish JSON templates to the public gallery. Upload a file, paste JSON, or fill the form.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/templates')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                >
                  <Globe size={13} /> View Public Gallery
                </button>
                <button
                  onClick={() => { setFtTab(t => t === 'new' ? 'list' : 'new'); setEditingFtId(null); setFtForm({ ...EMPTY_FULL }); setFtJsonText(''); setFtJsonError(''); }}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  {ftTab === 'new' ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Template</>}
                </button>
              </div>
            </div>

            {/* ── New / Edit form ── */}
            {ftTab === 'new' && (
              <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 space-y-5 shadow-xl">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  {editingFtId ? <><Pencil size={14} className="text-rose-400" /> Edit Template</> : <><Plus size={14} className="text-rose-400" /> Create New Template</>}
                </h3>

                {/* input mode tabs */}
                <div className="flex gap-2">
                  {([['form','Form'], ['json','Upload JSON'], ['paste','Paste JSON']] as const).map(([mode, label]) => (
                    <button key={mode} onClick={() => setFtInputMode(mode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${ftInputMode === mode ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* ── JSON upload zone ── */}
                {ftInputMode === 'json' && (
                  <div className="space-y-3">
                    {/* hidden file input – lives outside any clickable zone */}
                    <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleJsonFileUpload} />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-rose-500/40 hover:border-rose-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-800/40 hover:bg-slate-800/60 space-y-2"
                    >
                      <FileJson size={32} className="mx-auto text-rose-400" />
                      <p className="text-sm font-semibold text-slate-200">
                        {ftJsonText ? '✓ JSON loaded — click to replace' : 'Click to upload a .json template file'}
                      </p>
                      <p className="text-xs text-slate-500">Compatible with LoveLink Template Engine JSON format</p>
                    </div>
                    {ftJsonText && (
                      <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 max-h-32 overflow-y-auto">
                        <pre className="text-[10px] text-slate-400 whitespace-pre-wrap break-all">{ftJsonText.slice(0, 400)}{ftJsonText.length > 400 ? '\n…' : ''}</pre>
                      </div>
                    )}
                    {ftJsonError && <p className="text-xs text-rose-400 font-semibold">{ftJsonError}</p>}
                  </div>
                )}

                {/* ── Paste JSON zone ── */}
                {ftInputMode === 'paste' && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-300">Paste your template JSON here</label>
                    <textarea
                      rows={10}
                      value={ftJsonText}
                      onChange={e => { setFtJsonText(e.target.value); setFtJsonError(''); }}
                      placeholder={'{\n  "metadata": { "name": "My Template", … },\n  "pages": [ … ]\n}'}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500 resize-none"
                      spellCheck={false}
                    />
                    {ftJsonError && <p className="text-xs text-rose-400 font-semibold">{ftJsonError}</p>}
                  </div>
                )}

                {/* ── Metadata fields (shown for all modes) ── */}
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {ftInputMode === 'form' ? 'Template Details' : 'Metadata Overrides (optional)'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Name {ftInputMode === 'form' && '*'}</label>
                      <input type="text" placeholder="e.g. Pookie Love Story"
                        value={ftForm.name ?? ''} onChange={e => setFtForm({ ...ftForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Badge</label>
                      <input type="text" placeholder="e.g. 🐱 Cute"
                        value={ftForm.badge ?? ''} onChange={e => setFtForm({ ...ftForm, badge: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category</label>
                      <select value={ftForm.category ?? 'romantic'} onChange={e => setFtForm({ ...ftForm, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500">
                        {['romantic','cute','birthday','anniversary','long distance','proposal','friendship'].map(c => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Preview Image URL</label>
                      <input type="url" placeholder="https://…"
                        value={ftForm.previewImage ?? ''} onChange={e => setFtForm({ ...ftForm, previewImage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Description {ftInputMode === 'form' && '*'}</label>
                    <textarea rows={2} placeholder="A short description shown on the gallery card…"
                      value={ftForm.description ?? ''} onChange={e => setFtForm({ ...ftForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 resize-none" />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={ftForm.published ?? true} onChange={e => setFtForm({ ...ftForm, published: e.target.checked })}
                        className="w-4 h-4 accent-rose-500" />
                      <span className="text-xs font-semibold text-slate-300">Published (visible on gallery)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={ftForm.featured ?? false} onChange={e => setFtForm({ ...ftForm, featured: e.target.checked })}
                        className="w-4 h-4 accent-amber-400" />
                      <span className="text-xs font-semibold text-slate-300">Featured (highlighted)</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSaveFullTemplate}
                  disabled={savingFt}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  {savingFt ? 'Saving…' : editingFtId ? 'Update Template' : 'Publish Template'}
                </button>
              </div>
            )}

            {/* ── Full-template cards ── */}
            {fullTemplates.length === 0 && ftTab === 'list' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
                <LayoutTemplate size={36} className="mx-auto text-slate-600" />
                <p className="text-slate-400 text-sm font-semibold">No templates published yet.</p>
                <p className="text-slate-500 text-xs">Click "New Template" to upload a JSON template or fill the form.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fullTemplates.map(tpl => (
                  <div key={tpl.id} className={`bg-slate-900 border rounded-2xl overflow-hidden flex flex-col transition-all ${tpl.published ? 'border-slate-800' : 'border-slate-700/50 opacity-60'}`}>
                    {/* preview image */}
                    {(tpl.previewImage || tpl.coverImageUrl) && (
                      <div className="h-28 overflow-hidden relative">
                        <img src={tpl.previewImage || tpl.coverImageUrl} alt={tpl.name}
                          className="w-full h-full object-cover opacity-80"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        {tpl.featured && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-400/90 text-amber-900 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <Star size={9} fill="currentColor" /> Featured
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-rose-300">{tpl.badge}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${tpl.published ? 'bg-emerald-900/60 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                          {tpl.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm leading-snug">{tpl.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span className="capitalize">{tpl.category}</span>
                        {tpl.totalPages && <span>{tpl.totalPages} pages</span>}
                        {tpl.templateJson && <span className="text-rose-400/80 flex items-center gap-0.5"><FileJson size={9} /> JSON</span>}
                      </div>
                    </div>
                    {/* action strip */}
                    <div className="flex items-center gap-1.5 px-4 pb-4 flex-wrap">
                      <button onClick={() => startEditFt(tpl)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg" title="Edit">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleTogglePublish(tpl)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg" title={tpl.published ? 'Unpublish' : 'Publish'}>
                        {tpl.published ? <EyeOff size={13} /> : <Globe size={13} />}
                      </button>
                      <button onClick={() => handleToggleFeatured(tpl)}
                        className={`p-1.5 rounded-lg ${tpl.featured ? 'bg-amber-900/50 text-amber-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`} title={tpl.featured ? 'Unfeature' : 'Feature'}>
                        {tpl.featured ? <Star size={13} fill="currentColor" /> : <StarOff size={13} />}
                      </button>
                      <button onClick={() => handleDeleteFullTemplate(tpl.id)}
                        className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg ml-auto" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Legacy simple templates (collapsible) ── */}
            <details className="group">
              <summary className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-300 select-none flex items-center gap-2 py-2">
                <ChevronRight size={13} className="group-open:rotate-90 transition-transform" />
                Legacy Wizard Templates ({templatesList.length})
              </summary>
              <div className="mt-4 space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => setShowTemplateForm(v => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl">
                    {showTemplateForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Legacy</>}
                  </button>
                </div>
                {showTemplateForm && (
                  <form onSubmit={handleCreateTemplate} className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Title *</label>
                        <input required type="text" placeholder="Anniversary Surprise" value={newTemplate.title}
                          onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Badge *</label>
                        <input required type="text" placeholder="💍 Anniversary" value={newTemplate.badge}
                          onChange={e => setNewTemplate({ ...newTemplate, badge: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Description *</label>
                      <textarea required rows={2} value={newTemplate.description}
                        onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 resize-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-2">Sample Reasons</label>
                      <div className="space-y-2">
                        {newTemplate.sampleReasons.map((r, i) => (
                          <input key={i} type="text" placeholder={`Reason ${i + 1}…`} value={r}
                            onChange={e => updateReason(i, e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500" />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cover Image URL</label>
                        <input type="url" placeholder="https://…" value={newTemplate.coverImageUrl}
                          onChange={e => setNewTemplate({ ...newTemplate, coverImageUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Music Track Name</label>
                        <input type="text" placeholder="Piano Serenade" value={newTemplate.musicTrack.name}
                          onChange={e => setNewTemplate({ ...newTemplate, musicTrack: { ...newTemplate.musicTrack, name: e.target.value } })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500" />
                      </div>
                    </div>
                    <button type="submit" disabled={savingTemplate || !newTemplate.title.trim()}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl disabled:opacity-50">
                      {savingTemplate ? 'Saving…' : 'Save Legacy Template'}
                    </button>
                  </form>
                )}
                {templatesList.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-4">No legacy templates.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templatesList.map(tpl => (
                      <div key={tpl.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {tpl.coverImageUrl && (
                          <div className="h-24 overflow-hidden">
                            <img src={tpl.coverImageUrl} alt={tpl.title} className="w-full h-full object-cover opacity-70" />
                          </div>
                        )}
                        <div className="p-4 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-300">{tpl.badge}</span>
                            <button onClick={() => handleDeleteTemplate(tpl.id)} className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg"><Trash2 size={13} /></button>
                          </div>
                          <h4 className="font-bold text-white text-sm">{tpl.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* ════ SETTINGS ════ */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl">
            <h1 className="text-2xl font-extrabold text-white">System Settings</h1>
            <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website Brand Name</label>
                <input type="text" value={siteSettings.siteName} onChange={e => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-white">Maintenance Mode</p>
                  <p className="text-xs text-slate-400">Non-admin visitors see maintenance notice</p>
                </div>
                <button type="button" onClick={handleToggleMaintenance} className="text-rose-500" disabled={savingSettings}>
                  {siteSettings.maintenanceMode ? <ToggleRight size={32} className="text-rose-500" /> : <ToggleLeft size={32} className="text-slate-600" />}
                </button>
              </div>
              <button type="submit" disabled={savingSettings}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 disabled:opacity-60">
                {savingSettings ? 'Saving…' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};
