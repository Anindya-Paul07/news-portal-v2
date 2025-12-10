'use client';

import Link from 'next/link';
import { AdSlot } from '@/components/ads/AdSlot';
import { ArticleCard } from '@/components/news/ArticleCard';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import { HeroCarousel } from '@/components/news/HeroCarousel';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/language-context';
import { Article } from '@/lib/types';
import {
  useArticles,
  useBreakingTicker,
  useFeaturedArticles,
  useLatestArticles,
  useMenuCategories,
  useTrendingArticles,
} from '@/hooks/api-hooks';
import { sampleArticles, sampleCategories } from '@/lib/fallbacks';
import { getLocalizedText } from '@/lib/utils';

export default function HomePage() {
  const { data: featured } = useFeaturedArticles();
  const { data: breaking } = useBreakingTicker();
  const { data: trending } = useTrendingArticles();
  const { data: latest } = useLatestArticles();
  const { data: categories } = useMenuCategories();
  const { language } = useLanguage();
  const categoryList = categories && categories.length > 0 ? categories : sampleCategories;
  const latestList = latest && latest.length > 0 ? latest : sampleArticles;
  const trendingList = trending && trending.length > 0 ? trending : sampleArticles.slice(0, 6);
  const breakingTicker = breaking && breaking.length > 0 ? breaking : sampleArticles.slice(0, 3);
  const heroSlides = (featured && featured.length > 0 ? featured : sampleArticles).slice(0, 4);
  const gridLatest = latestList.slice(0, 4);
  const stackedLatest = latestList.slice(4, 8);
  const trendingHighlights = trendingList.slice(0, 4);

  const firstCategorySlug = categoryList?.[0]?.slug;
  const secondCategorySlug = categoryList?.[1]?.slug;
  const { data: firstCategoryArticles } = useArticles({ category: firstCategorySlug, limit: 3 });
  const { data: secondCategoryArticles } = useArticles({ category: secondCategorySlug, limit: 3 });
  const firstCategoryList =
    firstCategoryArticles && firstCategoryArticles.length > 0 ? firstCategoryArticles : sampleArticles;
  const secondCategoryList =
    secondCategoryArticles && secondCategoryArticles.length > 0 ? secondCategoryArticles : sampleArticles;
  const firstCategoryFeature = firstCategoryList[0];
  const firstCategoryRest = firstCategoryList.slice(1, 4);
  const secondCategoryGrid = secondCategoryList.slice(0, 4);
  const getArticleTitle = (story: Article) => getLocalizedText(story.title, language);
  const getArticleSummary = (story: Article) => getLocalizedText(story.excerpt, language);

  return (
    <div className="space-y-8">
      <BreakingTicker items={breakingTicker} />
      {heroSlides.length > 0 && <HeroCarousel articles={heroSlides} />}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-[var(--color-panel-border)] bg-[var(--color-panel-bg)] p-6 shadow-[0_16px_36px_rgba(27,23,22,0.12)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="headline text-2xl font-extrabold text-[var(--color-primary)]">Latest headlines</h2>
            <Link href="/search?sort=date">
              <Button variant="ghost" className="text-sm text-[var(--color-primary)] hover:text-[var(--color-accent)]">
                See all
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {gridLatest.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {stackedLatest.length > 0 && (
              <div className="rounded-2xl border border-[var(--color-panel-border)] bg-[var(--color-surface)] p-4 shadow-[0_12px_32px_rgba(27,23,22,0.12)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">Fresh picks</p>
                <div className="mt-3 space-y-4">
                  {stackedLatest.map((story) => (
                    <Link
                      key={story.id}
                      href={`/article/${story.slug}`}
                      className="block rounded-xl border border-transparent px-3 py-2 transition hover:border-[var(--color-primary)]"
                    >
                  <p className="font-semibold text-[var(--color-panel-text)]">{getArticleTitle(story)}</p>
                  {getArticleSummary(story) && (
                    <p className="text-xs text-[var(--color-muted)]">{getArticleSummary(story)}</p>
                  )}
                </Link>
              ))}
            </div>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border-l-4 border-[var(--color-primary)] bg-[var(--color-trending-bg)] p-5 text-[var(--color-trending-text)] shadow-[0_14px_32px_rgba(27,23,22,0.15)]">
            <h3 className="headline mb-3 text-xl font-bold text-[var(--color-trending-text)]">Trending now</h3>
            <div className="space-y-3">
              {trendingHighlights.map((story, index) => (
                <Link
                  key={story.id}
                  href={`/article/${story.slug}`}
                  className="group flex items-start gap-3 rounded-2xl bg-[var(--color-surface)] px-3 py-2 transition hover:bg-[var(--color-panel-bg)]"
                >
                  <span className="text-lg font-black text-[var(--color-accent)]">0{index + 1}</span>
                  <div>
                    <p className="font-semibold text-[var(--color-panel-text)] group-hover:text-[var(--color-primary)]">
                      {getArticleTitle(story)}
                    </p>
                    {getArticleSummary(story) && (
                      <p className="text-xs text-[var(--color-muted)]">{getArticleSummary(story)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <AdSlot position="sidebar" page="home" />
        </div>
      </div>

      <AdSlot position="banner" page="home" />

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-[var(--color-panel-border)] bg-[var(--color-secondary)] p-5 text-[var(--color-secondary-contrast)] shadow-[0_18px_36px_rgba(35,53,84,0.35)]">
          <div className="mb-3 flex items-center justify-between text-[var(--color-secondary-contrast)]">
            <h3 className="headline text-xl font-extrabold">
              {getLocalizedText(categoryList?.[0]?.name, language) || 'Top stories'}
            </h3>
            <Link href={`/category/${firstCategorySlug || 'news'}`} className="text-sm font-semibold text-[var(--color-accent)]">
              View category
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            {firstCategoryFeature && <ArticleCard key={firstCategoryFeature.id} article={firstCategoryFeature} />}
            <div className="space-y-3">
              {firstCategoryRest.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="block rounded-2xl bg-[rgba(255,244,239,0.12)] px-3 py-2 text-sm transition hover:bg-[rgba(255,244,239,0.24)]"
                >
                  <p className="font-semibold text-[var(--color-secondary-contrast)]">{getArticleTitle(article)}</p>
                  {getArticleSummary(article) && (
                    <p className="text-xs text-[rgba(255,244,239,0.8)]">{getArticleSummary(article)}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-3xl border border-[var(--color-panel-border)] bg-[var(--color-panel-bg)] p-5 shadow-[0_12px_28px_rgba(27,23,22,0.12)]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="headline text-xl font-extrabold text-[var(--color-primary)]">
              {getLocalizedText(categoryList?.[1]?.name, language) || 'In depth'}
            </h3>
            <Link href={`/category/${secondCategorySlug || 'news'}`} className="text-sm font-semibold text-[var(--color-secondary)]">
              View category
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {secondCategoryGrid.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </div>

      <section className="card-soft border border-[var(--color-section-bg)] bg-[var(--color-section-bg)] p-6">
        <div className="flex items-center justify-between">
          <h3 className="headline text-xl font-extrabold">Sections</h3>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Browse by beat</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categoryList?.map((category, index) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group rounded-2xl border border-[var(--color-panel-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-section-muted)]">
                {String(index + 1).padStart(2, '0')}
                <span className="text-[var(--color-primary)]">Section</span>
              </p>
              <p className="headline text-lg font-bold text-[var(--color-section-text)] group-hover:text-[var(--color-primary)]">
                {getLocalizedText(category.name, language)}
              </p>
              {category.description && (
                <p className="text-sm text-[var(--color-muted)]">{getLocalizedText(category.description, language)}</p>
              )}
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">Enter →</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
