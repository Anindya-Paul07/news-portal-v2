'use client';

import type { FbShort } from '@/components/news/FbShortsRail';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/lib/types';

export type ReelItem = FbShort & {
  createdAt: string;
  updatedAt: string;
};

export type ReelDraft = Omit<ReelItem, 'createdAt' | 'updatedAt'>;

export type ReelSyncResult = {
  items: ReelItem[];
  source: 'api' | 'local';
};

type BackendReel = {
  id?: string;
  title?: string;
  url?: string;
  videoUrl?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const STORAGE_KEY = 'newsportal.customReels.v1';

export const isSupportedReelUrl = (url: string) =>
  /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/|facebook\.com\/)/i.test(url);

const normalizeReel = (item: Partial<ReelItem> & BackendReel): ReelItem | null => {
  const videoUrl = item.videoUrl || item.url;
  if (!item.id || !item.title || !videoUrl) return null;
  const now = new Date().toISOString();

  return {
    id: String(item.id),
    title: String(item.title),
    videoUrl: String(videoUrl),
    thumbnailUrl: item.thumbnailUrl ? String(item.thumbnailUrl) : undefined,
    duration: item.duration ? String(item.duration) : undefined,
    postedAt: item.postedAt ? String(item.postedAt) : undefined,
    views: typeof item.views === 'number' ? item.views : item.views ? Number(item.views) : undefined,
    description: item.description ? String(item.description) : undefined,
    isActive: item.isActive ?? true,
    createdAt: item.createdAt ? String(item.createdAt) : now,
    updatedAt: item.updatedAt ? String(item.updatedAt) : now,
  };
};

const extractReels = (response: ApiResponse<unknown> | unknown): ReelItem[] => {
  const data =
    response && typeof response === 'object' && 'data' in response
      ? (response as ApiResponse<unknown>).data
      : response;
  const list =
    Array.isArray(data)
      ? data
      : data && typeof data === 'object' && 'reels' in data && Array.isArray((data as { reels?: unknown }).reels)
        ? (data as { reels: unknown[] }).reels
        : [];

  return list
    .map((item) => normalizeReel(item as BackendReel))
    .filter((item): item is ReelItem => Boolean(item))
    .filter((item) => item.isActive !== false);
};

const toBackendPayload = (payload: ReelDraft) => ({
  title: payload.title,
  url: payload.videoUrl,
  description: payload.description,
  isActive: payload.isActive ?? true,
});

export const readReels = (): ReelItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ReelItem => !!item?.id && !!item?.title);
  } catch {
    return [];
  }
};

const writeReels = (items: ReelItem[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const upsertReel = (payload: Omit<ReelItem, 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const items = readReels();
  const existing = items.find((item) => item.id === payload.id);

  if (existing) {
    const updated = items.map((item) => (item.id === payload.id ? { ...item, ...payload, updatedAt: now } : item));
    writeReels(updated);
    return updated;
  }

  const next = [{ ...payload, createdAt: now, updatedAt: now }, ...items];
  writeReels(next);
  return next;
};

export const deleteReel = (id: string) => {
  const next = readReels().filter((item) => item.id !== id);
  writeReels(next);
  return next;
};

export const fetchReels = async (): Promise<ReelSyncResult> => {
  try {
    const response = await apiClient.get<ApiResponse<unknown> | unknown>('/reels', { skipAuth: true });
    const items = extractReels(response);
    writeReels(items);
    return { items, source: 'api' };
  } catch {
    return { items: readReels(), source: 'local' };
  }
};

export const saveReel = async (payload: ReelDraft, editingId?: string | null): Promise<ReelSyncResult> => {
  try {
    const response = editingId
      ? await apiClient.put<ApiResponse<unknown> | unknown>(`/reels/${editingId}`, toBackendPayload(payload))
      : await apiClient.post<ApiResponse<unknown> | unknown>('/reels', toBackendPayload(payload));
    const data =
      response && typeof response === 'object' && 'data' in response
        ? (response as ApiResponse<unknown>).data
        : response;
    const saved = normalizeReel(data as BackendReel) ?? normalizeReel({ ...payload, id: editingId || payload.id });
    const items = saved ? upsertReel(saved) : readReels();
    return { items, source: 'api' };
  } catch {
    const normalized = normalizeReel({ ...payload, id: editingId || payload.id }) ?? payload;
    return { items: upsertReel(normalized), source: 'local' };
  }
};

export const removeReel = async (id: string): Promise<ReelSyncResult> => {
  try {
    await apiClient.delete<ApiResponse<null>>(`/reels/${id}`);
    return { items: deleteReel(id), source: 'api' };
  } catch {
    return { items: deleteReel(id), source: 'local' };
  }
};
