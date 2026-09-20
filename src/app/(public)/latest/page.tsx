'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Clock, ChevronDown, RefreshCw, Newspaper, ArrowRight, Youtube, Play } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { TransitionLink } from '@/components/navigation/TransitionLink';
import { useLanguage } from '@/contexts/language-context';
import { apiClient } from '@/lib/api-client';
import { type ApiResponse, type Article } from '@/lib/types';
import { cleanExcerpt, formatDate, formatTimeAgo, getLocalizedText, resolveMediaUrl } from '@/lib/utils';

const INITIAL_LIMIT = 15;
const PAGE_LIMIT = 10;

export default function LatestNewsPage() {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Fetch initial articles
  const fetchInitial = useCallback(async () => {
    setIsLoadingInitial(true);
    setHasError(false);
    try {
      const res = await apiClient.get<ApiResponse<Article[]>>(
        `/articles?limit=${INITIAL_LIMIT}&page=1&sort=-publishedAt&status=published`
      );
      if (res && res.data) {
        setArticles(res.data);
        const p = res.pagination;
        setTotal(p?.total ?? res.data.length);
        setTotalPages(p?.totalPages ?? 1);
        setPage(1);
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  // Load more articles
  const handleLoadMore = async () => {
    if (isLoadingMore || page >= totalPages) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await apiClient.get<ApiResponse<Article[]>>(
        `/articles?limit=${PAGE_LIMIT}&page=${nextPage}&sort=-publishedAt&status=published`
      );
      if (res && res.data && res.data.length > 0) {
        setArticles((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const fresh = res.data.filter((a) => !existingIds.has(a.id));
          return [...prev, ...fresh];
        });
        setPage(nextPage);
        if (res.pagination?.totalPages) {
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error('Failed to load more articles', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const leadStory = articles[0];
  const sideStories = articles.length > 1 ? articles.slice(1, Math.min(4, articles.length)) : [];
  const subStartIndex = 1 + sideStories.length;
  const subStories = articles.length > subStartIndex ? articles.slice(subStartIndex, Math.min(subStartIndex + 4, articles.length)) : [];
  const feedStartIndex = subStartIndex + subStories.length;
  const feedStories = articles.length > feedStartIndex ? articles.slice(feedStartIndex) : [];
  const hasMore = page < totalPages || articles.length < total;

  return (
    <div className="w-full bg-[var(--news-page)] text-[var(--news-ink)]">
      <main className="mx-auto max-w-[1440px] px-4 pt-4 pb-8 sm:pt-6 sm:pb-12 md:pt-6 md:pb-12">
        {/* Loading Skeleton */}
        {isLoadingInitial ? (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 h-64 bg-[var(--news-grid)] rounded-sm" />
              <div className="lg:col-span-4 h-64 bg-[var(--news-grid)] rounded-sm" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-[var(--news-grid)] rounded-sm" />
              ))}
            </div>
          </div>
        ) : hasError ? (
          <div className="border border-[var(--news-grid)] bg-[var(--news-white)] p-12 text-center max-w-lg mx-auto">
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--news-red-700)]">
              {language === 'bn' ? 'ত্রুটি' : 'Notice'}
            </p>
            <h2 className="mt-3 [font-family:var(--font-serif)] text-3xl font-bold text-[var(--news-ink)]">
              {language === 'bn' ? 'সংবাদ লোড করা যায়নি' : 'Unable to load stories'}
            </h2>
            <p className="mt-3 text-sm text-[var(--news-muted)]">
              {language === 'bn' ? 'অনুগ্রহ করে পুনরায় চেষ্টা করুন।' : 'Please check your connection and try again.'}
            </p>
            <button
              onClick={fetchInitial}
              className="mt-6 inline-flex items-center gap-2 bg-[var(--news-red-700)] px-5 py-2.5 text-sm font-bold !text-white hover:bg-[var(--news-red-hover)] transition-colors rounded-sm"
              style={{ color: '#ffffff' }}
            >
              <RefreshCw className="w-4 h-4" />
              {language === 'bn' ? 'পুনরায় লোড করুন' : 'Retry'}
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="border border-[var(--news-grid)] bg-[var(--news-white)] p-12 text-center max-w-lg mx-auto">
            <h2 className="[font-family:var(--font-serif)] text-3xl font-bold text-[var(--news-ink)]">
              {language === 'bn' ? 'কোনো সংবাদ পাওয়া যায়নি' : 'No stories published yet'}
            </h2>
            <TransitionLink
              href="/"
              className="mt-6 inline-flex items-center gap-2 bg-[var(--news-red-700)] px-5 py-2.5 text-sm font-bold !text-white hover:bg-[var(--news-red-hover)] transition-colors rounded-sm"
              style={{ color: '#ffffff' }}
            >
              {language === 'bn' ? 'হোমপেজে ফিরুন' : 'Return Home'}
            </TransitionLink>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Top Hero: Lead Story (Left 8 cols) + Right Column with Multimedia & Top Stories (Right 4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-b border-[var(--news-grid)] pb-8 sm:pb-10">
              {/* Lead Story - 8 cols (Image on top, details below like other category pages) */}
              {leadStory && (
                <article className="lg:col-span-8 border border-[var(--news-grid)] bg-[var(--news-white)] p-5 sm:p-6 rounded-sm flex flex-col justify-between group">
                  <TransitionLink href={`/article/${leadStory.slug || leadStory.id}`} className="group block">
                    {/* Top: Featured Image */}
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-sm bg-[var(--news-paper)] border border-[var(--news-grid)] mb-4 sm:mb-5">
                      {leadStory.featuredImage?.url ? (
                        <Image
                          src={resolveMediaUrl(leadStory.featuredImage.url)}
                          alt={getLocalizedText(leadStory.title, language)}
                          fill
                          priority
                          sizes="(min-width: 1024px) 65vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[linear-gradient(135deg,var(--news-red-900),var(--news-black))] text-white/50 text-xs font-serif">
                          The Contemporary
                        </div>
                      )}
                    </div>

                    {/* Bottom: News Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                        <span
                          className="news-kicker bg-[var(--news-red-700)] !text-white text-[11px] font-bold px-2.5 py-0.5 rounded-sm"
                          style={{ color: '#ffffff' }}
                        >
                          {language === 'bn' ? 'লেটেস্ট' : 'Latest'}
                        </span>
                        {leadStory.isBreaking && (
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--news-red-700)] dark:text-[#f87171] animate-pulse">
                            {language === 'bn' ? 'ব্রেকিং' : 'Breaking'}
                          </span>
                        )}
                      </div>

                      <h2 className="[font-family:var(--font-serif)] text-xl sm:text-2xl md:text-[1.85rem] lg:text-[2.1rem] font-bold leading-[1.25] text-[var(--news-ink)] group-hover:text-[var(--news-red-700)] dark:group-hover:text-[#f87171] transition-colors">
                        {getLocalizedText(leadStory.title, language)}
                      </h2>

                      {leadStory.excerpt && (
                        <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--news-muted)] line-clamp-3">
                          {cleanExcerpt(getLocalizedText(leadStory.excerpt, language))}
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-[var(--news-grid)] flex items-center gap-3 text-xs font-semibold text-[var(--news-soft)]">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[var(--news-red-700)] dark:text-[#f87171]" />
                          {leadStory.publishedAt ? formatTimeAgo(leadStory.publishedAt, language) : ''}
                        </span>
                        {leadStory.readTime && (
                          <span>• {language === 'bn' ? `${leadStory.readTime} মিনিট পড়া` : `${leadStory.readTime} min read`}</span>
                        )}
                        {leadStory.author?.name && (
                          <span>• {leadStory.author.name}</span>
                        )}
                      </div>
                    </div>
                  </TransitionLink>
                </article>
              )}

              {/* Right Column (4 cols) - Multimedia Desk with Proper Height & Top Stories Card */}
              <aside className="lg:col-span-4 space-y-6">
                {/* 1. Multimedia Desk Card */}
                <div className="border border-[var(--news-grid)] bg-[var(--news-white)] p-5 rounded-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--news-grid)]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--news-ink)] flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-[#e21837]" />
                      {language === 'bn' ? 'মাল্টিমিডিয়া ডেস্ক' : 'Multimedia Desk'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 uppercase tracking-wider rounded-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  <div className="mt-3.5">
                    <h3 className="[font-family:var(--font-serif)] text-base sm:text-lg font-bold leading-snug text-[var(--news-ink)]">
                      {language === 'bn' ? 'কনটেম্পরারি ভিডিও প্রতিবেদন ও বিশ্লেষণ' : 'The Contemporary Video Reports & Analysis'}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--news-muted)]">
                      {language === 'bn'
                        ? 'মাঠপর্যায়ের অনুসন্ধান, গুরুত্বপূর্ণ মতামত ও বিশেষ আলোচনা সরাসরি দেখতে যুক্ত থাকুন আমাদের অফিসিয়াল ইউটিউব চ্যানেলে।'
                        : 'Watch on-the-ground investigations, expert analysis, and in-depth discussions on our official YouTube channel.'}
                    </p>
                  </div>

                  <a
                    href="https://www.youtube.com/@TheContemporaryNews"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-2 w-full bg-[#8A0E16] hover:bg-[#a1141d] active:scale-[0.98] py-2.5 px-4 text-xs sm:text-sm font-bold rounded-sm shadow-sm transition-all duration-200 group !text-white"
                    style={{ color: '#ffffff', backgroundColor: '#8A0E16' }}
                  >
                    <Youtube className="w-4 h-4 !text-white group-hover:scale-110 transition-transform" style={{ color: '#ffffff' }} />
                    <span className="!text-white font-bold" style={{ color: '#ffffff' }}>
                      {language === 'bn' ? 'ইউটিউবে দেখুন' : 'Watch on YouTube'}
                    </span>
                  </a>
                </div>

                {/* 2. Top Stories Card (Matching Other Category Pages Exactly) */}
                {sideStories.length > 0 && (
                  <div className="border border-[var(--news-grid)] bg-[var(--news-white)] p-5">
                    <h2 className="news-section-title border-b border-[var(--news-grid)] pb-2">
                      {language === 'bn' ? 'শীর্ষ প্রতিবেদন' : 'Top stories'}
                    </h2>
                    <div className="mt-3">
                      {sideStories.map((story) => {
                        const categoryName = story.category
                          ? getLocalizedText(story.category.name, language)
                          : (language === 'bn' ? 'লেটেস্ট' : 'Latest');
                        return (
                          <TransitionLink
                            key={story.id}
                            href={`/article/${story.slug || story.id}`}
                            className="group block border-b border-[var(--news-grid)] py-4 last:border-b-0 last:pb-0 first:pt-1"
                          >
                            <p className="news-meta text-[var(--news-red-700)]">{categoryName}</p>
                            <h3 className="mt-2 [font-family:var(--font-serif)] text-xl font-bold leading-tight text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                              {getLocalizedText(story.title, language)}
                            </h3>
                            {story.excerpt && (
                              <p className="mt-3 text-sm leading-6 text-[var(--news-muted)] line-clamp-2">
                                {cleanExcerpt(getLocalizedText(story.excerpt, language))}
                              </p>
                            )}
                            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--news-soft)]">
                              {story.publishedAt ? formatDate(story.publishedAt, language) : 'Recent'}
                            </p>
                          </TransitionLink>
                        );
                      })}
                    </div>
                  </div>
                )}
              </aside>
            </div>

            {/* Sub-grid Row (4 Cards) */}
            {subStories.length > 0 && (
              <section className="border-b border-[var(--news-grid)] pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {subStories.map((story) => (
                    <article key={story.id} className="group flex flex-col">
                      <TransitionLink
                        href={`/article/${story.slug || story.id}`}
                        className="relative aspect-[16/10] w-full overflow-hidden rounded-sm bg-[var(--news-paper)] border border-[var(--news-grid)] mb-3 block"
                      >
                        {story.featuredImage?.url ? (
                          <Image
                            src={resolveMediaUrl(story.featuredImage.url)}
                            alt={getLocalizedText(story.title, language)}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[var(--news-soft)]">
                            The Contemporary
                          </div>
                        )}
                      </TransitionLink>

                      <div className="flex-1 flex flex-col">
                        {story.category && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--news-red-700)] dark:text-[#f87171] mb-1">
                            {getLocalizedText(story.category.name, language)}
                          </span>
                        )}
                        <TransitionLink href={`/article/${story.slug || story.id}`} className="group-hover:text-[var(--news-red-700)] dark:group-hover:text-[#f87171] transition-colors">
                          <h3 className="[font-family:var(--font-serif)] text-base font-bold leading-snug line-clamp-2 text-[var(--news-ink)]">
                            {getLocalizedText(story.title, language)}
                          </h3>
                        </TransitionLink>
                        <div className="mt-auto pt-2 flex items-center gap-1.5 text-[11px] text-[var(--news-soft)] font-medium">
                          <Clock className="w-3 h-3 text-[var(--news-red-700)] dark:text-[#f87171]" />
                          <span>{formatTimeAgo(story.publishedAt, language)}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Chronological News Stream (Horizontal Cards Feed + Sidebar) */}
            <section>
              <div className="flex items-center justify-between border-b-2 border-[var(--news-red-700)] pb-2 mb-6">
                <h2 className="text-lg sm:text-xl font-bold [font-family:var(--font-serif)] text-[var(--news-ink)] flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[var(--news-red-700)] dark:text-[#f87171]" />
                  <span>{language === 'bn' ? 'সকল সর্বশেষ সংবাদ' : 'All Latest Stories'}</span>
                </h2>
              </div>

              <div className="grid gap-8 lg:grid-cols-12 items-start">
                {/* Main Feed Column */}
                <div className="lg:col-span-8 divide-y divide-[var(--news-grid)]">
                  {feedStories.map((story) => (
                    <article
                      key={story.id}
                      className="group py-6 first:pt-0 flex flex-col sm:flex-row gap-5 items-start transition-colors duration-150"
                    >
                      {/* Thumbnail */}
                      <TransitionLink
                        href={`/article/${story.slug || story.id}`}
                        className="relative w-full sm:w-[220px] md:w-[260px] aspect-[16/10] flex-shrink-0 overflow-hidden rounded-sm bg-[var(--news-paper)] border border-[var(--news-grid)]"
                      >
                        {story.featuredImage?.url ? (
                          <Image
                            src={resolveMediaUrl(story.featuredImage.url)}
                            alt={getLocalizedText(story.title, language)}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 260px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[var(--news-soft)] font-serif">
                            The Contemporary
                          </div>
                        )}
                      </TransitionLink>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          {story.category && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--news-red-700)] dark:text-[#f87171]">
                              {getLocalizedText(story.category.name, language)}
                            </span>
                          )}
                          <span className="text-[var(--news-grid-strong)]">•</span>
                          <span className="flex items-center gap-1 text-[11px] text-[var(--news-soft)] font-medium">
                            <Clock className="w-3 h-3 text-[var(--news-red-700)] dark:text-[#f87171]" />
                            {formatTimeAgo(story.publishedAt, language)}
                          </span>
                        </div>

                        <TransitionLink href={`/article/${story.slug || story.id}`} className="block group-hover:text-[var(--news-red-700)] dark:group-hover:text-[#f87171] transition-colors">
                          <h3 className="[font-family:var(--font-serif)] text-lg sm:text-xl font-bold leading-snug text-[var(--news-ink)]">
                            {getLocalizedText(story.title, language)}
                          </h3>
                        </TransitionLink>

                        {story.excerpt && (
                          <p className="mt-2 text-sm leading-relaxed text-[var(--news-muted)] line-clamp-2">
                            {cleanExcerpt(getLocalizedText(story.excerpt, language))}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}

                  {/* Load More Button */}
                  {hasMore ? (
                    <div className="pt-6 pb-2 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[var(--news-red-700)] hover:bg-[var(--news-red-hover)] active:scale-[0.98] !text-white font-bold text-sm sm:text-base rounded-sm shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                        style={{ color: '#ffffff' }}
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{language === 'bn' ? 'সংবাদ লোড হচ্ছে...' : 'Loading stories...'}</span>
                          </>
                        ) : (
                          <>
                            <span>{language === 'bn' ? 'আরও খবর' : 'Load More News'}</span>
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Sidebar Column */}
                <aside className="lg:col-span-4 space-y-6">
                  {/* Sidebar AdSlot - renders ZERO leftover space if ads are disabled or empty */}
                  <AdSlot
                    slot="category_sidebar_tall"
                    page="category"
                    containerClassName="border border-[var(--news-grid)] bg-[var(--news-paper)] p-4 rounded-sm"
                  />

                  {/* Quick Topics */}
                  <div className="border border-[var(--news-grid)] bg-[var(--news-white)] p-5 rounded-sm">
                    <h3 className="[font-family:var(--font-serif)] text-base font-bold border-b border-[var(--news-grid)] pb-2 mb-3 text-[var(--news-ink)]">
                      {language === 'bn' ? 'গুরুত্বপূর্ণ বিভাগসমূহ' : 'Key News Sections'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { slug: 'explainer', bn: 'এক্সপ্লেইনার', en: 'Explainer' },
                        { slug: 'politics', bn: 'রাজনীতি', en: 'Politics' },
                        { slug: 'business', bn: 'ব্যবসা', en: 'Business' },
                        { slug: 'bangladesh', bn: 'বাংলাদেশ', en: 'Bangladesh' },
                        { slug: 'international', bn: 'ইন্টারন্যাশনাল', en: 'International' },
                        { slug: 'opinion', bn: 'মতামত', en: 'Opinion' },
                        { slug: 'feature', bn: 'ফিচার', en: 'Feature' },
                        { slug: 'fact-check', bn: 'ফ্যাক্টচেক', en: 'Fact Check' },
                      ].map((item) => (
                        <TransitionLink
                          key={item.slug}
                          href={`/category/${item.slug}`}
                          className="news-topic-pill"
                        >
                          {language === 'bn' ? item.bn : item.en}
                        </TransitionLink>
                      ))}
                    </div>
                  </div>

                  {/* Editorial Subscribe Card */}
                  <div className="bg-[var(--news-black)] text-white p-6 rounded-sm">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#f0c2c2] mb-1">
                      {language === 'bn' ? 'দ্যা কনটেম্পরারি বার্তা' : 'The Contemporary Wire'}
                    </p>
                    <h3 className="[font-family:var(--font-serif)] text-xl font-bold leading-tight text-white">
                      {language === 'bn' ? 'নির্ভুল সংবাদ ও বিশ্লেষণ' : 'Authentic news without sensationalism'}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/70">
                      {language === 'bn'
                        ? 'সরাসরি নির্ভরযোগ্য তথ্য ও গভীর অনুসন্ধানী প্রতিবেদন পড়ুন।'
                        : 'Read verified investigative reporting and thought-provoking analysis daily.'}
                    </p>
                    <TransitionLink
                      href="/contact"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[var(--news-red-500)] transition-colors"
                    >
                      <span>{language === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Contact Editorial Board'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </TransitionLink>
                  </div>
                </aside>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
