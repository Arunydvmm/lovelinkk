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
  Shield,
  ToggleLeft,
  ToggleRight,
  Check,
  RefreshCw,
  Search,
  ChevronRight
} from 'lucide-react';
import { AdminStats, SurpriseData, User, SiteSettings } from '../types';
import { api } from '../api';

interface Props {
  user: User;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export const AdminPanel: React.FC<Props> = ({ user, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'surprises' | 'settings'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [surprisesList, setSurprisesList] = useState<SurpriseData[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'LoveLink',
    logoUrl: '',
    maintenanceMode: false,
    defaultMusicTracks: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sData, uData, surpData, setRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminSurprises(),
        api.getPublicSettings()
      ]);
      setStats(sData);
      setUsersList(uData);
      setSurprisesList(surpData);
      setSiteSettings(setRes);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteAdminUser(id);
      setUsersList(usersList.filter(u => u.id !== id));
      if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteSurprise = async (id: string) => {
    if (!confirm('Are you sure you want to delete this love website?')) return;
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
      alert('Settings saved successfully!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
              <Heart size={18} fill="currentColor" />
            </div>
            <span className="font-extrabold text-lg text-white">LoveLink Admin</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition-all ${
                activeTab === 'users'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users size={16} /> Users ({usersList.length})
            </button>
            <button
              onClick={() => setActiveTab('surprises')}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition-all ${
                activeTab === 'surprises'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Heart size={16} /> Websites ({surprisesList.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition-all ${
                activeTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings size={16} /> Settings
            </button>
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold flex items-center gap-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        
        {/* ================= TAB 1: DASHBOARD METRICS ================= */}
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

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Total Users */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Users</p>
                  <p className="text-2xl font-extrabold text-white">{stats?.totalUsers || 245}</p>
                </div>
              </div>

              {/* Total Surprises */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                  <Heart size={24} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Websites</p>
                  <p className="text-2xl font-extrabold text-white">{stats?.totalSurprises || 320}</p>
                </div>
              </div>

              {/* Storage Usage */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <HardDrive size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Storage Used</p>
                  <p className="text-2xl font-extrabold text-white">{stats?.storageUsageMB || 2.4} GB</p>
                </div>
              </div>

            </div>

            {/* Recent Websites Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Recent Love Websites</h3>
                <button
                  onClick={() => setActiveTab('surprises')}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
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
                      <th className="p-3">Created Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {surprisesList.slice(0, 5).map((surp) => (
                      <tr key={surp.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-bold text-white">{surp.title}</td>
                        <td className="p-3">{surp.creatorName} & {surp.partnerName}</td>
                        <td className="p-3 font-semibold text-rose-400">{surp.viewsCount || 0}</td>
                        <td className="p-3 text-slate-400">{new Date(surp.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => onNavigate(`/s/${surp.id}`)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSurprise(surp.id)}
                            className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg"
                          >
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

        {/* ================= TAB 2: USERS MANAGEMENT ================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-white">Users Management</h1>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Joined Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <img src={u.picture} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                          {u.name}
                        </td>
                        <td className="p-3 text-slate-400">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg"
                          >
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

        {/* ================= TAB 3: WEBSITES MANAGEMENT ================= */}
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
                    {surprisesList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-bold text-white">{s.title}</td>
                        <td className="p-3">{s.creatorName} & {s.partnerName}</td>
                        <td className="p-3 font-bold text-rose-400">{s.viewsCount || 0}</td>
                        <td className="p-3 text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => onNavigate(`/s/${s.id}`)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSurprise(s.id)}
                            className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg"
                          >
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

        {/* ================= TAB 4: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl">
            <h1 className="text-2xl font-extrabold text-white">System Settings</h1>

            <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website Brand Name</label>
                <input
                  type="text"
                  value={siteSettings.siteName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Maintenance Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-white">Maintenance Mode</p>
                  <p className="text-xs text-slate-400">When enabled, non-admin visitors see maintenance notice</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleMaintenance}
                  className="text-rose-500"
                >
                  {siteSettings.maintenanceMode ? (
                    <ToggleRight size={32} className="text-rose-500" />
                  ) : (
                    <ToggleLeft size={32} className="text-slate-600" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30"
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};
