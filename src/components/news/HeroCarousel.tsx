'use client';

import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Article } from '@/lib/types';
import { HeroLead } from '@/components/news/HeroLead';

type HeroCarouselProps = {
  articles: Article[];
  intervalMs?: number;
};

export function HeroCarousel({ articles, intervalMs = 8000 }: HeroCarouselProps) {
  const slides = useMemo(() => articles.filter(Boolean), [articles]);
  const [index, setIndex] = useState(0);
  const theme = useTheme();

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
    <Box position="relative" overflow="hidden" sx={{ borderRadius: 3, boxShadow: theme.shadows[5] }}>
      <Box
        sx={{
          display: 'flex',
          transition: 'transform 500ms ease-out',
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {slides.map((article) => (
          <Box key={article.id} sx={{ flex: '0 0 100%' }}>
            <HeroLead article={article} />
          </Box>
        ))}
      </Box>
      {slides.length > 1 && (
        <>
          <Box
            sx={{
              pointerEvents: 'none',
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1,
            }}
          >
            <IconButton
              aria-label="Previous slide"
              onClick={() => goTo('prev')}
              sx={{
                pointerEvents: 'auto',
                bgcolor: alpha(theme.palette.primary.dark, 0.75),
                color: theme.palette.primary.contrastText,
                '&:hover': { bgcolor: alpha(theme.palette.primary.dark, 0.95) },
                boxShadow: theme.shadows[3],
              }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
            <IconButton
              aria-label="Next slide"
              onClick={() => goTo('next')}
              sx={{
                pointerEvents: 'auto',
                bgcolor: alpha(theme.palette.primary.dark, 0.75),
                color: theme.palette.primary.contrastText,
                '&:hover': { bgcolor: alpha(theme.palette.primary.dark, 0.95) },
                boxShadow: theme.shadows[3],
              }}
            >
              <ArrowForwardRoundedIcon />
            </IconButton>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ position: 'absolute', bottom: 16, left: 0, right: 0 }}
          >
            {slides.map((_, dotIndex) => (
              <IconButton
                key={`dot-${dotIndex}`}
                size="small"
                aria-label={`Go to slide ${dotIndex + 1}`}
                onClick={() => setIndex(dotIndex)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: `1px solid ${theme.palette.primary.contrastText}`,
                  bgcolor:
                    dotIndex === index
                      ? theme.palette.primary.contrastText
                      : 'transparent',
                  opacity: dotIndex === index ? 1 : 0.65,
                  '&:hover': {
                    bgcolor: theme.palette.primary.contrastText,
                    opacity: 1,
                  },
                }}
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
