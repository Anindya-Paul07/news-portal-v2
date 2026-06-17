'use client';

import { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAdminAreaGuard } from '@/hooks/useAdminAreaGuard';
import { useAlert } from '@/contexts/alert-context';
import { fetchReels, isSupportedReelUrl, readReels, removeReel, saveReel, type ReelItem } from '@/lib/reels-store';

const emptyDraft = {
  id: '',
  title: '',
  videoUrl: '',
  description: '',
  isActive: true,
};

export default function ReelsPage() {
  useAdminAreaGuard('reels');
  const { notify } = useAlert();
  const [items, setItems] = useState<ReelItem[]>(() => readReels());
  const [storageSource, setStorageSource] = useState<'api' | 'local' | 'checking'>('checking');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  useEffect(() => {
    let mounted = true;

    fetchReels().then((result) => {
      if (!mounted) return;
      setItems(result.items);
      setStorageSource(result.source);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [items],
  );

  const resetDraft = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const handleSave = async () => {
    if (!draft.title.trim()) {
      notify({ type: 'error', title: 'Missing title', description: 'Give this YouTube article a clear title.' });
      return;
    }

    if (!draft.videoUrl.trim() || !isSupportedReelUrl(draft.videoUrl.trim())) {
      notify({
        type: 'error',
        title: 'Invalid YouTube article URL',
        description: 'Use a valid YouTube or Facebook video URL.',
      });
      return;
    }

    const result = await saveReel({
      id: editingId || crypto.randomUUID(),
      title: draft.title.trim(),
      videoUrl: draft.videoUrl.trim(),
      description: draft.description.trim() || undefined,
      isActive: draft.isActive,
    }, editingId);

    setItems(result.items);
    setStorageSource(result.source);
    notify({
      type: 'success',
      title: editingId ? 'YouTube article updated' : 'YouTube article added',
      description:
        result.source === 'api'
          ? 'This YouTube article is now saved through the backend video API.'
          : 'The video API was not reachable, so this YouTube article was saved locally in this browser.',
    });
    resetDraft();
  };

  const handleEdit = (item: ReelItem) => {
    setEditingId(item.id);
    setDraft({
      id: item.id,
      title: item.title || '',
      videoUrl: item.videoUrl || '',
      description: item.description || '',
      isActive: item.isActive ?? true,
    });
  };

  const handleDelete = async (id: string) => {
    const result = await removeReel(id);
    setItems(result.items);
    setStorageSource(result.source);
    if (editingId === id) resetDraft();
    notify({
      type: 'success',
      title: 'YouTube article removed',
      description:
        result.source === 'api'
          ? 'The backend video collection was updated.'
          : 'The video API was not reachable, so only the local copy was updated.',
    });
  };

  return (
    <AdminShell
      title="YouTube Articles"
      description="Manage video article entries for the public YouTube section."
    >
      {storageSource === 'local' ? (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
          The video endpoint was not reachable, so this screen is using a browser-local fallback. When the backend
          route is available at <strong>/api/v1/reels</strong>, this page will use it automatically.
        </Alert>
      ) : null}

      <Card elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
        <CardHeader
          title={editingId ? 'Edit YouTube Article' : 'Add YouTube Article'}
          subheader="Backend payload: title, video URL, optional description, optional active status."
        />
        <CardContent>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Input
                label="Title"
                value={draft.title}
                onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Input
                label="Video URL"
                value={draft.videoUrl}
                onChange={(e) => setDraft((prev) => ({ ...prev, videoUrl: e.target.value }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Textarea
                label="Description (optional)"
                value={draft.description}
                onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                minRows={3}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={draft.isActive}
                    onChange={(e) => setDraft((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Active on public YouTube articles section"
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button onClick={handleSave}>{editingId ? 'Update YouTube article' : 'Add YouTube article'}</Button>
            {editingId ? (
              <Button variant="outline" onClick={resetDraft}>
                Cancel edit
              </Button>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardHeader title={`Saved YouTube Articles (${sortedItems.length})`} />
        <CardContent>
          {sortedItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No YouTube articles yet. Add your first video article above.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {sortedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-[var(--newsos-border-default)] bg-[var(--newsos-bg-secondary)] p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--newsos-text-primary)]">{item.title}</p>
                    <p className="truncate text-xs text-[var(--newsos-text-tertiary)]">{item.videoUrl}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-[var(--newsos-text-muted)]">
                      Updated {new Date(item.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <Stack direction="row" spacing={1.5}>
                    <Button variant="outline" size="small" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="small" onClick={() => handleDelete(item.id)}>
                      Delete
                    </Button>
                  </Stack>
                </div>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
