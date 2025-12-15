'use client';

import { useEffect, useState, type FormEvent } from 'react';
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
import { useMediaLibrary, useUploadMedia, useUpdateMedia, useDeleteMedia } from '@/hooks/api-hooks';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingBlock } from '@/components/states/LoadingBlock';
import { resolveMediaUrl } from '@/lib/utils';
import { LocalizedText, Media } from '@/lib/types';
import { useAlert } from '@/contexts/alert-context';

export default function MediaPage() {
  const { data: media } = useMediaLibrary({ limit: 20 });
  const { mutateAsync: upload } = useUploadMedia();
  const { mutateAsync: updateMedia } = useUpdateMedia();
  const { mutateAsync: deleteMedia } = useDeleteMedia();
  const { notify } = useAlert();
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

  const buildAltPayload = (enText?: string, bnText?: string) => {
    const en = enText?.trim();
    const bn = bnText?.trim();
    if (!en && !bn) return undefined;
    const payload: Record<string, string> = {};
    if (en) payload.en = en;
    if (bn) payload.bn = bn;
    return payload;
  };

  const handleUpdateMedia = async (id: string, values: { en: string; bn: string }) => {
    try {
      await updateMedia({ id, alt: buildAltPayload(values.en, values.bn) });
      notify({ type: 'success', title: 'Media updated', description: 'Alt text saved.' });
    } catch (error) {
      notify({
        type: 'error',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unable to update media.',
      });
      throw error;
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await deleteMedia(id);
      notify({ type: 'success', title: 'Media deleted' });
    } catch (error) {
      notify({
        type: 'error',
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Unable to delete media.',
      });
      throw error;
    }
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
            <MediaItemCard
              key={item.id}
              item={item}
              onUpdate={(values) => handleUpdateMedia(item.id, values)}
              onDelete={() => handleDeleteMedia(item.id)}
            />
          ))}
        </ImageList>
      )}
    </AdminShell>
  );
}

type MediaItemCardProps = {
  item: Media;
  onUpdate: (values: { en: string; bn: string }) => Promise<void>;
  onDelete: () => Promise<void>;
};

const getMediaAltText = (alt: LocalizedText | undefined, key: 'en' | 'bn') => {
  if (!alt) return '';
  if (typeof alt === 'string') {
    return key === 'en' ? alt : '';
  }
  return alt[key] || '';
};

function MediaItemCard({ item, onUpdate, onDelete }: MediaItemCardProps) {
  const [editing, setEditing] = useState(false);
  const [altEn, setAltEn] = useState(getMediaAltText(item.alt, 'en'));
  const [altBn, setAltBn] = useState(getMediaAltText(item.alt, 'bn'));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const resetFields = () => {
    setAltEn(getMediaAltText(item.alt, 'en'));
    setAltBn(getMediaAltText(item.alt, 'bn'));
  };

  useEffect(() => {
    setAltEn(getMediaAltText(item.alt, 'en'));
    setAltBn(getMediaAltText(item.alt, 'bn'));
    setEditing(false);
  }, [item.id, item.alt]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ en: altEn, bn: altBn });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this asset?')) {
      return;
    }
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const src = resolveMediaUrl(item.url);
  const altSummary =
    typeof item.alt === 'string'
      ? item.alt
      : item.alt?.en || item.alt?.bn || Object.values(item.alt || {}).find(Boolean) || 'Asset';

  return (
    <ImageListItem sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', p: 1 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={typeof item.alt === 'string' ? item.alt : item.alt?.en || 'Asset'}
        loading="lazy"
        style={{ borderRadius: 8, width: '100%' }}
      />
      <Stack spacing={1} sx={{ mt: 1 }}>
        {editing ? (
          <>
            <Input label="Alt (EN)" value={altEn} onChange={(e) => setAltEn(e.target.value)} size="small" />
            <Input label="Alt (BN)" value={altBn} onChange={(e) => setAltBn(e.target.value)} size="small" />
            <Stack direction="row" spacing={1}>
              <Button size="small" disabled={saving} onClick={handleSave}>
                Save
              </Button>
              <Button
                size="small"
                variant="ghost"
                disabled={saving}
                onClick={() => {
                  resetFields();
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography variant="caption">{altSummary}</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="ghost" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button size="small" variant="outline" color="error" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </ImageListItem>
  );
}
