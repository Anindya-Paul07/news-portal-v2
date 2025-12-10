'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useArticles, useMenuCategories, useSearchArticles } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { sampleArticles, sampleCategories } from '@/lib/fallbacks';
import { getLocalizedText } from '@/lib/utils';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [term, setTerm] = useState(searchParams.get('query') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');
  const category = searchParams.get('category') || undefined;

  const { data: categories } = useMenuCategories();
  const { data: results } = useSearchArticles(term, { sort, category });
  const { data: latest } = useArticles({ limit: 4 });
  const { language } = useLanguage();
  const categoryList = categories && categories.length > 0 ? categories : sampleCategories;
  const latestList = latest && latest.length > 0 ? latest : sampleArticles.slice(0, 4);
  const shouldShowPlaceholderResults = !term || results === undefined;
  const resultItems = shouldShowPlaceholderResults ? sampleArticles.slice(0, 6) : results || [];

  useEffect(() => {
    const query = new URLSearchParams();
    if (term) query.set('query', term);
    if (sort) query.set('sort', sort);
    if (category) query.set('category', category);
    router.replace(`/search?${query.toString()}`);
  }, [category, router, sort, term]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <h1 className="headline text-3xl font-extrabold">Search</h1>
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
          <Input
            label="Keyword"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search stories"
          />
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-[var(--color-muted)]">Sort:</span>
            {['relevance', 'date'].map((opt) => (
              <Button
                key={opt}
                variant={sort === opt ? 'primary' : 'outline'}
                className="px-3 py-1 text-xs"
                onClick={() => setSort(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-[var(--color-muted)]">Category:</span>
            {categoryList?.map((cat) => (
              <Button
                key={cat.id}
                variant={category === cat.slug ? 'primary' : 'outline'}
                className="px-3 py-1 text-xs"
                onClick={() =>
                  router.replace(`/search?query=${encodeURIComponent(term)}&category=${cat.slug}&sort=${sort}`)
                }
              >
                {getLocalizedText(cat.name, language)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {resultItems.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {results?.length === 0 && (
            <p className="text-[var(--color-muted)]">No matches yet. Try another keyword.</p>
          )}
        </div>
      </div>
      <aside className="space-y-3">
        <h3 className="headline text-xl font-bold">Latest</h3>
        <div className="space-y-3">
          {latestList.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </aside>
    </div>
  );
}
