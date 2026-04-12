'use client';

import { useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingBlock } from '@/components/states/LoadingBlock';
import { EmptyState } from '@/components/states/EmptyState';
import { useMediaLibrary } from '@/hooks/api-hooks';
import { resolveMediaUrl } from '@/lib/utils';
import type { Media } from '@/lib/types';

type MediaPickerDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (item: Media) => void;
};

export function MediaPickerDialog({ open, onClose, onSelect }: MediaPickerDialogProps) {
  const [query, setQuery] = useState('');
  const { data: media, isLoading } = useMediaLibrary({ limit: 60 });

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return media ?? [];
    return (media ?? []).filter((item) => {
      const alt =
        typeof item.alt === 'string'
          ? item.alt
          : item.alt?.en || item.alt?.bn || Object.values(item.alt || {}).find(Boolean) || '';
      return [item.filename, item.name, alt, item.url].some((value) => value?.toLowerCase().includes(term));
    });
  }, [media, query]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Select from media library</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Input
            label="Search media"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by filename, alt text, or URL"
          />

          {isLoading ? <LoadingBlock lines={3} /> : null}
          {!isLoading && filtered.length === 0 ? (
            <EmptyState title="No matching media" description="Try another search term or upload a new image." />
          ) : null}

          <Grid container spacing={2}>
            {filtered.map((item) => {
              const label =
                typeof item.alt === 'string'
                  ? item.alt
                  : item.alt?.en || item.alt?.bn || item.filename || item.name || 'Media asset';

              return (
                <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <div className="overflow-hidden rounded-xl border border-[var(--newsos-border-default)] bg-[var(--newsos-bg-secondary)]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--newsos-bg-primary)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resolveMediaUrl(item.url)} alt={label} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-3 p-3">
                      <Typography variant="body2" sx={{ fontWeight: 700 }} className="line-clamp-2">
                        {label}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                      >
                        Use this image
                      </Button>
                    </div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
