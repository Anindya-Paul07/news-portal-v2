'use client';

import { useState } from 'react';
import Image from 'next/image';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { TransitionLink } from '@/components/navigation/TransitionLink';

export type FbShort = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  embedUrl?: string;
  description?: string;
  isActive?: boolean;
  duration?: string;
  postedAt?: string;
  views?: number;
};

type FbShortsRailProps = {
  items: FbShort[];
  headline?: string;
  strapline?: string;
};

export const getYouTubeId = (url?: string) => {
  if (!url) return undefined;
  const patterns = [
    /youtu\.be\/([^?&/]+)/,
    /youtube\.com\/shorts\/([^?&/]+)/,
    /youtube\.com\/watch\?v=([^?&/]+)/,
    /youtube\.com\/embed\/([^?&/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return undefined;
};

export const getYouTubeThumbnail = (item: FbShort) => {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  const youtubeId = getYouTubeId(item.videoUrl || item.embedUrl);
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : undefined;
};

export const getYouTubeEmbedUrl = (item: FbShort) => {
  if (item.embedUrl) return item.embedUrl;
  const youtubeId = getYouTubeId(item.videoUrl);
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`;
  return item.videoUrl;
};

function VideoImage({ item, priority = false }: { item: FbShort; priority?: boolean }) {
  const thumbnail = getYouTubeThumbnail(item);

  if (!thumbnail) {
    return <div className="h-full w-full bg-[linear-gradient(135deg,#5f161c,#15110f)]" />;
  }

  return (
    <Image
      src={thumbnail}
      alt={item.title}
      fill
      priority={priority}
      sizes="(min-width: 1280px) 760px, (min-width: 1024px) 64vw, 100vw"
      unoptimized
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
    />
  );
}

function PlayButton({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/82 text-[var(--news-red-700)] shadow-[0_10px_30px_rgba(0,0,0,0.22)] ring-1 ring-black/10 transition-transform group-hover:scale-105 ${
        large ? 'h-20 w-20 md:h-24 md:w-24' : 'h-12 w-12'
      }`}
    >
      <PlayArrowRoundedIcon sx={{ fontSize: large ? 52 : 30 }} />
    </span>
  );
}

function LeadVideoCard({ item }: { item: FbShort }) {
  return (
    <TransitionLink href={`/youtube-article/${item.id}`} className="group block">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[18px] bg-[var(--news-gray-200)]">
        <VideoImage item={item} priority />
        <div className="absolute inset-0 bg-black/8" />
        <PlayButton large />
      </div>
      <h3 className="mt-4 text-center [font-family:var(--font-serif)] text-2xl font-bold leading-tight text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)] md:text-3xl">
        {item.title}
      </h3>
    </TransitionLink>
  );
}

function SideVideoCard({ item }: { item: FbShort }) {
  return (
    <TransitionLink href={`/youtube-article/${item.id}`} className="group block">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] bg-[var(--news-gray-200)]">
        <VideoImage item={item} />
        <div className="absolute inset-0 bg-black/10" />
        <PlayButton />
      </div>
      <h3 className="mt-3 text-lg font-bold leading-snug text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
        {item.title}
      </h3>
    </TransitionLink>
  );
}

export function FbShortsRail({
  items,
  headline = 'YouTube articles',
  strapline,
}: FbShortsRailProps) {
  const [showMore, setShowMore] = useState(false);
  const normalized = items.filter((item) => item.isActive !== false).slice(0, 8);
  const [lead, ...rest] = normalized;
  const sideItems = showMore ? rest : rest.slice(0, 2);
  const hasMoreVideos = rest.length > 2;

  if (!lead) return null;

  return (
    <section className="bg-[var(--news-page)]">
      <div className="mb-5 flex items-center gap-3">
        <h2 className="shrink-0 text-xl font-extrabold leading-none text-[var(--news-mahogany)]">
          {headline}
        </h2>
        <div className="h-px flex-1 bg-[var(--news-ink)]" />
      </div>

      {strapline ? <p className="-mt-2 mb-5 max-w-2xl text-sm leading-6 text-[var(--news-muted)]">{strapline}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <LeadVideoCard item={lead} />
        <aside className="space-y-6 lg:border-l lg:border-[var(--news-grid)] lg:pl-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {sideItems.map((item) => (
              <SideVideoCard key={item.id} item={item} />
            ))}
          </div>
          {hasMoreVideos && !showMore ? (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="inline-flex w-full items-center justify-center border border-[var(--news-grid-strong)] bg-[var(--news-paper)] px-4 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--news-mahogany)] transition-colors hover:border-[var(--news-red-700)] hover:text-[var(--news-red-700)]"
            >
              More
            </button>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
