'use client';

import { useState, type FormEvent } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMediaLibrary, useUploadMedia } from '@/hooks/api-hooks';

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
      <form className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4" onSubmit={onUpload}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Alt text (EN)" value={altEn} onChange={(e) => setAltEn(e.target.value)} />
          <Input label="Alt text (BN)" value={altBn} onChange={(e) => setAltBn(e.target.value)} />
        </div>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Button type="submit" className="w-fit">
          Upload
        </Button>
      </form>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {media?.map((item) => (
          <div key={item.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-sm">
            <p className="font-semibold text-[var(--color-ink)]">
              {(typeof item.alt === 'string' && item.alt) || item.alt?.en || 'Asset'}
            </p>
            <p className="text-[var(--color-muted)]">{item.url}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
