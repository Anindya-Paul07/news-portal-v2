'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { AdSlot } from '@/components/ads/AdSlot';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/states/EmptyState';
import { useCategory, useCategoryArticles } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText, resolveMediaUrl } from '@/lib/utils';

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const search = useSearchParams();
  const router = useRouter();
  const filter = search.get('filter') || 'latest';
  const { data: category } = useCategory(slug);
  const { data: articles } = useCategoryArticles(slug, {
    sort: filter,
    limit: 12,
  });
  const { language } = useLanguage();
  const categoryData = category;
  const articlesList = articles ?? [];
  const heroArticle = articlesList[0];
  const heroImageUrl = heroArticle ? resolveMediaUrl(heroArticle.featuredImage?.url || heroArticle.coverImage) : '';
  const restArticles = articlesList.slice(1);
  const categoryLabel = getLocalizedText(categoryData?.name, language) || 'Category';
  const categoryDescription = getLocalizedText(categoryData?.description, language);
  const heroHref = heroArticle ? `/article/${heroArticle.slug || heroArticle.id}` : '';

  const filters = useMemo(
    () => [
      { key: 'latest', label: 'Latest' },
      { key: 'featured', label: 'Featured' },
      { key: 'trending', label: 'Trending' },
    ],
    [],
  );

  const selectFilter = (value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('filter', value);
    router.replace(url.pathname + url.search);
  };

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, boxShadow: 3 }}>
        <Chip label="Category" size="small" color="secondary" sx={{ mb: 1, fontWeight: 700, letterSpacing: 1 }} />
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          {categoryLabel}
        </Typography>
        {categoryDescription && (
          <Typography variant="body1" color="text.secondary">
            {categoryDescription}
          </Typography>
        )}
        <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'secondary' : 'outline'}
              size="small"
              onClick={() => selectFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          {articlesList.length === 0 ? (
            <EmptyState title="No articles in this category yet" description="Please check back soon." />
          ) : (
            <Stack spacing={2.5}>
              {heroArticle && (
                <Paper
                  component={Link as unknown as 'a'}
                  href={heroHref}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    minHeight: 260,
                    backgroundImage: heroImageUrl
                      ? `linear-gradient(150deg, ${alpha('#000', 0.3)}, ${alpha('#000', 0.75)}), url(${heroImageUrl})`
                      : `linear-gradient(150deg, ${alpha('#d3182d', 0.15)}, ${alpha('#3b1f20', 0.8)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    gap: 1,
                    textDecoration: 'none',
                    boxShadow: 5,
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: 7,
                    },
                  }}
                >
                  <Typography variant="overline" sx={{ letterSpacing: 3 }}>
                    {heroArticle.category?.name ? getLocalizedText(heroArticle.category.name, language) : categoryLabel}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.15, maxWidth: 640 }}>
                    {getLocalizedText(heroArticle.title, language)}
                  </Typography>
                  {heroArticle.excerpt && (
                    <Typography variant="body2" sx={{ maxWidth: 520, color: alpha('#fff', 0.8) }}>
                      {getLocalizedText(heroArticle.excerpt, language)}
                    </Typography>
                  )}
                </Paper>
              )}

              <Grid container spacing={2.5}>
                {restArticles?.map((article) => (
                  <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <ArticleCard article={article} />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            <AdSlot position="sidebar" page="category" />
            <AdSlot position="banner" page="category" />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
