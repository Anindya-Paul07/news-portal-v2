'use client';

import { useState, type FormEvent } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMediaLibrary, useUploadMedia } from '@/hooks/api-hooks';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingBlock } from '@/components/states/LoadingBlock';

export default function MediaPage() {
  const { data: media } = useMediaLibrary({ limit: 20 });
  const { mutateAsync: upload } = useUploadMedia();
  const [file, setFile] = useState<File | null>(null);
  const [altEn, setAltEn] = useState('');
  const [altBn, setAltBn] = useState('');

  const onUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    await upload({ file, alt: { en: altEn, bn: altBn } });
    setFile(null);
    setAltEn('');
    setAltBn('');
  };

  return (
    <AdminShell title="Media library" description="Upload assets, edit metadata, and pick for articles/ads.">
      <Card sx={{ borderRadius: 3, boxShadow: 4, mb: 3 }}>
        <CardHeader title="Upload" subheader="Add alt text for accessibility and SEO." />
        <CardContent>
          <Stack component="form" onSubmit={onUpload} spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input label="Alt text (EN)" value={altEn} onChange={(e) => setAltEn(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input label="Alt text (BN)" value={altBn} onChange={(e) => setAltBn(e.target.value)} />
              </Grid>
            </Grid>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Button type="submit" sx={{ alignSelf: 'flex-start' }}>
              Upload
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Library
      </Typography>
      {!media && <LoadingBlock lines={3} />}
      {media?.length === 0 && <EmptyState title="No media" description="Upload assets to see them here." />}
      {media && media.length > 0 && (
        <ImageList variant="masonry" cols={4} gap={12}>
          {media.map((item) => (
            <ImageListItem key={item.id} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={typeof item.alt === 'string' ? item.alt : item.alt?.en || 'Asset'} loading="lazy" />
              <Typography variant="caption" sx={{ display: 'block', p: 1 }}>
                {typeof item.alt === 'string'
                  ? item.alt
                  : item.alt?.en || item.alt?.bn || Object.values(item.alt || {}).find(Boolean) || 'Asset'}
              </Typography>
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </AdminShell>
  );
}
