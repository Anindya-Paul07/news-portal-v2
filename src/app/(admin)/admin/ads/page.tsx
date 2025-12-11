'use client';

import { useState, type FormEvent } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAdminAds, useSaveAd } from '@/hooks/api-hooks';
import { AdvertisementType } from '@/lib/types';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingBlock } from '@/components/states/LoadingBlock';

export default function AdsPage() {
  const { data: ads } = useAdminAds();
  const { mutateAsync: saveAd } = useSaveAd();
  const [draft, setDraft] = useState({
    name: '',
    type: 'banner' as AdvertisementType,
    position: 'hero',
    page: 'home',
    linkUrl: '',
    imageUrl: '',
    imageAltEn: '',
    imageAltBn: '',
    startDate: '',
    endDate: '',
    isActive: true,
    priority: 5,
  });
  const positions: Array<'hero' | 'banner' | 'sidebar' | 'in_content' | 'popup'> = [
    'hero',
    'banner',
    'sidebar',
    'in_content',
    'popup',
  ];
  const adTypes: AdvertisementType[] = ['banner', 'sidebar', 'native', 'popup', 'video'];

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await saveAd({
      name: draft.name,
      type: draft.type,
      position: draft.position,
      page: draft.page,
      linkUrl: draft.linkUrl,
      image: draft.imageUrl
        ? { url: draft.imageUrl, alt: { en: draft.imageAltEn, bn: draft.imageAltBn } }
        : undefined,
      startDate: draft.startDate || undefined,
      endDate: draft.endDate || undefined,
      isActive: draft.isActive,
      displayPages: draft.page ? [draft.page] : undefined,
      priority: draft.priority,
    });
    setDraft({
      name: '',
      type: 'banner',
      position: 'hero',
      page: 'home',
      linkUrl: '',
      imageUrl: '',
      imageAltEn: '',
      imageAltBn: '',
      startDate: '',
      endDate: '',
      isActive: true,
      priority: 5,
    });
  };

  return (
    <AdminShell
      title="Advertisements"
      description="Control placements, priorities, activation windows, and preview banners/sidebars/popup units."
    >
      <Card sx={{ borderRadius: 3, boxShadow: 4, mb: 3 }}>
        <CardHeader title="New Advertisement" subheader="Configure placement, timing, and creatives." />
        <CardContent>
          <form onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Input
                  label="Internal name"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Type
                </Typography>
                <Grid container spacing={1}>
                  {adTypes.map((type) => (
                    <Grid key={type} size={{ xs: 'auto' }}>
                      <Chip
                        label={type}
                        color={draft.type === type ? 'primary' : 'default'}
                        onClick={() => setDraft((d) => ({ ...d, type }))}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Slot position
                </Typography>
                <Grid container spacing={1}>
                  {positions.map((pos) => (
                    <Grid key={pos} size={{ xs: 'auto' }}>
                      <Chip
                        label={pos.replace('_', ' ')}
                        color={draft.position === pos ? 'secondary' : 'default'}
                        onClick={() => setDraft((d) => ({ ...d, position: pos }))}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Input
                  label="Display page"
                  value={draft.page}
                  onChange={(e) => setDraft((d) => ({ ...d, page: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Input
                  label="Priority"
                  type="number"
                  value={draft.priority}
                  onChange={(e) => setDraft((d) => ({ ...d, priority: Number(e.target.value) }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={draft.isActive}
                      onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Input
                  label="Target URL"
                  value={draft.linkUrl}
                  onChange={(e) => setDraft((d) => ({ ...d, linkUrl: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input
                  label="Start date"
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input
                  label="End date"
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Textarea
                  label="Image URL"
                  value={draft.imageUrl}
                  onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                  helper="Upload via media library or paste external creative"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input
                  label="Alt text (EN)"
                  value={draft.imageAltEn}
                  onChange={(e) => setDraft((d) => ({ ...d, imageAltEn: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input
                  label="Alt text (BN)"
                  value={draft.imageAltBn}
                  onChange={(e) => setDraft((d) => ({ ...d, imageAltBn: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button type="submit">Save advertisement</Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Active ads
      </Typography>
      {!ads && <LoadingBlock lines={3} />}
      {ads?.length === 0 && <EmptyState title="No ads yet" description="Create an ad to fill placements." />}
      <Grid container spacing={2}>
        {ads?.map((ad) => (
          <Grid key={ad.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {ad.title || ad.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ad.position} • priority {ad.priority ?? '-'}
                </Typography>
                <Chip
                  sx={{ mt: 1 }}
                  label={`${ad.type}${ad.isActive === false ? ' • paused' : ''}`}
                  color={ad.isActive === false ? 'default' : 'primary'}
                  variant={ad.isActive === false ? 'outlined' : 'filled'}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </AdminShell>
  );
}
