'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useCategory, useCategoryArticles } from '@/hooks/api-hooks';
import { useLanguage, type SupportedLanguage } from '@/contexts/language-context';
import { getLocalizedText, resolveMediaUrl, formatDate } from '@/lib/utils';
import { AdSlot } from '@/components/ads/AdSlot';
import { TransitionLink } from '@/components/navigation/TransitionLink';
import { Clock, ChevronRight } from 'lucide-react';
import { Article } from '@/lib/types';

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const { language } = useLanguage();

  // Fetch Category Data
  const { data: category, isLoading: isCategoryLoading } = useCategory(slug);
  
  // Fetch Articles for this Category
  const { data: articles, isLoading: isArticlesLoading } = useCategoryArticles(slug, {
    limit: 15,
    sort: '-publishedAt',
    status: 'published'
  });

  const categoryName = category?.name ? getLocalizedText(category.name, language) : slug;
  const categoryDescription = category?.description ? getLocalizedText(category.description, language) : '';
  
  const articlesList = articles || [];
  const heroArticle = articlesList[0];
  const gridArticles = articlesList.slice(1);

  if (isCategoryLoading || isArticlesLoading) {
    return (
      <div className="min-h-screen bg-[var(--news-bg-light)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[var(--news-red-700)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--news-grey-600)] font-medium">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category && !isCategoryLoading) {
    return (
      <div className="min-h-screen bg-[var(--news-bg-light)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[var(--news-grey-900)] mb-2">Category Not Found</h1>
          <p className="text-[var(--news-grey-600)] mb-6">
            The category you are looking for does not exist or has been moved.
          </p>
          <TransitionLink 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--news-red-700)] text-white font-bold uppercase tracking-wide text-sm hover:bg-[var(--news-red-800)] transition-colors"
          >
            Go Home
          </TransitionLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--news-white)]">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          CATEGORY HEADER
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[var(--news-bg-light)] border-b border-[var(--news-grey-200)]">
        <div className="max-w-[1200px] mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <span className="inline-block w-12 h-1 bg-[var(--news-red-700)] mb-6"></span>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-black text-[var(--news-grey-900)] mb-4 leading-tight">
              {categoryName}
            </h1>
            
            {categoryDescription && (
              <p className="text-lg text-[var(--news-grey-600)] leading-relaxed max-w-2xl font-serif">
                {categoryDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ────────────────────────────────────────────────────────────────────────
              MAIN CONTENT COLUMN (Articles)
              ──────────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-12">
            
            {articlesList.length === 0 ? (
              <div className="text-center py-12 bg-[var(--news-bg-light)] border border-[var(--news-grey-200)] p-8">
                <p className="text-[var(--news-grey-600)] text-lg font-serif italic">
                  No articles found in this category yet.
                </p>
              </div>
            ) : (
              <>
                {/* HERO ARTICLE */}
                {heroArticle && (
                  <article className="group relative flex flex-col gap-4 mb-12 border-b border-[var(--news-grey-200)] pb-12">
                    <TransitionLink href={`/article/${heroArticle.slug}`} className="block overflow-hidden relative aspect-video md:aspect-[21/9] w-full bg-[var(--news-grey-100)]">
                      {heroArticle.featuredImage || heroArticle.coverImage ? (
                        <Image
                          src={resolveMediaUrl(heroArticle.featuredImage?.url || heroArticle.coverImage)}
                          alt={getLocalizedText(heroArticle.featuredImage?.alt, language) || getLocalizedText(heroArticle.title, language)}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 800px"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--news-grey-400)] bg-[var(--news-grey-100)]">
                          <span className="text-4xl text-[var(--news-grey-300)] font-serif italic">NewsOS</span>
                        </div>
                      )}
                    </TransitionLink>

                    <div className="flex flex-col gap-3 mt-2">
                       <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--news-red-700)] font-sans">
                          {heroArticle.isBreaking && (
                            <span className="bg-[var(--news-red-700)] text-white px-2 py-0.5 animate-pulse">
                              Breaking
                            </span>
                          )}
                          <span>{categoryName}</span>
                       </div>
                       
                       <TransitionLink href={`/article/${heroArticle.slug}`} className="group-hover:text-[var(--news-red-700)] transition-colors">
                        <h2 className="text-3xl md:text-4xl font-black text-[var(--news-grey-900)] font-serif leading-tight">
                          {getLocalizedText(heroArticle.title, language)}
                        </h2>
                       </TransitionLink>

                       <p className="text-[var(--news-grey-600)] text-lg leading-relaxed line-clamp-3 font-serif max-w-3xl">
                         {getLocalizedText(heroArticle.excerpt, language)}
                       </p>

                       <div className="flex items-center gap-4 mt-2 text-xs text-[var(--news-grey-500)] font-sans font-medium uppercase tracking-wide border-t border-[var(--news-grey-100)] pt-4">
                          <span className="flex items-center gap-1">
                             <Clock className="w-3.5 h-3.5" />
                             {heroArticle.publishedAt ? formatDate(heroArticle.publishedAt) : 'Recently'}
                          </span>
                          {heroArticle.author && (
                            <>
                              <span className="text-[var(--news-grey-300)]">•</span>
                              <span>{heroArticle.author.name}</span>
                            </>
                          )}
                       </div>
                    </div>
                  </article>
                )}

                {/* ARTICLE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                  {gridArticles.map((article) => (
                    <CategoryArticleCard key={article.id} article={article} language={language} categoryName={categoryName} />
                  ))}
                </div>
              </>
            )}

            {/* Pagination Placeholder (Next/Prev) can go here if needed */}
          </div>


          {/* ────────────────────────────────────────────────────────────────────────
              SIDEBAR
              ──────────────────────────────────────────────────────────────────────── */}
          <aside className="lg:col-span-4 space-y-10 pl-0 lg:pl-8 border-l-0 lg:border-l border-[var(--news-grey-200)]">
            
            {/* Sidebar Ad 1 */}
            <div className="bg-[var(--news-bg-light)] flex items-center justify-center p-4 min-h-[300px] border border-[var(--news-grey-200)]">
               <AdSlot position="sidebar" page="category" />
            </div>

            {/* Newsletter Simple Widget */}
            <div className="bg-[var(--news-grey-900)] text-white p-6 md:p-8 text-center">
              <h3 className="font-serif text-2xl font-bold mb-3 italic">The Red Wire</h3>
              <p className="text-[var(--news-grey-400)] text-sm mb-6 font-sans">
                Get the most independent news directly to your inbox. No noise, just facts.
              </p>
              <div className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] text-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--news-red-500)] transition-colors placeholder:text-[var(--news-grey-600)]"
                />
                <button className="w-full bg-[var(--news-red-700)] text-white font-bold uppercase tracking-wide text-xs py-3 hover:bg-[var(--news-red-600)] transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

             {/* Sidebar Ad 2 */}
             <div className="bg-[var(--news-bg-light)] flex items-center justify-center p-4 min-h-[300px] border border-[var(--news-grey-200)]">
               <AdSlot position="sidebar_middle" page="category" />
            </div>

          </aside>

        </div>
      </div>
      
      {/* Footer Ad */}
      <div className="max-w-[1240px] mx-auto px-4 pb-12">
          <AdSlot position="bottom" page="category" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function CategoryArticleCard({ article, language, categoryName }: { article: Article; language: SupportedLanguage; categoryName: string }) {
  return (
    <article className="group flex flex-col h-full">
      <TransitionLink href={`/article/${article.slug}`} className="block overflow-hidden relative aspect-[3/2] w-full bg-[var(--news-grey-100)] mb-4">
        {article.featuredImage || article.coverImage ? (
          <Image
            src={resolveMediaUrl(article.featuredImage?.url || article.coverImage)}
            alt={getLocalizedText(article.featuredImage?.alt, language) || getLocalizedText(article.title, language)}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--news-grey-100)]">
             <span className="text-2xl text-[var(--news-grey-300)] font-serif italic opacity-50">NewsOS</span>
          </div>
        )}
      </TransitionLink>

      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--news-red-700)] mb-2 font-sans">
             {article.isBreaking && (
                <span className="bg-[var(--news-red-700)] text-white px-1.5 py-0.5">
                  Live
                </span>
             )}
             <span>{categoryName}</span>
        </div>

        <TransitionLink href={`/article/${article.slug}`} className="group-hover:text-[var(--news-red-700)] transition-colors mb-2">
          <h3 className="text-xl font-bold text-[var(--news-grey-900)] font-serif leading-snug">
            {getLocalizedText(article.title, language)}
          </h3>
        </TransitionLink>

        <p className="text-[var(--news-grey-600)] text-sm leading-relaxed line-clamp-3 mb-4 font-serif flex-grow">
           {getLocalizedText(article.excerpt, language)}
        </p>

        <div className="flex items-center gap-2 text-[10px] text-[var(--news-grey-400)] font-sans font-bold uppercase tracking-wide mt-auto">
            <span>{article.publishedAt ? formatDate(article.publishedAt) : 'Just Now'}</span>
        </div>
      </div>
    </article>
  );
}
