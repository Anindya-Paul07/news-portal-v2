'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';
import { formatDate, getLocalizedText } from '@/lib/utils';

export function ArticleCard({ article }: { article: Article }) {
  const { language } = useLanguage();
  const categoryLabel = getLocalizedText(article.category?.name, language) || 'News';
  const title = getLocalizedText(article.title, language);
  const summary = getLocalizedText(article.excerpt, language);
  const imageUrl = article.featuredImage?.url || article.coverImage;
  const imageAlt = getLocalizedText(article.featuredImage?.alt, language) || title;

  return (
    <Link
      href={`/article/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card-surface,#fff4ef)] shadow-sm transition-transform hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-48 w-full overflow-hidden border-b-4 border-[var(--color-primary)] bg-[var(--color-panel-bg)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-card-meta)]">
          {categoryLabel}
          {article.isBreaking && (
            <span className="rounded-full bg-[var(--color-card-breaking-bg)] px-2 py-0.5 text-[var(--color-card-breaking-text)]">
              Breaking
            </span>
          )}
          {article.isTrending && (
            <span className="rounded-full border border-[var(--color-card-trending-border)] px-2 py-0.5 text-[var(--color-card-trending-text)]">
              Trending
            </span>
          )}
        </div>
        <h3 className="headline text-xl font-bold leading-tight text-[var(--color-card-heading)] group-hover:text-[var(--color-card-accent)]">
          {title}
        </h3>
        {summary && <p className="line-clamp-2 text-sm text-[var(--color-card-meta)]">{summary}</p>}
        <div className="mt-auto flex items-center justify-between text-xs text-[var(--color-card-meta)]">
          <span>{article.author?.name || 'Staff Desk'}</span>
          {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
        </div>
      </div>
    </Link>
  );
}
