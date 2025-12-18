'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import { alpha, useTheme } from '@mui/material/styles';
import { AdSlot } from '@/components/ads/AdSlot';
import { ArticleCard } from '@/components/news/ArticleCard';
import { EmptyState } from '@/components/states/EmptyState';
import { useArticle, useRelatedArticles } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { formatDate, getLocalizedText } from '@/lib/utils';
import { TransitionLink } from '@/components/navigation/TransitionLink';

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const articleQuery = useArticle(slug);
  const article = articleQuery.data;
  const categoryIdForRelated = article?.categoryId;
  const relatedQuery = useRelatedArticles(categoryIdForRelated);
  const related = relatedQuery.data;
  const { language } = useLanguage();
  const theme = useTheme();
  const displayArticle = article;
  const relatedStories =
    related && related.length > 0 && displayArticle
      ? related.filter((item) => item.id !== displayArticle.id).slice(0, 4)
      : [];
  const categoryLabel = displayArticle ? getLocalizedText(displayArticle.category?.name, language) || 'News' : 'News';
  const title = displayArticle ? getLocalizedText(displayArticle.title, language) : '';
  const summary = displayArticle ? getLocalizedText(displayArticle.excerpt, language) : '';
  const featuredImage = displayArticle?.featuredImage?.url || displayArticle?.coverImage;
  const featuredAlt = displayArticle ? getLocalizedText(displayArticle.featuredImage?.alt, language) || title : '';
  const bodyContent = useMemo(() => {
    if (!displayArticle) return summary || '';
    if (typeof displayArticle.content === 'string') return displayArticle.content;
    if (displayArticle.content) {
      const localized = (displayArticle.content as Record<string, string | undefined>)[language];
      if (localized) return localized;
      if ((displayArticle.content as Record<string, string | undefined>).en) {
        return (displayArticle.content as Record<string, string | undefined>).en as string;
      }
    }
    return summary || '';
  }, [displayArticle, language, summary]);

  if (articleQuery.isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, boxShadow: 3 }}>
              <Stack spacing={1.5} direction="row" flexWrap="wrap" alignItems="center">
                <Skeleton variant="rounded" width={92} height={26} />
                <Skeleton width={140} />
                <Skeleton width={120} />
              </Stack>
              <Stack spacing={1.25} sx={{ mt: 2 }}>
                <Skeleton variant="text" height={54} width="92%" />
                <Skeleton variant="text" height={28} width="78%" />
              </Stack>
              <Skeleton variant="rounded" sx={{ mt: 2, borderRadius: 3, height: { xs: 240, md: 320 } }} />
              <Divider sx={{ my: 3 }} />
              <Stack spacing={1}>
                <Skeleton variant="text" height={22} width="96%" />
                <Skeleton variant="text" height={22} width="92%" />
                <Skeleton variant="text" height={22} width="90%" />
                <Skeleton variant="text" height={22} width="84%" />
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2.5}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, boxShadow: 2 }}>
                <Skeleton width={160} />
                <Stack spacing={1.5} mt={1.5}>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} variant="rounded" height={92} />
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!displayArticle) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>
        <EmptyState title="Article not found" description="The story could not be loaded. Please try again later." />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: 'background.paper',
            }}
          >
            <Stack spacing={1.5} direction="row" flexWrap="wrap" alignItems="center" sx={{ color: 'text.secondary' }}>
              <Chip
                label={categoryLabel}
                color="warning"
                size="small"
                sx={{ fontWeight: 700, letterSpacing: 1, bgcolor: alpha(theme.palette.warning.main, 0.18) }}
              />
              {displayArticle.publishedAt && <Typography variant="body2">{formatDate(displayArticle.publishedAt)}</Typography>}
              {displayArticle.readingTime && <Typography variant="body2">• {displayArticle.readingTime} min read</Typography>}
              {displayArticle.author?.name && <Typography variant="body2">• By {displayArticle.author.name}</Typography>}
              <Stack direction="row" spacing={1} sx={{ marginLeft: 'auto' }}>
                <IconButton size="small" aria-label="Share article">
                  <ShareRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" aria-label="Save article">
                  <BookmarkBorderRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
              {summary && (
                <Typography variant="body1" color="text.secondary">
                  {summary}
                </Typography>
              )}
            </Stack>

            {featuredImage && (
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 240, md: 320 },
                  width: '100%',
                  mt: 2,
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: 3,
                }}
              >
                <Image src={featuredImage} alt={featuredAlt} fill className="object-cover" sizes="100vw" />
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                color: 'text.primary',
                lineHeight: 1.8,
                fontSize: '1rem',
                '& p': { mb: 2 },
              }}
              className="article-content"
            >
              <Typography variant="body1">{bodyContent || 'বাংলা কন্টেন্ট আসছে।'}</Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <AdSlot position="in_content" page="article" />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            <AdSlot position="sidebar" page="article" />
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, boxShadow: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                Related stories
              </Typography>
              <Stack spacing={1.5}>
                {relatedQuery.isLoading
                  ? Array.from({ length: 4 }).map((_, idx) => <Skeleton key={`related-skeleton-${idx}`} variant="rounded" height={92} />)
                  : relatedStories.slice(0, 4).map((item) => <ArticleCard key={item.id} article={item} />)}
              </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Explore categories
              </Typography>
              <Stack spacing={1} mt={1.5}>
                <TransitionLink href="/category/top" style={{ color: 'inherit', textDecoration: 'none' }}>
                  <Typography variant="body2">Top stories</Typography>
                </TransitionLink>
                <TransitionLink href="/category/politics" style={{ color: 'inherit', textDecoration: 'none' }}>
                  <Typography variant="body2">Politics</Typography>
                </TransitionLink>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
