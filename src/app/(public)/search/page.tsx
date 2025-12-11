'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/states/EmptyState';
import { useArticles, useMenuCategories, useSearchArticles } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText } from '@/lib/utils';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          Loading search…
        </Paper>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [term, setTerm] = useState(searchParams.get('query') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');
  const category = searchParams.get('category') || undefined;

  const { data: categories } = useMenuCategories();
  const { data: results } = useSearchArticles(term, { sort, category });
  const { data: latest } = useArticles({ limit: 4 });
  const { language } = useLanguage();
  const categoryList = categories ?? [];
  const latestList = latest ?? [];
  const resultItems = results ?? [];

  useEffect(() => {
    const query = new URLSearchParams();
    if (term) query.set('query', term);
    if (sort) query.set('sort', sort);
    if (category) query.set('category', category);
    router.replace(`/search?${query.toString()}`);
  }, [category, router, sort, term]);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Stack spacing={2}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Search
          </Typography>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, boxShadow: 2 }}>
            <Stack spacing={2}>
              <Input
                label="Keyword"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search stories"
              />
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">
                  Sort:
                </Typography>
                {['relevance', 'date'].map((opt) => (
                  <Button
                    key={opt}
                    variant={sort === opt ? 'secondary' : 'outline'}
                    size="small"
                    onClick={() => setSort(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">
                  Category:
                </Typography>
                {categoryList?.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={getLocalizedText(cat.name, language)}
                    color={category === cat.slug ? 'primary' : 'default'}
                    variant={category === cat.slug ? 'filled' : 'outlined'}
                    onClick={() =>
                      router.replace(`/search?query=${encodeURIComponent(term)}&category=${cat.slug}&sort=${sort}`)
                    }
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>

          {(!term || term.trim().length === 0) && (
            <EmptyState title="Start searching" description="Type a keyword to find stories." />
          )}

          {term && term.trim().length > 0 && (
            <Grid container spacing={2}>
              {resultItems.map((article) => (
                <Grid key={article.id} size={{ xs: 12, sm: 6 }}>
                  <ArticleCard article={article} />
                </Grid>
              ))}
              {results?.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <EmptyState title="No matches" description="Try adjusting keywords or filters." />
                </Grid>
              )}
            </Grid>
          )}
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Latest
          </Typography>
          {latestList.length === 0 ? (
            <EmptyState title="No latest stories yet" description="Fresh headlines will appear soon." />
          ) : (
            <Stack spacing={1.5}>
              {latestList.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </Stack>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}
