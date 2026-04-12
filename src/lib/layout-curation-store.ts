'use client';

import type { Article, LayoutCuration } from '@/lib/types';

const STORAGE_KEY = 'news-portal-layout-curation-v1';

const sanitize = (value: unknown): LayoutCuration => {
  if (!value || typeof value !== 'object') return {};
  const draft = value as LayoutCuration;
  return {
    homepageLeadId: typeof draft.homepageLeadId === 'string' ? draft.homepageLeadId : undefined,
    homepageSecondaryIds: Array.isArray(draft.homepageSecondaryIds)
      ? draft.homepageSecondaryIds.filter((item): item is string => typeof item === 'string').slice(0, 3)
      : [],
    sectionPromoBySlug:
      draft.sectionPromoBySlug && typeof draft.sectionPromoBySlug === 'object'
        ? Object.fromEntries(
            Object.entries(draft.sectionPromoBySlug).filter(
              ([key, value]) => typeof key === 'string' && typeof value === 'string',
            ),
          )
        : {},
    mostReadOverrideIds: Array.isArray(draft.mostReadOverrideIds)
      ? draft.mostReadOverrideIds.filter((item): item is string => typeof item === 'string').slice(0, 6)
      : [],
  };
};

export const readLayoutCuration = (): LayoutCuration => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return sanitize(JSON.parse(raw));
  } catch {
    return {};
  }
};

export const writeLayoutCuration = (value: LayoutCuration) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitize(value)));
};

export const findCuratedArticles = (articles: Article[], ids?: string[]) => {
  if (!ids?.length) return [];
  const byId = new Map(articles.map((article) => [article.id, article]));
  return ids.map((id) => byId.get(id)).filter((article): article is Article => Boolean(article));
};

export const findCuratedArticle = (articles: Article[], id?: string) => {
  if (!id) return undefined;
  return articles.find((article) => article.id === id);
};
