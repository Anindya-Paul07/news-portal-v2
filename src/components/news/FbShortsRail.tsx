'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

export type FbShort = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  embedUrl?: string;
  duration?: string;
  postedAt?: string;
  views?: number;
};

type FbShortsRailProps = {
  items: FbShort[];
  variant?: 'default' | 'compact';
};

const buildEmbedUrl = (short: FbShort) => {
  if (short.embedUrl) return short.embedUrl;
  if (short.videoUrl) {
    const base = 'https://www.facebook.com/plugins/video.php';
    return `${base}?href=${encodeURIComponent(short.videoUrl)}&show_text=false`;
  }
  return undefined;
};

export function FbShortsRail({ items, variant = 'default' }: FbShortsRailProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const theme = useTheme();
  const cardWidth = variant === 'compact' ? 190 : 220;

  const activeShort = items[activeIndex];
  const embedSrc = activeShort ? buildEmbedUrl(activeShort) : undefined;

  const updateScrollMeta = () => {
    const node = scrollRef.current;
    if (!node) return;
    setAtStart(node.scrollLeft <= 12);
    setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 12);
  };

  useEffect(() => {
    updateScrollMeta();
    const node = scrollRef.current;
    if (!node) return;
    node.addEventListener('scroll', updateScrollMeta, { passive: true });
    return () => node.removeEventListener('scroll', updateScrollMeta);
  }, [items.length]);

  const scroll = (direction: 'prev' | 'next') => {
    const node = scrollRef.current;
    if (!node) return;
    const delta = direction === 'next' ? cardWidth * 2 : -cardWidth * 2;
    node.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handleOpen = (index: number) => {
    setActiveIndex(index);
    setViewerOpen(true);
  };

  if (!items.length) return null;

  const skeletonImage = 'linear-gradient(120deg, rgba(0,0,0,0.45), rgba(0,0,0,0.25))';

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          borderRadius: variant === 'compact' ? 2 : 3,
          p: { xs: 2, md: variant === 'compact' ? 2 : 3 },
          boxShadow: theme.shadows[3],
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack spacing={0.5}>
              <Typography variant="overline" sx={{ letterSpacing: 3, color: 'text.secondary' }}>
                Shorts
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Latest from the newsroom
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <IconButton
                aria-label="Previous short"
                disabled={atStart}
                onClick={() => scroll('prev')}
                size="small"
                sx={{ border: `1px solid ${theme.palette.divider}` }}
              >
                <ChevronLeftRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Next short"
                disabled={atEnd}
                onClick={() => scroll('next')}
                size="small"
                sx={{ border: `1px solid ${theme.palette.divider}` }}
              >
                <ChevronRightRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          <Box
            ref={scrollRef}
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {items.map((short, index) => {
              const isActive = index === activeIndex;
              return (
                <Box
                  key={short.id}
                  component="button"
                  type="button"
                  onClick={() => handleOpen(index)}
                  sx={{
                    minWidth: cardWidth,
                    border: 0,
                    padding: 0,
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    scrollSnapAlign: 'start',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: 3,
                      overflow: 'hidden',
                      height: variant === 'compact' ? 240 : 280,
                      boxShadow: isActive ? theme.shadows[5] : theme.shadows[2],
                      transition: 'transform 150ms ease, box-shadow 150ms ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: theme.shadows[6],
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: short.thumbnailUrl
                          ? `url(${short.thumbnailUrl})`
                          : skeletonImage,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.85)',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.8) 100%)',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        p: 2,
                        gap: 0.75,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {short.title}
                      </Typography>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ fontSize: 12, textTransform: 'uppercase' }}>
                        {short.duration && (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <PlayArrowRoundedIcon fontSize="inherit" />
                            <Typography variant="caption" color="inherit">
                              {short.duration}
                            </Typography>
                          </Stack>
                        )}
                        {short.postedAt && (
                          <Typography variant="caption" color="inherit">
                            {short.postedAt}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Stack>
      </Card>

      <Dialog fullWidth maxWidth="md" open={viewerOpen} onClose={() => setViewerOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {activeShort?.title || 'Short'}
          </Typography>
          <IconButton aria-label="Close" onClick={() => setViewerOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {embedSrc ? (
            <Box
              component="iframe"
              title={activeShort?.title}
              src={embedSrc}
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
              sx={{
                width: '100%',
                minHeight: 420,
                border: 0,
                borderRadius: 2,
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Add a Facebook video or embed URL to play this short.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
