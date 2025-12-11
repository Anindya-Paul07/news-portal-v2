'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  Advertisement,
  AdvertisementPayload,
  ApiResponse,
  Article,
  ArticlePayload,
  Category,
  CategoryPayload,
  DashboardOverview,
  Media,
  MediaUploadPayload,
  User,
} from '@/lib/types';

const buildQuery = (params?: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

const fetcher = async <T,>(path: string) => {
  const res = await apiClient.get<ApiResponse<T>>(path);
  return res.data;
};

export const useMenuCategories = () =>
  useQuery({
    queryKey: ['categories', 'menu'],
    queryFn: () => fetcher<Category[]>(`/categories${buildQuery({ isActive: true, showInMenu: true })}`),
  });

export const useCategoryTree = () =>
  useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => fetcher<Category[]>('/categories/tree/all'),
  });

export const useFeaturedArticles = () =>
  useQuery({
    queryKey: ['articles', 'featured'],
    queryFn: () => fetcher<Article[]>(`/articles/featured/list${buildQuery({ limit: 5 })}`),
  });

export const useBreakingTicker = () =>
  useQuery({
    queryKey: ['articles', 'breaking'],
    queryFn: () => fetcher<Article[]>('/articles/breaking/list'),
  });

export const useTrendingArticles = () =>
  useQuery({
    queryKey: ['articles', 'trending'],
    queryFn: () => fetcher<Article[]>(`/articles${buildQuery({ isTrending: true, status: 'published', limit: 12 })}`),
  });

export const useLatestArticles = () =>
  useQuery({
    queryKey: ['articles', 'latest'],
    queryFn: () =>
      fetcher<Article[]>(`/articles${buildQuery({ sort: '-publishedAt', status: 'published', limit: 12 })}`),
  });

export const useArticles = (
  params?: Record<string, string | number | boolean | undefined>,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['articles', params],
    queryFn: () => fetcher<Article[]>(`/articles${buildQuery(params)}`),
    enabled: options?.enabled ?? true,
  });

export const useArticle = (identifier: string) =>
  useQuery({
    enabled: !!identifier,
    queryKey: ['article', identifier],
    queryFn: () => fetcher<Article>(`/articles/${identifier}`),
  });

export const useRelatedArticles = (categoryId?: string) =>
  useQuery({
    enabled: !!categoryId,
    queryKey: ['articles', 'related', categoryId],
    queryFn: () => fetcher<Article[]>(`/articles${buildQuery({ category: categoryId, limit: 6 })}`),
  });

export const useCategory = (identifier: string) =>
  useQuery({
    enabled: !!identifier,
    queryKey: ['category', identifier],
    queryFn: () => fetcher<Category>(`/categories/${identifier}`),
  });

export const useCategoryArticles = (
  identifier: string,
  params?: Record<string, string | number | boolean | undefined>,
) =>
  useQuery({
    enabled: !!identifier,
    queryKey: ['category', identifier, 'articles', params],
    queryFn: () => fetcher<Article[]>(`/categories/${identifier}/articles${buildQuery(params)}`),
  });

export const useSearchArticles = (term: string, filters?: Record<string, string | number | boolean | undefined>) =>
  useQuery({
    enabled: term.length > 0,
    queryKey: ['articles', 'search', term, filters],
    queryFn: () => fetcher<Article[]>(`/articles/search/query${buildQuery({ q: term, ...filters })}`),
  });

export const useAds = (position?: string, page?: string) =>
  useQuery({
    queryKey: ['ads', 'active', position, page],
    queryFn: () =>
      fetcher<Advertisement[]>(
        `/advertisements/active${buildQuery({
          type: position === 'sidebar' ? 'sidebar' : 'banner',
          position,
          page,
        })}`,
      ),
  });

export const useDashboardOverview = () =>
  useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => fetcher<DashboardOverview>('/dashboard/overview'),
  });

export const useAdminArticles = (params?: Record<string, string | number | boolean | undefined>) =>
  useQuery({
    queryKey: ['admin', 'articles', params],
    queryFn: () => fetcher<Article[]>(`/articles${buildQuery(params)}`),
  });

export const useAdminCategories = () =>
  useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => fetcher<Category[]>('/categories'),
  });

export const useAdminAds = () =>
  useQuery({
    queryKey: ['admin', 'ads'],
    queryFn: () => fetcher<Advertisement[]>('/advertisements'),
  });

export const useUsers = () =>
  useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => fetcher<User[]>('/users'),
  });

export const useMediaLibrary = (params?: Record<string, string | number | boolean | undefined>) =>
  useQuery({
    queryKey: ['admin', 'media', params],
    queryFn: () => fetcher<Media[]>(`/media${buildQuery(params)}`),
  });

export const useSaveArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ArticlePayload) =>
      payload.id
        ? apiClient.put<ApiResponse<Article>>(`/articles/${payload.id}`, payload)
        : apiClient.post<ApiResponse<Article>>('/articles', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
};

export const useSaveCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryPayload) =>
      payload.id
        ? apiClient.put<ApiResponse<Category>>(`/categories/${payload.id}`, payload)
        : apiClient.post<ApiResponse<Category>>('/categories', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
};

export const useSaveAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdvertisementPayload) =>
      payload.id
        ? apiClient.put<ApiResponse<Advertisement>>(`/advertisements/${payload.id}`, payload)
        : apiClient.post<ApiResponse<Advertisement>>('/advertisements', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
    },
  });
};

export const useSaveUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<User> & { id?: string; password?: string }) =>
      payload.id
        ? apiClient.put<ApiResponse<User>>(`/users/${payload.id}`, payload)
        : apiClient.post<ApiResponse<User>>('/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MediaUploadPayload) => {
      const formData = new FormData();
      formData.append('file', payload.file);
      if (payload.alt && typeof payload.alt === 'string') {
        formData.append('alt[en]', payload.alt);
      } else if (payload.alt) {
        Object.entries(payload.alt).forEach(([locale, text]) => {
          if (!text) return;
          formData.append(`alt[${locale}]`, text);
        });
      }
      if (payload.folder) formData.append('folder', payload.folder);
      if (payload.tags?.length) formData.append('tags', payload.tags.join(','));
      return apiClient.post<ApiResponse<Media>>('/media/upload', formData, { formData: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });
};
