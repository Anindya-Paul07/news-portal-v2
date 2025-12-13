'use client';

import { useState, type FormEvent } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAdminAds, useSaveAd, useDeleteAd } from '@/hooks/api-hooks';
import { AdvertisementType } from '@/lib/types';
import { useAlert } from '@/contexts/alert-context';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingBlock } from '@/components/states/LoadingBlock';

const initialAdDraft = {
  name: '',
  type: 'banner' as AdvertisementType,
  position: 'hero' as 'hero' | 'banner' | 'sidebar' | 'in_content' | 'popup',
  page: 'home',
  linkUrl: '',
  imageUrl: '',
  imageAltEn: '',
  imageAltBn: '',
  startDate: '',
  endDate: '',
  isActive: true,
  priority: 5,
};

export default function AdsPage() {
  const { data: ads } = useAdminAds();
  const { mutateAsync: saveAd } = useSaveAd();
  const { mutateAsync: deleteAd } = useDeleteAd();
  const { notify } = useAlert();
  const [draft, setDraft] = useState(initialAdDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      id: editingId || undefined,
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
    setDraft(initialAdDraft);
    setEditingId(null);
    notify({
      type: 'success',
      title: editingId ? 'Ad updated' : 'Ad saved',
      description: 'Placement inventory refreshed.',
    });
  };

  const handleEdit = (adId: string) => {
    const ad = ads?.find((item) => item.id === adId);
    if (!ad) return;
    setEditingId(ad.id);
    setDraft({
      name: ad.name || ad.title || '',
      type: ad.type,
      position: (ad.position as typeof draft.position) || 'hero',
      page: ad.page || ad.displayPages?.[0] || 'home',
      linkUrl: ad.linkUrl || ad.targetUrl || '',
      imageUrl: ad.image?.url || ad.imageUrl || '',
      imageAltEn: typeof ad.image?.alt === 'string' ? ad.image.alt : ad.image?.alt?.en || '',
      imageAltBn: typeof ad.image?.alt === 'string' ? '' : ad.image?.alt?.bn || '',
      startDate: ad.startDate || ad.activeFrom || '',
      endDate: ad.endDate || ad.activeTo || '',
      isActive: ad.isActive ?? true,
      priority: ad.priority ?? 5,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (adId: string) => {
    if (!window.confirm('Delete this advertisement?')) return;
    try {
      await deleteAd(adId);
      notify({ type: 'success', title: 'Ad deleted' });
      if (editingId === adId) {
        setEditingId(null);
        setDraft(initialAdDraft);
      }
    } catch (error) {
      notify({ type: 'error', title: 'Delete failed', description: error instanceof Error ? error.message : undefined });
    }
  };

  return (
    <AdminShell
      title="Advertisements"
      description="Control placements, priorities, activation windows, and preview banners/sidebars/popup units."
    >
      <Card sx={{ borderRadius: 3, boxShadow: 4, mb: 3 }}>
        <CardHeader
          title={editingId ? 'Edit Advertisement' : 'New Advertisement'}
          subheader="Configure placement, timing, and creatives."
          action={
            editingId ? (
              <Button variant="ghost" size="small" onClick={() => { setEditingId(null); setDraft(initialAdDraft); }}>
                Cancel edit
              </Button>
            ) : null
          }
        />
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
                <Button type="submit">{editingId ? 'Update advertisement' : 'Save advertisement'}</Button>
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
                <Stack direction="row" spacing={1} mt={2}>
                  <Button variant="ghost" size="small" onClick={() => handleEdit(ad.id)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="small" color="error" onClick={() => handleDelete(ad.id)}>
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </AdminShell>
  );
}
