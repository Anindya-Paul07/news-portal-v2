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

  return url;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function normalizeRichText(content?: string | null) {
  if (!content) return '';
  const trimmed = content.trim();
  if (!trimmed) return '';
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (hasHtml) return trimmed;
  const escaped = escapeHtml(trimmed);
  return `<p>${escaped.replace(/\r\n/g, '\n').replace(/\n/g, '<br />')}</p>`;
}

export function resolveRichTextMedia(html?: string | null) {
  if (!html) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src) {
      img.setAttribute('src', resolveMediaUrl(src));
    }
  });
  return doc.body.innerHTML;
}
