'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashboardOverview, useTrendingArticles, useAdminAds, useMediaLibrary } from '@/hooks/api-hooks';
import { AdminShell } from '@/components/layout/AdminShell';
import { ArticleCard } from '@/components/news/ArticleCard';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingBlock } from '@/components/states/LoadingBlock';

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="overline" sx={{ letterSpacing: 2, color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function Meter({ label, value, max, color = 'primary' }: { label: string; value: number; max: number; color?: 'primary' | 'secondary' | 'warning' }) {
  const percent = max > 0 ? Math.max(4, (value / max) * 100) : 4;
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {value}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percent}
          color={color}
          sx={{ mt: 1.5, height: 8, borderRadius: 2 }}
        />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: overview } = useDashboardOverview();
  const { data: trending } = useTrendingArticles();
  const { data: ads } = useAdminAds();
  const { data: media } = useMediaLibrary({ limit: 4 });
  const topTrending = trending?.slice(0, 4) ?? [];

  const articleStats = overview?.articles || {};
  const userStats = overview?.users || {};
  const adStats = overview?.ads || {};
  const maxArticle = Math.max(...Object.values(articleStats), 0);
  const maxUsers = Math.max(...Object.values(userStats), 0);
  const maxAds = Math.max(...Object.values(adStats), 0);

  return (
    <AdminShell title="Dashboard" description="Pulse of your newsroom and monetization.">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile label="Published" value={overview?.articles?.published || 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile label="Draft" value={overview?.articles?.draft || 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile label="Active ads" value={overview?.ads?.active || ads?.length || 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile label="Media" value={overview?.media?.library || media?.length || 0} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Articles status
          </Typography>
          {Object.keys(articleStats).length === 0 && <LoadingBlock lines={2} />}
          {Object.entries(articleStats).map(([key, value]) => (
            <Meter key={key} label={key} value={value || 0} max={maxArticle} color="primary" />
          ))}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Users by role
          </Typography>
          {Object.keys(userStats).length === 0 && <LoadingBlock lines={2} />}
          {Object.entries(userStats).map(([key, value]) => (
            <Meter key={key} label={key} value={value || 0} max={maxUsers} color="secondary" />
          ))}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Ads performance
          </Typography>
          {Object.keys(adStats).length === 0 && <LoadingBlock lines={2} />}
          {Object.entries(adStats).map(([key, value]) => (
            <Meter key={key} label={key} value={value || 0} max={maxAds} color="warning" />
          ))}
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
            Top performers
          </Typography>
          {!trending && <LoadingBlock lines={3} />}
          {topTrending.length === 0 && trending && <EmptyState title="No trending yet" description="Publish more to populate." />}
          <Grid container spacing={2}>
            {topTrending.map((article) => (
              <Grid key={article.id} size={{ xs: 12, sm: 6 }}>
                <ArticleCard article={article} />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardHeader title="Ad slots" />
            <CardContent>
              {!ads && <LoadingBlock lines={2} />}
              {ads?.length === 0 && <EmptyState title="No ads" description="Create ad placements to see them here." />}
              <Stack spacing={1.5}>
                {ads?.map((ad) => (
                  <Card key={ad.id} variant="outlined" sx={{ borderRadius: 1.5, p: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {ad.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ad.position} • priority {ad.priority ?? '-'}
                    </Typography>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AdminShell>
  );
}
