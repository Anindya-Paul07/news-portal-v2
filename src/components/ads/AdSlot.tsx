'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { useAds } from '@/hooks/api-hooks';
import { apiClient } from '@/lib/api-client';
import { sampleAds } from '@/lib/fallbacks';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText } from '@/lib/utils';
import { AdvertisementType } from '@/lib/types';

type SlotConfig = { height: number; type: AdvertisementType; apiPosition?: string; sizes: string };

const slotConfig: Record<string, SlotConfig> = {
  hero: { height: 320, type: 'banner', apiPosition: 'top', sizes: '(max-width: 600px) 100vw, 1200px' },
  banner: { height: 160, type: 'banner', apiPosition: 'middle', sizes: '(max-width: 600px) 100vw, 1200px' },
  sidebar: { height: 360, type: 'sidebar', apiPosition: 'sidebar', sizes: '(max-width: 600px) 100vw, 360px' },
  in_content: { height: 260, type: 'in_content', apiPosition: 'middle', sizes: '(max-width: 600px) 100vw, 600px' },
  popup: { height: 220, type: 'popup', apiPosition: 'middle', sizes: '(max-width: 600px) 100vw, 480px' },
};

export function AdSlot({ position, page }: { position: string; page?: string }) {
  const slot = slotConfig[position] || {
    height: 200,
    type: 'banner',
    apiPosition: undefined,
    sizes: '(max-width: 600px) 100vw, 600px',
  };
  const { data } = useAds({
    type: slot.type,
    position: slot.apiPosition,
    page,
  });
  const isFallbackAd = !data || data.length === 0;
  const fallbackAd = sampleAds.find((item) => item.position === position) || sampleAds[0];
  const ad = data?.[0] || fallbackAd;
  const adTitle = ad.title || ad.name || 'Sponsored placement';
  const { language } = useLanguage();
  const imageUrl = ad.image?.url || ad.imageUrl;
  const imageAlt = getLocalizedText(ad.image?.alt, language) || adTitle;
  const theme = useTheme();

  useEffect(() => {
    if (!ad?.id || isFallbackAd) return;
    apiClient.post(`/advertisements/${ad.id}/impression`).catch(() => {});
  }, [ad?.id, isFallbackAd]);

  const handleAdClick = () => {
    if (!ad?.id || isFallbackAd) return;
    apiClient.post(`/advertisements/${ad.id}/click`).catch(() => {});
  };

  const height = slot.height;
  const imageSizes = slot.sizes;

  return (
    <Paper
      variant="outlined"
      sx={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: theme.shadows[2],
      }}
    >
      {imageUrl ? (
        <Box
          component="a"
          href={ad.linkUrl || ad.targetUrl || '#'}
          target="_blank"
          rel="noreferrer"
          onClick={handleAdClick}
          sx={{ display: 'block', position: 'relative', width: '100%', height: '100%' }}
        >
          <Image src={imageUrl} alt={imageAlt} fill className="object-cover" sizes={imageSizes} />
        </Box>
      ) : (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">{adTitle}</Typography>
          <Chip
            size="small"
            label="Sponsored"
            color="warning"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
            }}
          />
        </Box>
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
