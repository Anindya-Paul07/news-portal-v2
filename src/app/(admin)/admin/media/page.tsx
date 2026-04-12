'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAdminArticles, useAttachMediaToArticle, useMediaLibrary, useUploadMedia, useUpdateMedia, useDeleteMedia } from '@/hooks/api-hooks';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingBlock } from '@/components/states/LoadingBlock';
import { ErrorState } from '@/components/states/ErrorState';
import { getDisplayErrorMessage } from '@/lib/errors';
import { getLocalizedText, resolveMediaUrl } from '@/lib/utils';
import { Article, LocalizedText, Media } from '@/lib/types';
import { useAlert } from '@/contexts/alert-context';
import { useAdminAreaGuard } from '@/hooks/useAdminAreaGuard';

export default function MediaPage() {
  useAdminAreaGuard('media');
  const { data: media, isError, error, refetch } = useMediaLibrary({ limit: 20 });
  const { data: articles } = useAdminArticles();
  const { mutateAsync: upload } = useUploadMedia();
  const { mutateAsync: updateMedia } = useUpdateMedia();
  const { mutateAsync: deleteMedia } = useDeleteMedia();
  const { mutateAsync: attachMediaToArticle, isPending: isAssigningMedia } = useAttachMediaToArticle();
  const { notify } = useAlert();
  const [file, setFile] = useState<File | null>(null);
  const [altEn, setAltEn] = useState('');
  const [altBn, setAltBn] = useState('');
  const [assignTarget, setAssignTarget] = useState<Media | null>(null);
  const [articleQuery, setArticleQuery] = useState('');

  const onUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    try {
      await upload({ file, alt: { en: altEn, bn: altBn } });
      setFile(null);
      setAltEn('');
      setAltBn('');
      notify({ type: 'success', title: 'Media uploaded', description: 'Your file is ready to use.' });
    } catch (error) {
      notify({ type: 'error', title: 'Upload failed', description: getDisplayErrorMessage(error, 'media-upload') });
    }
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
        description: getDisplayErrorMessage(error, 'media-update'),
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
        description: getDisplayErrorMessage(error, 'media-delete'),
      });
      throw error;
    }
  };

  const visibleArticles = (articles ?? []).filter((article) => {
    const term = articleQuery.trim().toLowerCase();
    if (!term) return true;
    const title = [getLocalizedText(article.title, 'en'), getLocalizedText(article.title, 'bn'), article.slug]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return title.includes(term);
  });

  const handleUseMediaForArticle = async (article: Article) => {
    if (!assignTarget) return;

    try {
      await attachMediaToArticle({
        articleId: article.id,
        featuredImage: {
          url: assignTarget.url,
          alt:
            typeof assignTarget.alt === 'string'
              ? { en: assignTarget.alt }
              : assignTarget.alt,
        },
      });
      notify({
        type: 'success',
        title: 'Image assigned',
        description: `Featured image updated for "${getLocalizedText(article.title, 'en') || article.slug}".`,
      });
      setAssignTarget(null);
      setArticleQuery('');
    } catch (error) {
      notify({
        type: 'error',
        title: 'Assignment failed',
        description: getDisplayErrorMessage(error, 'article-save'),
      });
    }
  };

  return (
    <AdminShell title="Media library" description="Upload assets, edit metadata, and pick for articles/ads.">
      <Card 
        elevation={6}
        sx={{ 
          borderRadius: 4, 
          mb: 5,
          overflow: 'hidden',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,107,129,0.15)' : 'rgba(226,24,55,0.12)'}`,
        }}
      >
        <CardHeader 
          title="📎 Upload Media" 
          subheader="Add alt text for accessibility and SEO."
          sx={{
            background: (theme) => 
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(255,107,129,0.08) 100%)`
                : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(226,24,55,0.04) 100%)`,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            '& .MuiCardHeader-title': {
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: 0.5,
            },
            '& .MuiCardHeader-subheader': {
              fontStyle: 'italic',
              mt: 0.5,
            },
          }}
        />
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack component="form" onSubmit={onUpload} spacing={3}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input label="Alt text (EN)" value={altEn} onChange={(e) => setAltEn(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input label="Alt text (BN)" value={altBn} onChange={(e) => setAltBn(e.target.value)} />
              </Grid>
            </Grid>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Button 
              type="submit" 
              sx={{ 
                alignSelf: 'flex-start',
                px: 4,
                py: 1.5,
                fontWeight: 800,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                },
              }}
            >
              ⬆️ Upload
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 900, 
          mb: 3,
          letterSpacing: 0.5,
          background: (theme) => 
            theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, #ff6b81 0%, #a7abb0 100%)'
              : 'linear-gradient(90deg, #e21837 0%, #5b5f63 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        🖼️ Media Library
      </Typography>
      {isError && <ErrorState title={getDisplayErrorMessage(error, 'fetch')} onRetry={() => refetch()} />}
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
              onUse={() => setAssignTarget(item)}
            />
          ))}
        </ImageList>
      )}
      <AssignMediaDialog
        open={!!assignTarget}
        media={assignTarget}
        articleQuery={articleQuery}
        setArticleQuery={setArticleQuery}
        articles={visibleArticles}
        assigning={isAssigningMedia}
        onClose={() => {
          setAssignTarget(null);
          setArticleQuery('');
        }}
        onAssign={handleUseMediaForArticle}
      />
    </AdminShell>
  );
}

type MediaItemCardProps = {
  item: Media;
  onUpdate: (values: { en: string; bn: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  onUse: () => void;
};

const getMediaAltText = (alt: LocalizedText | undefined, key: 'en' | 'bn') => {
  if (!alt) return '';
  if (typeof alt === 'string') {
    return key === 'en' ? alt : '';
  }
  return alt[key] || '';
};

function MediaItemCard({ item, onUpdate, onDelete, onUse }: MediaItemCardProps) {
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
    <ImageListItem 
      sx={{ 
        position: 'relative',
        borderRadius: 3, 
        overflow: 'hidden', 
        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,107,129,0.1)' : 'rgba(226,24,55,0.08)'}`,
        p: 1.5,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,107,129,0.3)' : 'rgba(226,24,55,0.2)',
        },
      }}
    >
      <div className="pointer-events-none absolute inset-x-1.5 top-1.5 z-10 flex items-center justify-between opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="group relative">
        <img
          src={src}
          alt={typeof item.alt === 'string' ? item.alt : item.alt?.en || 'Asset'}
          loading="lazy"
          style={{ borderRadius: 8, width: '100%' }}
        />
        <div className="absolute inset-0 flex items-start justify-between gap-2 bg-gradient-to-t from-black/55 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button size="small" onClick={onUse}>
            Use image
          </Button>
          <Button
            size="small"
            variant="outline"
            sx={{
              color: 'error.main',
              borderColor: 'error.main',
              backgroundColor: 'rgba(0,0,0,0.35)',
              '&:hover': {
                borderColor: 'error.dark',
                backgroundColor: 'rgba(211,47,47,0.16)',
              },
            }}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
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
            </Stack>
          </>
        )}
      </Stack>
    </ImageListItem>
  );
}

function AssignMediaDialog({
  open,
  media,
  articleQuery,
  setArticleQuery,
  articles,
  assigning,
  onClose,
  onAssign,
}: {
  open: boolean;
  media: Media | null;
  articleQuery: string;
  setArticleQuery: (value: string) => void;
  articles: Article[];
  assigning: boolean;
  onClose: () => void;
  onAssign: (article: Article) => Promise<void>;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Use image for article</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          {media ? (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--newsos-border-default)] bg-[var(--newsos-bg-secondary)] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveMediaUrl(media.url)} alt="Selected media" className="h-20 w-20 rounded-lg object-cover" />
              <div className="min-w-0">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {typeof media.alt === 'string'
                    ? media.alt
                    : media.alt?.en || media.alt?.bn || media.filename || 'Selected image'}
                </Typography>
                <Typography variant="caption" color="text.secondary" className="line-clamp-2">
                  {media.url}
                </Typography>
              </div>
            </div>
          ) : null}

          <Input
            label="Search article title"
            value={articleQuery}
            onChange={(e) => setArticleQuery(e.target.value)}
            placeholder="Search by title or slug"
          />

          {articles.length === 0 ? (
            <EmptyState title="No matching articles" description="Try a different title or slug." />
          ) : (
            <Stack spacing={1.5}>
              {articles.slice(0, 12).map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--newsos-border-default)] bg-[var(--newsos-bg-secondary)] p-3"
                >
                  <div className="min-w-0">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {getLocalizedText(article.title, 'en') || getLocalizedText(article.title, 'bn') || 'Untitled'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {article.slug}
                    </Typography>
                  </div>
                  <Button size="small" disabled={assigning} onClick={() => onAssign(article)}>
                    {assigning ? 'Assigning...' : 'Use image'}
                  </Button>
                </div>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
