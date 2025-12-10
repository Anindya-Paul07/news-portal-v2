import Link from 'next/link';
import { Article } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText } from '@/lib/utils';

export function BreakingTicker({ items }: { items: Article[] }) {
  const { language } = useLanguage();
  if (!items?.length) return null;
  const headlines = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: getLocalizedText(item.title, language),
  }));

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border-t-2 border-[var(--color-primary)] bg-[var(--color-breaker-bg)] px-4 py-3 text-sm text-[var(--color-breaker-text)] shadow-[0_12px_28px_rgba(35,53,84,0.25)]">
      <div className="rounded-full bg-[var(--color-breaker-label-bg)] px-3 py-1 text-xs font-black uppercase tracking-[0.3em] text-[var(--color-breaker-label-text)]">
        Breaking
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-marquee inline-flex items-center whitespace-nowrap">
          <div className="flex items-center gap-6 pr-6">
            {headlines.map((item) => (
              <Link key={`headline-${item.id}`} href={`/article/${item.slug}`} className="group flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-breaker-label-bg)]" />
                <span className="group-hover:text-[var(--color-accent)]">{item.title}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-6 pr-6" aria-hidden="true">
            {headlines.map((item) => (
              <Link key={`headline-ghost-${item.id}`} href={`/article/${item.slug}`} className="group flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-breaker-label-bg)]" />
                <span className="group-hover:text-[var(--color-accent)]">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
