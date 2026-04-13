'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { A11y, Keyboard, Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper/types';
import ReactPlayer from 'react-player';

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
    const origin = typeof window === 'undefined' ? '' : `&origin=${encodeURIComponent(window.location.origin)}`;
    return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1&controls=0&enablejsapi=1${origin}`;
  }

  if (short.videoUrl.includes('facebook.com')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(short.videoUrl)}&show_text=false`;
  }

  return short.videoUrl;
};

const isFacebookUrl = (url?: string) => Boolean(url && /facebook\.com/i.test(url));
const isYouTubeUrl = (url?: string) => Boolean(url && getYouTubeId(url));
const canUseReactPlayer = (short: FbShort) => Boolean(short.videoUrl && !isFacebookUrl(short.videoUrl) && !isYouTubeUrl(short.videoUrl));
const shouldCropYouTubeEmbed = (short: FbShort) => isYouTubeUrl(short.videoUrl) || isYouTubeUrl(short.embedUrl);

const formatViews = (views?: number) => {
  if (!views) return undefined;
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(views);
};

export function FbShortsRail({
  items,
  headline = 'Shorts',
  strapline = 'Fast vertical video from the newsroom',
}: FbShortsRailProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);
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
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  const viewerIndex = activeIndex === null ? null : Math.min(activeIndex, normalized.length - 1);
  const goToPrevious = () => swiperRef.current?.slidePrev();
  const goToNext = () => swiperRef.current?.slideNext();

  if (!normalized.length) return null;

  const viewer =
    viewerIndex !== null && typeof document !== 'undefined'
      ? createPortal(
        <div className="fixed inset-0 z-[2147483647] bg-black text-white">
          {normalized[viewerIndex]?.thumbnailUrl ? (
            <img
              src={normalized[viewerIndex].thumbnailUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-40 blur-2xl md:block"
            />
          ) : null}
          <div className="absolute inset-0 hidden bg-black/58 md:block" />

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/62 to-transparent px-4 pb-12 pt-[max(1rem,env(safe-area-inset-top))] md:px-6">
            <div className="flex items-start justify-end">
              <IconButton
                aria-label="Close shorts viewer"
                className="pointer-events-auto"
                onClick={() => setActiveIndex(null)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </div>
          </div>

          <Swiper
            direction="vertical"
            initialSlide={viewerIndex}
            keyboard={{ enabled: true }}
            modules={[A11y, Keyboard, Mousewheel]}
            mousewheel={{ forceToAxis: true, releaseOnEdges: true, sensitivity: 0.72 }}
            resistanceRatio={0.72}
            slidesPerView={1}
            speed={420}
            className="h-dvh w-full"
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setActiveIndex(swiper.activeIndex);
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          >
            {normalized.map((short, index) => (
              <SwiperSlide
                key={short.id}
                className="!flex h-dvh items-center justify-center overflow-hidden bg-transparent md:px-8 md:py-[max(4.75rem,env(safe-area-inset-top))] md:pb-[max(4.75rem,env(safe-area-inset-bottom))]"
              >
                <div className="relative flex h-full w-full items-center justify-center">
                  <div className="relative h-dvh w-screen overflow-hidden bg-black md:h-[min(760px,calc(100dvh-9.5rem))] md:w-[min(430px,calc((100dvh-9.5rem)*0.5625))] md:rounded-[8px] md:shadow-[0_24px_80px_rgba(0,0,0,0.7)] md:ring-1 md:ring-white/12">
                    {Math.abs(index - viewerIndex) <= 1 && canUseReactPlayer(short) ? (
                      <ReactPlayer
                        src={short.videoUrl}
                        controls
                        playing={index === viewerIndex}
                        playsInline
                        width="100%"
                        height="100%"
                        style={{ backgroundColor: '#000' }}
                      />
                    ) : Math.abs(index - viewerIndex) <= 1 && short.embedSrc ? (
                      <div className="absolute inset-0 overflow-hidden bg-black">
                        <iframe
                          title={short.title}
                          src={short.embedSrc}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading={index === viewerIndex ? 'eager' : 'lazy'}
                          className={
                            shouldCropYouTubeEmbed(short)
                              ? 'absolute left-1/2 top-1/2 h-full w-[316.05%] -translate-x-1/2 -translate-y-1/2 border-0'
                              : 'h-full w-full border-0'
                          }
                        />
                      </div>
                    ) : short.thumbnailUrl ? (
                      <img src={short.thumbnailUrl} alt={short.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(180deg,#2c1618,#060606)]" />
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/88 via-black/42 to-transparent px-4 pb-4 pt-24 md:px-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase text-white/76">
                        <span className="rounded-[6px] bg-[#d51d29] px-2 py-1">
                          {index + 1} / {normalized.length}
                        </span>
                        {short.duration ? <span>{short.duration}</span> : null}
                        {formatViews(short.views) ? <span>{formatViews(short.views)} views</span> : null}
                      </div>
                      <h3 className="line-clamp-2 text-xl font-extrabold leading-tight text-white md:text-2xl">
                        {short.title}
                      </h3>
                      {short.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/74">{short.description}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="pointer-events-none absolute inset-y-0 right-3 z-20 hidden items-center md:flex">
            <div className="pointer-events-auto flex flex-col gap-3">
              <IconButton
                aria-label="Previous short"
                disabled={viewerIndex <= 0}
                onClick={goToPrevious}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-disabled': { color: 'rgba(255,255,255,0.25)' },
                }}
              >
                <KeyboardArrowUpRoundedIcon />
              </IconButton>
              <IconButton
                aria-label="Next short"
                disabled={viewerIndex >= normalized.length - 1}
                onClick={goToNext}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-disabled': { color: 'rgba(255,255,255,0.25)' },
                }}
              >
                <KeyboardArrowDownRoundedIcon />
              </IconButton>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center bg-gradient-to-t from-black/78 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-12 md:hidden">
            <div className="rounded-[8px] bg-white/12 px-3 py-1.5 text-xs font-bold text-white/76 backdrop-blur">
              Swipe for more
            </div>
          </div>
        </div>,
        document.body,
      )
      : null;

  return (
    <>
      <section className="overflow-hidden bg-[#101010] text-white">
        <div className="flex items-start justify-between gap-4 px-4 pb-3 pt-5 md:px-6">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#d51d29]">
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
          <div className="flex min-w-max gap-4 md:gap-5">
            {normalized.map((short, index) => (
              <button
                key={short.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group w-[235px] text-left outline-none sm:w-[270px] md:w-[310px]"
              >
                <div className="relative overflow-hidden rounded-[8px] bg-[#1a1a1a]">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/12 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                      <div className="mb-2 inline-flex items-center rounded-[6px] bg-black/60 px-2.5 py-1 text-[11px] font-bold uppercase text-white/88">
                        {short.duration || 'Short'}
                      </div>
                      <h3 className="line-clamp-2 text-base font-extrabold leading-tight text-white md:text-lg">
                        {short.title}
                      </h3>
                    </div>
                    <span className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/20">
                      <PlayArrowRoundedIcon sx={{ fontSize: 22 }} />
                    </span>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3 px-1 pb-1 pt-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white/62">
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
      {viewer}
    </>
  );
}
