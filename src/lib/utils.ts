import { LocalizedText } from '@/lib/types';

export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(value?: string | number | Date) {
  if (!value) return '';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function readingTimeFromWords(words?: number) {
  if (!words) return '';
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export function getLocalizedText(value?: LocalizedText | null, language: 'en' | 'bn' = 'en') {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const normalized = language.toLowerCase();
  if (value[normalized]) return value[normalized];
  if (value.en) return value.en;
  if (value.bn) return value.bn;
  const firstEntry = Object.values(value).find((entry) => typeof entry === 'string' && entry.trim().length > 0);
  return firstEntry || '';
}

const defaultUploadBase = 'https://backoffice.thecontemporary.news';

const stripApiPrefix = (value: string) => value.replace(/^api\/v\d+\//i, '');

export function resolveMediaUrl(url?: string | null) {
  if (!url) return '';

  const uploadBase = (process.env.NEXT_PUBLIC_UPLOAD_BASE || defaultUploadBase).replace(/\/+$/, '');
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE || defaultUploadBase).replace(/\/+$/, '');

  const buildFromPath = (path: string) => {
    const withoutSlashes = path.replace(/^\/+/, '');
    const normalized = stripApiPrefix(withoutSlashes);
    return normalized ? `${uploadBase}/${normalized}` : uploadBase;
  };

  if (!/^https?:\/\//i.test(url)) {
    return buildFromPath(url);
  }

  try {
    const parsed = new URL(url);
    const allowedOrigins: string[] = [];
    try {
      allowedOrigins.push(new URL(uploadBase).origin);
    } catch {
      /* no-op */
    }
    try {
      const origin = new URL(apiBase).origin;
      if (!allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    } catch {
      /* no-op */
    }

    if (allowedOrigins.includes(parsed.origin)) {
      return buildFromPath(parsed.pathname);
    }
  } catch {
    // Ignore parsing errors and fall through to returning the original URL.
  }

  return url;
}
