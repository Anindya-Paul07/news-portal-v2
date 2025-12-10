'use client';

import { useState, type FormEvent } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAdminAds, useSaveAd } from '@/hooks/api-hooks';
import { AdvertisementType } from '@/lib/types';

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
      <form className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4" onSubmit={onSubmit}>
        <Input
          label="Internal name"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          required
        />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2 text-sm text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-ink)]">Type</span>
            <div className="flex flex-wrap gap-2">
              {adTypes.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={draft.type === type ? 'primary' : 'outline'}
                  className="rounded-full px-3 py-1 text-xs"
                  onClick={() => setDraft((d) => ({ ...d, type }))}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-ink)]">Slot position</span>
            <div className="flex flex-wrap gap-2">
              {positions.map((pos) => (
                <Button
                  key={pos}
                  type="button"
                  variant={draft.position === pos ? 'primary' : 'outline'}
                  className="rounded-full px-3 py-1 text-xs"
                  onClick={() => setDraft((d) => ({ ...d, position: pos }))}
                >
                  {pos.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Display page"
            value={draft.page}
            onChange={(e) => setDraft((d) => ({ ...d, page: e.target.value }))}
          />
          <Input
            label="Priority"
            type="number"
            value={draft.priority}
            onChange={(e) => setDraft((d) => ({ ...d, priority: Number(e.target.value) }))}
          />
          <div className="flex items-center gap-2 pt-6 text-sm font-semibold text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))}
            />
            Active
          </div>
        </div>
        <Input
          label="Target URL"
          value={draft.linkUrl}
          onChange={(e) => setDraft((d) => ({ ...d, linkUrl: e.target.value }))}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            value={draft.startDate}
            onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
          />
          <Input
            label="End date"
            type="date"
            value={draft.endDate}
            onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
          />
        </div>
        <Textarea
          label="Image URL"
          value={draft.imageUrl}
          onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
          helper="Upload via media library or paste external creative"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Alt text (EN)"
            value={draft.imageAltEn}
            onChange={(e) => setDraft((d) => ({ ...d, imageAltEn: e.target.value }))}
          />
          <Input
            label="Alt text (BN)"
            value={draft.imageAltBn}
            onChange={(e) => setDraft((d) => ({ ...d, imageAltBn: e.target.value }))}
          />
        </div>
        <Button type="submit" className="w-fit">Save advertisement</Button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ads?.map((ad) => (
          <div key={ad.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
            <p className="headline text-lg font-bold">{ad.title || ad.name}</p>
            <p className="text-sm text-[var(--color-muted)]">{ad.position} • priority {ad.priority ?? '-'}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-primary)]">
              {ad.type} {ad.isActive === false ? '• paused' : ''}
            </p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
