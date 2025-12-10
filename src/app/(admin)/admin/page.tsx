'use client';

import { useDashboardOverview, useTrendingArticles, useAdminAds, useMediaLibrary } from '@/hooks/api-hooks';
import { AdminShell } from '@/components/layout/AdminShell';
import { ArticleCard } from '@/components/news/ArticleCard';

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">{label}</span>
      <span className="headline text-2xl font-extrabold text-[var(--color-ink)]">{value}</span>
    </div>
  );
}

function Meter({
  label,
  value,
  max,
  color = 'var(--color-primary)',
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const width = max > 0 ? Math.max(4, (value / max) * 100) : 4;
  return (
    <div className="space-y-1 rounded-xl bg-[var(--color-surface-elevated)] p-3 shadow-sm">
      <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
        <span className="font-semibold text-[var(--color-ink)]">{label}</span>
        <span className="font-semibold text-[var(--color-ink)]">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div className="h-full rounded-full" style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
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
      <div className="grid gap-4 md:grid-cols-4">
        <StatTile label="Published" value={overview?.articles?.published || 0} />
        <StatTile label="Draft" value={overview?.articles?.draft || 0} />
        <StatTile label="Active ads" value={overview?.ads?.active || ads?.length || 0} />
        <StatTile label="Media" value={overview?.media?.library || media?.length || 0} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <h4 className="headline text-lg font-bold">Articles status</h4>
          {Object.entries(articleStats).map(([key, value]) => (
            <Meter key={key} label={key} value={value || 0} max={maxArticle} />
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="headline text-lg font-bold">Users by role</h4>
          {Object.entries(userStats).map(([key, value]) => (
            <Meter key={key} label={key} value={value || 0} max={maxUsers} color="var(--color-accent)" />
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="headline text-lg font-bold">Ads performance</h4>
          {Object.entries(adStats).map(([key, value]) => (
            <Meter key={key} label={key} value={value || 0} max={maxAds} color="#f59f0b" />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <h3 className="headline text-xl font-bold">Top performers</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {topTrending.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
          <h4 className="headline text-lg font-bold">Ad slots</h4>
          <div className="space-y-2 text-sm text-[var(--color-muted)]">
            {ads?.map((ad) => (
              <div key={ad.id} className="flex items-center justify-between rounded-xl bg-[rgba(13,59,102,0.06)] px-3 py-2">
                <span className="font-semibold text-[var(--color-ink)]">{ad.title}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">{ad.position}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
