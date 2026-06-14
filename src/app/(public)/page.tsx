'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, PlayCircle, Star, TrendingUp } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import type { FbShort } from '@/components/news/FbShortsRail';
import { TransitionLink } from '@/components/navigation/TransitionLink';
import { useLanguage } from '@/contexts/language-context';
import { useBreakingTicker, useFeaturedArticles, useLatestArticles, useTrendingArticles } from '@/hooks/api-hooks';
import { findCuratedArticle, findCuratedArticles, readLayoutCuration } from '@/lib/layout-curation-store';
import { fetchReels, readReels } from '@/lib/reels-store';
import { handleApiError } from '@/lib/query-config';
import type { Article } from '@/lib/types';
import { formatDate, getLocalizedText, resolveMediaUrl } from '@/lib/utils';

const FbShortsRail = dynamic(() => import('@/components/news/FbShortsRail').then((mod) => mod.FbShortsRail), {
  ssr: false,
});

type StoryCardProps = {
  article: Article;
  language: 'en' | 'bn';
  compact?: boolean;
};

const getArticleHref = (article: Article) => `/article/${article.slug || article.id}`;

const getStoryTitle = (article: Article, language: 'en' | 'bn') => getLocalizedText(article.title, language);
const getStoryExcerpt = (article: Article, language: 'en' | 'bn') => getLocalizedText(article.excerpt, language);
const getCategoryName = (article: Article, language: 'en' | 'bn') =>
  article.category?.name ? getLocalizedText(article.category.name, language) : language === 'bn' ? 'সংবাদ' : 'News';

function StoryImage({
  article,
  alt,
  priority = false,
  sizes,
}: {
  article: Article;
  alt: string;
  priority?: boolean;
  sizes: string;
}) {
  if (!article.featuredImage?.url) {
    return <div className="h-full w-full bg-[linear-gradient(135deg,var(--news-red-900),var(--news-black))]" />;
  }

  return (
    <Image
      src={resolveMediaUrl(article.featuredImage.url)}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
    />
  );
}

function SideStory({ article, language, compact = false }: StoryCardProps) {
  const title = getStoryTitle(article, language);

  return (
    <TransitionLink
      href={getArticleHref(article)}
      className="group grid gap-3 border-b border-[var(--news-grid)] py-4 first:pt-0 last:border-b-0 last:pb-0 md:grid-cols-[140px_minmax(0,1fr)]"
    >
      <div className={`relative overflow-hidden bg-[var(--news-gray-200)] ${compact ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}>
        <StoryImage article={article} alt={title} sizes="(min-width: 1024px) 180px, 38vw" />
      </div>
      <div>
        <p className="news-meta text-[var(--news-red-700)]">{getCategoryName(article, language)}</p>
        <h2
          className={`mt-2 [font-family:var(--font-serif)] font-bold leading-tight text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)] ${
            compact ? 'text-lg' : 'text-xl'
          }`}
        >
          {title}
        </h2>
        {!compact && getStoryExcerpt(article, language) ? (
          <div className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--news-muted)] [&>p]:m-0" dangerouslySetInnerHTML={{ __html: getStoryExcerpt(article, language) || '' }} />
        ) : null}
        <p className="news-meta mt-3 text-[var(--news-soft)]">{formatDate(article.publishedAt, language)}</p>
      </div>
    </TransitionLink>
  );
}

function BriefCard({ article, language }: StoryCardProps) {
  const title = getStoryTitle(article, language);

  return (
    <TransitionLink
      href={getArticleHref(article)}
      className="group block border-t border-[var(--news-grid)] py-4 transition-colors hover:bg-[var(--news-paper)]/60"
    >
      <p className="news-meta text-[var(--news-red-700)]">{getCategoryName(article, language)}</p>
      <h3 className="mt-2 text-lg font-semibold leading-6 text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
        {title}
      </h3>
      <p className="news-meta mt-3 text-[var(--news-soft)]">{formatDate(article.publishedAt, language)}</p>
    </TransitionLink>
  );
}

function HomepageLeadCarousel({ articles, language }: { articles: Article[]; language: 'en' | 'bn' }) {
  const slides = articles
    .filter((article, index, source) => source.findIndex((entry) => entry.id === article.id) === index)
    .slice(0, 4);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 7500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0);
  }, [activeIndex, slides.length]);

  if (slides.length === 0) return null;

  const activeArticle = slides[activeIndex];
  const title = getStoryTitle(activeArticle, language);
  const excerpt = getStoryExcerpt(activeArticle, language);

  const goToSlide = (direction: 'prev' | 'next') => {
    setActiveIndex((current) => {
      if (direction === 'next') return (current + 1) % slides.length;
      return current === 0 ? slides.length - 1 : current - 1;
    });
  };

  return (
    <div className="relative bg-[var(--news-white)] px-4 py-8 md:px-10 md:py-10 lg:px-12">
      <div className="mx-auto max-w-[920px] text-center">
        <p className="text-sm font-bold text-[var(--news-mahogany)] md:text-base">
          {getCategoryName(activeArticle, language)}
        </p>
        <TransitionLink href={getArticleHref(activeArticle)} className="group mt-2 block">
          <h1 className="[font-family:var(--font-serif)] text-[2.25rem] font-bold leading-[1.15] tracking-[-0.03em] text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)] md:text-[3.5rem] lg:text-[4rem]">
            {title}
          </h1>
        </TransitionLink>

        <div className="relative mt-7">
          <TransitionLink
            href={getArticleHref(activeArticle)}
            className="group relative block aspect-[16/9] overflow-hidden bg-[var(--news-gray-200)]"
          >
            <StoryImage article={activeArticle} alt={title} priority sizes="(min-width: 1280px) 820px, (min-width: 1024px) 64vw, 100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80" />
          </TransitionLink>

          {slides.length > 1 ? (
            <>
              <button
                type="button"
                aria-label={language === 'bn' ? 'আগের স্লাইড' : 'Previous slide'}
                onClick={() => goToSlide('prev')}
                className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[var(--news-mahogany)] transition-colors hover:text-[var(--news-red-700)] md:-left-16 md:h-14 md:w-14"
              >
                <ChevronLeft className="h-9 w-9 md:h-12 md:w-12" strokeWidth={1.6} />
              </button>
              <button
                type="button"
                aria-label={language === 'bn' ? 'পরের স্লাইড' : 'Next slide'}
                onClick={() => goToSlide('next')}
                className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[var(--news-mahogany)] transition-colors hover:text-[var(--news-red-700)] md:-right-16 md:h-14 md:w-14"
              >
                <ChevronRight className="h-9 w-9 md:h-12 md:w-12" strokeWidth={1.6} />
              </button>
            </>
          ) : null}
        </div>

        {excerpt ? (
          <div
            className="mx-auto mt-5 max-w-[760px] text-base leading-8 text-[var(--news-ink)] md:text-lg [&>p]:m-0"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        ) : null}

        {slides.length > 1 ? (
          <div className="mt-7 flex items-center justify-center gap-4">
            {slides.map((article, dotIndex) => (
              <button
                key={article.id}
                type="button"
                aria-label={`${language === 'bn' ? 'স্লাইডে যান' : 'Go to slide'} ${dotIndex + 1}`}
                onClick={() => setActiveIndex(dotIndex)}
                className={`h-3.5 w-3.5 rounded-full border-2 border-[var(--news-mahogany)] transition-colors ${
                  dotIndex === activeIndex ? 'bg-[var(--news-mahogany)]' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TrendingCarousel({ articles, language }: { articles: Article[]; language: 'en' | 'bn' }) {
  const items = articles
    .filter((article, index, source) => source.findIndex((entry) => entry.id === article.id) === index)
    .slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section className="news-perf-section border-b border-[var(--news-grid)] py-8 md:py-10">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="news-meta text-[var(--news-red-700)]">
            {language === 'bn' ? 'ট্রেন্ডিং ক্যারোসেল' : 'Trending carousel'}
          </p>
          <h2 className="news-section-title">
            {language === 'bn' ? 'এখন সবচেয়ে আলোচিত খবর' : 'Stories gaining momentum now'}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-[var(--news-muted)]">
          {language === 'bn'
            ? 'শুধু নির্বাচিত ট্রেন্ডিং গল্পগুলো অফ-হোয়াইট কন্টেইনারে, যাতে পেজ ভারী না লাগে।'
            : 'Only selected trending stories sit in a paper-toned carousel, keeping the page clean instead of over-contained.'}
        </p>
      </div>
      <div className="rounded-[1.75rem] border border-[var(--news-grid)] bg-[var(--news-paper)] p-3 shadow-[0_18px_55px_rgba(18,24,31,0.06)] md:p-5">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {items.map((article) => {
            const title = getStoryTitle(article, language);
            return (
              <TransitionLink
                key={article.id}
                href={getArticleHref(article)}
                className="group min-w-[82%] snap-start overflow-hidden border border-[var(--news-grid)] bg-[var(--news-page)] sm:min-w-[48%] lg:min-w-[31%]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--news-gray-200)]">
                  <StoryImage article={article} alt={title} sizes="(min-width: 1024px) 32vw, 82vw" />
                  <div className="absolute left-3 top-3">
                    <span className="news-kicker bg-white/92 text-[var(--news-ink)]">
                      {getCategoryName(article, language)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="[font-family:var(--font-serif)] text-2xl font-bold leading-tight text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                    {title}
                  </h3>
                  {getStoryExcerpt(article, language) ? (
                    <div className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--news-muted)] [&>p]:m-0" dangerouslySetInnerHTML={{ __html: getStoryExcerpt(article, language) || '' }} />
                  ) : null}
                  <p className="news-meta mt-4 text-[var(--news-soft)]">{formatDate(article.publishedAt, language)}</p>
                </div>
              </TransitionLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { language } = useLanguage();
  const [customReels, setCustomReels] = useState<FbShort[]>(() => readReels());
  const breakingQuery = useBreakingTicker();
  const trendingQuery = useTrendingArticles();
  const latestQuery = useLatestArticles();
  const featuredQuery = useFeaturedArticles();

  useEffect(() => {
    let mounted = true;
    fetchReels().then((result) => {
      if (mounted) setCustomReels(result.items);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const latestList = useMemo(() => latestQuery.data ?? [], [latestQuery.data]);
  const trendingList = useMemo(() => trendingQuery.data ?? [], [trendingQuery.data]);
  const featuredList = useMemo(() => featuredQuery.data ?? [], [featuredQuery.data]);
  const breakingTicker = useMemo(() => breakingQuery.data ?? [], [breakingQuery.data]);
  const curation = readLayoutCuration();
  const storyPool = useMemo(
    () =>
      [...featuredList, ...breakingTicker, ...trendingList, ...latestList].filter(
        (article, index, source) => source.findIndex((item) => item.id === article.id) === index,
      ),
    [breakingTicker, featuredList, latestList, trendingList],
  );

  const rankedStories = useMemo(
    () =>
      [...storyPool].sort((a, b) => {
        const score = (article: Article) =>
          (article.isFeatured ? 100 : 0) +
          (article.isBreaking ? 80 : 0) +
          (article.isTrending ? 50 : 0) +
          (article.publishedAt ? Date.parse(article.publishedAt) / 1000000000 : 0);
        return score(b) - score(a);
      }),
    [storyPool],
  );

  const curatedLead = findCuratedArticle(rankedStories, curation.homepageLeadId);
  const curatedSecondary = findCuratedArticles(rankedStories, curation.homepageSecondaryIds);
  const curatedMostRead = findCuratedArticles(rankedStories, curation.mostReadOverrideIds);

  const leadStory = curatedLead ?? rankedStories[0];
  const carouselStories = [
    ...(leadStory ? [leadStory] : []),
    ...curatedSecondary.filter((article) => article.id !== leadStory?.id),
    ...rankedStories.filter((article) => article.id !== leadStory?.id && !curatedSecondary.some((entry) => entry.id === article.id)),
  ]
    .filter((article, index, source) => source.findIndex((item) => item.id === article.id) === index)
    .slice(0, 3);
  const usedIds = new Set(carouselStories.map((article) => article.id));

  const heroStack = rankedStories.filter((article) => !usedIds.has(article.id)).slice(0, 3);
  heroStack.forEach((article) => usedIds.add(article.id));

  const editorsPick = rankedStories.find((article) => !usedIds.has(article.id)) ?? trendingList[0];
  if (editorsPick) usedIds.add(editorsPick.id);

  const quickBriefs = rankedStories.filter((article) => !usedIds.has(article.id)).slice(0, 4);
  quickBriefs.forEach((article) => usedIds.add(article.id));

  const featureStrip = rankedStories.filter((article) => !usedIds.has(article.id)).slice(0, 3);
  featureStrip.forEach((article) => usedIds.add(article.id));

  const mostRead = [...curatedMostRead, ...trendingList.filter((article) => !curatedMostRead.some((entry) => entry.id === article.id))].slice(0, 6);
  const latestFeed = rankedStories.filter((article) => ![...carouselStories, ...heroStack, editorsPick].filter(Boolean).some((item) => item?.id === article.id)).slice(0, 8);
  const sectionPromoBySlug = curation.sectionPromoBySlug ?? {};

  const categoryClusters = (() => {
    const byCategory = new Map<string, { categoryName: string; slug: string; articles: Article[] }>();
    rankedStories.forEach((article) => {
      const slug = article.category?.slug;
      const categoryName = getCategoryName(article, language);
      if (!slug) return;
      const entry = byCategory.get(slug) ?? { categoryName, slug, articles: [] };
      if (!entry.articles.some((item) => item.id === article.id)) entry.articles.push(article);
      byCategory.set(slug, entry);
    });

    return Array.from(byCategory.values())
      .map((entry) => {
        const curatedPromoId = sectionPromoBySlug[entry.slug];
        const curatedPromo = curatedPromoId ? entry.articles.find((article) => article.id === curatedPromoId) : undefined;
        const lead = curatedPromo ?? entry.articles[0];
        const supporting = entry.articles.filter((article) => article.id !== lead?.id).slice(0, 3);
        return { ...entry, lead, supporting };
      })
      .filter((entry) => entry.lead && entry.supporting.length > 0)
      .slice(0, 3);
  })();

  const reels: FbShort[] = customReels
    .filter((item, index, source) => source.findIndex((entry) => entry.id === item.id) === index)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[var(--news-page)]">
      {breakingTicker.length > 0 ? (
        <div className="border-y border-[var(--news-grid)] bg-[var(--news-ticker-bg)]">
          <div className="mx-auto max-w-[1440px] px-4">
            <div className="flex items-center gap-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--news-ticker-live)]">
                <span className="h-2 w-2 rounded-full bg-[var(--news-red-500)]" />
                {language === 'bn' ? 'লাইভ' : 'Live'}
              </span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <BreakingTicker items={breakingTicker} loading={breakingQuery.isLoading} error={breakingQuery.isError} />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1440px] px-4 py-5 md:py-8">
        {latestQuery.isError || trendingQuery.isError ? (
          <div className="mb-6 border border-[var(--news-grid)] bg-white px-5 py-4 text-sm leading-6 text-[var(--news-muted)]">
            {handleApiError(latestQuery.error || trendingQuery.error)}
          </div>
        ) : null}
        <section className="border-b border-[var(--news-grid)] pb-8 md:pb-10">
          {carouselStories.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_410px]">
              <HomepageLeadCarousel articles={carouselStories} language={language} />
              <aside className="border-l-0 lg:border-l lg:border-[var(--news-grid)] lg:pl-6">
                <div className="mb-7 bg-[var(--news-white)] p-2">
                  <AdSlot slot="home_top_leaderboard" page="home" />
                </div>
                <div>
                  <div className="mb-5 border-b border-[var(--news-ink)] pb-2">
                    <h2 className="text-lg font-bold text-[var(--news-mahogany)]">
                      {language === 'bn' ? 'টপ পিক' : 'Top stories'}
                    </h2>
                  </div>
                  {heroStack.map((article) => (
                    <SideStory key={article.id} article={article} language={language} compact />
                  ))}
                </div>

                {editorsPick ? (
                  <div className="mt-6 border border-[var(--news-grid-strong)] bg-[var(--news-paper)] p-4 md:p-5">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-[var(--news-red-700)] text-[var(--news-red-700)]" />
                      <p className="news-meta text-[var(--news-red-700)]">
                        {language === 'bn' ? 'সম্পাদকের পছন্দ' : "Editor's Pick"}
                      </p>
                    </div>
                    <TransitionLink href={getArticleHref(editorsPick)} className="group mt-3 block">
                      <h3 className="[font-family:var(--font-serif)] text-2xl font-bold leading-tight text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                        {getStoryTitle(editorsPick, language)}
                      </h3>
                      {getStoryExcerpt(editorsPick, language) ? (
                        <div className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--news-muted)] [&>p]:m-0" dangerouslySetInnerHTML={{ __html: getStoryExcerpt(editorsPick, language) || '' }} />
                      ) : null}
                    </TransitionLink>
                  </div>
                ) : null}
              </aside>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_410px]">
              <div className="min-h-[620px] animate-pulse bg-[var(--news-white)]" />
              <div className="h-full min-h-[420px] animate-pulse bg-[var(--news-gray-100)]" />
            </div>
          )}
        </section>

        <TrendingCarousel
          articles={(trendingList.length ? trendingList : [...carouselStories, ...heroStack, editorsPick, ...quickBriefs, ...featureStrip]).filter(
            (article): article is Article => Boolean(article),
          )}
          language={language}
        />

        <section className="news-perf-section grid gap-8 border-b border-[var(--news-grid)] py-8 md:py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div>
            <div className="mb-5 border-b border-[var(--news-grid)] pb-2">
              <h2 className="news-section-title">{language === 'bn' ? 'নিউজ ব্রিফিং' : 'News briefing'}</h2>
            </div>
            <div className="grid gap-0 md:grid-cols-2 md:gap-x-6">
              {quickBriefs.map((article) => (
                <BriefCard key={article.id} article={article} language={language} />
              ))}
            </div>

            {featureStrip.length > 0 ? (
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {featureStrip.map((article) => (
                  <TransitionLink
                    key={article.id}
                    href={getArticleHref(article)}
                    className="group block border border-[var(--news-grid)] border-t-4 border-t-[var(--news-red-700)] bg-[var(--news-paper)] px-4 pb-5 pt-4 shadow-[0_12px_35px_rgba(18,24,31,0.04)]"
                  >
                    <p className="news-meta text-[var(--news-red-700)]">{getCategoryName(article, language)}</p>
                    <h3 className="mt-2 [font-family:var(--font-serif)] text-xl font-bold leading-tight text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                      {getStoryTitle(article, language)}
                    </h3>
                    <p className="news-meta mt-4 text-[var(--news-soft)]">{formatDate(article.publishedAt, language)}</p>
                  </TransitionLink>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="border-l-0 lg:border-l lg:border-[var(--news-grid)] lg:pl-8">
            <div className="mb-4 flex items-center gap-2 border-b border-[var(--news-grid)] pb-2">
              <TrendingUp className="h-4 w-4 text-[var(--news-red-700)]" />
              <h2 className="news-section-title">{language === 'bn' ? 'সবচেয়ে পঠিত' : 'Most read'}</h2>
            </div>
            <div className="space-y-1">
              {mostRead.map((article, index) => (
                <TransitionLink
                  key={article.id}
                  href={getArticleHref(article)}
                  className="group grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-b border-[var(--news-grid)] py-4 last:border-b-0"
                >
                  <span className="[font-family:var(--font-serif)] text-4xl font-bold leading-none text-[var(--news-grid-strong)]">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <p className="news-meta text-[var(--news-red-700)]">{getCategoryName(article, language)}</p>
                    <h3 className="mt-2 text-base font-semibold leading-6 text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                      {getStoryTitle(article, language)}
                    </h3>
                  </div>
                </TransitionLink>
              ))}
            </div>

            <div className="mt-8 border border-[var(--news-grid)] bg-[var(--news-paper)] p-3">
              <AdSlot slot="home_sidebar_tall" page="home" />
            </div>
          </aside>
        </section>

        {categoryClusters.length > 0 ? (
          <section className="news-perf-section border-b border-[var(--news-grid)] py-8 md:py-10">
            <div className="mb-6 flex items-center justify-between border-b border-[var(--news-grid)] pb-2">
              <h2 className="news-section-title">{language === 'bn' ? 'বিভাগভিত্তিক কভারেজ' : 'Coverage by section'}</h2>
              <span className="news-meta text-[var(--news-soft)]">
                {language === 'bn' ? 'ফিচার্ড, ট্রেন্ডিং, ব্রেকিং সিগন্যাল থেকে সাজানো' : 'Built from featured, trending, and breaking signals'}
              </span>
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
              {categoryClusters.map((cluster) => (
                <section key={cluster.slug} className="border border-[var(--news-grid)] bg-[var(--news-paper)] p-4">
                  <div className="mb-4 flex items-center justify-between border-b border-[var(--news-grid)] pb-2">
                    <h3 className="news-section-title">{cluster.categoryName}</h3>
                    <TransitionLink href={`/category/${cluster.slug}`} className="news-meta text-[var(--news-red-700)]">
                      {language === 'bn' ? 'আরও' : 'More'}
                    </TransitionLink>
                  </div>
                  {cluster.lead ? <SideStory article={cluster.lead} language={language} /> : null}
                  <div className="mt-2">
                    {cluster.supporting.map((article) => (
                      <BriefCard key={article.id} article={article} language={language} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ) : null}

        <section className="news-perf-section py-8 md:py-10">
          <FbShortsRail
            items={reels}
            headline={language === 'bn' ? 'শর্টস' : 'Shorts'}
            strapline={
              language === 'bn'
                ? 'হরাইজন্টাল শর্টস শেলফ, ভেতরে উল্লম্ব ভিউয়ার।'
                : 'A Shorts-style shelf on the page, with a portrait viewer when opened.'
            }
          />
        </section>

        <section className="news-perf-section grid gap-8 border-t border-[var(--news-grid)] pt-8 md:pt-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-[var(--news-grid)] pb-2">
              <h2 className="news-section-title">{language === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest news'}</h2>
              <PlayCircle className="h-5 w-5 text-[var(--news-red-700)]" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {latestQuery.isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse border border-[var(--news-grid)] bg-[var(--news-paper)] p-4">
                      <div className="aspect-[16/10] bg-[var(--news-gray-200)]" />
                      <div className="mt-4 h-4 w-20 bg-[var(--news-gray-200)]" />
                      <div className="mt-3 h-6 w-full bg-[var(--news-gray-200)]" />
                      <div className="mt-2 h-6 w-4/5 bg-[var(--news-gray-200)]" />
                    </div>
                  ))
                : latestFeed.map((article) => (
                    <TransitionLink
                      key={article.id}
                      href={getArticleHref(article)}
                      className="group block border border-[var(--news-grid)] bg-[var(--news-paper)] transition-colors hover:border-[var(--news-grid-strong)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--news-gray-200)]">
                        <StoryImage article={article} alt={getStoryTitle(article, language)} sizes="(min-width: 1024px) 32vw, 100vw" />
                      </div>
                      <div className="p-4">
                        <p className="news-meta text-[var(--news-red-700)]">{getCategoryName(article, language)}</p>
                        <h3 className="mt-2 [font-family:var(--font-serif)] text-2xl font-bold leading-tight text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                          {getStoryTitle(article, language)}
                        </h3>
                        {getStoryExcerpt(article, language) ? (
                          <div className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--news-muted)] [&>p]:m-0" dangerouslySetInnerHTML={{ __html: getStoryExcerpt(article, language) || '' }} />
                        ) : null}
                        <p className="news-meta mt-4 text-[var(--news-soft)]">{formatDate(article.publishedAt, language)}</p>
                      </div>
                    </TransitionLink>
                  ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-[var(--news-grid)] bg-[var(--news-paper)] p-5">
              <p className="news-meta text-[var(--news-red-700)]">{language === 'bn' ? 'নিউজরুম ফোকাস' : 'Newsroom focus'}</p>
              <h3 className="mt-2 [font-family:var(--font-serif)] text-3xl font-bold leading-tight text-[var(--news-ink)]">
                {language === 'bn' ? 'সংযত রঙ, শক্ত গ্রিড, দ্রুত স্ক্যানযোগ্যতা' : 'Restrained color, stronger grid, faster scanning'}
              </h3>
              <p className="mt-4 text-sm leading-6 text-[var(--news-muted)]">
                {language === 'bn'
                  ? 'এই সংস্করণে মারুন, কালো, মহগনি ধাঁচের ছায়া, আর অফ-হোয়াইট পেপার টোন ব্যবহার করে জনসম্মুখের ল্যান্ডিং অভিজ্ঞতা পুনর্গঠন করা হয়েছে।'
                  : 'The public front page now leans on maroon, ink-black, warm grey, and off-white paper tones to feel more like a serious newsroom.'}
              </p>
            </div>

            <div className="border border-[var(--news-grid)] bg-[var(--news-paper)] p-3">
              <AdSlot slot="home_mid_leaderboard" page="home" />
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
