'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, TrendingUp } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { AdSlot, useAdsEnabled } from '@/components/ads/AdSlot';
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
import { cleanExcerpt, formatDate, getLocalizedText, resolveMediaUrl } from '@/lib/utils';

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
  const [hasError, setHasError] = useState(false);

  if (!article.featuredImage?.url || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--news-red-900),var(--news-black))] text-white/50 select-none">
        <span className="text-xs font-semibold tracking-wider uppercase">The Contemporary</span>
      </div>
    );
  }

  return (
    <Image
      src={resolveMediaUrl(article.featuredImage.url)}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      draggable={false}
      onError={() => setHasError(true)}
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
    <div className="py-2">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="shrink-0 text-base sm:text-lg font-bold leading-none text-[#8a0e16] dark:text-[#f87171]">
          {language === 'bn' ? 'টপ পিক' : 'Top pick'}
        </h2>
        <div className="h-px flex-1 bg-[var(--news-grid)]" />
      </div>

      <div className="space-y-6">
        {items.map((article, index) => {
          const title = getStoryTitle(article, language);
          const label = categoryName || getCategoryName(article, language);

          return (
            <TransitionLink key={article.id} href={getArticleHref(article)} className="group block">
              <div className="relative aspect-[16/9] overflow-hidden bg-[var(--news-gray-200)]">
                <StoryImage article={article} alt={title} sizes="(min-width: 1280px) 390px, (min-width: 1024px) 32vw, 100vw" />
              </div>
              <div className="mt-2.5">
                {index > 0 ? (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--news-red-600)]">
                    {label}
                  </p>
                ) : null}
                <h3
                  className={`font-bold leading-[1.3] text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)] break-words ${
                    language === 'bn'
                      ? 'text-base sm:text-[1.05rem]'
                      : '[font-family:var(--font-serif)] text-base sm:text-[1.05rem]'
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
          className="news-meta mt-4 inline-flex text-xs font-semibold text-[var(--news-red-700)] transition-colors hover:underline"
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const swiperRef = useRef<any>(null);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full min-w-0 max-w-full bg-[var(--news-white)] py-4 sm:py-5 md:py-6 homepage-lead-swiper">
      {/* Pagination dot styles only — arrows are custom buttons below */}
      <style>{`
        .homepage-lead-swiper .swiper-pagination {
          position: static;
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .homepage-lead-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: transparent;
          border: 2px solid #8a0e16;
          opacity: 1;
          border-radius: 50%;
          transition: background 0.25s;
          margin: 0 !important;
        }
        .homepage-lead-swiper .swiper-pagination-bullet-active {
          background: #8a0e16;
        }
      `}</style>

      {/* Outer wrapper: side padding = gutter space for arrows */}
      <div className="relative mx-auto w-full max-w-[1000px] px-3 sm:px-10 md:px-12">

        {/* LEFT arrow — sits in left gutter, outside image */}
        {slides.length > 1 ? (
          <button
            type="button"
            aria-label={language === 'bn' ? 'আগের স্লাইড' : 'Previous slide'}
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-10 h-10 z-10 cursor-pointer select-none text-[#8a0e16] hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="h-20 w-20" strokeWidth={2} />
          </button>
        ) : null}

        {/* Swiper — no built-in navigation, pagination only */}
        <Swiper
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 7500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          loop={slides.length > 1}
          grabCursor
          className="w-full text-center"
        >
          {slides.map((article, idx) => {
            const title = getStoryTitle(article, language);
            const excerpt = getStoryExcerpt(article, language);
            return (
              <SwiperSlide key={article.id}>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#8a0e16] dark:text-[#f87171] mb-1">
                  {getCategoryName(article, language)}
                </p>
                <TransitionLink
                  href={getArticleHref(article)}
                  draggable={false}
                  className="group block w-full min-w-0 max-w-[780px] mx-auto"
                >
                  <h1 className="w-full min-w-0 [font-family:var(--font-serif)] text-xl sm:text-2xl md:text-[2rem] lg:text-[2.25rem] font-bold leading-[1.26] sm:leading-[1.28] tracking-tight text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)] break-words">
                    {title}
                  </h1>
                </TransitionLink>

                <TransitionLink
                  href={getArticleHref(article)}
                  draggable={false}
                  className="group relative mt-3.5 sm:mt-4 block aspect-[16/9] w-full overflow-hidden bg-[var(--news-gray-200)]"
                >
                  <StoryImage
                    article={article}
                    alt={title}
                    priority={idx === 0}
                    sizes="(min-width: 1280px) 820px, (min-width: 1024px) 64vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80" />
                </TransitionLink>

                {excerpt ? (
                  <div
                    className="mx-auto mt-3.5 max-w-[740px] text-sm sm:text-base leading-relaxed text-[var(--news-muted)] md:text-[1.05rem] [&>p]:m-0"
                    dangerouslySetInnerHTML={{ __html: excerpt }}
                  />
                ) : null}
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* RIGHT arrow — sits in right gutter, outside image */}
        {slides.length > 1 ? (
          <button
            type="button"
            aria-label={language === 'bn' ? 'পরের স্লাইড' : 'Next slide'}
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-10 h-10 z-10 cursor-pointer select-none text-[#8a0e16] hover:opacity-70 transition-opacity"
          >
            <ChevronRight className="h-20 w-20" strokeWidth={2} />
          </button>
        ) : null}

      </div>
    </div>
  );
}

function TrendingCarousel({ articles, language }: { articles: Article[]; language: 'en' | 'bn' }) {
  const items = useMemo(() => {
    return articles
      .filter((article, index, source) => source.findIndex((entry) => entry.id === article.id) === index)
      .slice(0, 4);
  }, [articles]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const hasSwipedRef = useRef(false);
  const pointerStartXRef = useRef(0);
  const pointerStartYRef = useRef(0);
  const isPointerDownRef = useRef(false);

  useEffect(() => {
    const updateCards = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth >= 1024) setCardsPerView(3);
      else if (window.innerWidth >= 640) setCardsPerView(2);
      else setCardsPerView(1);
    };
    updateCards();
    window.addEventListener('resize', updateCards);
    return () => window.removeEventListener('resize', updateCards);
  }, []);

  useEffect(() => {
    if (items.length <= 1 || isPaused || isDragging) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length, isPaused, isDragging]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || items.length <= 1) return;
    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    hasSwipedRef.current = false;
    pointerStartXRef.current = e.clientX;
    pointerStartYRef.current = e.clientY;
    setIsPaused(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || items.length <= 1) return;
    const diffX = e.clientX - pointerStartXRef.current;
    const diffY = e.clientY - pointerStartYRef.current;

    if (!isDraggingRef.current) {
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 8) {
        isPointerDownRef.current = false;
        return;
      }
      if (Math.abs(diffX) > 6) {
        isDraggingRef.current = true;
        hasSwipedRef.current = true;
        setIsDragging(true);
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {}
      }
    }

    if (isDraggingRef.current) {
      setDragOffset(diffX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch {}

    if (isDraggingRef.current) {
      const diffX = e.clientX - pointerStartXRef.current;
      if (diffX < -35) {
        nextSlide();
      } else if (diffX > 35) {
        prevSlide();
      }
    }

    setDragOffset(0);
    setIsDragging(false);
    isDraggingRef.current = false;
    setIsPaused(false);
    setTimeout(() => {
      hasSwipedRef.current = false;
    }, 120);
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    handlePointerUp(e);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasSwipedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="news-perf-section border-b border-[var(--news-grid)] py-6 md:py-10 overflow-hidden max-w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="news-section-title">
          {language === 'bn' ? 'এখন সবচেয়ে আলোচিত খবর' : 'Stories gaining momentum now'}
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous story"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center border border-[var(--news-grid-strong)] bg-[var(--news-paper)] text-[var(--news-ink)] transition-colors hover:border-[var(--news-red-700)] hover:bg-[var(--news-red-700)] hover:text-white active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next story"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center border border-[var(--news-grid-strong)] bg-[var(--news-paper)] text-[var(--news-ink)] transition-colors hover:border-[var(--news-red-700)] hover:bg-[var(--news-red-700)] hover:text-white active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        className="relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem] border border-[var(--news-grid)] bg-[var(--news-paper)] p-2.5 sm:p-4 md:p-5 shadow-[0_12px_40px_rgba(18,24,31,0.05)] max-w-full select-none cursor-grab active:cursor-grabbing touch-pan-y"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          if (!isDraggingRef.current) setIsPaused(false);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="overflow-hidden w-full">
          <div
            className="flex w-full"
            style={{
              gap: '16px',
              transform:
                cardsPerView === 1
                  ? `translateX(calc(-${currentIndex % items.length} * (100% + 16px) + ${dragOffset}px))`
                  : cardsPerView === 2
                  ? `translateX(calc(-${currentIndex % items.length} * ((100% - 16px) / 2 + 16px) + ${dragOffset}px))`
                  : `translateX(calc(-${currentIndex % items.length} * ((100% - 32px) / 3 + 16px) + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 500ms ease-out',
            }}
          >
            {[...items, ...items].map((article, idx) => {
              const title = getStoryTitle(article, language);
              return (
                <div
                  key={`${article.id}-${idx}`}
                  style={{
                    flex:
                      cardsPerView === 1
                        ? '0 0 100%'
                        : cardsPerView === 2
                        ? '0 0 calc((100% - 16px) / 2)'
                        : '0 0 calc((100% - 32px) / 3)',
                    maxWidth:
                      cardsPerView === 1
                        ? '100%'
                        : cardsPerView === 2
                        ? 'calc((100% - 16px) / 2)'
                        : 'calc((100% - 32px) / 3)',
                    minWidth: 0,
                  }}
                >
                  <TransitionLink
                    href={getArticleHref(article)}
                    draggable={false}
                    className="group block h-full overflow-hidden border border-[var(--news-grid)] bg-[var(--news-page)] transition-all hover:shadow-md"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--news-gray-200)] w-full">
                      <StoryImage article={article} alt={title} sizes="(min-width: 1024px) 32vw, 100vw" />
                      <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
                        <span className="news-kicker bg-white/92 dark:bg-black/80 text-[var(--news-ink)] text-[10px] sm:text-xs">
                          {getCategoryName(article, language)}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="line-clamp-2 [font-family:var(--font-serif)] text-lg sm:text-xl md:text-2xl font-bold leading-snug text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                        {title}
                      </h3>
                      {getStoryExcerpt(article, language) ? (
                        <div
                          className="mt-2 line-clamp-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[var(--news-muted)] [&>p]:m-0"
                          dangerouslySetInnerHTML={{ __html: getStoryExcerpt(article, language) || '' }}
                        />
                      ) : null}
                      <p className="news-meta mt-3 text-[var(--news-soft)] text-[11px] sm:text-xs">{formatDate(article.publishedAt, language)}</p>
                    </div>
                  </TransitionLink>
                </div>
              );
            })}
          </div>
        </div>
        {/* Dot indicators for the 4 items */}
        <div className="mt-3.5 flex items-center justify-center gap-1.5 sm:gap-2">
          {items.map((_, dotIdx) => {
            const isActive = (currentIndex % items.length) === dotIdx;
            return (
              <button
                key={dotIdx}
                type="button"
                aria-label={`Slide to story ${dotIdx + 1}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(dotIdx);
                }}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? 'w-5 sm:w-6 bg-[var(--news-red-700)]' : 'w-1.5 sm:w-2 bg-[var(--news-grid-strong)] hover:bg-[var(--news-muted)]'
                }`}
              />
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

function LatestNewsSection({
  articles,
  language,
  isLoading = false,
}: {
  articles: Article[];
  language: 'en' | 'bn';
  isLoading?: boolean;
}) {
  if (isLoading && articles.length === 0) {
    return (
      <section className="news-perf-section border-b border-[var(--news-grid)] py-8 md:py-10">
        <SectionHeading
          title={language === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}
          href="/latest"
          language={language}
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,1fr)]">
          <div className="h-[380px] animate-pulse rounded border border-[var(--news-grid)] bg-[var(--news-paper)]" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[180px] animate-pulse rounded border border-[var(--news-grid)] bg-[var(--news-paper)]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) return null;

  const [leadStory, ...otherStories] = articles;
  const gridStories = otherStories.slice(0, 4);
  const bottomStories = otherStories.slice(4, 8);

  const leadTitle = getStoryTitle(leadStory, language);
  const leadExcerpt = cleanExcerpt(getStoryExcerpt(leadStory, language));

  return (
    <section className="news-perf-section border-b border-[var(--news-grid)] py-8 md:py-10">
      <SectionHeading
        title={language === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}
        href="/latest"
        language={language}
      />

      {/* Main Grid: Lead Story (left) + 4 Supporting Stories (right) */}
      <div className={gridStories.length > 0 ? 'grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,1fr)]' : 'w-full'}>
        {/* Lead Fresh Story */}
        <TransitionLink
          href={getArticleHref(leadStory)}
          className="group flex flex-col justify-between border border-[var(--news-grid)] bg-[var(--news-paper)] p-4 sm:p-5 transition-all duration-200 hover:border-[var(--news-red-700)]/40 hover:shadow-md"
        >
          <div>
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--news-gray-200)] rounded-sm">
              <StoryImage
                article={leadStory}
                alt={leadTitle}
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute left-3 top-3 flex items-center gap-1.5">
                <span className="news-kicker bg-white/95 dark:bg-black/85 text-[var(--news-ink)] text-xs font-bold px-2.5 py-1 shadow-sm">
                  {getCategoryName(leadStory, language)}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[var(--news-red-700)] text-white text-[11px] font-bold px-2 py-1 rounded-sm shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {language === 'bn' ? 'সদ্য প্রাপ্ত' : 'Just In'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="[font-family:var(--font-serif)] text-xl sm:text-2xl lg:text-[1.7rem] font-bold leading-snug text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                {leadTitle}
              </h3>
              {leadExcerpt ? (
                <p className="mt-2.5 line-clamp-3 text-sm sm:text-base leading-relaxed text-[var(--news-muted)]">
                  {leadExcerpt}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--news-grid)] pt-3 text-xs text-[var(--news-soft)]">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[var(--news-red-700)]" />
              <span>{formatDate(leadStory.publishedAt, language)}</span>
            </div>
            {leadStory.author?.name ? (
              <span className="truncate max-w-[150px] font-medium text-[var(--news-muted)]">
                {leadStory.author.name}
              </span>
            ) : null}
          </div>
        </TransitionLink>

        {/* 4 Supporting Latest Stories in 2x2 Grid */}
        {gridStories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {gridStories.map((article) => {
              const title = getStoryTitle(article, language);
              return (
                <TransitionLink
                  key={article.id}
                  href={getArticleHref(article)}
                  className="group flex flex-col justify-between border border-[var(--news-grid)] bg-[var(--news-paper)] p-3 sm:p-3.5 transition-all duration-200 hover:border-[var(--news-red-700)]/40 hover:shadow-sm"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--news-gray-200)] rounded-sm">
                      <StoryImage
                        article={article}
                        alt={title}
                        sizes="(min-width: 1024px) 25vw, 50vw"
                      />
                      <div className="absolute left-2 top-2">
                        <span className="news-kicker bg-white/90 dark:bg-black/80 text-[var(--news-ink)] text-[10px] px-2 py-0.5 shadow-sm">
                          {getCategoryName(article, language)}
                        </span>
                      </div>
                    </div>
                    <h4 className="mt-2.5 line-clamp-2 text-sm sm:text-[0.95rem] font-bold leading-snug text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                      {title}
                    </h4>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--news-grid)] pt-2 text-[11px] text-[var(--news-soft)]">
                    <Clock className="h-3 w-3 text-[var(--news-red-700)]" />
                    <span>{formatDate(article.publishedAt, language)}</span>
                  </div>
                </TransitionLink>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Bottom Row: 4 Additional Latest Articles (if available) */}
      {bottomStories.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bottomStories.map((article) => {
            const title = getStoryTitle(article, language);
            return (
              <TransitionLink
                key={article.id}
                href={getArticleHref(article)}
                className="group flex gap-3 border border-[var(--news-grid)] bg-[var(--news-paper)] p-3 transition-all duration-200 hover:border-[var(--news-red-700)]/40 hover:shadow-sm"
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden bg-[var(--news-gray-200)] rounded-sm">
                  <StoryImage
                    article={article}
                    alt={title}
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <h4 className="line-clamp-2 text-xs sm:text-sm font-bold leading-snug text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                    {title}
                  </h4>
                  <span className="mt-1 text-[11px] text-[var(--news-soft)]">
                    {formatDate(article.publishedAt, language)}
                  </span>
                </div>
              </TransitionLink>
            );
          })}
        </div>
      ) : null}

      {/* "View All" Footer Link */}
      <div className="mt-5 flex justify-end">
        <TransitionLink
          href="/latest"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--news-red-700)] transition-all hover:text-[var(--news-red-hover)] hover:translate-x-1"
        >
          <span>{language === 'bn' ? 'সকল সর্বশেষ সংবাদ পড়ুন' : 'View all latest news'}</span>
          <ArrowRight className="h-4 w-4" />
        </TransitionLink>
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
  const menuCategoriesQuery = useMenuCategories();
  const layoutSettingsQuery = useLayoutSettings();
  const adsEnabled = useAdsEnabled();

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
    <div className="w-full bg-[var(--news-page)]">
      {breakingTicker.length > 0 ? (
        <div className="border-b border-[var(--news-grid)] bg-[var(--news-ticker-bg)] w-full">
          <div className="w-full px-3 sm:px-4 md:px-6">
            <div className="flex items-center gap-3 py-2 w-full">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--news-ticker-live)] shrink-0">
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

      <div className="mx-auto max-w-[1440px] px-3 sm:px-4 py-4 sm:py-6 md:py-8 w-full min-w-0 overflow-hidden">
        {latestQuery.isError || trendingQuery.isError ? (
          <div className="mb-6 border border-[var(--news-grid)] bg-white px-5 py-4 text-sm leading-6 text-[var(--news-muted)]">
            {handleApiError(latestQuery.error || trendingQuery.error)}
          </div>
        ) : null}
        <section className="border-b border-[var(--news-grid)] pb-8 md:pb-10 w-full min-w-0 overflow-hidden">
          {carouselStories.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_410px] w-full min-w-0">
              <div className="min-w-0 w-full overflow-hidden">
                <HomepageLeadCarousel articles={carouselStories} language={language} />
              </div>
              <aside className="border-l-0 lg:border-l lg:border-[var(--news-grid)] lg:pl-6 min-w-0 w-full">
                <AdSlot
                  slot="home_top_leaderboard"
                  page="home"
                  containerClassName="mb-7 bg-[var(--news-white)] p-2"
                />
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

        <LatestNewsSection
          articles={latestList}
          language={language}
          isLoading={latestQuery.isLoading}
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

              <AdSlot
                slot="home_sidebar_tall"
                page="home"
                containerClassName="mt-8 border border-[var(--news-grid)] bg-[var(--news-paper)] p-3"
              />
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
