'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AdSlot } from '@/components/ads/AdSlot';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/Button';
import { useArticle, useRelatedArticles } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { sampleArticles } from '@/lib/fallbacks';
import { formatDate, getLocalizedText } from '@/lib/utils';

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const fallbackArticle = sampleArticles.find((item) => item.slug === slug) || sampleArticles[0];
  const { data: article } = useArticle(slug);
  const categoryIdForRelated = article?.categoryId ?? fallbackArticle.categoryId;
  const { data: related } = useRelatedArticles(categoryIdForRelated);
  const { language } = useLanguage();
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const displayArticle = article || fallbackArticle;
  const relatedStories =
    related && related.length > 0
      ? related
      : sampleArticles.filter((item) => item.id !== displayArticle.id).slice(0, 4);
  const categoryLabel = getLocalizedText(displayArticle.category?.name, language) || 'News';
  const title = getLocalizedText(displayArticle.title, language);
  const summary = getLocalizedText(displayArticle.excerpt, language);
  const featuredImage = displayArticle.featuredImage?.url || displayArticle.coverImage;
  const featuredAlt = getLocalizedText(displayArticle.featuredImage?.alt, language) || title;
  const bodyContent =
    typeof displayArticle.content === 'string'
      ? displayArticle.content
      : displayArticle.content?.[lang] || displayArticle.content?.en || summary || '';

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <article className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
          <span className="rounded-full bg-[rgba(252,186,4,0.2)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
            {categoryLabel}
          </span>
          {displayArticle.publishedAt && <span>{formatDate(displayArticle.publishedAt)}</span>}
          {displayArticle.readingTime && <span>• {displayArticle.readingTime} min read</span>}
          <div className="flex items-center gap-2">
            <Button variant="outline" className="px-3 py-1 text-xs" onClick={() => setLang('en')}>
              EN
            </Button>
            <Button variant="outline" className="px-3 py-1 text-xs" onClick={() => setLang('bn')}>
              বাংলা
            </Button>
          </div>
        </div>
        <h1 className="headline text-3xl font-extrabold leading-tight md:text-4xl">{title}</h1>
        {summary && <p className="text-lg text-[var(--color-muted)]">{summary}</p>}

        {featuredImage && (
          <div className="relative h-80 w-full overflow-hidden rounded-2xl">
            <Image src={featuredImage} alt={featuredAlt} fill className="object-cover" sizes="100vw" />
          </div>
        )}

        <div className="article-content prose max-w-none prose-headings:font-serif">
          <p>{bodyContent || 'বাংলা কন্টেন্ট আসছে।'}</p>
        </div>

        <AdSlot position="in_content" page="article" />
      </article>

      <aside className="space-y-4">
        <AdSlot position="sidebar" page="article" />
        <div className="surface-card p-4">
          <h3 className="headline mb-3 text-xl font-bold">Related stories</h3>
          <div className="space-y-3">
            {relatedStories.slice(0, 4).map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
