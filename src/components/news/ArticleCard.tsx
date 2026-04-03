'use client';

import Image from 'next/image';
import { Article } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';
import { formatDate, getLocalizedText, resolveMediaUrl } from '@/lib/utils';
import { TransitionLink } from '@/components/navigation/TransitionLink';
import { Clock } from 'lucide-react';

export function ArticleCard({ article, className = '' }: { article: Article; className?: string }) {
  const { language } = useLanguage();
  const categoryLabel = getLocalizedText(article.category?.name, language) || 'News';
  const title = getLocalizedText(article.title, language);
  const summary = getLocalizedText(article.excerpt, language);
  const imageUrl = resolveMediaUrl(article.featuredImage?.url || article.coverImage);
  const imageAlt = getLocalizedText(article.featuredImage?.alt, language) || title;

  return (
    <article className={`group flex flex-col h-full bg-white md:hover:-translate-y-1 transition-transform duration-300 ${className}`}>
      {/* Image Container */}
      <TransitionLink 
        href={`/article/${article.slug || article.id}`}
        className="block relative aspect-[4/3] w-full overflow-hidden bg-gray-100"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="font-serif italic text-2xl">NewsOS</span>
          </div>
        )}
        
        {/* Overlays */}
        {(article.isBreaking || article.isTrending) && (
          <div className="absolute top-3 left-3 flex gap-2">
            {article.isBreaking && (
              <span className="bg-[var(--news-red-700)] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 shadow-sm animate-pulse">
                Breaking
              </span>
            )}
            {article.isTrending && (
              <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 shadow-sm">
                Trending
              </span>
            )}
          </div>
        )}
      </TransitionLink>

      {/* Content */}
      <div className="flex flex-col flex-grow py-4">
        {/* Category */}
        <div className="mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--news-red-700)]">
            {categoryLabel}
          </span>
        </div>

        {/* Title */}
        <TransitionLink 
          href={`/article/${article.slug || article.id}`} 
          className="mb-3 block group-hover:text-[var(--news-red-700)] transition-colors"
        >
          <h3 className="font-serif text-xl font-bold text-gray-900 leading-snug line-clamp-3">
            {title}
          </h3>
        </TransitionLink>

        {/* Excerpt */}
        {summary && (
          <p className="font-serif text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-grow">
            {summary}
          </p>
        )}

        {/* Footer / Meta */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
             <span className="flex items-center gap-1">
               <Clock className="w-3 h-3" />
               {article.publishedAt ? formatDate(article.publishedAt) : 'Recent'}
             </span>
          </div>
          {article.readingTime && (
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
              {article.readingTime} min read
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
