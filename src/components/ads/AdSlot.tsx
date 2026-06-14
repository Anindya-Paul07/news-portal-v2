'use client';

import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { useAds, useLayoutSettings } from '@/hooks/api-hooks';
import { apiClient } from '@/lib/api-client';
import { AD_PRESETS, getAdCategoryIds, getAdPreset, inferAdPreset, type AdRenderMode } from '@/lib/ad-presets';
import { sampleAds } from '@/lib/fallbacks';
import { readLayoutCuration } from '@/lib/layout-curation-store';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText } from '@/lib/utils';
import type { AdPlacement, AdPresetKey, Advertisement } from '@/lib/types';

type LegacySlotKey = 'hero' | 'banner' | 'sidebar' | 'sidebar_middle' | 'in_content' | 'popup' | 'bottom';

type LegacySlotConfig = {
  preset: AdPresetKey;
  position?: AdPlacement;
};

const legacySlotMap: Record<LegacySlotKey, LegacySlotConfig> = {
  hero: { preset: 'home_top_leaderboard', position: 'top' },
  banner: { preset: 'home_mid_leaderboard', position: 'middle' },
  sidebar: { preset: 'home_sidebar_tall', position: 'sidebar_top' },
  sidebar_middle: { preset: 'category_sidebar_tall', position: 'sidebar_middle' },
  in_content: { preset: 'article_inline_wide', position: 'middle' },
  popup: { preset: 'home_mid_leaderboard', position: 'middle' },
  bottom: { preset: 'article_footer_banner', position: 'bottom' },
};

const renderModes: Record<
  AdRenderMode,
  { minHeight: number; sizes: string; imageClassName: string; contentPadding: number | string }
> = {
  leaderboard: {
    minHeight: 180,
    sizes: '(max-width: 600px) 100vw, 1200px',
    imageClassName: 'object-cover',
    contentPadding: 20,
  },
  sidebarTall: {
    minHeight: 420,
    sizes: '(max-width: 600px) 100vw, 360px',
    imageClassName: 'object-cover',
    contentPadding: 16,
  },
  inlineWide: {
    minHeight: 220,
    sizes: '(max-width: 600px) 100vw, 920px',
    imageClassName: 'object-cover',
    contentPadding: 18,
  },
  promoCompact: {
    minHeight: 160,
    sizes: '(max-width: 600px) 100vw, 560px',
    imageClassName: 'object-cover',
    contentPadding: 16,
  },
};

const normalizePage = (page?: string) => {
  if (!page) return undefined;
  if (['home', 'article', 'category', 'all'].includes(page)) return page;
  return 'all';
};

const isAdActive = (ad: Advertisement) => {
  if (ad.isActive === false) return false;
  const now = Date.now();
  const start = ad.startDate || ad.activeFrom;
  const end = ad.endDate || ad.activeTo;
  if (start && Number.isFinite(Date.parse(start)) && Date.parse(start) > now) return false;
  if (end && Number.isFinite(Date.parse(end)) && Date.parse(end) < now) return false;
  return true;
};

const scoreAd = ({
  ad,
  preset,
  page,
  categoryId,
}: {
  ad: Advertisement;
  preset: AdPresetKey;
  page?: string;
  categoryId?: string;
}) => {
  const inferredPreset = inferAdPreset(ad);
  const adPages = ad.displayPages?.length ? ad.displayPages : ad.page ? [ad.page] : [];
  const categories = getAdCategoryIds(ad);
  const matchesPage = page ? adPages.includes(page) || adPages.includes('all') : true;
  const matchesCategory = categoryId ? categories.includes(categoryId) : false;

  let score = ad.priority ?? 0;
  if (inferredPreset === preset) score += 60;
  if (matchesPage) score += 25;
  if (matchesCategory) score += 40;
  if (!categories.length) score += 6;
  return score;
};

const pickBestAd = ({
  ads,
  preset,
  page,
  categoryId,
}: {
  ads: Advertisement[];
  preset: AdPresetKey;
  page?: string;
  categoryId?: string;
}) => {
  const activeAds = ads.filter(isAdActive);
  if (!activeAds.length) return undefined;
  return [...activeAds].sort((a, b) => scoreAd({ ad: b, preset, page, categoryId }) - scoreAd({ ad: a, preset, page, categoryId }))[0];
};

const getClientLabel = (client: Advertisement['client']) => {
  if (!client) return '';
  if (typeof client === 'string') return client;
  if (typeof client === 'object' && 'name' in client && typeof client.name === 'string') return client.name;
  return '';
};

export function AdSlot({
  slot,
  position,
  page,
  categoryId,
  className,
}: {
  slot?: AdPresetKey;
  position?: string;
  page?: string;
  categoryId?: string;
  className?: string;
}) {
  const normalizedPage = normalizePage(page);
  const legacy = position && position in legacySlotMap ? legacySlotMap[position as LegacySlotKey] : undefined;
  const presetKey = slot ?? legacy?.preset ?? 'home_mid_leaderboard';
  const preset = getAdPreset(presetKey) ?? AD_PRESETS.home_mid_leaderboard;
  const queryPosition = legacy?.position ?? preset.position;
  const localCuration = readLayoutCuration();
  const { data: layoutSettings } = useLayoutSettings();
  const adsEnabled = layoutSettings?.adsEnabled ?? localCuration.adsEnabled ?? true;
  const { data } = useAds({
    type: preset.type,
    position: queryPosition,
    page: normalizedPage ?? preset.page,
    categoryId,
  }, { enabled: adsEnabled });
  const theme = useTheme();
  const { language } = useLanguage();

  const fallbackAd = useMemo(() => {
    return (
      sampleAds.find((item) => inferAdPreset(item) === preset.key) ||
      sampleAds.find((item) => item.position === queryPosition) ||
      sampleAds[0]
    );
  }, [preset.key, queryPosition]);

  const ad = useMemo(
    () => pickBestAd({ ads: data ?? [], preset: preset.key, page: normalizedPage ?? preset.page, categoryId }) || fallbackAd,
    [categoryId, data, fallbackAd, normalizedPage, preset.key, preset.page],
  );

  const isFallbackAd = !data || data.length === 0 || ad?.id === fallbackAd?.id;
  const imageUrl = ad?.image?.url || ad?.imageUrl;
  const adTitle = getLocalizedText(ad?.title, language) || ad?.name || preset.label;
  const adDescription = getLocalizedText(ad?.description, language);
  const imageAlt = getLocalizedText(ad?.image?.alt, language) || adTitle;
  const renderConfig = renderModes[preset.renderMode] ?? renderModes.promoCompact;
  const target = ad?.linkUrl || ad?.targetUrl || '#';
  const clientLabel = getClientLabel(ad?.client);

  useEffect(() => {
    if (!adsEnabled || !ad?.id || isFallbackAd) return;
    apiClient.post(`/advertisements/${ad.id}/impression`).catch(() => {});
  }, [ad?.id, adsEnabled, isFallbackAd]);

  const handleAdClick = () => {
    if (!ad?.id || isFallbackAd) return;
    apiClient.post(`/advertisements/${ad.id}/click`).catch(() => {});
  };

  if (!adsEnabled) return null;

  return (
    <Paper
      variant="outlined"
      className={className}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: renderConfig.minHeight,
        overflow: 'hidden',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: theme.shadows[1],
      }}
    >
      {imageUrl ? (
        <Box
          component="a"
          href={target}
          target={ad?.openInNewTab === false ? undefined : '_blank'}
          rel="noreferrer"
          onClick={handleAdClick}
          sx={{
            display: 'block',
            position: 'relative',
            width: '100%',
            aspectRatio: preset.preview.width / preset.preview.height,
            minHeight: renderConfig.minHeight,
          }}
        >
          <Image src={imageUrl} alt={imageAlt} fill className={renderConfig.imageClassName} sizes={renderConfig.sizes} />
        </Box>
      ) : (
        <Stack
          spacing={1.25}
          sx={{
            minHeight: renderConfig.minHeight,
            justifyContent: 'center',
            px: renderConfig.contentPadding,
            py: 3,
            background:
              preset.renderMode === 'sidebarTall'
                ? 'linear-gradient(180deg, rgba(123,26,41,0.08) 0%, rgba(8,15,28,0.06) 100%)'
                : 'linear-gradient(135deg, rgba(123,26,41,0.08) 0%, rgba(0,0,0,0.02) 100%)',
          }}
        >
          <Typography variant="overline" sx={{ fontWeight: 900, letterSpacing: 2, color: 'text.secondary' }}>
            Sponsored
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
            {adTitle}
          </Typography>
          {adDescription ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: preset.renderMode === 'leaderboard' ? 560 : 320 }}>
              {adDescription}
            </Typography>
          ) : null}
          {clientLabel ? (
            <Chip size="small" label={clientLabel} sx={{ width: 'fit-content', fontWeight: 700 }} />
          ) : null}
        </Stack>
      )}

      <Box
        sx={{
          position: 'absolute',
          left: 12,
          top: 12,
          bgcolor: alpha(theme.palette.common.black, 0.7),
          color: theme.palette.common.white,
          px: 1.5,
          py: 0.5,
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        Advertisement
      </Box>
    </Paper>
  );
}
