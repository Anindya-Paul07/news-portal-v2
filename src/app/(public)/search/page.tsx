'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Search } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { ArticleCard } from '@/components/news/ArticleCard';
import { useLanguage } from '@/contexts/language-context';
import { useArticles, useMenuCategories, useSearchArticles } from '@/hooks/api-hooks';
import { handleApiError } from '@/lib/query-config';
import { getLocalizedText, resolveMediaUrl } from '@/lib/utils';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--news-page)]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--news-red-700)] border-t-transparent" />
            <p className="news-meta text-[var(--news-soft)]">Initializing search</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [term, setTerm] = useState(searchParams.get('query') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');
  const category = searchParams.get('category') || undefined;

  const { data: categories, isError: isCategoriesError, error: categoriesError } = useMenuCategories();
  const { data: results, isLoading: isSearchLoading, isError: isSearchError, error: searchError } = useSearchArticles(term, { sort, category });
  const { data: latest, isError: isLatestError, error: latestError } = useArticles({ sort: '-publishedAt', limit: 5, status: 'published' });

  const categoryList = categories ?? [];
  const latestList = latest ?? [];
  const resultItems = results ?? [];

  useEffect(() => {
    const handler = setTimeout(() => {
      const query = new URLSearchParams();
      if (term) query.set('query', term);
      if (sort) query.set('sort', sort);
      if (category) query.set('category', category);

      if (query.toString() !== searchParams.toString()) {
        router.replace(`/search?${query.toString()}`);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [term, sort, category, router, searchParams]);

  return (
    <div className="min-h-screen bg-[var(--news-page)]">
      <div className="border-b border-[var(--news-grid)] bg-[var(--news-paper)]">
        <div className="mx-auto max-w-[1440px] px-4 py-10 md:py-14">
          <div className="max-w-4xl">
            <p className="news-meta text-[var(--news-red-700)]">Search desk</p>
            <h1 className="mt-3 [font-family:var(--font-serif)] text-4xl font-bold leading-none tracking-[-0.04em] text-[var(--news-ink)] md:text-6xl">
              {language === 'bn' ? 'দ্রুত, নির্ভুল, সম্পাদিত অনুসন্ধান' : 'Faster, cleaner newsroom search'}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--news-muted)]">
              {language === 'bn'
                ? 'শিরোনাম, বিষয়, বিভাগ এবং সাম্প্রতিক প্রতিবেদন খুঁজুন।'
                : 'Search headlines, topics, sections, and the latest reporting without the old cluttered filter layout.'}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--news-soft)]" />
              <input
                type="text"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={language === 'bn' ? 'খুঁজুন প্রতিবেদন, বিষয়, লেখক' : 'Search reports, topics, authors'}
                className="w-full border border-[var(--news-grid-strong)] bg-white py-4 pl-12 pr-4 text-lg text-[var(--news-ink)] placeholder:text-[var(--news-soft)] focus:border-[var(--news-red-700)] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="news-meta inline-flex items-center gap-1 text-[var(--news-soft)]">
                <Filter className="h-3.5 w-3.5" />
                Filters
              </span>
              <div className="flex border border-[var(--news-grid-strong)] bg-white p-1">
                {[
                  { key: 'relevance', label: language === 'bn' ? 'সাজেস্টেড' : 'Recommended' },
                  { key: 'date', label: language === 'bn' ? 'সর্বশেষ' : 'Newest' },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSort(option.key)}
                    className={`px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                      sort === option.key ? 'bg-[var(--news-black)] text-white' : 'text-[var(--news-soft)] hover:text-[var(--news-ink)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.replace(`/search?query=${encodeURIComponent(term)}&sort=${sort}`)}
              className={`px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] ${
                !category ? 'bg-[var(--news-red-700)] text-white' : 'border border-[var(--news-grid)] bg-white text-[var(--news-soft)]'
              }`}
            >
              {language === 'bn' ? 'সব' : 'All'}
            </button>
            {categoryList.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  router.replace(
                    `/search?query=${encodeURIComponent(term)}&sort=${sort}&category=${encodeURIComponent(cat.slug)}`,
                  )
                }
                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] ${
                  category === cat.slug
                    ? 'bg-[var(--news-red-700)] text-white'
                    : 'border border-[var(--news-grid)] bg-white text-[var(--news-soft)]'
                }`}
              >
                {getLocalizedText(cat.name, language)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_340px]">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-[var(--news-grid)] pb-2">
              <h2 className="news-section-title">
                {term
                  ? language === 'bn'
                    ? `"${term}" এর ফলাফল`
                    : `Results for "${term}"`
                  : language === 'bn'
                    ? 'সাম্প্রতিক প্রতিবেদন'
                    : 'Recent reporting'}
              </h2>
              <span className="news-meta text-[var(--news-soft)]">{resultItems.length} items</span>
            </div>

            {isSearchLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse border border-[var(--news-grid)] bg-white p-4">
                    <div className="aspect-[4/3] bg-[var(--news-gray-100)]" />
                    <div className="mt-4 h-4 w-20 bg-[var(--news-gray-100)]" />
                    <div className="mt-3 h-6 w-full bg-[var(--news-gray-100)]" />
                    <div className="mt-2 h-6 w-4/5 bg-[var(--news-gray-100)]" />
                  </div>
                ))}
              </div>
            ) : isSearchError ? (
              <div className="border border-[var(--news-grid)] bg-white px-6 py-16 text-center">
                <h3 className="mt-2 [font-family:var(--font-serif)] text-3xl font-bold text-[var(--news-ink)]">
                  {language === 'bn' ? 'অনুসন্ধান লোড করা যায়নি' : 'Search is unavailable'}
                </h3>
                <p className="mt-4 max-w-md mx-auto text-[var(--news-muted)]">{handleApiError(searchError)}</p>
              </div>
            ) : resultItems.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {resultItems.map((article) => (
                  <ArticleCard key={article.id} article={article} className="border border-[var(--news-grid)] bg-white p-4" />
                ))}
              </div>
            ) : (
              <div className="border border-[var(--news-grid)] bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--news-paper)] text-[var(--news-soft)]">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-4 [font-family:var(--font-serif)] text-3xl font-bold text-[var(--news-ink)]">
                  {language === 'bn' ? 'কিছু পাওয়া যায়নি' : 'No matching stories'}
                </h3>
                <p className="mt-4 max-w-md mx-auto text-[var(--news-muted)]">
                  {language === 'bn'
                    ? 'অন্য শব্দ ব্যবহার করে চেষ্টা করুন অথবা বিভাগ ব্রাউজ করুন।'
                    : 'Try another term or browse the main sections instead.'}
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="border border-[var(--news-grid)] bg-[var(--news-paper)] p-4">
              <AdSlot position="sidebar" page="search" />
            </div>

            <div className="border border-[var(--news-grid)] bg-white p-5">
              <h3 className="news-section-title border-b border-[var(--news-grid)] pb-2">
                {language === 'bn' ? 'জাস্ট ইন' : 'Just in'}
              </h3>
              <div className="mt-4 space-y-4">
                {isLatestError ? (
                  <p className="text-sm leading-6 text-[var(--news-muted)]">{handleApiError(latestError)}</p>
                ) : null}
                {latestList.map((article) => {
                  const imageUrl = resolveMediaUrl(article.featuredImage?.url || article.coverImage);
                  return (
                    <a
                      key={article.id}
                      href={`/article/${article.slug || article.id}`}
                      className="group grid grid-cols-[minmax(0,1fr)_72px] gap-3 border-b border-[var(--news-grid)] pb-4 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="news-meta text-[var(--news-red-700)]">
                          {getLocalizedText(article.category?.name, language) || 'News'}
                        </p>
                        <h4 className="mt-2 [font-family:var(--font-serif)] text-lg font-bold leading-tight text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                          {getLocalizedText(article.title, language)}
                        </h4>
                      </div>
                      <div className="relative h-[72px] overflow-hidden bg-[var(--news-gray-100)]">
                        {imageUrl ? (
                          <Image src={imageUrl} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="72px" />
                        ) : null}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
        {isCategoriesError ? (
          <div className="mt-6 border border-[var(--news-grid)] bg-white px-5 py-4 text-sm text-[var(--news-muted)]">
            {handleApiError(categoriesError)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
