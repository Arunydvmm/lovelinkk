import { User, SurpriseData, AdminStats, SiteSettings, StoryTemplate } from './types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('lovelink_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('lovelink_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('lovelink_token');
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem('lovelink_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem('lovelink_user', JSON.stringify(user));
}

export function removeStoredUser() {
  localStorage.removeItem('lovelink_user');
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (response.status === 530) {
    const json = await response.json().catch(() => ({}));
    if (json.maintenance) {
      throw new Error('MAINTENANCE_MODE');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Media (Cloudinary)
  async getUploadStatus(): Promise<{ cloudinaryEnabled: boolean }> {
    const res = await fetch(`${API_BASE}/upload/status`);
    return res.json();
  },

  async uploadMedia(dataUrl: string, resourceType: 'image' | 'audio' = 'image'): Promise<{ url: string; publicId: string }> {
    return fetchWithAuth(`${API_BASE}/upload`, {
      method: 'POST',
      body: JSON.stringify({ dataUrl, resourceType, folder: 'lovelink' }),
    });
  },

  // Auth
  async guestLogin(deviceId: string) {
    const data = await fetchWithAuth(`${API_BASE}/auth/guest`, {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    });
    setAuthToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async adminLogin(username: string, password: string) {
    const data = await fetchWithAuth(`${API_BASE}/auth/admin`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setAuthToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const data = await fetchWithAuth(`${API_BASE}/auth/me`);
    setStoredUser(data.user);
    return data.user;
  },

  async getPublicSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/admin/settings`);
    const data = await res.json();
    return data.settings ?? data;
  },

  // Surprises
  async getMySurprises(): Promise<SurpriseData[]> {
    const data = await fetchWithAuth(`${API_BASE}/surprises`);
    return data.surprises;
  },

  async getSurpriseById(id: string, viewToken?: string): Promise<SurpriseData> {
    const url = viewToken
      ? `${API_BASE}/surprises/${id}?token=${encodeURIComponent(viewToken)}`
      : `${API_BASE}/surprises/${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Surprise not found');
    const data = await res.json();
    return data.surprise ?? data;
  },

  async createSurprise(surprise: Partial<SurpriseData>): Promise<SurpriseData> {
    const data = await fetchWithAuth(`${API_BASE}/surprises`, {
      method: 'POST',
      body: JSON.stringify(surprise),
    });
    return data.surprise ?? data;
  },

  async updateSurprise(id: string, surprise: Partial<SurpriseData>): Promise<SurpriseData> {
    const data = await fetchWithAuth(`${API_BASE}/surprises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(surprise),
    });
    return data.surprise ?? data;
  },

  async deleteSurprise(id: string): Promise<{ message: string }> {
    return fetchWithAuth(`${API_BASE}/surprises/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    return fetchWithAuth(`${API_BASE}/admin/stats`);
  },

  async getAdminUsers(): Promise<User[]> {
    const data = await fetchWithAuth(`${API_BASE}/admin/users`);
    return data.users;
  },

  async deleteAdminUser(id: string) {
    return fetchWithAuth(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminSurprises(): Promise<SurpriseData[]> {
    const data = await fetchWithAuth(`${API_BASE}/admin/surprises`);
    return data.surprises;
  },

  async deleteAdminSurprise(id: string) {
    return fetchWithAuth(`${API_BASE}/admin/surprises/${id}`, {
      method: 'DELETE',
    });
  },

  async updateAdminSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const data = await fetchWithAuth(`${API_BASE}/admin/settings`, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    return data.settings;
  },

  async getAdminTemplates(): Promise<StoryTemplate[]> {
    const data = await fetchWithAuth(`${API_BASE}/admin/templates`);
    return data.templates;
  },

  async createAdminTemplate(template: Omit<StoryTemplate, 'id' | 'createdAt'>): Promise<StoryTemplate> {
    const data = await fetchWithAuth(`${API_BASE}/admin/templates`, {
      method: 'POST',
      body: JSON.stringify(template),
    });
    return data.template;
  },

  async deleteAdminTemplate(id: string) {
    return fetchWithAuth(`${API_BASE}/admin/templates/${id}`, {
      method: 'DELETE',
    });
  },
};
