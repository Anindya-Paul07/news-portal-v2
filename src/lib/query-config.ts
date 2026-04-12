import { getDisplayErrorMessage } from '@/lib/errors';

/**
 * Enterprise-Grade API Configuration
 * Centralized query configuration for professional newsroom operations
 */

export const QUERY_CONFIGS = {
  // Real-time data - short stale time, frequent refetch
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // 1 minute
    retry: 2,
  },

  // Dashboard metrics - moderate freshness
  dashboard: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  },

  // Static reference data - long cache
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 3,
  },

  // User-generated content - balanced
  content: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  },

  // Critical operations - no staling, always fresh
  critical: {
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true,
    retry: 5,
  },
} as const;

/**
 * Error handler for API operations
 */
export const handleApiError = (error: unknown): string => {
  return getDisplayErrorMessage(error, 'fetch');
};

/**
 * Success toast configurations
 */
export const SUCCESS_MESSAGES = {
  article: {
    create: 'Article created successfully',
    update: 'Article updated successfully',
    delete: 'Article deleted successfully',
  },
  category: {
    create: 'Category created successfully',
    update: 'Category updated successfully',
    delete: 'Category deleted successfully',
  },
  ad: {
    create: 'Advertisement created successfully',
    update: 'Advertisement updated successfully',
    delete: 'Advertisement deleted successfully',
  },
  user: {
    create: 'User created successfully',
    update: 'User updated successfully',
    delete: 'User deleted successfully',
  },
  media: {
    upload: 'Media uploaded successfully',
    update: 'Media updated successfully',
    delete: 'Media deleted successfully',
  },
} as const;
