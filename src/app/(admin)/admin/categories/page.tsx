'use client';

import { useState, type FormEvent } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AdminShell } from '@/components/layout/AdminShell';
import { useAdminCategories, useCategoryTree, useSaveCategory } from '@/hooks/api-hooks';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText } from '@/lib/utils';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingBlock } from '@/components/states/LoadingBlock';

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
      <Card sx={{ borderRadius: 3, boxShadow: 4, mb: 3 }}>
        <CardHeader title="New Category" subheader="Hierarchies, order, and menu visibility." />
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
                <Input
                  label="Parent ID"
                  value={draft.parentId}
                  onChange={(e) => setDraft((d) => ({ ...d, parentId: e.target.value }))}
                  helperText="Leave blank for top level"
                />
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
                <Button type="submit">Save category</Button>
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
