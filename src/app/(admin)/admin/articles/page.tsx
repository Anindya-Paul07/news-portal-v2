'use client';

import { useState, type FormEvent } from 'react';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AdminShell } from '@/components/layout/AdminShell';
import { useAdminArticles, useAdminCategories, useSaveArticle } from '@/hooks/api-hooks';
import { ArticleStatus } from '@/lib/types';
import { useAlert } from '@/contexts/alert-context';

export default function ArticlesAdminPage() {
  const { data: articles } = useAdminArticles({ limit: 12 });
  const { data: categories } = useAdminCategories();
  const { mutateAsync: saveArticle } = useSaveArticle();
  const { notify } = useAlert();
  const [draft, setDraft] = useState({
    titleEn: '',
    titleBn: '',
    slug: '',
    excerptEn: '',
    excerptBn: '',
    contentEn: '',
    contentBn: '',
    categoryId: '',
    status: 'draft' as ArticleStatus,
    imageUrl: '',
  });
  const statusOptions: ArticleStatus[] = ['draft', 'published', 'scheduled'];

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await saveArticle({
        slug: draft.slug,
        title: { en: draft.titleEn, bn: draft.titleBn },
        excerpt: { en: draft.excerptEn, bn: draft.excerptBn },
        content: { en: draft.contentEn, bn: draft.contentBn },
        categoryId: draft.categoryId || undefined,
        status: draft.status,
        featuredImage: draft.imageUrl ? { url: draft.imageUrl } : undefined,
      });
      setDraft({
        titleEn: '',
        titleBn: '',
        slug: '',
        excerptEn: '',
        excerptBn: '',
        contentEn: '',
        contentBn: '',
        categoryId: '',
        status: 'draft',
        imageUrl: '',
      });
      notify({ type: 'success', title: 'Article saved', description: 'Your story is now synced with the newsroom.' });
    } catch (error) {
      notify({ type: 'error', title: 'Save failed', description: error instanceof Error ? error.message : undefined });
    }
  };

  return (
    <AdminShell
      title="Articles"
      description="Create, schedule, and manage featured/breaking/trending flags with bilingual content."
    >
      <form className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4" onSubmit={onCreate}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Title (EN)"
            value={draft.titleEn}
            onChange={(e) => setDraft((d) => ({ ...d, titleEn: e.target.value }))}
            required
          />
          <Input
            label="Title (BN)"
            value={draft.titleBn}
            onChange={(e) => setDraft((d) => ({ ...d, titleBn: e.target.value }))}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Slug" value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} required />
          <Input
            label="Featured image URL"
            value={draft.imageUrl}
            onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
            helper="Serve from media library or CDN"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Textarea
            label="Excerpt (EN)"
            value={draft.excerptEn}
            onChange={(e) => setDraft((d) => ({ ...d, excerptEn: e.target.value }))}
            helper="Short dek for card and hero contexts"
          />
          <Textarea
            label="Excerpt (BN)"
            value={draft.excerptBn}
            onChange={(e) => setDraft((d) => ({ ...d, excerptBn: e.target.value }))}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Textarea
            label="Content (EN)"
            value={draft.contentEn}
            onChange={(e) => setDraft((d) => ({ ...d, contentEn: e.target.value }))}
            rows={5}
          />
          <Textarea
            label="Content (BN)"
            value={draft.contentBn}
            onChange={(e) => setDraft((d) => ({ ...d, contentBn: e.target.value }))}
            rows={5}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-ink)]">
            <span>Category</span>
            <select
              value={draft.categoryId}
              onChange={(e) => setDraft((d) => ({ ...d, categoryId: e.target.value }))}
              className="min-w-[220px] rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-normal text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none"
            >
              <option value="">Select category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {typeof category.name === 'string' ? category.name : category.name?.en || category.slug}
                </option>
              ))}
            </select>
            <span className="text-xs font-normal text-[var(--color-muted)]">Choose which section this article belongs to.</span>
          </label>
          <div className="flex flex-col gap-2 text-sm text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-ink)]">Status</span>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={draft.status === option ? 'primary' : 'outline'}
                  className="rounded-full px-3 py-1 text-xs"
                  onClick={() => setDraft((d) => ({ ...d, status: option }))}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Button type="submit" className="w-fit px-4">Save article</Button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles?.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </AdminShell>
  );
}
