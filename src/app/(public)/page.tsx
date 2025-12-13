'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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
import { FbShortsRail, type FbShort } from '@/components/news/FbShortsRail';
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
  const spotlightLead = latestList[0];
  const spotlightSecondary = latestList.slice(1, 4);
  const headlines = latestList.slice(4, 16);
  const trendingHighlights = trendingList.slice(0, 6);
  const fbShorts = useMemo<FbShort[]>(
    () => [
      {
        id: 'short-1',
        title: 'Morning brief in 60s',
        videoUrl: 'https://www.facebook.com/facebookapp/videos/10153231379946729/',
        thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=60',
        duration: '01:00',
        postedAt: 'Just now',
      },
      {
        id: 'short-2',
        title: 'Market pulse recap',
        videoUrl: 'https://www.facebook.com/FacebookforDevelopers/videos/10152454700553553/',
        thumbnailUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=600&q=60',
        duration: '00:52',
        postedAt: '1h ago',
      },
      {
        id: 'short-3',
        title: 'City desk on the move',
        videoUrl: 'https://www.facebook.com/FacebookforBusiness/videos/566237083858067/',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=60',
        duration: '00:48',
        postedAt: '3h ago',
      },
    ],
    [],
  );
  const [tickerCondensed, setTickerCondensed] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setTickerCondensed(window.scrollY > 120);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Stack spacing={4}>
      <BreakingTicker items={breakingTicker} condensed={tickerCondensed} />
      {heroSlides.length > 0 && <HeroCarousel articles={heroSlides} />}

      {fbShorts.length > 0 && (
        <Box sx={{ animation: `${fadeInUp} 520ms ease both` }}>
          <FbShortsRail items={fbShorts} variant="compact" />
        </Box>
      )}

      {spotlightLead && (
        <Box
          component="section"
          sx={{
            display: 'grid',
            gap: { xs: 2.5, md: 3 },
            gridTemplateColumns: { xs: '1fr', lg: '1.7fr 1fr' },
          }}
        >
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              boxShadow: 4,
              minHeight: 320,
              backgroundImage: spotlightLead.featuredImage?.url
                ? `linear-gradient(160deg, rgba(0,0,0,0.4), rgba(0,0,0,0.75)), url(${spotlightLead.featuredImage.url})`
                : 'linear-gradient(160deg, #2d1c1c, #441b1b)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: 1.5,
              transition: 'transform 200ms ease, box-shadow 200ms ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
            }}
            component={Link as unknown as 'a'}
            href={`/article/${spotlightLead.slug}`}
          >
            <Chip label="Spotlight" color="warning" size="small" sx={{ alignSelf: 'flex-start' }} />
            <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              {getArticleTitle(spotlightLead)}
            </Typography>
            {getArticleSummary(spotlightLead) && (
              <Typography variant="body2" sx={{ maxWidth: 540 }}>
                {getArticleSummary(spotlightLead)}
              </Typography>
            )}
          </Paper>

          <Stack spacing={2}>
            {spotlightSecondary.map((story) => (
              <Paper
                key={story.id}
                variant="outlined"
                component={Link}
                href={`/article/${story.slug}`}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'text.primary',
                  transition: 'border-color 150ms ease, transform 150ms ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography variant="overline" sx={{ letterSpacing: 2, color: 'text.secondary' }}>
                  {story.category?.name ? getLocalizedText(story.category.name, language) : 'Top story'}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
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
        </Box>
      )}

      <Box component="section">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
            Latest headlines
          </Typography>
          {headlines.length > 0 && (
            <Button variant="ghost" size="small" component={Link as unknown as 'a'} href="/search?sort=date">
              See all
            </Button>
          )}
        </Stack>
        {headlines.length === 0 ? (
          <EmptyState title="No headlines yet" description="New stories will appear here once published." />
        ) : (
          <Grid container spacing={2.5}>
            {headlines.map((article) => (
              <Grid key={article.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <ArticleCard article={article} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {firstCategorySlug && firstCategoryList.length > 0 && (
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
            )}

            {secondCategorySlug && secondCategoryGrid.length > 0 && (
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
            )}
          </Stack>
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
                        p: 1.25,
                        borderRadius: 2,
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-start',
                        textDecoration: 'none',
                        color: 'text.primary',
                        borderColor: 'divider',
                        '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 900, color: 'warning.main' }}>
                        {(index + 1).toString().padStart(2, '0')}
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

    </Stack>
  );
}
