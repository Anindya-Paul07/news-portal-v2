'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useAds } from '@/hooks/api-hooks';
import { apiClient } from '@/lib/api-client';
import { sampleAds } from '@/lib/fallbacks';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText } from '@/lib/utils';

const slotSizes: Record<string, string> = {
  hero: 'h-48 md:h-56',
  banner: 'h-28',
  sidebar: 'h-72',
  in_content: 'h-52',
  popup: 'h-48',
};

export function AdSlot({ position, page }: { position: string; page?: string }) {
  const { data } = useAds(position, page);
  const fallbackAd = sampleAds.find((item) => item.position === position) || sampleAds[0];
  const ad = data?.[0] || fallbackAd;
  const adTitle = ad.title || ad.name || 'Sponsored placement';
  const { language } = useLanguage();
  const imageUrl = ad.image?.url || ad.imageUrl;
  const imageAlt = getLocalizedText(ad.image?.alt, language) || adTitle;

  useEffect(() => {
    if (!ad?.id) return;
    apiClient.post(`/advertisements/${ad.id}/impression`).catch(() => {});
  }, [ad?.id]);

  const sizeClass = slotSizes[position] || 'h-32';

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] ${sizeClass}`}>
      {imageUrl ? (
        <a
          href={ad.linkUrl || ad.targetUrl || '#'}
          target="_blank"
          rel="noreferrer"
          onClick={() => apiClient.post(`/advertisements/${ad.id}/click`).catch(() => {})}
        >
          <Image src={imageUrl} alt={imageAlt} fill className="object-cover" sizes="100vw" />
        </a>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-[var(--color-muted)]">
          <p>{adTitle}</p>
          <p className="rounded-full bg-[rgba(252,186,4,0.25)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
            Sponsored
          </p>
        </div>
      )}
      <div className="absolute left-3 top-3 rounded-full bg-[rgba(37,0,1,0.7)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
        Advertisement
      </div>
    </div>
  );
}
