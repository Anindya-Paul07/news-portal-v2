'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { AdSlot } from '@/components/ads/AdSlot';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/Button';
import { useCategory, useCategoryArticles } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { sampleArticles, sampleCategories } from '@/lib/fallbacks';
import { getLocalizedText } from '@/lib/utils';

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const search = useSearchParams();
  const router = useRouter();
  const filter = search.get('filter') || 'latest';
  const { data: category } = useCategory(slug);
  const { data: articles } = useCategoryArticles(slug, {
    sort: filter,
    limit: 12,
  });
  const { language } = useLanguage();
  const fallbackCategory = sampleCategories.find((item) => item.slug === slug) || sampleCategories[0];
  const categoryData = category || fallbackCategory;
  const articlesList = articles && articles.length > 0 ? articles : sampleArticles;
  const categoryLabel = getLocalizedText(categoryData?.name, language) || 'Category';
  const categoryDescription = getLocalizedText(categoryData?.description, language);

  const filters = useMemo(
    () => [
      { key: 'latest', label: 'Latest' },
      { key: 'featured', label: 'Featured' },
      { key: 'trending', label: 'Trending' },
    ],
    [],
  );

  const selectFilter = (value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('filter', value);
    router.replace(url.pathname + url.search);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[var(--color-surface-elevated)] p-6 shadow-md">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-muted)]">Category</p>
        <h1 className="headline text-3xl font-extrabold">{categoryLabel}</h1>
        {categoryDescription && <p className="text-[var(--color-muted)]">{categoryDescription}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'primary' : 'outline'}
              className="px-3 py-1 text-xs"
              onClick={() => selectFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articlesList?.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        <div className="space-y-4">
          <AdSlot position="sidebar" page="category" />
          <AdSlot position="banner" page="category" />
        </div>
      </div>
    </div>
  );
}
