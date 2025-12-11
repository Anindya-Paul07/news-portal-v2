'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';
import { AdSlot } from '@/components/ads/AdSlot';
import { ArticleCard } from '@/components/news/ArticleCard';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import { HeroCarousel } from '@/components/news/HeroCarousel';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/states/EmptyState';
import { useLanguage } from '@/contexts/language-context';
import { Article } from '@/lib/types';
import {
  useArticles,
  useBreakingTicker,
  useFeaturedArticles,
  useLatestArticles,
  useMenuCategories,
  useTrendingArticles,
} from '@/hooks/api-hooks';
import { getLocalizedText } from '@/lib/utils';

export default function HomePage() {
  const { data: featured } = useFeaturedArticles();
  const { data: breaking } = useBreakingTicker();
  const { data: trending } = useTrendingArticles();
  const { data: latest } = useLatestArticles();
  const { data: categories } = useMenuCategories();
  const { language } = useLanguage();
  const categoryList = categories ?? [];
  const latestList = latest ?? [];
  const trendingList = trending ?? [];
  const breakingTicker = breaking ?? [];
  const heroSlides = (featured ?? []).slice(0, 4);
  const gridLatest = latestList.slice(0, 4);
  const stackedLatest = latestList.slice(4, 8);
  const trendingHighlights = trendingList.slice(0, 4);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const heroPrimary = useMemo(() => heroSlides[0], [heroSlides]);
  const heroPoster = heroPrimary?.featuredImage?.url || heroPrimary?.coverImage;

  const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  `;

  const firstCategorySlug = categoryList?.[0]?.slug;
  const secondCategorySlug = categoryList?.[1]?.slug;
  const { data: firstCategoryArticles } = useArticles(
    firstCategorySlug ? { category: firstCategorySlug, limit: 3 } : undefined,
    { enabled: !!firstCategorySlug },
  );
  const { data: secondCategoryArticles } = useArticles(
    secondCategorySlug ? { category: secondCategorySlug, limit: 3 } : undefined,
    { enabled: !!secondCategorySlug },
  );
  const firstCategoryList = firstCategoryArticles ?? [];
  const secondCategoryList = secondCategoryArticles ?? [];
  const firstCategoryFeature = firstCategoryList[0];
  const firstCategoryRest = firstCategoryList.slice(1, 4);
  const secondCategoryGrid = secondCategoryList.slice(0, 4);
  const getArticleTitle = (story: Article) => getLocalizedText(story.title, language);
  const getArticleSummary = (story: Article) => getLocalizedText(story.excerpt, language);

  return (
    <Stack spacing={4}>
      <BreakingTicker items={breakingTicker} />
      {heroSlides.length > 0 && <HeroCarousel articles={heroSlides} />}

      {heroSlides.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            boxShadow: 3,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
            alignItems: 'stretch',
            animation: `${fadeInUp} 520ms ease both`,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              minHeight: { xs: 240, md: 300 },
              backgroundImage: heroPoster
                ? `linear-gradient(120deg, ${alpha('#000', 0.62)}, ${alpha('#000', 0.35)}), url(${heroPoster})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#fff',
              boxShadow: 4,
              p: { xs: 2, md: 3 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="Video" color="warning" size="small" sx={{ fontWeight: 800 }} />
              <Typography variant="overline" sx={{ letterSpacing: 3 }}>
                04:12
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 900, maxWidth: '80%', textShadow: '0 6px 24px rgba(0,0,0,0.4)' }}>
              {getArticleTitle(heroPrimary || heroSlides[0]) || 'Today’s briefing in 4 minutes'}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="secondary" size="small" component={Link as unknown as 'a'} href={`/article/${heroPrimary?.slug || heroSlides[0]?.slug || '#'}`}>
                Play now
              </Button>
              <Button
                variant="outline"
                size="small"
                sx={{
                  color: '#fff',
                  borderColor: alpha('#fff', 0.65),
                  '&:hover': { borderColor: '#fff', backgroundColor: alpha('#fff', 0.12) },
                }}
                onClick={() => setCaptionsEnabled((prev) => !prev)}
              >
                {captionsEnabled ? 'Captions on' : 'Captions off'}
              </Button>
            </Stack>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              justifyContent: 'space-between',
              boxShadow: 1,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Audio" color="primary" size="small" />
                <Typography variant="overline" sx={{ letterSpacing: 3 }}>
                  08:45
                </Typography>
              </Stack>
              <Button
                variant={audioPlaying ? 'secondary' : 'primary'}
                size="small"
                onClick={() => setAudioPlaying((prev) => !prev)}
                sx={{ px: 2.5 }}
              >
                {audioPlaying ? 'Pause' : 'Play'}
              </Button>
            </Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Morning audio briefing: top 5 stories with context
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hear the headlines with quick expert notes and timestamps to jump to topics.
            </Typography>
            <Box
              sx={{
                height: 54,
                borderRadius: 2,
                bgcolor: alpha('#000', 0.05),
                display: 'grid',
                gridTemplateColumns: 'repeat(28, 1fr)',
                gap: 0.25,
                alignItems: 'end',
                p: 1,
                overflow: 'hidden',
                '& div': {
                  borderRadius: 1,
                  background: (theme) =>
                    `linear-gradient(180deg, ${alpha(theme.palette.secondary.main, 0.9)}, ${alpha(
                      theme.palette.primary.main,
                      0.7,
                    )})`,
                  transition: 'height 200ms ease',
                },
              }}
            >
              {Array.from({ length: 28 }).map((_, idx) => (
                <Box
                  key={idx}
                  component="div"
                  sx={{
                    height: `${30 + ((idx * 7) % 40)}%`,
                    animation: audioPlaying ? `wavePulse 900ms ease-in-out ${idx * 0.02}s infinite alternate` : 'none',
                    '@keyframes wavePulse': {
                      from: { transform: 'scaleY(0.75)' },
                      to: { transform: 'scaleY(1.2)' },
                    },
                  }}
                />
              ))}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Button
                variant="ghost"
                size="small"
                component={Link as unknown as 'a'}
                href={`/article/${heroPrimary?.slug || heroSlides[0]?.slug || '#'}`}
              >
                View transcript
              </Button>
              <Typography variant="caption" color="text.secondary">
                Captions {captionsEnabled ? 'enabled' : 'disabled'}
              </Typography>
            </Stack>
          </Paper>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: 3,
              animation: `${fadeInUp} 560ms ease both`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                Latest headlines
              </Typography>
              {latestList.length > 0 && (
                <Button variant="ghost" size="small" component={Link as unknown as 'a'} href="/search?sort=date">
                  See all
                </Button>
              )}
            </Stack>
            {latestList.length === 0 ? (
              <EmptyState title="No headlines yet" description="New stories will appear here once published." />
            ) : (
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Grid container spacing={2}>
                    {gridLatest.map((article) => (
                      <Grid key={article.id} size={{ xs: 12, sm: 6 }}>
                        <ArticleCard article={article} />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                  {stackedLatest.length > 0 && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                      }}
                    >
                      <Typography
                        variant="overline"
                        sx={{ letterSpacing: 3, fontWeight: 700, color: 'text.secondary' }}
                      >
                        Fresh picks
                      </Typography>
                      <Stack spacing={2} mt={2}>
                        {stackedLatest.map((story) => (
                          <Paper
                            key={story.id}
                            variant="outlined"
                            component={Link}
                            href={`/article/${story.slug}`}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              textDecoration: 'none',
                              color: 'text.primary',
                              borderColor: 'transparent',
                              transition: 'border-color 150ms ease, transform 150ms ease',
                              '&:hover': {
                                borderColor: 'primary.main',
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {getArticleTitle(story)}
                            </Typography>
                            {getArticleSummary(story) && (
                              <Typography variant="caption" color="text.secondary">
                                {getArticleSummary(story)}
                              </Typography>
                            )}
                          </Paper>
                        ))}
                      </Stack>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: 3,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Trending now
                </Typography>
                {trendingHighlights.length > 0 && <Chip label="Live" color="warning" size="small" />}
              </Stack>
              {trendingHighlights.length === 0 ? (
                <EmptyState title="No trending stories" description="Check back soon for popular coverage." />
              ) : (
                <Stack spacing={2}>
                  {trendingHighlights.map((story, index) => (
                    <Paper
                      key={story.id}
                      component={Link}
                      href={`/article/${story.slug}`}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'flex-start',
                        textDecoration: 'none',
                        color: 'text.primary',
                        borderColor: 'divider',
                        '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 900, color: 'warning.main' }}>
                        0{index + 1}
                      </Typography>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {getArticleTitle(story)}
                        </Typography>
                        {getArticleSummary(story) && (
                          <Typography variant="caption" color="text.secondary">
                            {getArticleSummary(story)}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
            <AdSlot position="sidebar" page="home" />
          </Stack>
        </Grid>
      </Grid>

      <AdSlot position="banner" page="home" />

      <Grid container spacing={3}>
        {firstCategorySlug && firstCategoryList.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                boxShadow: 4,
                border: `1px solid ${alpha('#ffffff', 0.16)}`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {getLocalizedText(categoryList?.[0]?.name, language) || 'Top stories'}
                </Typography>
                <Button
                  variant="ghost"
                  size="small"
                  component={Link as unknown as 'a'}
                  href={`/category/${firstCategorySlug || 'news'}`}
                  sx={{ color: 'warning.main' }}
                >
                  View category
                </Button>
              </Stack>
              <Grid container spacing={2}>
                {firstCategoryFeature && (
                  <Grid size={{ xs: 12, md: 7 }}>
                    <ArticleCard article={firstCategoryFeature} />
                  </Grid>
                )}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Stack spacing={1.5}>
                    {firstCategoryRest.map((article) => (
                      <Paper
                        key={article.id}
                        component={Link}
                        href={`/article/${article.slug}`}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha('#fff5ef', 0.1),
                          color: 'secondary.contrastText',
                          textDecoration: 'none',
                          '&:hover': {
                            bgcolor: alpha('#fff5ef', 0.18),
                          },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {getArticleTitle(article)}
                        </Typography>
                        {getArticleSummary(article) && (
                          <Typography variant="caption" sx={{ color: alpha('#fff5ef', 0.8) }}>
                            {getArticleSummary(article)}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {secondCategorySlug && secondCategoryGrid.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {getLocalizedText(categoryList?.[1]?.name, language) || 'In depth'}
                </Typography>
                <Button
                  variant="ghost"
                  size="small"
                  component={Link as unknown as 'a'}
                  href={`/category/${secondCategorySlug || 'news'}`}
                  sx={{ color: 'secondary.main' }}
                >
                  View category
                </Button>
              </Stack>
              <Grid container spacing={2}>
                {secondCategoryGrid.map((article) => (
                  <Grid key={article.id} size={{ xs: 12, sm: 6 }}>
                    <ArticleCard article={article} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Sections
          </Typography>
          <Typography variant="overline" sx={{ letterSpacing: 3, color: 'text.secondary' }}>
            Browse by beat
          </Typography>
        </Stack>
        {categoryList.length === 0 ? (
          <Box mt={2}>
            <EmptyState title="No sections available" description="Add categories to populate this grid." />
          </Box>
        ) : (
          <Grid container spacing={2} mt={1}>
            {categoryList?.map((category, index) => (
              <Grid key={category.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Paper
                  component={Link}
                  href={`/category/${category.slug}`}
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    textDecoration: 'none',
                    color: 'text.primary',
                    transition: 'transform 150ms ease, box-shadow 150ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    minHeight: 160,
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                    <Typography variant="overline" sx={{ letterSpacing: 3 }}>
                      {String(index + 1).padStart(2, '0')}
                    </Typography>
                    <Chip label="Section" size="small" color="primary" variant="outlined" />
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {getLocalizedText(category.name, language)}
                  </Typography>
                  {category.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {getLocalizedText(category.description, language)}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ mt: 1, display: 'inline-block', letterSpacing: 2 }}>
                    Enter →
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Stack>
  );
}
