'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { Button } from '@/components/ui/Button';
import {
  useDashboardOverview,
  useTrendingArticles,
  useAdminAds,
  useMediaLibrary,
  useDashboardArticleStats,
  useDashboardCategoryDistribution,
  useDashboardTrafficTrends,
  useDashboardAuthorActivity,
  useAnalyticsTraffic,
  useAnalyticsAdsSummary,
  useAnalyticsAdsTop,
  useAdminCategories,
} from '@/hooks/api-hooks';
import { AdminShell } from '@/components/layout/AdminShell';
import { ArticleCard } from '@/components/news/ArticleCard';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingBlock } from '@/components/states/LoadingBlock';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText } from '@/lib/utils';
import { useTheme } from '@mui/material/styles';

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

type SparklineMetricCardProps = {
  label: string;
  value: string;
  change?: number | null;
  data: number[];
  loading: boolean;
  emptyMessage?: string;
  color?: 'primary' | 'secondary' | 'warning';
};

function SparklineMetricCard({ label, value, change, data, loading, emptyMessage, color = 'primary' }: SparklineMetricCardProps) {
  const theme = useTheme();
  const resolvedColor = theme.palette[color].main;
  const showTrend = typeof change === 'number' && !Number.isNaN(change);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 2, color: 'text.secondary' }}>
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {value}
            </Typography>
            {showTrend && (
              <Chip
                size="small"
                label={`${change! > 0 ? '+' : ''}${change!.toFixed(1)}%`}
                color={change! >= 0 ? 'success' : 'error'}
                sx={{ mt: 1, fontWeight: 600 }}
              />
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 140 }}>
            {loading && <LoadingBlock lines={2} />}
            {!loading && data.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                {emptyMessage || 'No analytics yet'}
              </Typography>
            )}
            {!loading && data.length > 0 && (
              <SparkLineChart
                width={180}
                height={80}
                data={data}
                colors={[resolvedColor]}
                curve="linear"
                showTooltip={false}
                showHighlight={false}
                margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
              />
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

type TrafficWindow = '24h' | '7d' | '30d';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [days, setDays] = useState(7);
  const [deskFilter, setDeskFilter] = useState<string>('all');
  const [trafficWindow, setTrafficWindow] = useState<TrafficWindow>('7d');
  const { data: overview } = useDashboardOverview();
  const { data: trending } = useTrendingArticles();
  const { data: ads } = useAdminAds();
  const { data: media } = useMediaLibrary({ limit: 4 });
  const { data: categories } = useAdminCategories();
  const articleStatsRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [days]);
  const trafficParams = useMemo(() => ({ days }), [days]);
  const { data: articleStatsSeries } = useDashboardArticleStats(articleStatsRange);
  const { data: categoryDistribution } = useDashboardCategoryDistribution();
  const { data: trafficTrends } = useDashboardTrafficTrends(trafficParams);
  const activeDeskId = deskFilter === 'all' ? undefined : deskFilter;
  const { data: authorActivity } = useDashboardAuthorActivity({ limit: 6, categoryId: activeDeskId, days });
  const trafficIntervals: Record<TrafficWindow, string> = {
    '24h': '1h',
    '7d': '6h',
    '30d': '1d',
  };
  const { data: analyticsTraffic } = useAnalyticsTraffic({
    window: trafficWindow,
    interval: trafficIntervals[trafficWindow],
    categoryId: activeDeskId,
  });
  const { data: adsSummary } = useAnalyticsAdsSummary();
  const { data: topAds } = useAnalyticsAdsTop({ limit: 5, sort: 'ctr', categoryId: activeDeskId });
  const topTrending = trending?.slice(0, 4) ?? [];
  const deskOptions =
    categories?.map((category) => ({
      id: category.id,
      label: getLocalizedText(category.name, language) || 'Desk',
    })) ?? [];

  const articleStats = overview?.articles || {};
  const userStats = overview?.users || {};
  const adStats = overview?.ads || {};
  const maxArticle = Math.max(...Object.values(articleStats), 0);
  const maxUsers = Math.max(...Object.values(userStats), 0);
  const maxAds = Math.max(...Object.values(adStats), 0);
  const formatDateLabel = (value: string) =>
    new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric' }).format(new Date(value));
  const articleBarData = articleStatsSeries ?? [];
  const articleLabels = articleBarData.map((point) => formatDateLabel(point.date));
  const categoryPieData =
    categoryDistribution?.map((category, index) => ({
      id: category.categoryId,
      value: category.count ?? 0,
      label: getLocalizedText(category.categoryName, language) || `Category ${index + 1}`,
    })) ?? [];
  const trafficData = trafficTrends ?? [];
  const trafficLabels = trafficData.map((point) => formatDateLabel(point.date));
  const sparklineViews = analyticsTraffic?.map((point) => point.pageViews ?? 0) ?? [];
  const sparklineUsers = analyticsTraffic?.map((point) => point.uniqueUsers ?? 0) ?? [];
  const engagementSeries = trafficData.map((point) => (point.likes ?? 0) + (point.shares ?? 0));
  const getLastValue = (values: number[]) => (values.length > 0 ? values[values.length - 1] : 0);
  const computeChange = (values: number[]) => {
    if (values.length < 2) return null;
    const firstNonZero = values.find((value) => value !== 0) ?? values[0] ?? 0;
    const last = getLastValue(values);
    if (firstNonZero === 0) {
      return last === 0 ? 0 : 100;
    }
    const change = ((last - firstNonZero) / firstNonZero) * 100;
    return Number.isFinite(change) ? change : null;
  };
  const formatCompactNumber = (value: number) => {
    const options: Intl.NumberFormatOptions =
      value >= 1000
        ? { notation: 'compact', maximumFractionDigits: 1 }
        : { maximumFractionDigits: 0 };
    return new Intl.NumberFormat('en-US', options).format(value);
  };
  const toPercentNumber = (value?: number) => {
    if (value === undefined || value === null) return 0;
    return value > 1 ? value : value * 100;
  };
  const analyticsEmptyMessage = 'Analytics API has not returned data yet';
  const adPositionData = adsSummary?.byPosition ?? [];
  const adPositionLabels = adPositionData.map((item) => item.position);
  const adPositionCtr = adPositionData.map((item) => toPercentNumber(item.ctr));
  const trafficWindowOptions: { label: string; value: TrafficWindow }[] = [
    { label: '24h', value: '24h' },
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
  ];

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
      <Stack direction="row" spacing={2} mt={2} alignItems="center" flexWrap="wrap" rowGap={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Range:
          </Typography>
          {[7, 14, 30].map((option) => (
            <Button key={option} variant={days === option ? 'secondary' : 'outline'} size="small" onClick={() => setDays(option)}>
              {option}d
            </Button>
          ))}
        </Stack>
        <TextField
          select
          label="Desk"
          size="small"
          value={deskFilter}
          onChange={(event) => setDeskFilter(event.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All desks</MenuItem>
          {deskOptions.map((desk) => (
            <MenuItem key={desk.id} value={desk.id}>
              {desk.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Traffic window"
          size="small"
          value={trafficWindow}
          onChange={(event) => setTrafficWindow(event.target.value as TrafficWindow)}
          sx={{ minWidth: 160 }}
        >
          {trafficWindowOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SparklineMetricCard
            label="Page views"
            value={formatCompactNumber(getLastValue(sparklineViews))}
            change={computeChange(sparklineViews)}
            data={sparklineViews}
            loading={!analyticsTraffic}
            emptyMessage={analyticsEmptyMessage}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SparklineMetricCard
            label="Unique visitors"
            value={formatCompactNumber(getLastValue(sparklineUsers))}
            change={computeChange(sparklineUsers)}
            data={sparklineUsers}
            loading={!analyticsTraffic}
            emptyMessage={analyticsEmptyMessage}
            color="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SparklineMetricCard
            label="Engagement (likes + shares)"
            value={formatCompactNumber(getLastValue(engagementSeries))}
            change={computeChange(engagementSeries)}
            data={engagementSeries}
            loading={!trafficTrends}
            emptyMessage="Engagement data arrives once readers interact."
            color="warning"
          />
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
            <CardHeader title="Top ads by CTR" />
            <CardContent>
              {!topAds && <LoadingBlock lines={2} />}
              {topAds?.length === 0 && topAds && <EmptyState title="No data" description="Ads need impressions before stats appear." />}
              {topAds && topAds.length > 0 && (
                <Stack spacing={2}>
                  <BarChart
                    height={220}
                    xAxis={[{ scaleType: 'band', data: topAds.map((ad) => ad.name || 'Ad') }]}
                    series={[{ label: 'CTR %', data: topAds.map((ad) => toPercentNumber(ad.ctr)) }]}
                    margin={{ left: 40, right: 10, top: 20, bottom: 30 }}
                    slotProps={{ legend: { hidden: true } }}
                  />
                  <Stack spacing={1.5}>
                    {topAds.map((ad, index) => (
                      <Stack
                        key={ad.id ?? `${ad.name ?? 'ad'}-${index}`}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}
                      >
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {ad.name || 'Ad'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ad.impressions?.toLocaleString() ?? 0} impressions • {ad.clicks?.toLocaleString() ?? 0} clicks
                          </Typography>
                        </Box>
                        <Chip label={`CTR ${toPercentNumber(ad.ctr).toFixed(2)}%`} color="secondary" size="small" />
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Publishing cadence ({days} days)
            </Typography>
            {!articleStatsSeries && <LoadingBlock lines={3} />}
            {articleStatsSeries && articleBarData.length === 0 && (
              <EmptyState title="No recent publishing" description="Recent activity appears once stories go live." />
            )}
            {articleBarData.length > 0 && (
              <BarChart
                height={320}
                xAxis={[{ scaleType: 'band', data: articleLabels }]}
                series={[
                  { label: 'Stories', data: articleBarData.map((point) => point.count ?? 0) },
                  { label: 'Views', data: articleBarData.map((point) => point.views ?? 0) },
                ]}
                margin={{ left: 40, right: 10, top: 20, bottom: 20 }}
                slotProps={{ legend: { hidden: false } }}
              />
            )}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Category mix
            </Typography>
            {!categoryDistribution && <LoadingBlock lines={3} />}
            {categoryDistribution && categoryPieData.length === 0 && (
              <EmptyState title="No categories" description="Add articles by category to populate the chart." />
            )}
            {categoryPieData.length > 0 && (
              <PieChart
                height={320}
                series={[
                  {
                    data: categoryPieData.map((item) => ({
                      id: item.id,
                      value: item.value || 0,
                      label: item.label,
                    })),
                    innerRadius: 40,
                    paddingAngle: 2,
                  },
                ]}
                slotProps={{ legend: { position: { vertical: 'bottom', horizontal: 'middle' } } }}
              />
            )}
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Traffic trend ({days} days)
              </Typography>
              {!trafficTrends && <LoadingBlock lines={4} />}
              {trafficTrends && trafficData.length === 0 && (
                <EmptyState title="No traffic yet" description="Analytics will appear once the API returns data." />
              )}
              {trafficData.length > 0 && (
                <LineChart
                  height={320}
                  xAxis={[{ data: trafficLabels, scaleType: 'point' }]}
                  series={[
                    { id: 'views', label: 'Views', data: trafficData.map((point) => point.views ?? 0) },
                    { id: 'articles', label: 'Articles', data: trafficData.map((point) => point.articles ?? 0) },
                  ]}
                  margin={{ left: 40, right: 20, top: 20, bottom: 20 }}
                  slotProps={{ legend: { hidden: false } }}
                />
              )}
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Author activity
              </Typography>
              {!authorActivity && <LoadingBlock lines={3} />}
              {authorActivity && authorActivity.length === 0 && (
                <EmptyState title="No author data" description="Publish stories to see author metrics." />
              )}
              {authorActivity && authorActivity.length > 0 && (
                <BarChart
                  height={320}
                  xAxis={[{ scaleType: 'band', data: authorActivity.map((item) => item.name) }]}
                  series={[
                    { label: 'Articles', data: authorActivity.map((item) => item.articleCount ?? 0) },
                    { label: 'Views', data: authorActivity.map((item) => item.views ?? 0) },
                  ]}
                  margin={{ left: 40, right: 10, bottom: 40 }}
                  slotProps={{ legend: { hidden: false } }}
                />
              )}
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Ad CTR by position
              </Typography>
              {!adsSummary && <LoadingBlock lines={3} />}
              {adsSummary && adPositionData.length === 0 && (
                <EmptyState title="No ad positions yet" description="Once ads run in multiple slots, CTR insights appear here." />
              )}
              {adPositionData.length > 0 && (
                <BarChart
                  height={320}
                  xAxis={[{ scaleType: 'band', data: adPositionLabels }]}
                  series={[{ label: 'CTR %', data: adPositionCtr }]}
                  margin={{ left: 40, right: 10, top: 20, bottom: 40 }}
                  slotProps={{ legend: { hidden: true } }}
                />
              )}
              {adsSummary?.totals && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total impressions: {adsSummary.totals.impressions?.toLocaleString() ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total clicks: {adsSummary.totals.clicks?.toLocaleString() ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall CTR: {toPercentNumber(adsSummary.totals.ctr).toFixed(2)}%
                  </Typography>
                </Stack>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminShell>
  );
}
