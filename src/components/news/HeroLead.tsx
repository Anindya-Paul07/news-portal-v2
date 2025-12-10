import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';
import { formatDate, getLocalizedText } from '@/lib/utils';

export function HeroLead({ article }: { article: Article }) {
  const { language } = useLanguage();
  if (!article) return null;
  const title = getLocalizedText(article.title, language);
  const summary = getLocalizedText(article.excerpt, language);
  const imageUrl = article.featuredImage?.url || article.coverImage;
  const imageAlt = getLocalizedText(article.featuredImage?.alt, language) || title;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-[var(--color-hero-border,#e0bba8)] bg-[var(--color-hero-surface)] shadow-[0_20px_48px_rgba(27,23,22,0.18)]"
      style={{ backgroundImage: 'var(--gradient-hero)' }}
    >
      <div className="grid gap-6 p-6 md:grid-cols-2 md:items-center lg:p-10">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-[var(--color-hero-chip-bg,#c53727)] px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-hero-chip-text,#ffede6)]">
            Lead story
          </p>
          <Link href={`/article/${article.slug}`}>
            <h1 className="headline text-3xl font-extrabold leading-tight text-[var(--color-card-heading)] md:text-4xl">
              {title}
            </h1>
          </Link>
          {summary && <p className="text-lg leading-relaxed text-[var(--color-hero-summary,#6e5245)]">{summary}</p>}
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-hero-meta,#6e5245)]">
            <span>{article.author?.name || 'Staff Desk'}</span>
            {article.publishedAt && <span>• {formatDate(article.publishedAt)}</span>}
            {article.readingTime && <span>• {article.readingTime} min read</span>}
          </div>
          <Link
            href={`/article/${article.slug}`}
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-hero-cta-bg,#233554)] px-6 py-2 text-sm font-semibold text-[var(--color-hero-cta-text,#ffede6)] transition hover:opacity-90"
          >
            Read full story
          </Link>
        </div>
        <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-[var(--color-panel-bg)] sm:h-80">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
              Image coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
