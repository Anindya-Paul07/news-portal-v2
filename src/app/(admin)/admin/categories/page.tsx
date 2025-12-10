'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AdminShell } from '@/components/layout/AdminShell';
import { useAdminCategories, useCategoryTree, useSaveCategory } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText } from '@/lib/utils';

export default function CategoriesPage() {
  const { data: categories } = useAdminCategories();
  const { data: tree } = useCategoryTree();
  const { mutateAsync: saveCategory } = useSaveCategory();
  const [draft, setDraft] = useState({
    nameEn: '',
    nameBn: '',
    slug: '',
    descriptionEn: '',
    descriptionBn: '',
    parentId: '',
    order: 1,
    showInMenu: true,
    isActive: true,
  });
  const { language } = useLanguage();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await saveCategory({
      slug: draft.slug,
      name: { en: draft.nameEn, bn: draft.nameBn },
      description: { en: draft.descriptionEn, bn: draft.descriptionBn },
      parentId: draft.parentId || null,
      order: draft.order,
      showInMenu: draft.showInMenu,
      isActive: draft.isActive,
    });
    setDraft({
      nameEn: '',
      nameBn: '',
      slug: '',
      descriptionEn: '',
      descriptionBn: '',
      parentId: '',
      order: 1,
      showInMenu: true,
      isActive: true,
    });
  };

  return (
    <AdminShell
      title="Categories"
      description="Manage hierarchy, visibility, and menu order for navigation and landing pages."
    >
      <form className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Name (EN)"
            value={draft.nameEn}
            onChange={(e) => setDraft((d) => ({ ...d, nameEn: e.target.value }))}
            required
          />
          <Input
            label="Name (BN)"
            value={draft.nameBn}
            onChange={(e) => setDraft((d) => ({ ...d, nameBn: e.target.value }))}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Slug"
            value={draft.slug}
            onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
            required
          />
          <Input
            label="Menu order"
            type="number"
            value={draft.order}
            onChange={(e) => setDraft((d) => ({ ...d, order: Number(e.target.value) || 0 }))}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Textarea
            label="Description (EN)"
            value={draft.descriptionEn}
            onChange={(e) => setDraft((d) => ({ ...d, descriptionEn: e.target.value }))}
          />
          <Textarea
            label="Description (BN)"
            value={draft.descriptionBn}
            onChange={(e) => setDraft((d) => ({ ...d, descriptionBn: e.target.value }))}
          />
        </div>
        <Input
          label="Parent ID"
          value={draft.parentId}
          onChange={(e) => setDraft((d) => ({ ...d, parentId: e.target.value }))}
          helper="Leave blank for top level"
        />
        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-muted)]">
          <label className="flex items-center gap-2 font-semibold text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={draft.showInMenu}
              onChange={(e) => setDraft((d) => ({ ...d, showInMenu: e.target.checked }))}
            />
            Show in menu
          </label>
          <label className="flex items-center gap-2 font-semibold text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))}
            />
            Active
          </label>
        </div>
        <Button type="submit" className="w-fit">Save category</Button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => (
          <div key={category.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-sm">
            <p className="headline text-xl font-bold">{getLocalizedText(category.name, language)}</p>
            <p className="text-sm text-[var(--color-muted)]">/{category.slug}</p>
          </div>
        ))}
      </div>
      {false && (
        <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
          <p className="headline text-lg font-bold">Menu tree</p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-[rgba(0,0,0,0.04)] p-3 text-xs text-[var(--color-muted)]">
{JSON.stringify(tree, null, 2)}
          </pre>
        </div>
      )}
    </AdminShell>
  );
}
