'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { AdSlot } from '@/components/ads/AdSlot';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/states/EmptyState';
import { useArticle, useRelatedArticles } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { formatDate, getLocalizedText } from '@/lib/utils';

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const { data: article } = useArticle(slug);
  const categoryIdForRelated = article?.categoryId;
  const { data: related } = useRelatedArticles(categoryIdForRelated);
  const { language } = useLanguage();
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [readingMode, setReadingMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
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
  const bodyContent =
    displayArticle && typeof displayArticle.content === 'string'
      ? displayArticle.content
      : displayArticle?.content
        ? (displayArticle.content as Record<string, string | undefined>)[lang] ||
          (displayArticle.content as Record<string, string | undefined>).en ||
          summary ||
          ''
        : summary || '';

  if (!displayArticle) {
    return (
      <EmptyState
        title="Article not found"
        description="The story could not be loaded. Please try again later."
      />
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: readingMode ? 3.5 : 3 },
            borderRadius: readingMode ? 3.5 : 3,
            boxShadow: readingMode ? 1 : 3,
            bgcolor: readingMode
              ? alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.94 : 0.98)
              : 'background.paper',
            borderColor: readingMode ? alpha(theme.palette.primary.main, 0.15) : undefined,
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
            {displayArticle.readingTime && (
              <Typography variant="body2">• {displayArticle.readingTime} min read</Typography>
            )}
            <Stack direction="row" spacing={1}>
              <Button variant={lang === 'en' ? 'secondary' : 'outline'} size="small" onClick={() => setLang('en')}>
                EN
              </Button>
              <Button variant={lang === 'bn' ? 'secondary' : 'outline'} size="small" onClick={() => setLang('bn')}>
                বাংলা
              </Button>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant={readingMode ? 'secondary' : 'outline'}
                size="small"
                onClick={() => setReadingMode((prev) => !prev)}
              >
                {readingMode ? 'Reading mode on' : 'Reading mode'}
              </Button>
              <Button
                variant={largeText ? 'secondary' : 'outline'}
                size="small"
                onClick={() => setLargeText((prev) => !prev)}
              >
                {largeText ? 'Text: Large' : 'Text: Default'}
              </Button>
            </Stack>
          </Stack>

          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mt: 2 }}>
            {title}
          </Typography>
          {summary && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
              {summary}
            </Typography>
          )}

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
              lineHeight: readingMode ? 1.9 : 1.7,
              fontSize: largeText ? '1.08rem' : '1rem',
              maxWidth: readingMode ? 760 : '100%',
              mx: readingMode ? 'auto' : undefined,
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
              {relatedStories.slice(0, 4).map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}
