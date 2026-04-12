'use client';

import { useMemo, useState } from 'react';
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
import { ArticleCard } from '@/components/news/ArticleCard'; // Now Tailwind based
import { useLanguage } from '@/contexts/language-context';
import { ErrorState } from '@/components/states/ErrorState';
import { getDisplayErrorMessage } from '@/lib/errors';
import { getLocalizedText } from '@/lib/utils';
import { useAdminAreaGuard } from '@/hooks/useAdminAreaGuard';

// Chart components can remain from MUI X Charts as they render SVGs mostly independent of MUI styling system,
// essentially we treat them as 3rd party viz components.
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

// Icons
import { type LucideIcon, FileText, MonitorPlay, Activity } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   INTERNAL COMPONENTS (Tailwind)
   ───────────────────────────────────────────────────────────────────────────── */

function StatTile({ label, value, icon: Icon }: { label: string; value: number | string; icon?: LucideIcon }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-[var(--newsos-border-default)] shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--newsos-text-tertiary)]">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-[var(--newsos-text-tertiary)] group-hover:text-[var(--newsos-accent-primary)] transition-colors" />}
      </div>
      <div className="text-3xl font-black text-[var(--newsos-text-primary)] font-mono tracking-tight">
        {value}
      </div>
    </div>
  );
}

function Meter({ label, value, max, color = 'bg-blue-500' }: { label: string; value: number; max: number; color?: string }) {
  const percent = max > 0 ? Math.min(100, Math.max(2, (value / max) * 100)) : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs font-bold text-[var(--newsos-text-primary)]">{label}</span>
        <span className="text-xs font-mono text-[var(--newsos-text-secondary)]">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-[var(--newsos-bg-secondary)] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color}`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

type SparklineMetricCardProps = {
  label: string;
  value: string;
  change?: number | null;
  data: number[];
  loading: boolean;
  emptyMessage?: string;
  colorHex: string; // Passed to chart
};

function SparklineMetricCard({ label, value, change, data, loading, emptyMessage, colorHex }: SparklineMetricCardProps) {
  const showTrend = typeof change === 'number' && !Number.isNaN(change);
  const isPositive = showTrend && change! >= 0;

  return (
    <div className="bg-white p-5 rounded-lg border border-[var(--newsos-border-default)] shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--newsos-text-tertiary)] mb-1">
          {label}
        </div>
        <div className="flex items-baseline gap-3">
          <div className="text-2xl font-black text-[var(--newsos-text-primary)] font-mono">
            {value}
          </div>
          {showTrend && (
            <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isPositive ? '+' : ''}{change!.toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 h-16 w-full relative">
        {loading && <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Loading...</div>}
        {!loading && data.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">{emptyMessage}</div>
        )}
        {!loading && data.length > 0 && (
          <SparkLineChart
            width={300} // Approximate responsive width handling via container is tricky with MUI X Charts, fixed width is safer or responsive wrapper
            height={64}
            data={data}
            colors={[colorHex]}
            curve="linear"
            showTooltip={false}
            showHighlight={false}
            margin={{ left: 0, right: 0, top: 4, bottom: 4 }}
          />
        )}
      </div>
    </div>
  );
}

type TrafficWindow = '24h' | '7d' | '30d';

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────────────────────── */

export default function AdminDashboard() {
  useAdminAreaGuard('dashboard');
  const { language } = useLanguage();
  
  // -- State --
  const [days, setDays] = useState(7);
  const [deskFilter, setDeskFilter] = useState<string>('all');
  const [trafficWindow, setTrafficWindow] = useState<TrafficWindow>('7d');

  // -- Data --
  const { data: overview, isError: isOverviewError, error: overviewError, refetch: refetchOverview } = useDashboardOverview();
  const { data: trending, isError: isTrendingError, error: trendingError, refetch: refetchTrending } = useTrendingArticles();
  const { data: ads, isError: isAdsError, error: adsError, refetch: refetchAds } = useAdminAds();
  const { data: media, isError: isMediaError, error: mediaError, refetch: refetchMedia } = useMediaLibrary({ limit: 4 });
  const { data: categories, isError: isCategoriesError, error: categoriesError, refetch: refetchCategories } = useAdminCategories();
  
  // Computed Params
  const articleStatsRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [days]);
  
  const trafficParams = useMemo(() => ({ days }), [days]);
  // Queries
  const { data: articleStatsSeries } = useDashboardArticleStats(articleStatsRange);
  const { data: categoryDistribution } = useDashboardCategoryDistribution();
  const { data: trafficTrends } = useDashboardTrafficTrends(trafficParams);
  
  const activeDeskId = deskFilter === 'all' ? undefined : deskFilter;
  const { data: authorActivity } = useDashboardAuthorActivity({ limit: 6, categoryId: activeDeskId, days });
  
  const trafficIntervals: Record<TrafficWindow, string> = { '24h': '1h', '7d': '6h', '30d': '1d' };
  const { data: analyticsTraffic } = useAnalyticsTraffic({
    window: trafficWindow,
    interval: trafficIntervals[trafficWindow],
    categoryId: activeDeskId,
  });
  
  const { data: adsSummary } = useAnalyticsAdsSummary();
  const { data: topAds } = useAnalyticsAdsTop({ limit: 5, sort: 'ctr', categoryId: activeDeskId });
  
  // -- Transformations --
  const topTrending = trending?.slice(0, 4) ?? [];
  const deskOptions = categories?.map((category) => ({
      id: category.id,
      label: getLocalizedText(category.name, language) || 'Desk',
    })) ?? [];

  const articleStats = overview?.articles || {};
  const userStats = overview?.users || {};
  const adStats = overview?.ads || {};
  const maxArticle = Math.max(...Object.values(articleStats), 0);
  const maxUsers = Math.max(...Object.values(userStats), 0);
  const maxAds = Math.max(...Object.values(adStats), 0);
  
  const formatDateLabel = (value: string) => new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric' }).format(new Date(value));
  const articleBarData = articleStatsSeries ?? [];
  const articleLabels = articleBarData.map((point) => formatDateLabel(point.date));
  
  const categoryPieData = categoryDistribution?.map((category, index) => ({
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
    if (firstNonZero === 0) return last === 0 ? 0 : 100;
    const change = ((last - firstNonZero) / firstNonZero) * 100;
    return Number.isFinite(change) ? change : null;
  };
  
  const formatCompactNumber = (value: number) => {
    const options: Intl.NumberFormatOptions = value >= 1000 ? { notation: 'compact', maximumFractionDigits: 1 } : { maximumFractionDigits: 0 };
    return new Intl.NumberFormat('en-US', options).format(value);
  };
  const toPercentNumber = (value?: number) => {
    if (value === undefined || value === null) return 0;
    return value > 1 ? value : value * 100;
  };

  return (
    <AdminShell title="Dashboard" description="Pulse of your newsroom and monetization.">
      {isOverviewError || isTrendingError || isAdsError || isMediaError || isCategoriesError ? (
        <div className="mb-6">
          <ErrorState
            title={getDisplayErrorMessage(overviewError || trendingError || adsError || mediaError || categoriesError, 'fetch')}
            onRetry={() => {
              refetchOverview();
              refetchTrending();
              refetchAds();
              refetchMedia();
              refetchCategories();
            }}
          />
        </div>
      ) : null}
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Published Content" value={overview?.articles?.published || 0} icon={FileText} />
        <StatTile label="Drafts" value={overview?.articles?.draft || 0} icon={FileText} />
        <StatTile label="Active Ads" value={overview?.ads?.active || ads?.length || 0} icon={Activity} />
        <StatTile label="Media Assets" value={overview?.media?.library || media?.length || 0} icon={MonitorPlay} />
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-3 rounded-lg border border-[var(--newsos-border-default)]">
        <div className="flex items-center gap-2 mr-4">
          <span className="text-xs font-bold text-[var(--newsos-text-tertiary)] uppercase">Range:</span>
          {[7, 14, 30].map((option) => (
            <button
              key={option}
              onClick={() => setDays(option)}
              className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                days === option 
                  ? 'bg-[var(--newsos-accent-primary)] text-white' 
                  : 'text-[var(--newsos-text-primary)] hover:bg-[var(--newsos-bg-hover)]'
              }`}
            >
              {option}d
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
           <select 
             value={deskFilter} 
             onChange={(e) => setDeskFilter(e.target.value)}
             className="text-xs font-medium border border-[var(--newsos-border-default)] rounded px-2 py-1.5 focus:outline-none focus:border-[var(--newsos-accent-primary)] bg-[var(--newsos-bg-primary)]"
           >
             <option value="all">All Desks</option>
             {deskOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
           </select>

           <select 
             value={trafficWindow} 
             onChange={(e) => setTrafficWindow(e.target.value as TrafficWindow)}
             className="text-xs font-medium border border-[var(--newsos-border-default)] rounded px-2 py-1.5 focus:outline-none focus:border-[var(--newsos-accent-primary)] bg-[var(--newsos-bg-primary)]"
           >
             <option value="24h">Last 24h</option>
             <option value="7d">Last 7d</option>
             <option value="30d">Last 30d</option>
           </select>
        </div>
      </div>

      {/* Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SparklineMetricCard
          label="Page Views"
          value={formatCompactNumber(getLastValue(sparklineViews))}
          change={computeChange(sparklineViews)}
          data={sparklineViews}
          loading={!analyticsTraffic}
          emptyMessage="No traffic data"
          colorHex="#2563eb"
        />
        <SparklineMetricCard
          label="Unique Visitors"
          value={formatCompactNumber(getLastValue(sparklineUsers))}
          change={computeChange(sparklineUsers)}
          data={sparklineUsers}
          loading={!analyticsTraffic}
          emptyMessage="No traffic data"
          colorHex="#ec4899"
        />
        <SparklineMetricCard
          label="Engagement"
          value={formatCompactNumber(getLastValue(engagementSeries))}
          change={computeChange(engagementSeries)}
          data={engagementSeries}
          loading={!trafficTrends}
          emptyMessage="No data"
          colorHex="#f59e0b"
        />
      </div>

      {/* Status Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg border border-[var(--newsos-border-default)]">
          <h3 className="text-sm font-bold uppercase tracking-wide mb-4 text-[var(--newsos-text-primary)]">Articles Status</h3>
          {Object.entries(articleStats).map(([key, value]) => (
            <Meter key={key} label={key} value={value || 0} max={maxArticle} color="bg-blue-500" />
          ))}
        </div>
        <div className="bg-white p-5 rounded-lg border border-[var(--newsos-border-default)]">
           <h3 className="text-sm font-bold uppercase tracking-wide mb-4 text-[var(--newsos-text-primary)]">Users by Role</h3>
           {Object.entries(userStats).map(([key, value]) => (
            <Meter key={key} label={key} value={value || 0} max={maxUsers} color="bg-purple-500" />
          ))}
        </div>
        <div className="bg-white p-5 rounded-lg border border-[var(--newsos-border-default)]">
           <h3 className="text-sm font-bold uppercase tracking-wide mb-4 text-[var(--newsos-text-primary)]">Ad Inventory</h3>
           {Object.entries(adStats).map(([key, value]) => (
            <Meter key={key} label={key} value={value || 0} max={maxAds} color="bg-amber-500" />
          ))}
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Publishing Cadence */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-[var(--newsos-border-default)]">
           <h3 className="text-sm font-bold uppercase tracking-wide mb-4">Publishing Cadence</h3>
           <div className="h-[300px] w-full">
             {articleBarData.length > 0 ? (
               <BarChart
                 series={[
                   { label: 'Stories', data: articleBarData.map((point) => point.count ?? 0), color: '#3b82f6' },
                   { label: 'Views', data: articleBarData.map((point) => point.views ?? 0), color: '#93c5fd' },
                 ]}
                 xAxis={[{ scaleType: 'band', data: articleLabels }]}
                 slotProps={{ legend: { hidden: false } }}
               />
             ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400 font-mono">No data available</div>
             )}
           </div>
        </div>

        {/* Category Mix */}
        <div className="bg-white p-5 rounded-lg border border-[var(--newsos-border-default)]">
           <h3 className="text-sm font-bold uppercase tracking-wide mb-4">Category Mix</h3>
           <div className="h-[300px] w-full">
             {categoryPieData.length > 0 ? (
               <PieChart
                 series={[
                   {
                     data: categoryPieData.map((item) => ({
                       id: item.id,
                       value: item.value || 0,
                       label: item.label,
                     })),
                     innerRadius: 60,
                     paddingAngle: 2,
                   },
                 ]}
                 slotProps={{ legend: { position: { vertical: 'bottom', horizontal: 'middle' }, itemMarkWidth: 10, itemMarkHeight: 10 } }}
               />
             ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400 font-mono">No categories</div>
             )}
           </div>
        </div>
      </div>

      {/* Traffic & Authors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
         <div className="bg-white p-5 rounded-lg border border-[var(--newsos-border-default)]">
            <h3 className="text-sm font-bold uppercase tracking-wide mb-4">Content Traffic</h3>
            <div className="h-[300px] w-full">
              {trafficData.length > 0 ? (
                 <LineChart
                   xAxis={[{ data: trafficLabels, scaleType: 'point' }]}
                   series={[
                     { label: 'Views', data: trafficData.map((point) => point.views ?? 0), color: '#ef4444' },
                     { label: 'Articles', data: trafficData.map((point) => point.articles ?? 0), color: '#3b82f6' },
                   ]}
                 />
              ) : <div className="h-full flex items-center justify-center text-sm text-gray-400 font-mono">No data</div>}
            </div>
         </div>

         <div className="bg-white p-5 rounded-lg border border-[var(--newsos-border-default)]">
            <h3 className="text-sm font-bold uppercase tracking-wide mb-4">Author Activity</h3>
            <div className="h-[300px] w-full">
               {authorActivity && authorActivity.length > 0 ? (
                 <BarChart
                   layout="horizontal"
                   yAxis={[{ scaleType: 'band', data: authorActivity.map((item) => item.name) }]}
                   series={[
                     { label: 'Articles', data: authorActivity.map((item) => item.articleCount ?? 0), color: '#10b981' },
                   ]}
                   margin={{ left: 100 }}
                 />
               ) : <div className="h-full flex items-center justify-center text-sm text-gray-400 font-mono">No data</div>}
            </div>
         </div>
      </div>

      {/* Tables: Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <h3 className="text-lg font-bold mb-4">Top Performing Stories</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topTrending.map(article => (
                <ArticleCard key={article.id} article={article} className="border border-[var(--newsos-border-default)] rounded-lg !bg-[var(--newsos-bg-secondary)]" />
              ))}
              {topTrending.length === 0 && <div className="col-span-2 py-8 text-center text-gray-400">No trending stories available</div>}
           </div>
        </div>

        <div>
           <h3 className="text-lg font-bold mb-4">Ad Performance (CTR)</h3>
           <div className="bg-white rounded-lg border border-[var(--newsos-border-default)] overflow-hidden">
             {topAds && topAds.length > 0 ? (
                <div>
                   <div className="h-[200px] border-b border-gray-100 p-2">
                      <BarChart
                        xAxis={[{ scaleType: 'band', data: topAds.map(ad => (ad.name || 'Ad').substring(0, 10)) }]}
                        series={[{ label: 'CTR %', data: topAds.map(ad => toPercentNumber(ad.ctr)), color: '#f59e0b' }]}
                        margin={{ left: 40, right: 10, top: 10, bottom: 20 }}
                      />
                   </div>
                   <div className="divide-y divide-gray-100">
                      {topAds.map((ad, idx) => (
                         <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50">
                            <div className="truncate pr-2">
                               <div className="text-xs font-bold text-gray-900 truncate">{ad.name}</div>
                               <div className="text-[10px] text-gray-500">{ad.impressions?.toLocaleString()} imps</div>
                            </div>
                            <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded">
                               {toPercentNumber(ad.ctr).toFixed(1)}%
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             ) : (
                <div className="p-8 text-center text-sm text-gray-400">No ad data</div>
             )}
           </div>
        </div>
      </div>

    </AdminShell>
  );
}
