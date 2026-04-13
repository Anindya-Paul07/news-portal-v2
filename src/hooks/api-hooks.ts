'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  Advertisement,
  AdvertisementPayload,
  AdvertisementType,
  AdPlacement,
  ApiResponse,
  Article,
  ArticlePayload,
  Pagination,
  Category,
  CategoryPayload,
  DashboardOverview,
  ArticleStatPoint,
  CategoryDistributionPoint,
  TrafficTrendPoint,
  AuthorActivityPoint,
  AdPerformancePoint,
  AnalyticsTrafficPoint,
  AnalyticsAdsSummary,
  Media,
  MediaUpdatePayload,
  MediaUploadPayload,
  User,
  LayoutCuration,
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
    queryFn: () => fetcher<Article[]>(`/articles/trending/list${buildQuery({ limit: 12 })}`),
  });

export const useLatestArticles = () =>
  useQuery({
    queryKey: ['articles', 'latest'],
    queryFn: () => fetcher<Article[]>(`/articles/latest/list${buildQuery({ limit: 12 })}`),
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

export const useRelatedArticles = (articleId?: string) =>
  useQuery({
    enabled: !!articleId,
    queryKey: ['articles', 'related', articleId],
    queryFn: () => fetcher<Article[]>(`/articles/${articleId}/related${buildQuery({ limit: 6 })}`),
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

export const useAds = (params?: { type?: AdvertisementType; position?: AdPlacement; page?: string; categoryId?: string }) =>
  useQuery({
    queryKey: ['ads', 'active', params],
    queryFn: () => fetcher<Advertisement[]>(`/advertisements/active${buildQuery(params)}`),
  });

export const useDashboardOverview = () =>
  useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => fetcher<DashboardOverview>('/dashboard/overview'),
  });

export const useDashboardArticleStats = (params?: { startDate?: string; endDate?: string }) =>
  useQuery({
    queryKey: ['dashboard', 'articles', 'stats', params],
    queryFn: () => fetcher<ArticleStatPoint[]>(`/dashboard/articles/stats${buildQuery(params)}`),
  });

export const useDashboardCategoryDistribution = () =>
  useQuery({
    queryKey: ['dashboard', 'categories', 'distribution'],
    queryFn: () => fetcher<CategoryDistributionPoint[]>(`/dashboard/categories/distribution`),
  });

export const useDashboardTrafficTrends = (params?: { days?: number }) =>
  useQuery({
    queryKey: ['dashboard', 'traffic', params],
    queryFn: () => fetcher<TrafficTrendPoint[]>(`/dashboard/traffic/trends${buildQuery(params)}`),
  });

export const useDashboardAuthorActivity = (params?: { limit?: number; categoryId?: string; days?: number }) =>
  useQuery({
    queryKey: ['dashboard', 'users', 'activity', params],
    queryFn: () => fetcher<AuthorActivityPoint[]>(`/dashboard/users/activity${buildQuery(params)}`),
  });

export const useAnalyticsTraffic = (params?: { window?: string; interval?: string; categoryId?: string }) =>
  useQuery({
    queryKey: ['analytics', 'traffic', params],
    queryFn: () => fetcher<AnalyticsTrafficPoint[]>(`/analytics/traffic${buildQuery(params)}`),
  });

export const useAnalyticsAdsSummary = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['analytics', 'ads', 'summary'],
    queryFn: () => fetcher<AnalyticsAdsSummary>('/analytics/ads/summary'),
    enabled: options?.enabled ?? true,
  });

export const useAnalyticsAdsTop = (
  params?: { limit?: number; sort?: string; order?: string; position?: string; categoryId?: string },
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['analytics', 'ads', 'top', params],
    queryFn: () => fetcher<AdPerformancePoint[]>(`/analytics/ads/top${buildQuery(params)}`),
    enabled: options?.enabled ?? true,
  });

export const useLayoutSettings = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['settings', 'layout'],
    queryFn: () => fetcher<LayoutCuration>('/settings/layout'),
    enabled: options?.enabled ?? true,
  });

export const useAdminArticles = (
  params?: Record<string, string | number | boolean | undefined>,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['admin', 'articles', params],
    queryFn: () => fetcher<Article[]>(`/articles${buildQuery(params)}`),
    enabled: options?.enabled ?? true,
  });

export const usePaginatedAdminArticles = (
  params?: Record<string, string | number | boolean | undefined>,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['admin', 'articles', 'paginated', params],
    queryFn: async (): Promise<{ articles: Article[]; pagination?: Pagination }> => {
      const response = await apiClient.get<ApiResponse<Article[]>>(`/articles${buildQuery(params)}`);
      return { articles: response.data, pagination: response.pagination };
    },
    enabled: options?.enabled ?? true,
  });

export const useAdminCategories = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => fetcher<Category[]>('/categories'),
    enabled: options?.enabled ?? true,
  });

export const useAdminAds = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['admin', 'ads'],
    queryFn: () => fetcher<Advertisement[]>('/advertisements'),
    enabled: options?.enabled ?? true,
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

export const useSaveLayoutSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LayoutCuration) => {
      const response = await apiClient.put<ApiResponse<LayoutCuration>>('/settings/layout', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'layout'] });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => apiClient.delete<ApiResponse<null>>(`/articles/${articleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => apiClient.delete<ApiResponse<null>>(`/categories/${categoryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
};

export const useDeleteAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adId: string) => apiClient.delete<ApiResponse<null>>(`/advertisements/${adId}`),
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

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiClient.delete<ApiResponse<null>>(`/users/${userId}`),
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
      if (payload.type) formData.append('type', payload.type);
      if (payload.alt && typeof payload.alt === 'string') {
        formData.append('alt[en]', payload.alt);
      } else if (payload.alt) {
        Object.entries(payload.alt).forEach(([locale, text]) => {
          if (!text) return;
          formData.append(`alt[${locale}]`, text);
        });
      }
      if (payload.caption && typeof payload.caption === 'string') {
        formData.append('caption[en]', payload.caption);
      } else if (payload.caption) {
        Object.entries(payload.caption).forEach(([locale, text]) => {
          if (!text) return;
          formData.append(`caption[${locale}]`, text);
        });
      }
      if (payload.folder) formData.append('folder', payload.folder);
      payload.tags?.forEach((tag) => {
        if (tag) formData.append('tags[]', tag);
      });
      if (payload.isPublic !== undefined) formData.append('isPublic', String(payload.isPublic));
      if (payload.cloudinaryId) formData.append('cloudinaryId', payload.cloudinaryId);
      return apiClient.post<ApiResponse<Media>>('/media/upload', formData, { formData: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });
};

export const useUpdateMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: MediaUpdatePayload) =>
      apiClient.put<ApiResponse<Media>>(`/media/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });
};

export const useAttachMediaToArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      articleId,
      featuredImage,
    }: {
      articleId: string;
      featuredImage: Article['featuredImage'];
    }) => apiClient.put<ApiResponse<Article>>(`/articles/${articleId}`, { featuredImage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => apiClient.delete<ApiResponse<null>>(`/media/${mediaId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });
};
