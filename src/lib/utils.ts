import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get localized text from an object with en/bn properties
 */
export function getLocalizedText(
  obj: string | { en?: string | null; bn?: string | null } | undefined | null,
  locale: 'en' | 'bn' = 'en'
): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return (locale === 'bn' ? obj.bn : obj.en) || obj.en || obj.bn || '';
}

/**
 * Resolve media URL - handles both absolute URLs and relative paths
 */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Relative path - prepend API base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'https://backoffice.thecontemporary.news';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Normalize rich text content into a string HTML payload that can be rendered safely by the UI.
 */
export function normalizeRichText(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '<p></p>';
  }

  if (value === null || value === undefined) {
    return '<p></p>';
  }

  return String(value);
}

/**
 * Rewrite relative media sources inside rich text so article/editor rendering works consistently.
 */
export function resolveRichTextMedia(html: string): string {
  return html.replace(
    /\b(src|href)=["'](?!https?:\/\/|mailto:|tel:|#|data:)([^"']+)["']/gi,
    (_match, attr: string, url: string) => `${attr}="${resolveMediaUrl(url)}"`,
  );
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date | undefined | null, locale: 'en' | 'bn' = 'en'): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return d.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', options);
}
