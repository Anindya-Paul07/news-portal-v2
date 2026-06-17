'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { MediaPickerDialog } from '@/components/media/MediaPickerDialog';
import {
  useAdminAds,
  useAdminArticles,
  useAdminCategories,
  useAnalyticsAdsSummary,
  useAnalyticsAdsTop,
  useDeleteAd,
  useLayoutSettings,
  useSaveAd,
  useSaveLayoutSettings,
} from '@/hooks/api-hooks';
import { AD_PRESETS, AD_PRESET_ORDER, getAdCategoryIds, inferAdPreset } from '@/lib/ad-presets';
import { readLayoutCuration, writeLayoutCuration } from '@/lib/layout-curation-store';
import type { Advertisement, AdvertisementPayload, AdPresetKey, Article, Category, LayoutCuration } from '@/lib/types';
import { useAlert } from '@/contexts/alert-context';
import { useAuth } from '@/contexts/auth-context';
import { getDisplayErrorMessage } from '@/lib/errors';
import { canAccessAdminArea } from '@/lib/rbac';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingBlock } from '@/components/states/LoadingBlock';
import { getLocalizedText, resolveMediaUrl } from '@/lib/utils';
import { useAdminAreaGuard } from '@/hooks/useAdminAreaGuard';

type AdDraft = {
  name: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  preset: AdPresetKey;
  page: string;
  linkUrl: string;
  imageUrl: string;
  imageAltEn: string;
  imageAltBn: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  client: string;
  openInNewTab: boolean;
  categoryIds: string[];
};

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const initialAdDraft: AdDraft = {
  name: '',
  titleEn: '',
  titleBn: '',
  descriptionEn: '',
  descriptionBn: '',
  preset: 'home_top_leaderboard',
  page: 'home',
  linkUrl: '',
  imageUrl: '',
  imageAltEn: '',
  imageAltBn: '',
  startDate: toDateInputValue(new Date()),
  endDate: toDateInputValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  isActive: true,
  priority: 5,
  client: '',
  openInNewTab: true,
  categoryIds: [],
};

const presetChips = AD_PRESET_ORDER.map((key) => AD_PRESETS[key]);
const presetFilterOptions: Array<[string, string]> = [
  ['all', 'All presets'],
  ...AD_PRESET_ORDER.map((key) => [key, AD_PRESETS[key].label] as [string, string]),
];

const getArticleTitle = (article: Article) => getLocalizedText(article.title, 'en') || article.slug || article.id;
const getCategoryLabel = (category: Category) => getLocalizedText(category.name, 'en') || category.slug;
const asDateInputValue = (value?: string) => (value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString().slice(0, 10) : '');
const asIsoDate = (value?: string, endOfDay = false) => {
  if (!value) return undefined;
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
};
const isValidAbsoluteUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
const getClientLabel = (client: Advertisement['client']) => {
  if (!client) return '';
  if (typeof client === 'string') return client;
  if (typeof client === 'object' && 'name' in client && typeof client.name === 'string') return client.name;
  return '';
};

const buildPayload = (draft: AdDraft, editingId?: string | null): AdvertisementPayload => {
  const preset = AD_PRESETS[draft.preset];
  const uniquePages = Array.from(new Set([draft.page, ...preset.displayPages].filter(Boolean)));
  return {
    id: editingId || undefined,
    name: draft.name,
    title: { en: draft.titleEn, bn: draft.titleBn },
    description: { en: draft.descriptionEn, bn: draft.descriptionBn },
    type: preset.type,
    position: preset.position,
    page: draft.page,
    image: draft.imageUrl
      ? { url: draft.imageUrl, alt: { en: draft.imageAltEn, bn: draft.imageAltBn } }
      : undefined,
    linkUrl: draft.linkUrl || undefined,
    openInNewTab: draft.openInNewTab,
    client: draft.client || undefined,
    categories: draft.categoryIds.length ? draft.categoryIds : undefined,
    startDate: asIsoDate(draft.startDate),
    endDate: asIsoDate(draft.endDate, true),
    isActive: draft.isActive,
    displayPages: uniquePages.length ? uniquePages : undefined,
    priority: draft.priority,
  };
};

const hydrateDraft = (ad: Advertisement): AdDraft => {
  const preset = inferAdPreset(ad) ?? 'home_top_leaderboard';
  return {
    name: ad.name || getLocalizedText(ad.title, 'en') || '',
    titleEn: getLocalizedText(ad.title, 'en'),
    titleBn: getLocalizedText(ad.title, 'bn'),
    descriptionEn: getLocalizedText(ad.description, 'en'),
    descriptionBn: getLocalizedText(ad.description, 'bn'),
    preset,
    page: ad.page || ad.displayPages?.[0] || AD_PRESETS[preset].page,
    linkUrl: ad.linkUrl || ad.targetUrl || '',
    imageUrl: ad.image && typeof ad.image === 'object' ? ad.image.url || ad.imageUrl || '' : ad.imageUrl || '',
    imageAltEn: typeof ad.image?.alt === 'string' ? ad.image.alt : ad.image?.alt?.en || '',
    imageAltBn: typeof ad.image?.alt === 'string' ? '' : ad.image?.alt?.bn || '',
    startDate: asDateInputValue(ad.startDate || ad.activeFrom),
    endDate: asDateInputValue(ad.endDate || ad.activeTo),
    isActive: ad.isActive ?? true,
    priority: ad.priority ?? 5,
    client: getClientLabel(ad.client),
    openInNewTab: ad.openInNewTab ?? true,
    categoryIds: getAdCategoryIds(ad),
  };
};

const getCtr = (ad?: Advertisement) => {
  if (!ad?.impressions || !ad.clicks) return '0.0%';
  return `${((ad.clicks / ad.impressions) * 100).toFixed(1)}%`;
};

export default function AdsPage() {
  useAdminAreaGuard('ads');
  const { status, user } = useAuth();
  const { notify } = useAlert();
  const canLoadAds = status === 'authenticated' && canAccessAdminArea(user?.role, 'ads');
  const { data: ads, isError, error, refetch, isLoading: isAdsLoading } = useAdminAds({ enabled: canLoadAds });
  const { data: categories } = useAdminCategories({ enabled: canLoadAds });
  const { data: articles } = useAdminArticles({ status: 'published', limit: 50, sort: '-publishedAt' }, { enabled: canLoadAds });
  const { data: analyticsSummary } = useAnalyticsAdsSummary({ enabled: canLoadAds });
  const { data: analyticsTop } = useAnalyticsAdsTop({ limit: 6, sort: 'impressions', order: 'desc' }, { enabled: canLoadAds });
  const { data: layoutSettings } = useLayoutSettings({ enabled: canLoadAds });
  const { mutateAsync: saveAd } = useSaveAd();
  const { mutateAsync: saveLayoutSettings } = useSaveLayoutSettings();
  const { mutateAsync: deleteAd } = useDeleteAd();

  const [draft, setDraft] = useState<AdDraft>(initialAdDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterPage, setFilterPage] = useState<'all' | 'home' | 'category' | 'article'>('all');
  const [filterPreset, setFilterPreset] = useState<'all' | AdPresetKey>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterWindow, setFilterWindow] = useState<'all' | 'scheduled' | 'expired' | 'running'>('all');
  const [curationDraft, setCurationDraft] = useState<LayoutCuration | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [referenceNow] = useState(() => Date.now());

  const filteredAds = useMemo(() => {
    return (ads ?? []).filter((ad) => {
      const preset = inferAdPreset(ad);
      const adPage = ad.page || ad.displayPages?.[0] || 'all';
      const categoryIds = getAdCategoryIds(ad);
      const start = ad.startDate || ad.activeFrom;
      const end = ad.endDate || ad.activeTo;
      const startMs = start ? Date.parse(start) : undefined;
      const endMs = end ? Date.parse(end) : undefined;

      const matchesPage = filterPage === 'all' ? true : adPage === filterPage || ad.displayPages?.includes(filterPage);
      const matchesPreset = filterPreset === 'all' ? true : preset === filterPreset;
      const matchesStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'active'
            ? ad.isActive !== false
            : ad.isActive === false;
      const matchesCategory = filterCategory === 'all' ? true : categoryIds.includes(filterCategory);
      const matchesWindow =
        filterWindow === 'all'
          ? true
          : filterWindow === 'scheduled'
            ? Boolean(startMs && startMs > referenceNow)
            : filterWindow === 'expired'
              ? Boolean(endMs && endMs < referenceNow)
              : (!startMs || startMs <= referenceNow) && (!endMs || endMs >= referenceNow);

      return matchesPage && matchesPreset && matchesStatus && matchesCategory && matchesWindow;
    });
  }, [ads, filterCategory, filterPage, filterPreset, filterStatus, filterWindow, referenceNow]);

  const groupedAds = useMemo(() => {
    return AD_PRESET_ORDER.map((key) => ({
      preset: AD_PRESETS[key],
      ads: filteredAds
        .filter((ad) => (inferAdPreset(ad) ?? key) === key)
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)),
    })).filter((group) => group.ads.length > 0 || filterPreset === group.preset.key);
  }, [filteredAds, filterPreset]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      notify({ type: 'error', title: 'Missing ad name', description: 'Add an internal campaign name before saving.' });
      return;
    }
    if (!isValidAbsoluteUrl(draft.linkUrl.trim())) {
      notify({ type: 'error', title: 'Invalid target URL', description: 'Use a full http or https URL for the ad destination.' });
      return;
    }
    if (!isValidAbsoluteUrl(draft.imageUrl.trim())) {
      notify({ type: 'error', title: 'Invalid creative URL', description: 'Use a full http or https URL for the creative image.' });
      return;
    }
    if (!draft.startDate || !draft.endDate || Date.parse(draft.startDate) > Date.parse(draft.endDate)) {
      notify({ type: 'error', title: 'Invalid schedule', description: 'Choose a valid start date and an end date after it.' });
      return;
    }
    try {
      await saveAd(buildPayload(draft, editingId));
      setDraft(initialAdDraft);
      setEditingId(null);
      notify({
        type: 'success',
        title: editingId ? 'Advertisement updated' : 'Advertisement saved',
        description: 'Placement inventory refreshed with the selected preset.',
      });
    } catch (submitError) {
      notify({
        type: 'error',
        title: editingId ? 'Ad update failed' : 'Ad save failed',
        description: getDisplayErrorMessage(submitError, 'ad-save'),
      });
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingId(ad.id);
    setDraft(hydrateDraft(ad));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (adId: string) => {
    if (!window.confirm('Delete this advertisement?')) return;
    try {
      await deleteAd(adId);
      notify({ type: 'success', title: 'Advertisement deleted', description: 'The placement inventory has been updated.' });
      if (editingId === adId) {
        setEditingId(null);
        setDraft(initialAdDraft);
      }
    } catch (deleteError) {
      notify({ type: 'error', title: 'Delete failed', description: getDisplayErrorMessage(deleteError, 'ad-delete') });
    }
  };

  const selectedPreset = AD_PRESETS[draft.preset];
  const articleOptions = articles ?? [];
  const categoryOptions = categories ?? [];
  const curation = curationDraft ?? layoutSettings ?? readLayoutCuration();
  const adsEnabled = curation.adsEnabled ?? true;
  const categoryFilterOptions: Array<[string, string]> = [
    ['all', 'All categories'],
    ...categoryOptions.map((category) => [category.id, getCategoryLabel(category)] as [string, string]),
  ];

  const saveCuration = async () => {
    try {
      const saved = await saveLayoutSettings(curation);
      writeLayoutCuration(saved);
      setCurationDraft(saved);
      notify({
        type: 'success',
        title: 'Editorial layout updated',
        description: 'Homepage and section overrides are now stored in the backend settings API.',
      });
    } catch (saveError) {
      writeLayoutCuration(curation);
      notify({
        type: 'error',
        title: 'Layout settings save failed',
        description: getDisplayErrorMessage(saveError, 'default'),
      });
    }
  };

  const toggleAdsVisibility = async () => {
    const nextCuration = { ...curation, adsEnabled: !adsEnabled };
    setCurationDraft(nextCuration);
    writeLayoutCuration(nextCuration);

    try {
      const saved = await saveLayoutSettings(nextCuration);
      writeLayoutCuration(saved);
      setCurationDraft(saved);
      notify({
        type: 'success',
        title: saved.adsEnabled === false ? 'Ads hidden' : 'Ads visible',
        description:
          saved.adsEnabled === false
            ? 'Public ad slots are temporarily turned off.'
            : 'Public ad slots are turned back on.',
      });
    } catch (saveError) {
      notify({
        type: 'error',
        title: 'Ad visibility save failed',
        description: getDisplayErrorMessage(saveError, 'default'),
      });
    }
  };

  if (!canLoadAds) {
    return (
      <AdminShell
        title="Advertisements"
        description="Manage newsroom ad inventory by placement preset, schedule, targeting, and performance."
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {status === 'loading' || status === 'idle' ? (
            <LoadingBlock lines={4} />
          ) : (
            <ErrorState title="You need an admin or super admin account to manage advertisements." />
          )}
        </Box>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Advertisements"
      description="Manage newsroom ad inventory by placement preset, schedule, targeting, and performance."
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <Card elevation={4} sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <CardHeader
                title={editingId ? 'Edit placement inventory' : 'Create placement inventory'}
                subheader="Presets map to the existing advertisement API while giving editors clearer slot intent."
              />
              <CardContent>
                <form onSubmit={onSubmit}>
                  <Stack spacing={3}>
                    <div>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: 0.4 }}>
                        Placement preset
                      </Typography>
                      <Grid container spacing={1.2}>
                        {presetChips.map((preset) => (
                          <Grid key={preset.key} size={{ xs: 12, md: 6 }}>
                            <Card
                              onClick={() => setDraft((current) => ({ ...current, preset: preset.key, page: preset.page }))}
                              variant={draft.preset === preset.key ? 'elevation' : 'outlined'}
                              sx={{
                                cursor: 'pointer',
                                borderRadius: 3,
                                borderColor: draft.preset === preset.key ? 'primary.main' : 'divider',
                                boxShadow: draft.preset === preset.key ? 4 : 0,
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                  <div>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                      {preset.label}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                                      {preset.description}
                                    </Typography>
                                  </div>
                                  <Chip size="small" label={preset.aspectRatio} color="secondary" />
                                </Stack>
                                <Box
                                  sx={{
                                    mt: 1.75,
                                    width: '100%',
                                    aspectRatio: `${preset.preview.width} / ${preset.preview.height}`,
                                    borderRadius: 2,
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                    background:
                                      preset.renderMode === 'sidebarTall'
                                        ? 'linear-gradient(180deg, rgba(123,26,41,0.18), rgba(8,15,28,0.12))'
                                        : 'linear-gradient(135deg, rgba(123,26,41,0.16), rgba(255,255,255,0.08))',
                                  }}
                                />
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </div>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Input
                          label="Internal name"
                          value={draft.name}
                          onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))}
                          required
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Input
                          label="Client / advertiser"
                          value={draft.client}
                          onChange={(e) => setDraft((current) => ({ ...current, client: e.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Input
                          label="Title (EN)"
                          value={draft.titleEn}
                          onChange={(e) => setDraft((current) => ({ ...current, titleEn: e.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Input
                          label="Title (BN)"
                          value={draft.titleBn}
                          onChange={(e) => setDraft((current) => ({ ...current, titleBn: e.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Textarea
                          label="Description (EN)"
                          value={draft.descriptionEn}
                          onChange={(e) => setDraft((current) => ({ ...current, descriptionEn: e.target.value }))}
                          minRows={3}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Textarea
                          label="Description (BN)"
                          value={draft.descriptionBn}
                          onChange={(e) => setDraft((current) => ({ ...current, descriptionBn: e.target.value }))}
                          minRows={3}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Input
                          label="Page target"
                          value={draft.page}
                          onChange={(e) => setDraft((current) => ({ ...current, page: e.target.value }))}
                          helper={`Default for this preset: ${selectedPreset.page}`}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Input
                          label="Priority"
                          type="number"
                          value={draft.priority}
                          onChange={(e) => setDraft((current) => ({ ...current, priority: Number(e.target.value) }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Stack spacing={0.5}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={draft.isActive}
                                onChange={(e) => setDraft((current) => ({ ...current, isActive: e.target.checked }))}
                              />
                            }
                            label="Active"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={draft.openInNewTab}
                                onChange={(e) => setDraft((current) => ({ ...current, openInNewTab: e.target.checked }))}
                              />
                            }
                            label="Open in new tab"
                          />
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Input
                          label="Target URL"
                          value={draft.linkUrl}
                          onChange={(e) => setDraft((current) => ({ ...current, linkUrl: e.target.value }))}
                          required
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Textarea
                          label="Creative image URL"
                          value={draft.imageUrl}
                          onChange={(e) => setDraft((current) => ({ ...current, imageUrl: e.target.value }))}
                          helper="Use a full http or https URL. Media library selections are converted automatically."
                          minRows={3}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="small"
                          onClick={() => setMediaPickerOpen(true)}
                          sx={{ mt: 1.5 }}
                        >
                          Choose from media library
                        </Button>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Input
                          label="Alt text (EN)"
                          value={draft.imageAltEn}
                          onChange={(e) => setDraft((current) => ({ ...current, imageAltEn: e.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Input
                          label="Alt text (BN)"
                          value={draft.imageAltBn}
                          onChange={(e) => setDraft((current) => ({ ...current, imageAltBn: e.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Input
                          label="Start date"
                          type="date"
                          value={draft.startDate}
                          onChange={(e) => setDraft((current) => ({ ...current, startDate: e.target.value }))}
                          required
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Input
                          label="End date"
                          type="date"
                          value={draft.endDate}
                          onChange={(e) => setDraft((current) => ({ ...current, endDate: e.target.value }))}
                          required
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="ad-category-targeting">Category targeting</InputLabel>
                          <Select
                            labelId="ad-category-targeting"
                            multiple
                            value={draft.categoryIds}
                            label="Category targeting"
                            onChange={(e) =>
                              setDraft((current) => ({ ...current, categoryIds: e.target.value as string[] }))
                            }
                            renderValue={(selected) =>
                              selected.length
                                ? selected
                                    .map((id) => categoryOptions.find((category) => category.id === id))
                                    .filter(Boolean)
                                    .map((category) => getCategoryLabel(category as Category))
                                    .join(', ')
                                : 'All categories'
                            }
                          >
                            {categoryOptions.map((category) => (
                              <MenuItem key={category.id} value={category.id}>
                                {getCategoryLabel(category)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Stack direction="row" spacing={1.5}>
                      <Button type="submit">{editingId ? 'Update advertisement' : 'Save advertisement'}</Button>
                      {editingId ? (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setDraft(initialAdDraft);
                          }}
                        >
                          Cancel edit
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <Stack spacing={3}>
              <Card elevation={3} sx={{ borderRadius: 4 }}>
                <CardHeader
                  title="Public ad visibility"
                  subheader="Temporarily hide every public ad slot without deleting campaigns."
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Chip
                      label={adsEnabled ? 'Ads are visible' : 'Ads are hidden'}
                      color={adsEnabled ? 'success' : 'warning'}
                      sx={{ width: 'fit-content', fontWeight: 800 }}
                    />
                    <Button onClick={toggleAdsVisibility}>
                      {adsEnabled ? 'Hide all ads' : 'Show all ads'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              <Card elevation={3} sx={{ borderRadius: 4 }}>
                <CardHeader title="Inventory snapshot" subheader="Read-only performance summary from current analytics." />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <MetricCard label="Impressions" value={analyticsSummary?.totals?.impressions ?? 0} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <MetricCard label="Clicks" value={analyticsSummary?.totals?.clicks ?? 0} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <MetricCard label="CTR" value={`${((analyticsSummary?.totals?.ctr ?? 0) * 100).toFixed(1)}%`} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <MetricCard label="Active ads" value={(ads ?? []).filter((ad) => ad.isActive !== false).length} />
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Top performing creatives
                  </Typography>
                  <Stack spacing={1.2}>
                    {(analyticsTop ?? []).map((entry) => (
                      <Box key={entry.id || entry.adId} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {entry.name || entry.title || 'Untitled advertisement'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.impressions ?? 0} impressions • {entry.clicks ?? 0} clicks • {((entry.ctr ?? 0) * 100).toFixed(1)}% CTR
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card elevation={3} sx={{ borderRadius: 4 }}>
                <CardHeader title="Editorial curation" subheader="Override key homepage and section placements without backend changes." />
                <CardContent>
                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="curation-lead">Homepage lead</InputLabel>
                      <Select
                        labelId="curation-lead"
                        label="Homepage lead"
                        value={curation.homepageLeadId || ''}
                        onChange={(e) =>
                          setCurationDraft((current) => ({
                            ...(current ?? curation),
                            homepageLeadId: String(e.target.value) || undefined,
                          }))
                        }
                      >
                        <MenuItem value="">Automatic</MenuItem>
                        {articleOptions.map((article) => (
                          <MenuItem key={article.id} value={article.id}>
                            {getArticleTitle(article)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {[0, 1, 2].map((index) => (
                      <FormControl fullWidth size="small" key={index}>
                        <InputLabel id={`curation-secondary-${index}`}>Homepage secondary {index + 1}</InputLabel>
                        <Select
                          labelId={`curation-secondary-${index}`}
                          label={`Homepage secondary ${index + 1}`}
                          value={curation.homepageSecondaryIds?.[index] || ''}
                          onChange={(e) =>
                            setCurationDraft((current) => {
                              const next = [...((current ?? curation).homepageSecondaryIds ?? [])];
                              if (e.target.value) next[index] = String(e.target.value);
                              else next.splice(index, 1);
                              return { ...(current ?? curation), homepageSecondaryIds: next };
                            })
                          }
                        >
                          <MenuItem value="">Automatic</MenuItem>
                          {articleOptions.map((article) => (
                            <MenuItem key={article.id} value={article.id}>
                              {getArticleTitle(article)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ))}

                    <FormControl fullWidth size="small">
                      <InputLabel id="curation-top-pick-category">Homepage right rail category</InputLabel>
                      <Select
                        labelId="curation-top-pick-category"
                        label="Homepage right rail category"
                        value={curation.homepageTopPickCategorySlug || ''}
                        onChange={(e) =>
                          setCurationDraft((current) => ({
                            ...(current ?? curation),
                            homepageTopPickCategorySlug: String(e.target.value) || undefined,
                          }))
                        }
                      >
                        <MenuItem value="">Automatic</MenuItem>
                        {categoryOptions.map((category) => (
                          <MenuItem key={category.id} value={category.slug}>
                            {getCategoryLabel(category)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {[0, 1, 2].map((index) => (
                      <FormControl fullWidth size="small" key={`most-read-${index}`}>
                        <InputLabel id={`curation-most-read-${index}`}>Most-read override {index + 1}</InputLabel>
                        <Select
                          labelId={`curation-most-read-${index}`}
                          label={`Most-read override ${index + 1}`}
                          value={curation.mostReadOverrideIds?.[index] || ''}
                          onChange={(e) =>
                            setCurationDraft((current) => {
                              const next = [...((current ?? curation).mostReadOverrideIds ?? [])];
                              if (e.target.value) next[index] = String(e.target.value);
                              else next.splice(index, 1);
                              return { ...(current ?? curation), mostReadOverrideIds: next };
                            })
                          }
                        >
                          <MenuItem value="">Automatic</MenuItem>
                          {articleOptions.map((article) => (
                            <MenuItem key={article.id} value={article.id}>
                              {getArticleTitle(article)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ))}

                    {categoryOptions.slice(0, 6).map((category) => (
                      <FormControl fullWidth size="small" key={category.id}>
                        <InputLabel id={`section-promo-${category.id}`}>{`${getCategoryLabel(category)} promo`}</InputLabel>
                        <Select
                          labelId={`section-promo-${category.id}`}
                          label={`${getCategoryLabel(category)} promo`}
                          value={curation.sectionPromoBySlug?.[category.slug] || ''}
                          onChange={(e) =>
                            setCurationDraft((current) => ({
                              ...(current ?? curation),
                              sectionPromoBySlug: {
                                ...((current ?? curation).sectionPromoBySlug ?? {}),
                                [category.slug]: String(e.target.value),
                              },
                            }))
                          }
                        >
                          <MenuItem value="">Automatic</MenuItem>
                          {articleOptions.map((article) => (
                            <MenuItem key={article.id} value={article.id}>
                              {getArticleTitle(article)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ))}

                    <Button onClick={saveCuration}>Save editorial layout overrides</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        <Card elevation={3} sx={{ borderRadius: 4, mt: 3 }}>
          <CardHeader title="Placement inventory" subheader="Filter by page, preset, status, schedule window, and category targeting." />
          <CardContent>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FilterSelect
                  label="Page"
                  value={filterPage}
                  onChange={(value) => setFilterPage(value as typeof filterPage)}
                  options={[
                    ['all', 'All pages'],
                    ['home', 'Homepage'],
                    ['category', 'Category'],
                    ['article', 'Article'],
                  ]}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FilterSelect
                  label="Preset"
                  value={filterPreset}
                  onChange={(value) => setFilterPreset(value as typeof filterPreset)}
                  options={presetFilterOptions}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FilterSelect
                  label="Status"
                  value={filterStatus}
                  onChange={(value) => setFilterStatus(value as typeof filterStatus)}
                  options={[
                    ['all', 'All statuses'],
                    ['active', 'Active'],
                    ['paused', 'Paused'],
                  ]}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FilterSelect
                  label="Window"
                  value={filterWindow}
                  onChange={(value) => setFilterWindow(value as typeof filterWindow)}
                  options={[
                    ['all', 'All windows'],
                    ['running', 'Running now'],
                    ['scheduled', 'Scheduled'],
                    ['expired', 'Expired'],
                  ]}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FilterSelect
                  label="Category"
                  value={filterCategory}
                  onChange={(value) => setFilterCategory(value)}
                  options={categoryFilterOptions}
                />
              </Grid>
            </Grid>

            {isError ? <ErrorState title={getDisplayErrorMessage(error, 'fetch')} onRetry={() => refetch()} /> : null}
            {isAdsLoading ? <LoadingBlock lines={5} /> : null}
            {ads?.length === 0 ? <EmptyState title="No ads yet" description="Create an ad to populate the newsroom inventory." /> : null}

            <Stack spacing={3}>
              {groupedAds.map(({ preset, ads: presetAds }) => (
                <Card key={preset.key} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                          {preset.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                          {preset.description}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                          <Chip size="small" label={preset.page} />
                          <Chip size="small" label={preset.aspectRatio} color="secondary" />
                          <Chip size="small" label={`${preset.type} / ${preset.position}`} variant="outlined" />
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, md: 9 }}>
                        {presetAds.length === 0 ? (
                          <EmptyState title="No matching ads" description="Adjust filters or create a creative for this preset." />
                        ) : (
                          <Grid container spacing={2}>
                            {presetAds.map((ad) => (
                              <Grid size={{ xs: 12, lg: 6 }} key={ad.id}>
                                <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                                  <CardContent>
                                    <Stack spacing={1.1}>
                                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                                        <div>
                                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                            {ad.name || getLocalizedText(ad.title, 'en') || 'Untitled ad'}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {ad.page || ad.displayPages?.join(', ') || preset.page}
                                            {' • '}
                                            priority {ad.priority ?? 0}
                                          </Typography>
                                        </div>
                                        <Chip
                                          size="small"
                                          label={ad.isActive === false ? 'Paused' : 'Active'}
                                          color={ad.isActive === false ? 'default' : 'success'}
                                        />
                                      </Stack>
                                      <Typography variant="body2" color="text.secondary">
                                        {getLocalizedText(ad.description, 'en') || 'No creative description added.'}
                                      </Typography>
                                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                        {getClientLabel(ad.client) ? <Chip size="small" label={getClientLabel(ad.client)} /> : null}
                                        {getAdCategoryIds(ad).map((categoryId) => {
                                          const category = categoryOptions.find((entry) => entry.id === categoryId);
                                          return <Chip key={categoryId} size="small" label={category ? getCategoryLabel(category) : categoryId} variant="outlined" />;
                                        })}
                                      </Stack>
                                      <Typography variant="caption" color="text.secondary">
                                        {ad.impressions ?? 0} impressions • {ad.clicks ?? 0} clicks • {getCtr(ad)} CTR
                                      </Typography>
                                      <Stack direction="row" spacing={1}>
                                        <Button variant="ghost" size="small" onClick={() => handleEdit(ad)}>
                                          Edit
                                        </Button>
                                        <Button variant="outline" size="small" onClick={() => handleDelete(ad.id)}>
                                          Delete
                                        </Button>
                                      </Stack>
                                    </Stack>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
      <MediaPickerDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(item) => {
          setDraft((current) => ({
            ...current,
            imageUrl: resolveMediaUrl(item.url),
            imageAltEn:
              current.imageAltEn ||
              (typeof item.alt === 'string' ? item.alt : item.alt?.en || item.alt?.bn || item.name || item.filename || ''),
            imageAltBn: current.imageAltBn || (typeof item.alt === 'string' ? '' : item.alt?.bn || ''),
          }));
          notify({ type: 'success', title: 'Creative selected', description: 'Ad image URL was added from the media library.' });
        }}
      />
    </AdminShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, height: '100%' }}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(e) => onChange(String(e.target.value))}>
        {options.map(([optionValue, optionLabel]) => (
          <MenuItem key={optionValue} value={optionValue}>
            {optionLabel}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
