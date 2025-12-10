'use client';

import { getInitialTokens, persistTokens, removeTokens } from '@/lib/session';
import { ApiResponse } from '@/lib/types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  formData?: boolean;
};

export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null;
  private refreshToken: string | null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BASE || 'https://backoffice.thecontemporary.news';
    const tokens = getInitialTokens();
    this.accessToken = tokens?.accessToken || null;
    this.refreshToken = tokens?.refreshToken || null;
  }

  setTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    persistTokens({ accessToken: this.accessToken, refreshToken: this.refreshToken });
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    removeTokens();
  }

  getBase(path: string) {
    return `${this.baseUrl}/api/v1${path}`;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth, formData, ...rest } = options;
    const headers: Record<string, string> = {
      ...(rest.headers as Record<string, string>),
    };

    if (!formData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.accessToken && !skipAuth) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(this.getBase(path), {
      ...rest,
      headers,
      credentials: 'include',
    });

    if (response.status === 401 && this.refreshToken && !skipAuth) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        return this.request<T>(path, options);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }

    const json = await response.json().catch(() => ({}));
    return json as T;
  }

  async tryRefresh(): Promise<boolean> {
    try {
      const res = await fetch(this.getBase('/auth/refresh-token'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.refreshToken ? `Bearer ${this.refreshToken}` : '',
        },
      });

      if (!res.ok) return false;
      const payload = (await res.json()) as ApiResponse<{ accessToken: string; refreshToken?: string | null }>;
      const accessToken = payload.data?.accessToken;
      const refreshToken = payload.data?.refreshToken ?? this.refreshToken ?? undefined;
      if (!accessToken) return false;
      this.setTokens(accessToken, refreshToken || undefined);
      return true;
    } catch (error) {
      console.error('Refresh failed', error);
      this.clearTokens();
      return false;
    }
  }

  async get<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: 'GET' });
  }

  async post<T>(path: string, body?: unknown, init?: RequestOptions) {
    const formData = body instanceof FormData;
    return this.request<T>(path, {
      ...init,
      method: 'POST',
      body: formData ? body : body ? JSON.stringify(body) : undefined,
      formData,
    });
  }

  async put<T>(path: string, body?: unknown, init?: RequestOptions) {
    const formData = body instanceof FormData;
    return this.request<T>(path, {
      ...init,
      method: 'PUT',
      body: formData ? body : body ? JSON.stringify(body) : undefined,
      formData,
    });
  }

  async delete<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
