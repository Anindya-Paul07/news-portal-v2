'use client';

import { useEffect, useState } from 'react';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import { AdSlot } from '@/components/ads/AdSlot';
import { useLanguage } from '@/contexts/language-context';
import { Article } from '@/lib/types';
import { useBreakingTicker, useLatestArticles, useTrendingArticles } from '@/hooks/api-hooks';
import { getLocalizedText, resolveMediaUrl, formatDate } from '@/lib/utils';
import { TransitionLink } from '@/components/navigation/TransitionLink';
import { Play, ChevronLeft, ChevronRight, Star, TrendingUp } from 'lucide-react';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔴 THE RED WIRE - HOMEPAGE (BBC/CNN Professional Design)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Enhanced Features:
 * ✅ Category Navigation Bar
 * ✅ Professional Breaking Ticker
 * ✅ Editor's Pick Section
 * ✅ Most Read Section
 * 
 * ══════════════════════════════════════════════════════════════════════════
 */

export default function HomePage() {
  const { language } = useLanguage();
  
  // Data hooks
  const breakingQuery = useBreakingTicker();
  const trendingQuery = useTrendingArticles();
  const latestQuery = useLatestArticles();

  const latestList = latestQuery.data ?? [];
  const trendingList = trendingQuery.data ?? [];
  const breakingTicker = breakingQuery.data ?? [];

  // Hero carousel state
  const heroArticles = latestList.slice(0, 6);
  const [heroIndex, setHeroIndex] = useState(0);
  
  useEffect(() => {
    if (heroArticles.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroArticles.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroArticles.length]);

  const heroArticle = heroArticles[heroIndex] || latestList[0];
  const secondaryHero = heroArticles.filter((_, idx) => idx !== heroIndex).slice(0, 4);
  
  // Editor's Pick (featured article)
  const editorsPick = latestList[6] || latestList[0]; // or fetch from API with special flag
  
  const headlines = latestList.slice(heroArticles.length + 1, heroArticles.length + 13); // Skip editor's pick
  const mostRead = trendingList.slice(0, 10);

  // News Reels
  const reels = [
    { id: '1', title: 'Morning Brief in 60s', thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', duration: '01:00' },
    { id: '2', title: 'Market Pulse Recap', thumbnail: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=400', duration: '00:52' },
    { id: '3', title: 'City Desk Update', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', duration: '00:48' },
    { id: '4', title: 'Global Trade News', thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400', duration: '01:15' },
    { id: '5', title: 'Tech Summit Highlights', thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400', duration: '02:00' },
  ];

  // Helper functions
  const getTitle = (article: Article) => getLocalizedText(article.title, language);
  const getExcerpt = (article: Article) => getLocalizedText(article.excerpt, language);
  const getArticleHref = (article: Article) => `/article/${article.slug || article.id}`;
  const getCategoryName = (article: Article) => 
    article.category?.name ? getLocalizedText(article.category.name, language) : 'News';

  return (
    <div className="min-h-screen bg-[var(--news-white)]">
      {/* Enhanced Breaking News Ticker */}
      {breakingTicker.length > 0 && (
        <div className="bg-[var(--news-red-700)] text-white">
          <div className="max-w-[1440px] mx-auto px-4">
            <div className="flex items-center gap-3 py-2">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-['var(--font-work-sans)'] text-xs font-bold uppercase tracking-wide">
                  Breaking News
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <BreakingTicker
                  items={breakingTicker}
                  loading={breakingQuery.isLoading}
                  error={breakingQuery.isError}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-4 py-6 md:py-8">
        {/* Hero Section - 8 cols + 4 cols (BBC Style) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-[var(--news-gray-200)] mb-8 pb-8">
          {/* Main Hero Story - 8 cols */}
          <div className="lg:col-span-8 lg:border-r border-[var(--news-gray-200)] lg:pr-6 mb-6 lg:mb-0">
            {heroArticle ? (
              <TransitionLink href={getArticleHref(heroArticle)} className="block group">
                <div className="relative aspect-[16/9] overflow-hidden bg-[var(--news-gray-100)] mb-4">
                  {heroArticle.featuredImage && (
                    <img
                      src={resolveMediaUrl(heroArticle.featuredImage.url)}
                      alt={getTitle(heroArticle)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {heroArticle.category?.slug === 'video' && (
                    <div className="absolute top-4 right-4 bg-[var(--news-red-700)] text-white px-3 py-1 text-xs font-bold uppercase">
                      LIVE
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block bg-[var(--news-red-700)] text-white px-2 py-1 text-xs font-bold uppercase mb-3">
                      {getCategoryName(heroArticle)}
                    </span>
                    <h1 className="font-['var(--font-playfair)'] text-white text-3xl md:text-5xl font-bold leading-tight mb-2">
                      {getTitle(heroArticle)}
                    </h1>
                    {getExcerpt(heroArticle) && (
                      <p className="text-gray-200 text-base md:text-lg line-clamp-2">
                        {getExcerpt(heroArticle)}
                      </p>
                    )}
                  </div>

                  {heroArticles.length > 1 && (
                    <>
                      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 text-xs font-bold rounded-full">
                        {heroIndex + 1} / {heroArticles.length}
                      </div>
                      <div className="absolute bottom-6 right-6 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setHeroIndex((prev) => (prev - 1 + heroArticles.length) % heroArticles.length);
                          }}
                          className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                          aria-label="Previous"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setHeroIndex((prev) => (prev + 1) % heroArticles.length);
                          }}
                          className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                          aria-label="Next"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </TransitionLink>
            ) : (
              <div className="aspect-[16/9] bg-[var(--news-gray-100)] animate-pulse" />
            )}
          </div>

          {/* Top Stories Sidebar - 4 cols */}
          <div className="lg:col-span-4 lg:pl-6">
            <div className="border-b-2 border-[var(--news-gray-200)] pb-2 mb-4">
              <h2 className="font-['var(--font-work-sans)'] text-[var(--news-red-600)] text-sm font-bold uppercase tracking-wide">
                Top Stories
              </h2>
            </div>
            <div className="space-y-4">
              {secondaryHero.map((article) => (
                <TransitionLink
                  key={article.id}
                  href={getArticleHref(article)}
                  className="flex gap-3 group pb-4 border-b border-[var(--news-gray-200)] last:border-0"
                >
                  {article.featuredImage && (
                    <img
                      src={resolveMediaUrl(article.featuredImage.url)}
                      alt=""
                      className="w-24 h-16 object-cover bg-[var(--news-gray-100)] flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-['var(--font-work-sans)'] text-[var(--news-black)] text-sm font-bold leading-tight line-clamp-2 group-hover:text-[var(--news-red-600)] transition-colors">
                      {getTitle(article)}
                    </h3>
                    <p className="font-['var(--font-work-sans)'] text-[var(--news-gray-600)] text-xs font-bold uppercase mt-1">
                      {getCategoryName(article)}
                    </p>
                  </div>
                </TransitionLink>
              ))}
            </div>
          </div>
        </section>

        {/* Editor's Pick Section */}
        {editorsPick && (
          <section className="mb-8 border-b border-[var(--news-gray-200)] pb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-[var(--news-red-700)]" fill="var(--news-red-700)" />
              <h2 className="font-['var(--font-work-sans)'] text-[var(--news-black)] text-lg font-bold uppercase tracking-wide">
                {language === 'bn' ? 'সম্পাদকের পছন্দ' : "Editor's Pick"}
              </h2>
            </div>
            <TransitionLink href={getArticleHref(editorsPick)} className="block group">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--news-gray-50)] p-6 border border-[var(--news-gray-200)]">
                {editorsPick.featuredImage && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={resolveMediaUrl(editorsPick.featuredImage.url)}
                      alt={getTitle(editorsPick)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <span className="inline-block bg-[var(--news-red-700)] text-white px-2 py-1 text-xs font-bold uppercase mb-3 w-fit">
                    {getCategoryName(editorsPick)}
                  </span>
                  <h3 className="font-['var(--font-playfair)'] text-[var(--news-black)] text-2xl md:text-3xl font-bold leading-tight mb-3 group-hover:text-[var(--news-red-600)] transition-colors">
                    {getTitle(editorsPick)}
                  </h3>
                  {getExcerpt(editorsPick) && (
                    <p className="font-['var(--font-work-sans)'] text-[var(--news-darkgray)] text-base leading-relaxed line-clamp-3">
                      {getExcerpt(editorsPick)}
                    </p>
                  )}
                </div>
              </div>
            </TransitionLink>
          </section>
        )}

        {/* News Reels Rail */}
        {reels.length > 0 && (
          <section className="mb-8 bg-black rounded-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-[var(--news-red-700)]" />
              <h2 className="font-['var(--font-work-sans)'] text-white text-xl font-bold">
                Must Watch
              </h2>
              <span className="font-['var(--font-work-sans)'] text-gray-400 text-sm">
                Quick clips from the newsroom
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  className="relative flex-shrink-0 w-36 md:w-44 aspect-[9/16] rounded-sm overflow-hidden cursor-pointer group"
                  style={{ backgroundImage: `url(${reel.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="text-white w-12 h-12 transition-transform group-hover:scale-110" fill="white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-['var(--font-work-sans)'] text-white text-sm font-bold leading-tight line-clamp-2">
                      {reel.title}
                    </p>
                    <span className="font-['var(--font-work-sans)'] text-gray-400 text-xs">
                      {reel.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest News Grid */}
        <section>
          <div className="border-b-2 border-[var(--news-black)] mb-6">
            <h2 className="font-['var(--font-work-sans)'] text-[var(--news-black)] text-2xl font-bold uppercase pb-2">
              Latest News
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Feed - 8 cols */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestQuery.isLoading ? (
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-[var(--news-gray-200)] p-4">
                      <div className="aspect-[16/9] bg-[var(--news-gray-100)] animate-pulse mb-3" />
                      <div className="bg-[var(--news-gray-100)] h-4 w-20 animate-pulse mb-2" />
                      <div className="bg-[var(--news-gray-100)] h-6 w-full animate-pulse mb-2" />
                      <div className="bg-[var(--news-gray-100)] h-6 w-3/4 animate-pulse" />
                    </div>
                  ))
                ) : headlines.map((article) => (
                  <article
                    key={article.id}
                    className="border border-[var(--news-gray-200)] hover:border-[var(--news-red-600)] transition-colors group"
                  >
                    <TransitionLink href={getArticleHref(article)} className="block">
                      {article.featuredImage && (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img
                            src={resolveMediaUrl(article.featuredImage.url)}
                            alt={getTitle(article)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <span className="font-['var(--font-work-sans)'] text-[var(--news-red-600)] text-xs font-bold uppercase">
                          {getCategoryName(article)}
                        </span>
                        <h3 className="font-['var(--font-playfair)'] text-[var(--news-black)] text-lg font-bold leading-tight mt-2 mb-2 group-hover:text-[var(--news-red-600)] transition-colors line-clamp-3">
                          {getTitle(article)}
                        </h3>
                        {getExcerpt(article) && (
                          <p className="font-['var(--font-work-sans)'] text-[var(--news-darkgray)] text-sm line-clamp-2">
                            {getExcerpt(article)}
                          </p>
                        )}
                        <p className="font-['var(--font-work-sans)'] text-[var(--news-gray-600)] text-xs font-bold uppercase mt-3">
                          {formatDate(article.publishedAt, language)}
                        </p>
                      </div>
                    </TransitionLink>
                  </article>
                ))}
              </div>
            </div>

            {/* Most Read Sidebar - 4 cols */}
            <aside className="lg:col-span-4 lg:border-l border-[var(--news-gray-200)] lg:pl-6">
              <div className="flex items-center gap-2 border-b border-[var(--news-gray-200)] pb-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[var(--news-red-700)]" />
                <h2 className="font-['var(--font-work-sans)'] text-[var(--news-black)] text-sm font-bold uppercase tracking-wide">
                  {language === 'bn' ? 'সর্বাধিক পঠিত' : 'Most Read'}
                </h2>
              </div>
              <div className="space-y-4">
                {trendingQuery.isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="bg-[var(--news-gray-100)] w-8 h-8 animate-pulse" />
                      <div className="flex-1">
                        <div className="bg-[var(--news-gray-100)] h-4 w-full animate-pulse mb-2" />
                        <div className="bg-[var(--news-gray-100)] h-4 w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : mostRead.map((article, index) => (
                  <TransitionLink
                    key={article.id}
                    href={getArticleHref(article)}
                    className="flex gap-3 group hover:bg-[var(--news-gray-50)] p-2 -mx-2 transition-colors"
                  >
                    <span className="font-['var(--font-playfair)'] text-[var(--news-gray-300)] text-3xl font-bold leading-none flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-['var(--font-work-sans)'] text-[var(--news-black)] text-sm font-semibold leading-tight group-hover:text-[var(--news-red-600)] transition-colors line-clamp-3">
                        {getTitle(article)}
                      </h3>
                      <p className="font-['var(--font-work-sans)'] text-[var(--news-gray-600)] text-xs mt-1">
                        {getCategoryName(article)}
                      </p>
                    </div>
                  </TransitionLink>
                ))}
              </div>

              {/* Ad Slot */}
              <div className="mt-8">
                <AdSlot position="sidebar" page="home" />
              </div>
            </aside>
          </div>
        </section>

        {/* Bottom Ad Slot */}
        <div className="mt-8">
          <AdSlot position="banner" page="home" />
        </div>
      </div>
    </div>
  );
}
