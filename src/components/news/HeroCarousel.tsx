'use client';

import { useEffect, useMemo, useState } from 'react';
import { Article } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { HeroLead } from '@/components/news/HeroLead';
import { cn } from '@/lib/utils';

type HeroCarouselProps = {
  articles: Article[];
  intervalMs?: number;
};

export function HeroCarousel({ articles, intervalMs = 8000 }: HeroCarouselProps) {
  const slides = useMemo(() => articles.filter(Boolean), [articles]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  if (!slides.length) return null;

  const goTo = (direction: 'prev' | 'next') => {
    setIndex((prev) => {
      if (direction === 'next') return (prev + 1) % slides.length;
      return prev === 0 ? slides.length - 1 : prev - 1;
    });
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((article) => (
          <div key={article.id} className="w-full flex-shrink-0 flex-grow-0 px-0">
            <HeroLead article={article} />
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-y-0 flex w-full items-center justify-between px-4">
            <Button
              type="button"
              variant="subtle"
              className="pointer-events-auto rounded-full bg-[rgba(37,0,1,0.75)] text-[var(--color-header-text)] hover:bg-[rgba(37,0,1,0.95)]"
              aria-label="Previous slide"
              onClick={() => goTo('prev')}
            >
              ‹
            </Button>
            <Button
              type="button"
              variant="subtle"
              className="pointer-events-auto rounded-full bg-[rgba(37,0,1,0.75)] text-[var(--color-header-text)] hover:bg-[rgba(37,0,1,0.95)]"
              aria-label="Next slide"
              onClick={() => goTo('next')}
            >
              ›
            </Button>
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, dotIndex) => (
              <button
                key={`dot-${dotIndex}`}
                type="button"
                aria-label={`Go to slide ${dotIndex + 1}`}
                className={cn(
                  'h-2.5 w-2.5 rounded-full border border-[var(--color-header-text)] transition',
                  dotIndex === index ? 'bg-[var(--color-header-text)]' : 'bg-transparent opacity-60',
                )}
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
