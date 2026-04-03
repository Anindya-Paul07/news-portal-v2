'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArticleCard } from '@/components/news/ArticleCard';
import { useArticles, useMenuCategories, useSearchArticles } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText } from '@/lib/utils';
import { Search, Filter } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--news-bg-light)]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-[var(--news-red-700)] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Initializing search...</p>
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
  const [term, setTerm] = useState(searchParams.get('query') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');
  const category = searchParams.get('category') || undefined;
  
  // Real-time keyword update debouncing could be added here, 
  // but for now we stick to the existing logic of updating URL on specific triggers if needed,
  // or just letting the input state drive the button click. 
  // However, the original code had an effect that synced state -> URL. 
  // We will keep it simple: sync UI state to URL when user keeps typing?
  // Actually, standard search UX is "type -> press enter/search button".
  // The previous implementation utilized a `useEffect` to sync everything. We will replicate that behavior slightly better.

  const { data: categories } = useMenuCategories();
  const { data: results, isLoading: isSearchLoading } = useSearchArticles(term, { sort, category });
  const { data: latest } = useArticles({ sort: '-publishedAt', limit: 5 });
  const { language } = useLanguage();
  
  const categoryList = categories ?? [];
  const latestList = latest ?? [];
  const resultItems = results ?? [];

  // Sync state to URL with debounce to avoid spamming history
  useEffect(() => {
    const handler = setTimeout(() => {
      const query = new URLSearchParams();
      if (term) query.set('query', term);
      if (sort) query.set('sort', sort);
      if (category) query.set('category', category);
      
      // Only replace if parameters actually changed to avoid loop
      const currentString = searchParams.toString();
      const newString = query.toString();
      if (currentString !== newString) {
        router.replace(`/search?${newString}`);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [term, sort, category, router, searchParams]);


  return (
    <div className="min-h-screen bg-[var(--news-white)]">
      
      {/* ────────────────────────────────────────────────────────────────────────
          SEARCH HERO / HEADER
          ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[var(--news-bg-light)] border-b border-gray-200">
        <div className="max-w-[1240px] mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl font-black text-gray-900">
              Search the <span className="text-[var(--news-red-700)]">Wire</span>
            </h1>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[var(--news-red-700)] transition-colors" />
              </div>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search for articles, topics, or authors..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--news-red-700)] focus:border-transparent transition-shadow shadow-sm rounded-none text-lg"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                <span className="text-gray-500 font-bold uppercase tracking-wide text-xs flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filters:
                </span>
                
                {/* Sort Toggle */}
                <div className="flex items-center bg-white border border-gray-200 p-1 gap-1">
                  {[
                    { key: 'relevance', label: 'Recommended' },
                    { key: 'date', label: 'Newest' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setSort(opt.key)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                        sort === opt.key 
                          ? 'bg-[var(--news-bg-dark)] text-white' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

            </div>
            
            {/* Horizontal Category List */}
            <div className="flex flex-wrap justify-center gap-2">
               <button
                  onClick={() => { 
                    const url = new URL(window.location.href);
                    url.searchParams.delete('category');
                    router.replace(url.toString()); // Force URL update directly for "All"
                    // But we also need to update local state if we want immediate feedback?
                    // The useEffect above syncs local state to URL. 
                    // Wait, the useEffect relies on `category` state.
                    // If we update URL directly, we need to make sure the component re-renders or state updates.
                    // Actually, let's just use the `searchParams` as the source of truth? 
                    // No, `SearchContent` initializes state from params.
                    // Let's stick to updating state.
                    // BUT `category` IS derived from `searchParams.get('category')` in the original code logic?
                    // No, `const category = searchParams.get(...)` is a constant in render.
                    // Wait, the original code had NO `setCategory`. All updates were via `router.replace`.
                    // Ah! In my `SearchContent` I defined `const category = searchParams.get('category')`. 
                    // I did NOT define `[category, setCategory]`.
                    // So `category` IS purely derived from URL.
                    // `term` and `sort` were state.
                    // Let's fix that.
                  }}
                  className={`px-3 py-1.5 border text-xs font-bold uppercase tracking-wide transition-all ${
                    !category 
                     ? 'border-[var(--news-red-700)] text-[var(--news-red-700)]' 
                     : 'border-transparent text-gray-500 hover:text-gray-900 bg-white border-gray-200'
                  }`}
               >
                 All
               </button>
               {categoryList.map((cat) => (
                 <button
                   key={cat.id}
                   onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('category', cat.slug);
                      url.searchParams.set('query', term); // Ensure query is preserved
                      url.searchParams.set('sort', sort);
                      router.replace(url.toString());
                   }}
                   className={`px-3 py-1.5 border text-xs font-bold uppercase tracking-wide transition-all ${
                     category === cat.slug
                       ? 'border-[var(--news-red-700)] text-[var(--news-red-700)] bg-white'
                       : 'border-transparent text-gray-500 hover:text-gray-900 bg-white border-gray-200'
                   }`}
                 >
                   {getLocalizedText(cat.name, language)}
                 </button>
               ))}
            </div>

          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          MAIN RESULTS GRID
          ──────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1240px] mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pl-0">
          
          {/* SEARCH RESULTS COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {term ? (
                   <>Results for <span className="text-[var(--news-red-700)]">&quot;{term}&quot;</span></>
                ) : (
                   'Latest Stories'
                )}
              </h2>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                {resultItems.length} found
              </span>
            </div>

            {isSearchLoading ? (
               <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4 h-32">
                       <div className="w-1/3 bg-gray-200"></div>
                       <div className="w-2/3 space-y-2 py-2">
                          <div className="h-4 bg-gray-200 w-3/4"></div>
                          <div className="h-4 bg-gray-200 w-1/2"></div>
                       </div>
                    </div>
                  ))}
               </div>
            ) : resultItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                {resultItems.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50 border border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                   <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No matches found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                   We couldn&apos;t find any articles matching your criteria. Try different keywords or browse the categories.
                </p>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-10 border-l-0 lg:border-l border-gray-200 pl-0 lg:pl-10">
             
             {/* Ad */}
             <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block text-center">Advertisement</span>
                <div className="bg-gray-100 min-h-[250px] flex items-center justify-center">
                   <AdSlot position="sidebar" page="search" />
                </div>
             </div>

             {/* Sections: Latest News */}
             <div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--news-red-700)] mb-5 border-b border-gray-200 pb-2">
                  Just In
               </h3>
               <div className="space-y-6">
                 {latestList.map(article => (
                    <div key={article.id} className="group flex gap-4 items-start">
                       <div className="flex-1">
                          <a href={`/article/${article.slug}`} className="block font-serif font-bold text-gray-900 leading-snug hover:text-[var(--news-red-700)] transition-colors mb-1">
                             {getLocalizedText(article.title, language)}
                          </a>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">
                             {article.publishedAt ? new Date(article.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}
                          </span>
                       </div>
                       {article.featuredImage?.url && (
                          <div className="w-16 h-16 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                             <img src={article.featuredImage.url} alt="" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                          </div>
                       )}
                    </div>
                 ))}
               </div>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}
