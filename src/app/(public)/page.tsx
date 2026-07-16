'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import type { FbShort } from '@/components/news/FbShortsRail';
import { TransitionLink } from '@/components/navigation/TransitionLink';
import { useLanguage } from '@/contexts/language-context';
import {
  useBreakingTicker,
  useFeaturedArticles,
  useLatestArticles,
  useLayoutSettings,
  useMenuCategories,
  useTrendingArticles,
} from '@/hooks/api-hooks';
import { findCuratedArticle, findCuratedArticles, readLayoutCuration } from '@/lib/layout-curation-store';
import { fetchReels, readReels } from '@/lib/reels-store';
import { handleApiError } from '@/lib/query-config';
import type { Article, LayoutCuration } from '@/lib/types';
import { formatDate, getLocalizedText, resolveMediaUrl } from '@/lib/utils';

const FbShortsRail = dynamic(() => import('@/components/news/FbShortsRail').then((mod) => mod.FbShortsRail), {
  ssr: false,
});

type StoryCardProps = {
  article: Article;
  language: 'en' | 'bn';
  compact?: boolean;
};

type CategoryShowcaseGroup = {
  slug: string;
  name: string;
  articles: Article[];
};

const getArticleHref = (article: Article) => `/article/${article.slug || article.id}`;

const getStoryTitle = (article: Article, language: 'en' | 'bn') => getLocalizedText(article.title, language);
const getStoryExcerpt = (article: Article, language: 'en' | 'bn') => getLocalizedText(article.excerpt, language);
const getCategoryName = (article: Article, language: 'en' | 'bn') =>
  article.category?.name ? getLocalizedText(article.category.name, language) : language === 'bn' ? 'সংবাদ' : 'News';
const legacyOnThisDayDefaults = new Set([
  'On this day',
  'এই দিনে',
  'A brief note from the archive',
  'আর্কাইভ থেকে সংক্ষিপ্ত নোট',
  'Use this space for a short historical note, anniversary, or newsroom memory.',
  'ইতিহাস, বার্ষিকী বা নিউজরুম স্মৃতি নিয়ে ছোট নোটের জন্য এই জায়গাটি ব্যবহার করুন।',
]);
const cleanOnThisDayText = (value: string) => {
  const trimmed = value.trim();
  return legacyOnThisDayDefaults.has(trimmed) ? '' : trimmed;
};

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

function TopPickRail({
  articles,
  categoryName,
  categorySlug,
  language,
}: {
  articles: Article[];
  categoryName?: string;
  categorySlug?: string;
  language: 'en' | 'bn';
}) {
  const items = articles.slice(0, 2);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-t border-[var(--news-ink)] py-5">
      <div className="mb-5 flex items-center gap-3">
        <h2 className="shrink-0 text-xl font-extrabold leading-none text-[var(--news-mahogany)]">
          {language === 'bn' ? 'টপ পিক' : 'Top pick'}
        </h2>
        <div className="h-px flex-1 bg-[var(--news-ink)]" />
      </div>

      <div className="space-y-7">
        {items.map((article, index) => {
          const title = getStoryTitle(article, language);
          const label = categoryName || getCategoryName(article, language);

          return (
            <TransitionLink key={article.id} href={getArticleHref(article)} className="group block">
              <div className="relative aspect-[16/9] overflow-hidden bg-[var(--news-gray-200)]">
                <StoryImage article={article} alt={title} sizes="(min-width: 1280px) 390px, (min-width: 1024px) 32vw, 100vw" />
              </div>
              <div className={index === 0 ? 'mt-4' : 'mt-3'}>
                {index > 0 ? (
                  <p className="mb-2 text-lg font-semibold leading-none text-[var(--news-red-600)]">
                    {label}
                    <span className="mx-1.5 inline-block h-2 w-2 rounded-full bg-[var(--news-red-600)] align-middle" />
                  </p>
                ) : null}
                <h3
                  className={`font-extrabold leading-[1.45] text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)] ${
                    language === 'bn'
                      ? index === 0
                        ? 'text-[1.85rem]'
                        : 'text-[1.68rem]'
                      : index === 0
                        ? '[font-family:var(--font-serif)] text-[1.65rem] leading-tight'
                        : '[font-family:var(--font-serif)] text-[1.45rem] leading-tight'
                  }`}
                >
                  {title}
                </h3>
              </div>
            </TransitionLink>
          );
        })}
      </div>

      {categorySlug ? (
        <TransitionLink
          href={`/category/${categorySlug}`}
          className="news-meta mt-6 inline-flex text-[var(--news-red-700)] transition-colors hover:text-[var(--news-red-hover)]"
        >
          {language === 'bn' ? 'আরও দেখুন' : `More ${categoryName || 'stories'}`}
        </TransitionLink>
      ) : null}
    </div>
  );
}

function OnThisDayBox({
  onThisDay,
  language,
  className = '',
}: {
  onThisDay?: LayoutCuration['onThisDay'];
  language: 'en' | 'bn';
  className?: string;
}) {
  const [todayLabel, setTodayLabel] = useState('');

  useEffect(() => {
    const updateTodayLabel = () => {
      setTodayLabel(
        new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
          day: 'numeric',
          month: 'long',
          timeZone: 'Asia/Dhaka',
        }).format(new Date()),
      );
    };

    updateTodayLabel();
    const timer = window.setInterval(updateTodayLabel, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [language]);

  if (onThisDay?.enabled === false) return null;

  const note = cleanOnThisDayText(getLocalizedText(onThisDay?.description, language));

  if (!note) return null;

  return (
    <div className={`${className} border border-[var(--news-grid-strong)] bg-[var(--news-paper)] px-4 py-3`}>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[var(--news-red-700)]" />
        <p className="news-meta text-[var(--news-red-700)]">{language === 'bn' ? 'এই দিনে' : 'On this day'}</p>
      </div>
      {todayLabel ? (
        <p className="mt-2 text-sm font-extrabold leading-5 text-[var(--news-mahogany)]">
          {todayLabel}
        </p>
      ) : null}
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--news-ink)]">
        {note}
      </p>
    </div>
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

  if (slides.length === 0) return null;

  const safeActiveIndex = activeIndex >= slides.length ? 0 : activeIndex;
  const activeArticle = slides[safeActiveIndex];
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
                  dotIndex === safeActiveIndex ? 'bg-[var(--news-mahogany)]' : 'bg-transparent'
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
                    <span className="news-kicker bg-white/92 dark:bg-black/80 text-[var(--news-ink)]">
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

function SectionHeading({
  title,
  href,
  language,
}: {
  title: string;
  href?: string;
  language: 'en' | 'bn';
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="shrink-0 text-base font-extrabold leading-none text-[var(--news-mahogany)] md:text-lg">
        {title}
      </h2>
      <div className="h-px flex-1 bg-[var(--news-grid-strong)]" />
      {href ? (
        <TransitionLink href={href} className="news-meta text-[var(--news-red-700)] transition-colors hover:text-[var(--news-red-hover)]">
          {language === 'bn' ? 'আরও' : 'More'}
        </TransitionLink>
      ) : null}
    </div>
  );
}

function CompactNewsCard({ article, language }: StoryCardProps) {
  const title = getStoryTitle(article, language);

  return (
    <TransitionLink href={getArticleHref(article)} className="group grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b border-[var(--news-grid)] pb-4 last:border-b-0 md:block md:pb-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--news-gray-200)]">
        <StoryImage article={article} alt={title} sizes="(min-width: 1024px) 210px, 120px" />
      </div>
      <div className="md:mt-2">
        <h3 className="text-sm font-extrabold leading-5 text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)] md:text-base md:leading-6">
          {title}
        </h3>
        <p className="news-meta mt-2 text-[var(--news-soft)]">{formatDate(article.publishedAt, language)}</p>
      </div>
    </TransitionLink>
  );
}

function FeatureCategoryBlock({
  group,
  language,
}: {
  group: CategoryShowcaseGroup;
  language: 'en' | 'bn';
}) {
  const [lead, ...supporting] = group.articles;
  if (!lead) return null;

  const title = getStoryTitle(lead, language);
  const excerpt = getStoryExcerpt(lead, language);

  return (
    <section className="border-t border-[var(--news-grid)] pt-5">
      <SectionHeading title={group.name} href={`/category/${group.slug}`} language={language} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <TransitionLink href={getArticleHref(lead)} className="group block">
          <div className="relative aspect-[16/9] overflow-hidden bg-[var(--news-gray-200)]">
            <StoryImage article={lead} alt={title} sizes="(min-width: 1024px) 52vw, 100vw" />
          </div>
          <h3 className="mt-3 [font-family:var(--font-serif)] text-2xl font-extrabold leading-tight text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)] md:text-3xl">
            {title}
          </h3>
          {excerpt ? (
            <div className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--news-muted)] [&>p]:m-0" dangerouslySetInnerHTML={{ __html: excerpt }} />
          ) : null}
        </TransitionLink>

        <div className="grid gap-4 md:grid-cols-2">
          {supporting.slice(0, 4).map((article) => (
            <CompactNewsCard key={article.id} article={article} language={language} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StripCategoryBlock({
  group,
  language,
}: {
  group: CategoryShowcaseGroup;
  language: 'en' | 'bn';
}) {
  const articles = group.articles.slice(0, 4);
  if (articles.length === 0) return null;

  return (
    <section className="border border-[var(--news-mahogany)] bg-[var(--news-paper)] px-4 py-4">
      <SectionHeading title={group.name} href={`/category/${group.slug}`} language={language} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => {
          const title = getStoryTitle(article, language);
          return (
            <TransitionLink key={article.id} href={getArticleHref(article)} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--news-gray-200)]">
                <StoryImage article={article} alt={title} sizes="(min-width: 1024px) 250px, 50vw" />
              </div>
              <h3 className="mt-2 text-sm font-extrabold leading-5 text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)] md:text-base md:leading-6">
                {title}
              </h3>
            </TransitionLink>
          );
        })}
      </div>
    </section>
  );
}

function CategoryNewsShowcase({
  groups,
  language,
}: {
  groups: CategoryShowcaseGroup[];
  language: 'en' | 'bn';
}) {
  if (groups.length === 0) return null;

  return (
    <section className="news-perf-section space-y-8 border-t border-[var(--news-grid)] py-8 md:py-10">
      {groups[0] ? <FeatureCategoryBlock group={groups[0]} language={language} /> : null}
      {groups[1] ? <StripCategoryBlock group={groups[1]} language={language} /> : null}
      {groups[2] ? <FeatureCategoryBlock group={groups[2]} language={language} /> : null}
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
  const menuCategoriesQuery = useMenuCategories();
  const layoutSettingsQuery = useLayoutSettings();

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
  const menuCategories = useMemo(() => menuCategoriesQuery.data ?? [], [menuCategoriesQuery.data]);
  const localCuration = readLayoutCuration();
  const curation = layoutSettingsQuery.data ?? localCuration;
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

  const topPickCandidates = (() => {
    const configuredSlug = curation.homepageTopPickCategorySlug;
    const preferredSlugs = [
      configuredSlug,
      ...menuCategories.map((category) => category.slug),
      ...rankedStories.map((article) => article.category?.slug),
    ].filter((slug): slug is string => Boolean(slug));

    for (const slug of preferredSlugs) {
      const articles = rankedStories.filter((article) => article.category?.slug === slug && !usedIds.has(article.id)).slice(0, 2);
      if (articles.length >= 2) {
        return {
          slug,
          categoryName:
            getLocalizedText(menuCategories.find((category) => category.slug === slug)?.name, language) ||
            getCategoryName(articles[0], language),
          articles,
        };
      }
    }

    const fallbackArticles = rankedStories.filter((article) => !usedIds.has(article.id)).slice(0, 2);
    return {
      slug: fallbackArticles[0]?.category?.slug,
      categoryName: fallbackArticles[0] ? getCategoryName(fallbackArticles[0], language) : undefined,
      articles: fallbackArticles,
    };
  })();

  const heroStack = topPickCandidates.articles;
  heroStack.forEach((article) => usedIds.add(article.id));

  const editorsPick = rankedStories.find((article) => !usedIds.has(article.id)) ?? trendingList[0];
  if (editorsPick) usedIds.add(editorsPick.id);

  const quickBriefs = rankedStories.filter((article) => !usedIds.has(article.id)).slice(0, 4);
  quickBriefs.forEach((article) => usedIds.add(article.id));

  const featureStrip = rankedStories.filter((article) => !usedIds.has(article.id)).slice(0, 3);
  featureStrip.forEach((article) => usedIds.add(article.id));

  const mostRead = [...curatedMostRead, ...trendingList.filter((article) => !curatedMostRead.some((entry) => entry.id === article.id))].slice(0, 6);

  const reels: FbShort[] = customReels
    .filter((item, index, source) => source.findIndex((entry) => entry.id === item.id) === index)
    .slice(0, 10);

  const categoryShowcaseGroups = useMemo(() => {
    const groupsBySlug = new Map<string, CategoryShowcaseGroup>();

    rankedStories.forEach((article) => {
      const slug = article.category?.slug;
      if (!slug) return;

      const existing = groupsBySlug.get(slug);
      const name =
        getLocalizedText(menuCategories.find((category) => category.slug === slug)?.name, language) ||
        getCategoryName(article, language);
      const group = existing ?? { slug, name, articles: [] };

      if (!group.articles.some((entry) => entry.id === article.id)) {
        group.articles.push(article);
      }
      groupsBySlug.set(slug, group);
    });

    const preferredOrder = [
      ...menuCategories.map((category) => category.slug),
      ...rankedStories.map((article) => article.category?.slug).filter((slug): slug is string => Boolean(slug)),
    ];
    const ordered = preferredOrder
      .map((slug) => groupsBySlug.get(slug))
      .filter((group, index, source): group is CategoryShowcaseGroup => {
        if (!group) return false;
        return source.findIndex((entry) => entry?.slug === group.slug) === index;
      });

    const enoughItems = ordered.filter((group) => group.articles.length >= 3);
    const fallbackItems = ordered.filter((group) => group.articles.length > 0 && !enoughItems.some((entry) => entry.slug === group.slug));

    return [...enoughItems, ...fallbackItems].slice(0, 3);
  }, [language, menuCategories, rankedStories]);

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
                <TopPickRail
                  articles={heroStack}
                  categoryName={topPickCandidates.categoryName}
                  categorySlug={topPickCandidates.slug}
                  language={language}
                />

                <OnThisDayBox onThisDay={curation.onThisDay} language={language} className="mt-6" />
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

        <section className="news-perf-section py-8 md:py-10">
          <FbShortsRail
            items={reels}
            headline={language === 'bn' ? 'ট্রিম ওয়াচ' : 'YouTube articles'}
            strapline={
              language === 'bn'
                ? 'প্রধান ভিডিও প্রতিবেদন, সঙ্গে দ্রুত পড়ার মতো আরও ভিডিও খবর।'
                : 'Lead video reporting with supporting video stories in the same newsroom grid.'
            }
          />
        </section>

        <CategoryNewsShowcase groups={categoryShowcaseGroups} language={language} />
      </div>
    </div>
  );
}
