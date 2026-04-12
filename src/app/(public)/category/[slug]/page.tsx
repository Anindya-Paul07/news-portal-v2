'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Clock } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { ArticleCard } from '@/components/news/ArticleCard';
import { TransitionLink } from '@/components/navigation/TransitionLink';
import { useCategory, useCategoryArticles } from '@/hooks/api-hooks';
import { handleApiError } from '@/lib/query-config';
import { type Article } from '@/lib/types';
import { formatDate, getLocalizedText, resolveMediaUrl } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const { language } = useLanguage();
  const { data: category, isLoading: isCategoryLoading, isError: isCategoryError, error: categoryError } = useCategory(slug);
  const { data: articles, isLoading: isArticlesLoading, isError: isArticlesError, error: articlesError } = useCategoryArticles(slug, {
    limit: 15,
    sort: '-publishedAt',
    status: 'published',
  });

  const categoryName = category?.name ? getLocalizedText(category.name, language) : slug;
  const categoryDescription = category?.description ? getLocalizedText(category.description, language) : '';
  const articlesList = articles ?? [];
  const leadStory = articlesList[0];
  const sideStories = articlesList.slice(1, 4);
  const feedStories = articlesList.slice(4);

  if (isCategoryLoading || isArticlesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--news-page)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--news-red-700)] border-t-transparent" />
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--news-soft)]">Loading category</p>
        </div>
      </div>
    );
  }

  if (!category && !isCategoryLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--news-page)] px-4">
        <div className="max-w-lg border border-[var(--news-grid)] bg-white p-8 text-center">
          <p className="news-meta text-[var(--news-red-700)]">Category</p>
          <h1 className="mt-3 [font-family:var(--font-serif)] text-4xl font-bold text-[var(--news-ink)]">
            {isCategoryError || isArticlesError ? 'Unable to load section' : 'Category not found'}
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--news-muted)]">
            {isCategoryError || isArticlesError
              ? handleApiError(categoryError || articlesError)
              : 'The section you requested is unavailable or has moved.'}
          </p>
          <TransitionLink
            href="/"
            className="mt-6 inline-flex items-center justify-center bg-[var(--news-red-700)] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[var(--news-red-hover)]"
          >
            Return home
          </TransitionLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--news-page)]">
      <div className="border-b border-[var(--news-grid)] bg-[var(--news-paper)]">
        <div className="mx-auto max-w-[1440px] px-4 py-10 md:py-14">
          <p className="news-meta text-[var(--news-red-700)]">Section</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <h1 className="[font-family:var(--font-serif)] text-4xl font-bold leading-none tracking-[-0.04em] text-[var(--news-ink)] md:text-6xl">
                {categoryName}
              </h1>
              {categoryDescription ? (
                <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--news-muted)] md:text-lg">
                  {categoryDescription}
                </p>
              ) : null}
            </div>
            <p className="max-w-sm text-sm leading-6 text-[var(--news-soft)]">
              {language === 'bn'
                ? 'প্রধান প্রতিবেদন, দ্রুত আপডেট এবং গভীর বিশ্লেষণ একই নিউজরুম গ্রিডে সাজানো।'
                : 'Lead coverage, rapid updates, and secondary reads arranged in the same newsroom grid as the homepage.'}
            </p>
          </div>
          <div className="mt-8">
            <AdSlot slot="category_top_banner" page="category" categoryId={category?.id} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 md:py-10">
        {articlesList.length === 0 ? (
          <div className="border border-[var(--news-grid)] bg-white px-6 py-16 text-center">
            <p className="news-meta text-[var(--news-red-700)]">{categoryName}</p>
            <h2 className="mt-3 [font-family:var(--font-serif)] text-3xl font-bold text-[var(--news-ink)]">
              No stories yet
            </h2>
            <p className="mt-4 text-[var(--news-muted)]">This section does not have published articles at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_380px]">
            <div>
              {leadStory ? <CategoryLead article={leadStory} categoryName={categoryName} /> : null}

              {feedStories.length > 0 ? (
                <div className="mt-8 border-t border-[var(--news-grid)] pt-8">
                  <div className="mb-5 flex items-center justify-between border-b border-[var(--news-grid)] pb-2">
                    <h2 className="news-section-title">{language === 'bn' ? 'সর্বশেষ' : 'Latest in section'}</h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {feedStories.map((article) => (
                      <ArticleCard key={article.id} article={article} className="border border-[var(--news-grid)] bg-white p-4" />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="space-y-6">
              <div className="border border-[var(--news-grid)] bg-white p-5">
                <h2 className="news-section-title border-b border-[var(--news-grid)] pb-2">
                  {language === 'bn' ? 'শীর্ষ প্রতিবেদন' : 'Top stories'}
                </h2>
                <div className="mt-3">
                  {sideStories.map((article) => (
                    <CategoryBrief key={article.id} article={article} categoryName={categoryName} />
                  ))}
                </div>
              </div>

              <div className="border border-[var(--news-grid)] bg-[var(--news-paper)] p-4">
                <AdSlot slot="category_sidebar_tall" page="category" categoryId={category?.id} />
              </div>

              <div className="bg-[var(--news-black)] p-6 text-white">
                <p className="news-meta text-[#f0c2c2]">The Red Wire</p>
                <h3 className="mt-3 [font-family:var(--font-serif)] text-3xl font-bold leading-tight">
                  Daily reporting with a cleaner editorial rhythm.
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/68">
                  Subscribe for essential reporting, sharper hierarchy, and fewer distractions.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/38 focus:border-[var(--news-red-500)] focus:outline-none"
                  />
                  <button className="bg-[var(--news-red-700)] px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[var(--news-red-hover)]">
                    Subscribe
                  </button>
                </div>
              </div>

              <div className="border border-[var(--news-grid)] bg-white p-4">
                <AdSlot slot="category_sidebar_tall" page="category" categoryId={category?.id} />
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryLead({ article, categoryName }: { article: Article; categoryName: string }) {
  const { language } = useLanguage();
  const title = getLocalizedText(article.title, language);
  const excerpt = getLocalizedText(article.excerpt, language);
  const imageUrl = resolveMediaUrl(article.featuredImage?.url || article.coverImage);
  const imageAlt = getLocalizedText(article.featuredImage?.alt, language) || title;

  return (
    <article className="border-b border-[var(--news-grid)] pb-8">
      <TransitionLink href={`/article/${article.slug || article.id}`} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--news-gray-100)]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,var(--news-red-900),var(--news-black))]" />
          )}
        </div>
        <div className="pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="news-kicker bg-[var(--news-red-700)] text-white">{categoryName}</span>
            {article.isBreaking ? <span className="news-meta text-[var(--news-red-700)]">Breaking</span> : null}
          </div>
          <h2 className="mt-4 [font-family:var(--font-serif)] text-3xl font-bold leading-tight text-[var(--news-ink)] md:text-5xl">
            {title}
          </h2>
          {excerpt ? <div className="mt-4 max-w-3xl text-base leading-7 text-[var(--news-muted)] [&>p]:m-0" dangerouslySetInnerHTML={{ __html: excerpt }} /> : null}
          <div className="mt-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--news-soft)]">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {article.publishedAt ? formatDate(article.publishedAt, language) : 'Recent'}
            </span>
            {article.author?.name ? <span>{article.author.name}</span> : null}
          </div>
        </div>
      </TransitionLink>
    </article>
  );
}

function CategoryBrief({ article, categoryName }: { article: Article; categoryName: string }) {
  const { language } = useLanguage();
  return (
    <TransitionLink
      href={`/article/${article.slug || article.id}`}
      className="group block border-b border-[var(--news-grid)] py-4 last:border-b-0 last:pb-0 first:pt-1"
    >
      <p className="news-meta text-[var(--news-red-700)]">{categoryName}</p>
      <h3 className="mt-2 [font-family:var(--font-serif)] text-xl font-bold leading-tight text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
        {getLocalizedText(article.title, language)}
      </h3>
      <div 
        className="mt-3 text-sm leading-6 text-[var(--news-muted)] line-clamp-2 [&>p]:m-0"
        dangerouslySetInnerHTML={{ __html: getLocalizedText(article.excerpt, language) || '' }}
      />
      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--news-soft)]">
        {article.publishedAt ? formatDate(article.publishedAt, language) : 'Recent'}
      </p>
    </TransitionLink>
  );
}
