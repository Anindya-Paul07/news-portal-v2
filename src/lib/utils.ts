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
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  // Relative path - prepend API base URL
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE || 'https://backoffice.thecontemporary.news').replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
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
 * Strips HTML tags and decodes common HTML entities from excerpt/summary text
 * ensuring clean plain text is rendered without stray <p> or <div> tags.
 */
export function cleanExcerpt(text: string | undefined | null): string {
  if (!text) return '';
  let clean = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  clean = clean.replace(/<[^>]*>/g, '');
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean;
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

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string): string {
  return String(num).replace(/\d/g, (d) => bnDigits[Number(d)] ?? d);
}

/**
 * Format relative time (e.g. "৩ ঘণ্টা আগে" / "3 hours ago")
 */
export function formatTimeAgo(date: string | Date | undefined | null, locale: 'en' | 'bn' = 'en'): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffInMs = Math.max(0, now.getTime() - d.getTime());
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return locale === 'bn' ? 'এইমাত্র' : 'Just now';
  }
  if (diffInMinutes < 60) {
    return locale === 'bn'
      ? `${toBengaliNumber(diffInMinutes)} মিনিট আগে`
      : `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  if (diffInHours < 24) {
    return locale === 'bn'
      ? `${toBengaliNumber(diffInHours)} ঘণ্টা আগে`
      : `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  if (diffInDays < 7) {
    return locale === 'bn'
      ? `${toBengaliNumber(diffInDays)} দিন আগে`
      : `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return formatDate(d, locale);
}
