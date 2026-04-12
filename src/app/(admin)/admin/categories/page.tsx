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
import { getDisplayErrorMessage } from '@/lib/errors';
import { getLocalizedText } from '@/lib/utils';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingBlock } from '@/components/states/LoadingBlock';
import { useAdminAreaGuard } from '@/hooks/useAdminAreaGuard';

export default function CategoriesPage() {
  useAdminAreaGuard('categories');
  const { data: categories, isError: isCategoriesError, error: categoriesError, refetch: refetchCategories } = useAdminCategories();
  const { data: tree, isError: isTreeError, error: treeError, refetch: refetchTree } = useCategoryTree();
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
    try {
      await saveCategory({
        id: editingId || undefined,
        slug: draft.slug,
        name: { en: draft.nameEn, bn: draft.nameBn },
        description: { en: draft.descriptionEn, bn: draft.descriptionBn },
        parent: draft.parentId || null,
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
    } catch (error) {
      notify({
        type: 'error',
        title: editingId ? 'Category update failed' : 'Category save failed',
        description: getDisplayErrorMessage(error, 'category-save'),
      });
    }
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
      notify({ type: 'error', title: 'Delete failed', description: getDisplayErrorMessage(error, 'category-delete') });
    }
  };

  return (
    <AdminShell
      title="Categories"
      description="Manage hierarchy, visibility, and menu order for navigation and landing pages."
    >
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
          title={editingId ? '✏️ Edit Category' : '📁 New Category'}
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
                sx={{
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Cancel edit
              </Button>
            ) : null
          }
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
          <form onSubmit={onSubmit}>
            <Grid container spacing={3}>
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
                  required
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
                <Button 
                  type="submit"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 800,
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  {editingId ? '💾 Update category' : '✨ Save category'}
                </Button>
              </Grid>
            </Grid>
          </form>
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
        📂 Existing Categories
      </Typography>
      {(isCategoriesError || isTreeError) && (
        <ErrorState
          title={getDisplayErrorMessage(categoriesError || treeError, 'fetch')}
          onRetry={() => {
            refetchCategories();
            refetchTree();
          }}
        />
      )}
      {!categories && <LoadingBlock lines={3} />}
      {categories?.length === 0 && <EmptyState title="No categories yet" description="Add your first category to start." />}
      <Grid container spacing={2.5}>
        {categories?.map((category) => (
          <Grid key={category.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card 
              elevation={3}
              sx={{ 
                borderRadius: 3, 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,107,129,0.1)' : 'rgba(226,24,55,0.08)'}`,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 8,
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,107,129,0.3)' : 'rgba(226,24,55,0.2)',
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 800,
                    mb: 0.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {getLocalizedText(category.name, language)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  }}
                >
                  /{category.slug}
                </Typography>
                <Stack direction="row" spacing={1} mt={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Button 
                    variant="ghost" 
                    size="small" 
                    onClick={() => handleEdit(category.id)}
                    sx={{
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateX(2px)',
                      },
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    sx={{
                      color: 'error.main',
                      borderColor: 'error.main',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'error.dark',
                        backgroundColor: 'rgba(211,47,47,0.08)',
                        transform: 'translateX(2px)',
                      },
                    }}
                    onClick={() => handleDelete(category.id)}
                  >
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
