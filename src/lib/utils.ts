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
