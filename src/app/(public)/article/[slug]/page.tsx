'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import { Share2, Bookmark, Clock, User, ArrowRight, Mail } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { EmptyState } from '@/components/states/EmptyState';
import { useArticle, useRelatedArticles } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { handleApiError } from '@/lib/query-config';
import { formatDate, getLocalizedText, normalizeRichText, resolveMediaUrl, resolveRichTextMedia } from '@/lib/utils';
import { TransitionLink } from '@/components/navigation/TransitionLink';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔴 THE RED WIRE - ARTICLE READER (BBC/CNN Professional Design)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - Max-width: 720px for optimal reading
 * - Serif typography for body (Georgia/Merriweather feel)
 * - Large Playfair Display headline
 * - Red accents for categories and UI elements
 * - Sticky Reading Progress Bar
 * - Clean sidebar with related content
 * 
 * ══════════════════════════════════════════════════════════════════════════
 */

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params?.slug[0] : params?.slug;
  const articleQuery = useArticle(slug || '');
  const article = articleQuery.data;
  const relatedQuery = useRelatedArticles(article?.id);
  const related = relatedQuery.data;
  const { language } = useLanguage();
  
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll Progress Logic
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayArticle = article;
  const relatedStories =
    related && related.length > 0 && displayArticle
      ? related.filter((item) => item.id !== displayArticle.id).slice(0, 4)
      : [];
      
  const categoryLabel = displayArticle ? getLocalizedText(displayArticle.category?.name, language) || 'News' : 'News';
  const getCategoryLink = () => displayArticle?.category?.slug ? `/category/${displayArticle.category.slug}` : '/';
  
  const title = displayArticle ? getLocalizedText(displayArticle.title, language) : '';
  const summary = displayArticle ? getLocalizedText(displayArticle.excerpt, language) : '';
  const featuredImage = resolveMediaUrl(displayArticle?.featuredImage?.url || displayArticle?.coverImage);
  const featuredAlt = displayArticle ? getLocalizedText(displayArticle.featuredImage?.alt, language) || title : '';
  
  const bodyContent = useMemo(() => {
    if (!displayArticle) return summary || '';
    if (typeof displayArticle.content === 'string') return displayArticle.content;
    if (displayArticle.content) {
      const localized = (displayArticle.content as Record<string, string | undefined>)[language];
      if (localized) return localized;
      if ((displayArticle.content as Record<string, string | undefined>).en) {
        return (displayArticle.content as Record<string, string | undefined>).en as string;
      }
    }
    return summary || '';
  }, [displayArticle, language, summary]);

  const bodyHtml = useMemo(
    () => resolveRichTextMedia(normalizeRichText(bodyContent || 'Please wait, content loading...')),
    [bodyContent],
  );

  // Loading State
  if (articleQuery.isLoading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 w-3/4 mb-4 rounded"></div>
        <div className="h-4 bg-gray-200 w-1/2 mb-8 rounded"></div>
        <div className="aspect-video bg-gray-200 w-full mb-8 rounded"></div>
        <div className="space-y-4">
            <div className="h-4 bg-gray-200 w-full rounded"></div>
            <div className="h-4 bg-gray-200 w-full rounded"></div>
            <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!displayArticle) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-12">
        <EmptyState
          title={articleQuery.isError ? 'Unable to load article' : 'Article not found'}
          description={articleQuery.isError ? handleApiError(articleQuery.error) : 'The story could not be loaded. Please try again later.'}
        />
      </div>
    );
  }

  return (
    <div className="bg-[var(--news-page)] min-h-screen relative">
      {/* Reading Progress Bar (Red) */}
      <div className="fixed top-0 left-0 h-1 bg-[var(--news-red-700)] z-50 transition-all duration-100 ease-out" style={{ width: `${scrollProgress * 100}%` }} />

      <div className="max-w-[1200px] mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Content Column - 8 cols (centered feel) */}
          <main className="lg:col-span-8">
            <article>
              {/* Header Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 bg-[var(--news-red-700)] rounded-full animate-pulse"></span>
                  <TransitionLink 
                    href={getCategoryLink()}
                    className="font-['var(--font-work-sans)'] text-[var(--news-red-700)] text-sm font-bold uppercase tracking-wider hover:underline"
                  >
                    {categoryLabel}
                  </TransitionLink>
                </div>

                <h1 className="font-['var(--font-playfair)'] text-[var(--news-ink)] text-3xl md:text-5xl font-bold leading-tight mb-4">
                  {title}
                </h1>

                {summary && (
                  <div 
                    className="font-['var(--font-work-sans)'] text-[var(--news-gray-600)] text-lg md:text-xl leading-relaxed mb-6 border-l-4 border-[var(--news-red-700)] pl-4 bg-[var(--news-offwhite)] py-2 pr-2 [&>p]:m-0"
                    dangerouslySetInnerHTML={{ __html: summary }}
                  />
                )}

                {/* Meta Data Row */}
                <div className="flex flex-wrap items-center justify-between border-y border-[var(--news-gray-200)] py-4 gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-6 text-sm text-[var(--news-darkgray)] font-['var(--font-work-sans)']">
                    {displayArticle.author?.name && (
                      <div className="flex items-center gap-2 font-bold group">
                        <div className="p-1 bg-[var(--news-red-100)] rounded-full group-hover:bg-[var(--news-red-200)] transition-colors">
                            <User size={14} className="text-[var(--news-red-700)]" />
                        </div>
                        <span className="group-hover:text-[var(--news-red-700)] transition-colors">By {displayArticle.author.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                       <Clock size={16} className="text-[var(--news-gray-400)]" />
                       <span>{displayArticle.publishedAt ? formatDate(displayArticle.publishedAt) : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[var(--news-red-50)] text-[var(--news-gray-600)] hover:text-[var(--news-red-700)] transition-colors text-sm font-bold group">
                      <Share2 size={16} />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[var(--news-red-50)] text-[var(--news-gray-600)] hover:text-[var(--news-red-700)] transition-colors text-sm font-bold">
                      <Bookmark size={16} />
                      <span className="hidden sm:inline">Save</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {featuredImage && (
                <div className="relative aspect-video w-full mb-8 lg:mb-10 bg-[var(--news-gray-100)] border-b-4 border-[var(--news-red-700)]">
                  <Image 
                    src={featuredImage} 
                    alt={featuredAlt} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                    priority
                    unoptimized 
                  />
                  {displayArticle.featuredImage?.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                       <p className="text-white text-xs md:text-sm font-['var(--font-work-sans)']">
                         {getLocalizedText(displayArticle.featuredImage.caption, language)}
                       </p>
                    </div>
                  )}
                </div>
              )}

              {/* Article Body */}
              <div 
                className="prose prose-lg max-w-none 
                  prose-headings:font-['var(--font-playfair)'] prose-headings:font-bold prose-headings:text-[var(--news-ink)]
                  prose-p:font-['Georgia'] prose-p:text-[var(--news-darkgray)] prose-p:text-lg prose-p:leading-8 prose-p:mb-6
                  prose-a:text-[var(--news-red-700)] prose-a:font-bold prose-a:no-underline prose-a:border-b-2 prose-a:border-[var(--news-red-200)] hover:prose-a:border-[var(--news-red-700)] hover:prose-a:bg-[var(--news-red-50)] prose-a:transition-all
                  prose-blockquote:border-l-4 prose-blockquote:border-[var(--news-red-700)] prose-blockquote:bg-[var(--news-offwhite)] prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:my-8 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:font-['var(--font-playfair)'] prose-blockquote:text-xl prose-blockquote:text-[var(--news-ink)]
                  prose-img:rounded-sm prose-img:w-full prose-img:shadow-md
                  prose-strong:text-[var(--news-red-700)]
                  font-serif text-[var(--news-ink)]"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />

              {/* Newsletter Callout */}
              <div className="my-10 p-8 bg-[var(--news-red-700)] text-white rounded-sm text-center">
                  <Mail className="w-8 h-8 mx-auto mb-4 text-white/80" />
                  <h3 className="font-['var(--font-playfair)'] text-2xl font-bold mb-2">Get the Red Wire</h3>
                  <p className="font-['var(--font-work-sans)'] text-white/80 mb-6 max-w-md mx-auto">
                    Essential news, expert analysis, and exclusive content delivered straight to your inbox.
                  </p>
                  <div className="flex max-w-sm mx-auto gap-2">
                    <input 
                      type="email" 
                      placeholder="Your email" 
                      className="flex-1 h-10 px-4 bg-black/25 border border-white/10 text-white placeholder:text-white/50 rounded-sm focus:border-white/40 focus:outline-none text-sm transition-colors" 
                    />
                    <button className="h-10 bg-black text-white px-6 font-bold uppercase text-sm tracking-wide hover:bg-gray-900 transition-colors rounded-sm flex items-center justify-center">
                      Join
                    </button>
                  </div>
              </div>

              {/* In-content Ad */}
              <div className="my-8 py-8 border-t border-[var(--news-gray-200)] text-center">
                 <span className="text-xs text-[var(--news-gray-400)] uppercase tracking-widest mb-2 block">Advertisement</span>
                 <AdSlot slot="article_inline_wide" page="article" categoryId={displayArticle.category?.id || displayArticle.categoryId} />
              </div>

            </article>
          </main>

          {/* Sidebar Column - 4 cols */}
          <aside className="lg:col-span-4 lg:pl-8 lg:border-l border-[var(--news-gray-200)]">
             <div className="sticky top-24">
                {/* Related Stories */}
                <div className="mb-8 p-6 bg-[var(--news-offwhite)] border-t-4 border-[var(--news-red-700)]">
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="font-['var(--font-work-sans)'] font-bold text-lg uppercase tracking-wide text-[var(--news-red-700)]">
                      Related Stories
                    </h3>
                  </div>

                  <div className="flex flex-col gap-6">
                    {relatedQuery.isLoading ? (
                      [1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded"></div>)
                    ) : relatedStories.length > 0 ? (
                      relatedStories.map(story => (
                        <TransitionLink 
                          href={`/article/${story.slug || story.id}`} 
                          key={story.id}
                          className="group flex gap-3 items-start"
                        >
                          <div className="pt-1">
                             <ArrowRight size={16} className="text-[var(--news-red-700)] -ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                          </div>
                          <div>
                             <h4 className="font-['var(--font-work-sans)'] font-bold text-sm leading-snug text-[var(--news-ink)] group-hover:text-[var(--news-red-700)] transition-colors line-clamp-3">
                               {getLocalizedText(story.title, language)}
                             </h4>
                             <span className="text-xs text-[var(--news-gray-500)] mt-1 block group-hover:text-[var(--news-red-400)]">
                               {story.publishedAt ? formatDate(story.publishedAt) : ''}
                             </span>
                          </div>
                        </TransitionLink>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No related stories found.</p>
                    )}
                  </div>
                </div>

                {/* Sidebar Ad */}
                <div className="mb-8">
                  <AdSlot slot="article_sidebar_tall" page="article" categoryId={displayArticle.category?.id || displayArticle.categoryId} />
                </div>
                
                {/* Explore Categories */}
                <div className="p-6 border border-[var(--news-gray-200)]">
                   <h3 className="font-['var(--font-work-sans)'] font-bold text-sm uppercase tracking-wide mb-4 text-[var(--news-ink)]">
                     Explore More
                   </h3>
                   <div className="flex flex-wrap gap-2">
                      {['Politics', 'Business', 'Sports', 'Tech', 'World', 'Opinion'].map((cat) => (
                        <TransitionLink 
                          key={cat}
                          href={`/category/${cat.toLowerCase()}`} 
                          className="px-3 py-1 bg-[var(--news-white)] border border-[var(--news-gray-300)] text-xs font-bold text-[var(--news-ink)] hover:border-[var(--news-red-700)] hover:bg-[var(--news-red-700)] hover:text-white transition-all duration-300 uppercase"
                        >
                          {cat}
                        </TransitionLink>
                      ))}
                   </div>
                </div>

             </div>
          </aside>
        </div>

        <div className="mt-10 border-t border-[var(--news-gray-200)] pt-8">
          <AdSlot slot="article_footer_banner" page="article" categoryId={displayArticle.category?.id || displayArticle.categoryId} />
        </div>
      </div>
    </div>
  );
}
