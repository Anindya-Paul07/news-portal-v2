'use client';

import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { AdSlot } from '@/components/ads/AdSlot';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import { useLanguage } from '@/contexts/language-context';
import { Article } from '@/lib/types';
import { useBreakingTicker, useLatestArticles, useTrendingArticles } from '@/hooks/api-hooks';
import { getLocalizedText, resolveMediaUrl } from '@/lib/utils';
import { TransitionLink } from '@/components/navigation/TransitionLink';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// --- CONSTANTS ---
const CNN_RED = '#CC0000';

type TileVariant = 'hero' | 'wide' | 'tall' | 'standard';

const mosaicPattern: TileVariant[] = ['hero', 'standard', 'standard', 'tall', 'standard', 'wide', 'standard', 'standard'];
const previewLengthByVariant: Record<TileVariant, number> = {
  hero: 260,
  wide: 200,
  tall: 170,
  standard: 130,
};

const getTileVariant = (index: number): TileVariant => mosaicPattern[index % mosaicPattern.length];

const getTileGridStyles = (variant: TileVariant) => {
  const baseColumns = { xs: 'span 1', sm: 'span 1', md: 'span 2', lg: 'span 2' };
  const styles: Record<string, unknown> = {
    gridColumn: baseColumns,
    gridRow: { xs: 'auto', md: 'auto' },
  };

  if (variant === 'wide') {
    styles.gridColumn = { xs: 'span 1', sm: 'span 2', md: 'span 4', lg: 'span 3' };
  }
  if (variant === 'hero') {
    styles.gridColumn = { xs: 'span 1', sm: 'span 2', md: 'span 4', lg: 'span 4' };
    styles.gridRow = { xs: 'auto', md: 'span 2', lg: 'span 2' };
  }
  if (variant === 'tall') {
    styles.gridRow = { xs: 'auto', md: 'span 2', lg: 'span 2' };
  }

  return styles;
};

function HomeHeroSkeleton({ colors }: { colors: { bgSecondary: string; divider: string } }) {
  return (
    <Grid container spacing={{ xs: 3, md: 4 }}>
      <Grid size={{ xs: 12, md: 7, lg: 8 }} sx={{ minWidth: 0 }}>
        <Box sx={{ position: 'relative', width: '100%', height: { xs: 320, sm: 380, md: 540, lg: 620 } }}>
          <Skeleton
            variant="rounded"
            sx={{ width: '100%', height: '100%', bgcolor: colors.bgSecondary, borderRadius: { xs: 2, md: 3 } }}
          />
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ minWidth: 0 }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${colors.divider}`, pb: 1 }}>
            <Skeleton width={140} />
          </Box>
          <Stack spacing={2.5}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Stack key={idx} direction="row" spacing={2} alignItems="flex-start">
                <Skeleton variant="rounded" width={100} height={72} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="85%" />
                  <Skeleton width="55%" />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}

export default function HomePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Dynamic Colors based on Theme Mode
  const colors = {
    bg: isDark ? '#121212' : '#FFFFFF',
    bgSecondary: isDark ? '#1E1E1E' : '#F5F5F5',
    textMain: isDark ? '#FFFFFF' : '#111111',
    textMuted: isDark ? '#B0B0B0' : '#555555',
    divider: isDark ? '#333333' : '#E0E0E0',
    shortsBg: '#000000',
  };

  // --- DATA HOOKS ---
  const breakingQuery = useBreakingTicker();
  const trendingQuery = useTrendingArticles();
  const latestQuery = useLatestArticles();
  const { language } = useLanguage();
  const readMoreLabel = language === 'bn' ? 'আরও পড়ুন' : 'Read more';

  const latestList = latestQuery.data ?? [];
  const trendingList = trendingQuery.data ?? [];
  const breakingTicker = breakingQuery.data ?? [];

  // --- LAYOUT LOGIC ---
  const heroArticles = latestList.slice(0, 6);
  const heroCount = heroArticles.length;
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    if (heroCount <= 1) return undefined;
    const id = window.setInterval(() => {
      setHeroIndex((prev) => prev + 1);
    }, 8000);
    return () => window.clearInterval(id);
  }, [heroCount]);
  const normalizedHeroIndex = heroCount > 0 ? ((heroIndex % heroCount) + heroCount) % heroCount : 0;
  const heroArticle = heroArticles[normalizedHeroIndex] || latestList[0];
  const heroImageUrl = heroArticle ? resolveMediaUrl(heroArticle.featuredImage?.url || heroArticle.coverImage) : '';
  const handleHeroNavigate = (direction: 'prev' | 'next') => {
    if (heroCount === 0) return;
    setHeroIndex((prev) => (direction === 'next' ? prev + 1 : prev - 1));
  };
  const heroProgressLabel = heroCount > 0 ? `${normalizedHeroIndex + 1} / ${heroCount}` : '';
  // We take 4 items for the sidebar list
  const spotlightSecondary = heroArticles.filter((_, idx) => idx !== normalizedHeroIndex).slice(0, 4);
  
  const headlines = latestList.slice(heroArticles.length, heroArticles.length + 15);
  const trendingHighlights = trendingList.slice(0, 8);

  // Shorts Data
  const fbShorts = useMemo(() => [
    { id: '1', title: 'Morning brief in 60s', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', dur: '01:00' },
    { id: '2', title: 'Market pulse recap', img: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=400&q=80', dur: '00:52' },
    { id: '3', title: 'City desk on the move', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', dur: '00:48' },
    { id: '4', title: 'Global trade updates', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80', dur: '01:15' },
    { id: '5', title: 'Tech summit', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80', dur: '02:00' },
  ], []);

  const [tickerCondensed, setTickerCondensed] = useState(false);
  const getArticleTitle = (story: Article) => getLocalizedText(story.title, language);
  const getArticleHref = (story: Article) => `/article/${story.slug || story.id}`;
  
  useEffect(() => {
    const handleScroll = () => setTickerCondensed(window.scrollY > 120);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      sx={{
        fontFamily: 'var(--font-family-sans, Arial)',
        bgcolor: colors.bg,
        color: colors.textMain,
      }}
    >
      {/* 1. TICKER */}
      <Box sx={{ borderBottom: `2px solid ${CNN_RED}` }}>
        <BreakingTicker
          items={breakingTicker}
          loading={breakingQuery.isLoading}
          error={breakingQuery.isError}
          condensed={tickerCondensed}
        />
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={{ xs: 4, md: 6 }}>
          {/* 2. HERO SECTION (Responsive split) */}
          {latestQuery.isLoading ? (
            <Box component="section">
              <HomeHeroSkeleton colors={colors} />
            </Box>
          ) : latestQuery.isError && latestList.length === 0 ? (
            <Box
              component="section"
              sx={{
                border: `1px solid ${colors.divider}`,
                bgcolor: colors.bgSecondary,
                borderRadius: { xs: 2, md: 3 },
                p: { xs: 2, md: 3 },
              }}
            >
              <Stack spacing={1.25} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Latest stories unavailable
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textMuted }}>
                    Please check your connection and try again.
                  </Typography>
                </Box>
                <Button variant="contained" onClick={() => latestQuery.refetch()} sx={{ borderRadius: 999 }}>
                  Retry
                </Button>
              </Stack>
            </Box>
          ) : heroArticle ? (
            <Box component="section">
              <Grid container spacing={{ xs: 3, md: 4 }}>
                {/* LEFT: Dominant carousel */}
                <Grid size={{ xs: 12, md: 7, lg: 8 }} sx={{ minWidth: 0 }}>
                  <Box sx={{ position: 'relative', width: '100%', height: { xs: 320, sm: 380, md: 540, lg: 620 } }}>
                    <Box
                      component={TransitionLink}
                      href={getArticleHref(heroArticle)}
                      sx={{
                        display: 'block',
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        bgcolor: colors.bgSecondary,
                        borderRadius: { xs: 2, md: 3 },
                        overflow: 'hidden',
                        textDecoration: 'none',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: heroImageUrl
                            ? `url(${heroImageUrl})`
                            : 'linear-gradient(160deg, #222, #444)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          transition: 'transform 0.5s ease',
                          '&:hover': { transform: 'scale(1.02)' },
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)',
                          p: { xs: 2, md: 4 },
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          gap: 1.5,
                        }}
                      >
                        <Chip
                          label="Spotlight"
                          size="small"
                          sx={{
                            bgcolor: CNN_RED,
                            color: '#fff',
                            fontWeight: 700,
                            borderRadius: 0,
                            width: 'fit-content',
                          }}
                        />
                        <Typography
                          variant="h3"
                          sx={{
                            color: '#fff',
                            fontWeight: 900,
                            lineHeight: 1.1,
                            fontSize: { xs: '1.75rem', md: '2.75rem', lg: '3.5rem' },
                            fontFamily: 'Georgia, serif',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            maxWidth: '100%',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: { xs: 3, md: 2, lg: 2 },
                            overflow: 'hidden',
                          }}
                        >
                          {getArticleTitle(heroArticle)}
                        </Typography>
                        {heroArticle.excerpt && (
                          <Typography
                            variant="body1"
                            sx={{
                              color: '#f3f3f3',
                              maxWidth: '100%',
                              display: '-webkit-box',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: { xs: 3, md: 3, lg: 3 },
                              overflow: 'hidden',
                            }}
                          >
                            {getLocalizedText(heroArticle.excerpt, language)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {heroArticles.length > 1 && (
                      <>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            px: 2,
                            py: 0.5,
                            borderRadius: 999,
                            fontWeight: 700,
                            fontSize: 12,
                            letterSpacing: 1,
                          }}
                        >
                          {heroProgressLabel}
                        </Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            bgcolor: 'rgba(0,0,0,0.45)',
                            borderRadius: 999,
                            p: 0.5,
                          }}
                        >
                          <IconButton size="small" sx={{ color: '#fff' }} onClick={() => handleHeroNavigate('prev')} aria-label="Previous story">
                            <ChevronLeftIcon />
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#fff' }} onClick={() => handleHeroNavigate('next')} aria-label="Next story">
                            <ChevronRightIcon />
                          </IconButton>
                        </Stack>
                      </>
                    )}
                  </Box>
                </Grid>

                {/* RIGHT: Top Stories */}
                <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ minWidth: 0 }}>
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: `2px solid ${colors.divider}`,
                        pb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          color: CNN_RED,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          fontSize: { xs: '0.9rem', md: '1rem' },
                        }}
                      >
                        Top Stories
                      </Typography>
                    </Box>

                    <Stack spacing={2.5}>
                      {spotlightSecondary.map((story) => (
                        <Box
                          key={story.id}
                          component={TransitionLink}
                          href={getArticleHref(story)}
                          sx={{
                            display: 'flex',
                            gap: 2,
                            textDecoration: 'none',
                            alignItems: 'flex-start',
                          }}
                        >
                          {story.featuredImage && (
                            <Box
                              component="img"
                              src={resolveMediaUrl(story.featuredImage.url)}
                              alt=""
                              sx={{
                                width: { xs: 80, md: 100 },
                                height: { xs: 60, md: 72 },
                                objectFit: 'cover',
                                flexShrink: 0,
                                bgcolor: colors.bgSecondary,
                                borderRadius: 1,
                              }}
                            />
                          )}

                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                lineHeight: 1.3,
                                color: colors.textMain,
                                fontSize: { xs: '0.95rem', md: '1rem' },
                                '&:hover': { color: CNN_RED, textDecoration: 'underline' },
                              }}
                            >
                              {getArticleTitle(story)}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.textMuted,
                                mt: 0.5,
                                display: 'block',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                              }}
                            >
                              {story.category?.name ? getLocalizedText(story.category.name, language) : 'News'}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : null}

          {/* 3. SHORTS SECTION (now fully responsive) */}
          {fbShorts.length > 0 && (
            <Box
              component="section"
              sx={{
                bgcolor: colors.shortsBg,
                borderRadius: { xs: 2, md: 3 },
                p: { xs: 2.5, md: 4 },
                color: '#fff',
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 4, height: 24, bgcolor: CNN_RED }} />
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Must Watch
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: '#d0d0d0' }}>
                  Quick clips and explainers from the newsroom.
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: 2,
                  pb: 1,
                  scrollSnapType: 'x mandatory',
                  '&::-webkit-scrollbar': { height: 6 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#555', borderRadius: 999 },
                }}
              >
                {fbShorts.map((short) => (
                  <Box
                    key={short.id}
                    sx={{
                      flex: '0 0 auto',
                      width: { xs: 150, sm: 180, md: 220 },
                      aspectRatio: '9 / 16',
                      position: 'relative',
                      borderRadius: 2,
                      backgroundImage: `url(${short.img})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      scrollSnapAlign: 'start',
                      overflow: 'hidden',
                      '&:hover .play-btn': { transform: 'scale(1.1)' },
                    }}
                  >
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.85))' }} />
                    <Box className="play-btn" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', transition: 'transform 0.2s' }}>
                      <PlayCircleOutlineIcon sx={{ color: '#fff', fontSize: 40 }} />
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 0, p: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2, fontSize: '0.9rem' }}>
                        {short.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#aaa' }}>
                        {short.dur}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* 4. THE RIVER (Responsive Columns) */}
          <Box component="section">
            <Box sx={{ borderBottom: `2px solid ${colors.textMain}`, mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, pb: 1, textTransform: 'uppercase' }}>
                Latest News
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 3, lg: 4 }}>
              {/* Main Feed */}
              <Grid
                size={{ xs: 12, lg: 8 }}
                sx={{
                  pr: { lg: 4 },
                  borderRight: { lg: `1px solid ${colors.divider}` },
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: {
                      xs: 'repeat(1, minmax(0, 1fr))',
                      sm: 'repeat(2, minmax(0, 1fr))',
                      md: 'repeat(4, minmax(0, 1fr))',
                      lg: 'repeat(6, minmax(0, 1fr))',
                    },
                  }}
                >
                  {latestQuery.isLoading
                    ? Array.from({ length: 10 }).map((_, index) => {
                        const variant = getTileVariant(index);
                        return (
                          <Box
                            key={`skeleton-${index}`}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1.25,
                              p: { xs: 1.5, md: 2 },
                              borderRadius: 2,
                              border: `1px solid ${colors.divider}`,
                              bgcolor: colors.bgSecondary,
                              ...getTileGridStyles(variant),
                            }}
                          >
                            <Skeleton
                              variant="rounded"
                              sx={{
                                width: '100%',
                                height: variant === 'hero' ? 320 : variant === 'tall' ? 280 : 200,
                                borderRadius: 1.5,
                              }}
                            />
                            <Skeleton width="45%" />
                            <Skeleton width="90%" />
                            <Skeleton width="75%" />
                            <Skeleton width="60%" />
                          </Box>
                        );
                      })
                    : latestQuery.isError && headlines.length === 0
                      ? (
                        <Box
                          sx={{
                            gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 4', lg: 'span 6' },
                            border: `1px solid ${colors.divider}`,
                            bgcolor: colors.bgSecondary,
                            borderRadius: 2,
                            p: { xs: 2, md: 2.5 },
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Unable to load news
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.5 }}>
                            Please try again in a moment.
                          </Typography>
                          <Button variant="contained" size="small" onClick={() => latestQuery.refetch()} sx={{ mt: 1.5, borderRadius: 999 }}>
                            Retry
                          </Button>
                        </Box>
                      )
                      : headlines.map((article, index) => {
                    const variant = getTileVariant(index);
                    const previewLimit = previewLengthByVariant[variant];
                    const articleHref = getArticleHref(article);
                    const excerptText = article.excerpt ? getLocalizedText(article.excerpt, language) : '';
                    const preview =
                      previewLimit && excerptText.length > previewLimit
                        ? `${excerptText.slice(0, Math.max(0, previewLimit - 3)).trim()}...`
                        : excerptText;
                    return (
                      <Box
                        key={article.id}
                        component="article"
                        sx={{
                          textDecoration: 'none',
                          color: colors.textMain,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.25,
                          p: { xs: 1.5, md: 2 },
                          borderRadius: 2,
                          border: `1px solid ${colors.divider}`,
                          bgcolor: colors.bgSecondary,
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                          },
                          ...getTileGridStyles(variant),
                        }}
                      >
                        {article.featuredImage && (
                          <Box
                            component={TransitionLink}
                            href={articleHref}
                            sx={{
                              display: 'block',
                              borderRadius: 1.5,
                              overflow: 'hidden',
                              lineHeight: 0,
                            }}
                          >
                            <Box
                              component="img"
                              src={resolveMediaUrl(article.featuredImage.url)}
                              alt=""
                              sx={{
                                width: '100%',
                                height: variant === 'hero' ? 320 : variant === 'tall' ? 280 : 200,
                                objectFit: 'cover',
                              }}
                            />
                          </Box>
                        )}
                        <Box>
                          <Typography variant="caption" sx={{ color: CNN_RED, fontWeight: 700, textTransform: 'uppercase' }}>
                            {article.category?.name ? getLocalizedText(article.category.name, language) : 'News'}
                          </Typography>
                          <TransitionLink href={articleHref} style={{ textDecoration: 'none' }}>
                            <Typography
                              variant={variant === 'hero' ? 'h5' : 'h6'}
                              sx={{
                                fontWeight: 700,
                                lineHeight: 1.3,
                                fontSize: variant === 'hero' ? '1.4rem' : '1rem',
                                color: colors.textMain,
                                '&:hover': { color: CNN_RED },
                              }}
                            >
                              {getArticleTitle(article)}
                            </Typography>
                          </TransitionLink>
                          {preview && (
                            <Typography variant="body2" sx={{ color: colors.textMuted, mt: 1 }}>
                              {preview}
                            </Typography>
                          )}
                          <Button
                            component={TransitionLink}
                            href={articleHref}
                            variant="contained"
                            size="small"
                            sx={{ mt: 1.5, borderRadius: 999, alignSelf: 'flex-start' }}
                          >
                            {readMoreLabel}
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Grid>

              {/* Right Sidebar */}
              <Grid size={{ xs: 12, lg: 4 }} sx={{ pl: { lg: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  Trending Now
                </Typography>
                <Stack spacing={2}>
                  {trendingQuery.isLoading
                    ? Array.from({ length: 6 }).map((_, idx) => (
                        <Stack key={`trend-skeleton-${idx}`} direction="row" spacing={2} alignItems="flex-start">
                          <Skeleton variant="text" width={28} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton width="92%" />
                            <Skeleton width="70%" />
                          </Box>
                        </Stack>
                      ))
                    : trendingQuery.isError && trendingHighlights.length === 0
                      ? (
                        <Box
                          sx={{
                            border: `1px solid ${colors.divider}`,
                            bgcolor: colors.bgSecondary,
                            borderRadius: 2,
                            p: 2,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Trending unavailable
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.5 }}>
                            Please try again.
                          </Typography>
                          <Button variant="contained" size="small" onClick={() => trendingQuery.refetch()} sx={{ mt: 1.25, borderRadius: 999 }}>
                            Retry
                          </Button>
                        </Box>
                      )
                      : trendingHighlights.map((story, i) => (
                        <Box
                          key={story.id}
                          component={TransitionLink}
                          href={getArticleHref(story)}
                          sx={{ display: 'flex', gap: 2, textDecoration: 'none', alignItems: 'flex-start' }}
                        >
                          <Typography variant="h4" sx={{ color: '#d1d1d1', fontWeight: 900, lineHeight: 1, minWidth: '30px' }}>
                            {i + 1}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              color: colors.textMain,
                              fontWeight: 600,
                              lineHeight: 1.3,
                              transition: 'color 150ms ease',
                              '&:hover': { color: CNN_RED },
                            }}
                          >
                            {getArticleTitle(story)}
                          </Typography>
                        </Box>
                      ))}
                </Stack>
                <Box sx={{ mt: 4 }}>
                  <AdSlot position="sidebar" page="home" />
                </Box>
              </Grid>
            </Grid>
          </Box>

          <AdSlot position="banner" page="home" />
        </Stack>
      </Container>
    </Box>
  );
}
