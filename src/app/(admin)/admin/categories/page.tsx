'use client';

import { useState, type FormEvent } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AdminShell } from '@/components/layout/AdminShell';
import { useAdminCategories, useCategoryTree, useSaveCategory, useDeleteCategory } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { useAlert } from '@/contexts/alert-context';
import { getLocalizedText } from '@/lib/utils';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingBlock } from '@/components/states/LoadingBlock';

export default function CategoriesPage() {
  const { data: categories } = useAdminCategories();
  const { data: tree } = useCategoryTree();
  const { mutateAsync: saveCategory } = useSaveCategory();
  const { mutateAsync: deleteCategory } = useDeleteCategory();
  const { notify } = useAlert();
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const { language } = useLanguage();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await saveCategory({
      id: editingId || undefined,
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
    setEditingId(null);
    notify({
      type: 'success',
      title: editingId ? 'Category updated' : 'Category saved',
      description: 'Menu structure refreshed.',
    });
  };

  const handleEdit = (categoryId: string) => {
    const category = categories?.find((item) => item.id === categoryId);
    if (!category) return;
    setEditingId(category.id);
    setDraft({
      nameEn: typeof category.name === 'string' ? category.name : category.name?.en || '',
      nameBn: typeof category.name === 'string' ? '' : category.name?.bn || '',
      slug: category.slug,
      descriptionEn:
        typeof category.description === 'string' ? category.description : category.description?.en || '',
      descriptionBn: typeof category.description === 'string' ? '' : category.description?.bn || '',
      parentId: category.parentId || '',
      order: category.order ?? 1,
      showInMenu: category.showInMenu ?? true,
      isActive: category.isActive ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Delete this category? It will fail if articles still reference it.')) return;
    try {
      await deleteCategory(categoryId);
      notify({ type: 'success', title: 'Category deleted' });
      if (editingId === categoryId) {
        setEditingId(null);
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
      }
    } catch (error) {
      notify({ type: 'error', title: 'Delete failed', description: error instanceof Error ? error.message : undefined });
    }
  };

  return (
    <AdminShell
      title="Categories"
      description="Manage hierarchy, visibility, and menu order for navigation and landing pages."
    >
      <Card sx={{ borderRadius: 3, boxShadow: 4, mb: 3 }}>
        <CardHeader
          title={editingId ? 'Edit Category' : 'New Category'}
          subheader="Hierarchies, order, and menu visibility."
          action={
            editingId ? (
              <Button
                variant="ghost"
                size="small"
                onClick={() => {
                  setEditingId(null);
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
                }}
              >
                Cancel edit
              </Button>
            ) : null
          }
        />
        <CardContent>
          <form onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input
                  label="Name (EN)"
                  value={draft.nameEn}
                  onChange={(e) => setDraft((d) => ({ ...d, nameEn: e.target.value }))}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input
                  label="Name (BN)"
                  value={draft.nameBn}
                  onChange={(e) => setDraft((d) => ({ ...d, nameBn: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input
                  label="Slug"
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Input
                  label="Menu order"
                  type="number"
                  value={draft.order}
                  onChange={(e) => setDraft((d) => ({ ...d, order: Number(e.target.value) || 0 }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Textarea
                  label="Description (EN)"
                  value={draft.descriptionEn}
                  onChange={(e) => setDraft((d) => ({ ...d, descriptionEn: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Textarea
                  label="Description (BN)"
                  value={draft.descriptionBn}
                  onChange={(e) => setDraft((d) => ({ ...d, descriptionBn: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <Select
                    displayEmpty
                    value={draft.parentId}
                    onChange={(e) => setDraft((d) => ({ ...d, parentId: e.target.value }))}
                    renderValue={(value) => {
                      if (!value) return 'Top level (no parent)';
                      const parent = categories?.find((cat) => cat.id === value);
                      return parent ? getLocalizedText(parent.name, language) : 'Select parent';
                    }}
                  >
                    <MenuItem value="">Top level (no parent)</MenuItem>
                    {categories?.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {getLocalizedText(cat.name, language)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={draft.showInMenu}
                      onChange={(e) => setDraft((d) => ({ ...d, showInMenu: e.target.checked }))}
                    />
                  }
                  label="Show in menu"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch checked={draft.isActive} onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))} />
                  }
                  label="Active"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button type="submit">{editingId ? 'Update category' : 'Save category'}</Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Existing categories
      </Typography>
      {!categories && <LoadingBlock lines={3} />}
      {categories?.length === 0 && <EmptyState title="No categories yet" description="Add your first category to start." />}
      <Grid container spacing={2}>
        {categories?.map((category) => (
          <Grid key={category.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {getLocalizedText(category.name, language)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  /{category.slug}
                </Typography>
                <Stack direction="row" spacing={1} mt={2}>
                  <Button variant="ghost" size="small" onClick={() => handleEdit(category.id)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="small" color="error" onClick={() => handleDelete(category.id)}>
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {false && tree && (
        <Card sx={{ mt: 3 }}>
          <CardHeader title="Menu tree" />
          <CardContent>
            <pre>{JSON.stringify(tree, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}
