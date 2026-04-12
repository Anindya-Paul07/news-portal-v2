'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

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

const getYouTubeId = (url: string) => {
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

const buildEmbedUrl = (short: FbShort) => {
  if (short.embedUrl) return short.embedUrl;
  if (!short.videoUrl) return undefined;

  const youtubeId = getYouTubeId(short.videoUrl);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`;
  }

  if (short.videoUrl.includes('facebook.com')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(short.videoUrl)}&show_text=false`;
  }

  return short.videoUrl;
};

const formatViews = (views?: number) => {
  if (!views) return undefined;
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(views);
};

export function FbShortsRail({
  items,
  headline = 'Shorts',
  strapline = 'Fast vertical video from the newsroom',
}: FbShortsRailProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const normalized = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        embedSrc: buildEmbedUrl(item),
      })),
    [items],
  );

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        setActiveIndex((current) => (current === null ? 0 : Math.min(current + 1, normalized.length - 1)));
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        setActiveIndex((current) => (current === null ? 0 : Math.max(current - 1, 0)));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, normalized.length]);

  useEffect(() => {
    if (activeIndex === null || !overlayRef.current) return;
    const cardHeight = overlayRef.current.clientHeight;
    overlayRef.current.scrollTo({ top: cardHeight * activeIndex, behavior: 'smooth' });
  }, [activeIndex]);

  if (!normalized.length) return null;

  return (
    <>
      <section className="overflow-hidden bg-[#101010] text-white">
        <div className="flex items-start justify-between gap-4 px-4 pb-3 pt-5 md:px-6">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#ff174d]">
              <PlayArrowRoundedIcon sx={{ fontSize: 22, color: '#fff' }} />
            </span>
            <div>
              <h2 className="text-3xl font-bold leading-none text-white md:text-4xl">{headline}</h2>
              <p className="mt-1 text-sm text-white/60">{strapline}</p>
            </div>
          </div>
          <IconButton aria-label="More shorts actions" sx={{ color: '#fff' }}>
            <MoreVertRoundedIcon />
          </IconButton>
        </div>

        <div className="overflow-x-auto px-2 pb-4 md:px-4">
          <div className="flex min-w-max gap-5">
            {normalized.map((short, index) => (
              <button
                key={short.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group w-[320px] text-left outline-none sm:w-[340px]"
              >
                <div className="relative overflow-hidden rounded-[18px] bg-[#1a1a1a]">
                  <div className="relative aspect-[9/16]">
                    {short.thumbnailUrl ? (
                      <img
                        src={short.thumbnailUrl}
                        alt={short.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(180deg,#3c0e11,#111)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="mb-2 inline-flex items-center rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85">
                        {short.duration || 'Short'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3 px-1 pb-1 pt-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-[1.05rem] font-bold leading-[1.25] text-white">
                      {short.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/62">
                      {[short.postedAt, formatViews(short.views) ? `${formatViews(short.views)} views` : undefined]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  </div>
                  <IconButton aria-label="Short options" sx={{ color: 'rgba(255,255,255,0.88)', mt: -0.5 }}>
                    <MoreVertRoundedIcon />
                  </IconButton>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeIndex !== null ? (
        <div className="fixed inset-0 z-[1400] bg-black/92 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white md:px-6">
            <div>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.56)' }}>
                Shorts Viewer
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: '1.05rem', fontWeight: 700 }}>
                {normalized[activeIndex]?.title}
              </Typography>
            </div>
            <IconButton aria-label="Close shorts viewer" onClick={() => setActiveIndex(null)} sx={{ color: '#fff' }}>
              <CloseRoundedIcon />
            </IconButton>
          </div>

          <div
            ref={overlayRef}
            className="h-[calc(100vh-72px)] overflow-y-auto"
            style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
          >
            {normalized.map((short, index) => (
              <div
                key={short.id}
                className="flex min-h-[calc(100vh-72px)] items-center justify-center px-3 py-6 md:px-6"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="grid w-full max-w-[1180px] gap-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-center">
                  <div className="mx-auto w-full max-w-[420px]">
                    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_26px_80px_rgba(0,0,0,0.55)]">
                      <div className="aspect-[9/16] bg-black">
                        {short.embedSrc ? (
                          <iframe
                            title={short.title}
                            src={short.embedSrc}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            loading="lazy"
                            className="h-full w-full border-0"
                          />
                        ) : short.thumbnailUrl ? (
                          <img src={short.thumbnailUrl} alt={short.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-[linear-gradient(180deg,#3c0e11,#111)]" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <p className="news-meta text-[var(--news-red-300)]">Short-form coverage</p>
                    <h3 className="mt-3 [font-family:var(--font-serif)] text-5xl font-bold leading-tight text-white">
                      {short.title}
                    </h3>
                    <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
                      {short.description ||
                        'Open a short to view it in a portrait-first vertical viewer. This keeps the homepage shelf compact like YouTube Shorts, while still allowing a full-screen newsroom reel experience.'}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.16em] text-white/56">
                      <span>{index + 1} / {normalized.length}</span>
                      {short.duration ? <span>{short.duration}</span> : null}
                      {short.postedAt ? <span>{short.postedAt}</span> : null}
                      {formatViews(short.views) ? <span>{formatViews(short.views)} views</span> : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
