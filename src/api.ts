import { User, SurpriseData, AdminStats, SiteSettings } from './types';

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

  async adminLogin(passcode: string) {
    const data = await fetchWithAuth(`${API_BASE}/auth/admin`, {
      method: 'POST',
      body: JSON.stringify({ passcode }),
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
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  // Surprises
  async getMySurprises(): Promise<SurpriseData[]> {
    return fetchWithAuth(`${API_BASE}/surprises`);
  },

  async getSurpriseById(id: string): Promise<SurpriseData> {
    const res = await fetch(`${API_BASE}/surprises/${id}`);
    if (!res.ok) throw new Error('Surprise not found');
    return res.json();
  },

  async createSurprise(surprise: Partial<SurpriseData>): Promise<SurpriseData> {
    return fetchWithAuth(`${API_BASE}/surprises`, {
      method: 'POST',
      body: JSON.stringify(surprise),
    });
  },

  async updateSurprise(id: string, surprise: Partial<SurpriseData>): Promise<SurpriseData> {
    return fetchWithAuth(`${API_BASE}/surprises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(surprise),
    });
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
    return fetchWithAuth(`${API_BASE}/admin/users`);
  },

  async deleteAdminUser(id: string) {
    return fetchWithAuth(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminSurprises(): Promise<SurpriseData[]> {
    return fetchWithAuth(`${API_BASE}/admin/surprises`);
  },

  async deleteAdminSurprise(id: string) {
    return fetchWithAuth(`${API_BASE}/admin/surprises/${id}`, {
      method: 'DELETE',
    });
  },

  async updateAdminSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    return fetchWithAuth(`${API_BASE}/admin/settings`, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }
};
