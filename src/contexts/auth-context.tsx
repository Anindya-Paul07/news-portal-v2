'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, User } from '@/lib/types';
import { useAlert } from '@/contexts/alert-context';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type Credentials = { email: string; password: string; name?: string };

export type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  login: (payload: Credentials) => Promise<void>;
  register: (payload: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const queryClient = useQueryClient();
  const { notify } = useAlert();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setStatus('loading');
        const res = await apiClient.get<ApiResponse<User>>('/auth/me');
        setUser(res.data);
        setStatus('authenticated');
      } catch {
        setStatus('unauthenticated');
      }
    };
    loadProfile();
  }, []);

  const login = async (payload: Credentials) => {
    setStatus('loading');
    try {
      const res = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>(
        '/auth/login',
        payload,
        { skipAuth: true },
      );
      apiClient.setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      setStatus('authenticated');
      notify({ type: 'success', title: 'Welcome back', description: res.data.user.name });
    } catch (error) {
      setStatus('unauthenticated');
      notify({ type: 'error', title: 'Login failed', description: getErrorMessage(error) });
      throw error;
    }
  };

  const register = async (payload: Credentials) => {
    setStatus('loading');
    try {
      const res = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>(
        '/auth/register',
        payload,
        { skipAuth: true },
      );
      apiClient.setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      setStatus('authenticated');
      notify({ type: 'success', title: 'Welcome to The Contemporary News', description: res.data.user.name });
    } catch (error) {
      setStatus('unauthenticated');
      notify({ type: 'error', title: 'Registration failed', description: getErrorMessage(error) });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // logout endpoint might fail if token expired; still clear locally.
    }
    apiClient.clearTokens();
    setUser(null);
    setStatus('unauthenticated');
    queryClient.clear();
    notify({ type: 'info', title: 'You have logged out' });
  };

  const refreshProfile = async () => {
    try {
      const res = await apiClient.get<ApiResponse<User>>('/auth/me');
      setUser(res.data);
      setStatus('authenticated');
    } catch {
      setStatus('unauthenticated');
      apiClient.clearTokens();
    }
  };

  const updateProfile = async (payload: Partial<User>) => {
    const res = await apiClient.put<ApiResponse<User>>('/auth/profile', payload);
    setUser(res.data);
    notify({ type: 'success', title: 'Profile updated' });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await apiClient.put<ApiResponse<unknown>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    notify({ type: 'success', title: 'Password updated' });
  };

  return (
    <AuthContext.Provider
      value={{ user, status, login, register, logout, refreshProfile, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong';
}
