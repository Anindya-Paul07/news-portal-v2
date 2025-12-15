'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AdminShell } from '@/components/layout/AdminShell';
import { useAdminArticles, useAdminCategories, useSaveArticle, useDeleteArticle } from '@/hooks/api-hooks';
import { ArticleStatus } from '@/lib/types';
import { useAlert } from '@/contexts/alert-context';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingBlock } from '@/components/states/LoadingBlock';

const initialArticleDraft = {
  titleEn: '',
  titleBn: '',
  slug: '',
  excerptEn: '',
  excerptBn: '',
  contentEn: '',
  contentBn: '',
  category: '',
  status: 'draft' as ArticleStatus,
  imageUrl: '',
};

export default function ArticlesAdminPage() {
  const { data: articles } = useAdminArticles({ limit: 12 });
  const { data: categories } = useAdminCategories();
  const { mutateAsync: saveArticle } = useSaveArticle();
  const { mutateAsync: deleteArticle } = useDeleteArticle();
  const { notify } = useAlert();
  const [draft, setDraft] = useState(initialArticleDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const statusOptions: ArticleStatus[] = ['draft', 'published', 'scheduled'];

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await saveArticle({
        id: editingId || undefined,
        slug: draft.slug,
        title: { en: draft.titleEn, bn: draft.titleBn },
        excerpt: { en: draft.excerptEn, bn: draft.excerptBn },
        content: { en: draft.contentEn, bn: draft.contentBn },
        category: draft.category || undefined,
        status: draft.status,
        featuredImage: draft.imageUrl ? { url: draft.imageUrl } : undefined,
      });
      setDraft(initialArticleDraft);
      setEditingId(null);
      notify({
        type: 'success',
        title: editingId ? 'Article updated' : 'Article saved',
        description: 'Your story is now synced with the newsroom.',
      });
    } catch (error) {
      notify({ type: 'error', title: 'Save failed', description: error instanceof Error ? error.message : undefined });
    }
  };

  const handleEdit = (articleId: string) => {
    const article = articles?.find((item) => item.id === articleId);
    if (!article) return;
    setEditingId(article.id);
    setDraft({
      titleEn: typeof article.title === 'string' ? article.title : article.title?.en || '',
      titleBn: typeof article.title === 'string' ? '' : article.title?.bn || '',
      slug: article.slug,
      excerptEn: typeof article.excerpt === 'string' ? article.excerpt : article.excerpt?.en || '',
      excerptBn: typeof article.excerpt === 'string' ? '' : article.excerpt?.bn || '',
      contentEn: typeof article.content === 'string'
        ? article.content
        : (article.content as Record<string, string | undefined>)?.en || '',
      contentBn: typeof article.content === 'string'
        ? ''
        : (article.content as Record<string, string | undefined>)?.bn || '',
      category: article.categoryId || '',
      status: article.status || 'draft',
      imageUrl: article.featuredImage?.url || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (articleId: string) => {
    if (!window.confirm('Delete this article permanently?')) return;
    try {
      await deleteArticle(articleId);
      notify({ type: 'success', title: 'Article deleted', description: 'The article has been removed.' });
      if (editingId === articleId) {
        setEditingId(null);
        setDraft(initialArticleDraft);
      }
    } catch (error) {
      notify({ type: 'error', title: 'Delete failed', description: error instanceof Error ? error.message : undefined });
    }
  };

  const articleList = useMemo(() => articles ?? [], [articles]);

  return (
    <AdminShell
      title="Articles"
      description="Create, schedule, and manage featured/breaking/trending flags with bilingual content."
    >
      <Card sx={{ borderRadius: 3, boxShadow: 4, mb: 4 }}>
        <CardHeader
          title={editingId ? 'Edit Article' : 'New Article'}
          subheader="Bilingual content, scheduling, and category assignment."
          action={
            editingId ? (
              <Button variant="ghost" size="small" onClick={() => { setEditingId(null); setDraft(initialArticleDraft); }}>
                Cancel edit
              </Button>
            ) : null
          }
        />
        <CardContent>
          <Stack component="form" onSubmit={onCreate} spacing={2.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Input label="Slug" value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} required />
              <Input
                label="Featured image URL"
                value={draft.imageUrl}
                onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                helperText="Serve from media library or CDN"
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  label="Category"
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                >
                  <MenuItem value="">Select category</MenuItem>
                  {categories?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {typeof category.name === 'string' ? category.name : category.name?.en || category.slug}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Status
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {statusOptions.map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      color={draft.status === option ? 'primary' : 'default'}
                      onClick={() => setDraft((d) => ({ ...d, status: option }))}
                    />
                  ))}
                </Stack>
              </Stack>
            </Stack>
            <Button type="submit" sx={{ alignSelf: 'flex-start' }}>
              {editingId ? 'Update article' : 'Save article'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Recent articles
        </Typography>
        {!articles && <LoadingBlock lines={4} />}
        {articles?.length === 0 && <EmptyState title="No articles yet" description="Create one to get started." />}
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
            <Chip label="Status" size="small" color="secondary" />
            <Chip label="Bilingual ready" size="small" color="primary" variant="outlined" />
          </Stack>
          <Stack spacing={2} direction="row" flexWrap="wrap">
            {articleList.map((article) => (
              <Card key={article.id} variant="outlined" sx={{ flex: '1 1 300px', minWidth: 280 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {typeof article.title === 'string' ? article.title : article.title?.en || article.slug}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    /{article.slug}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={2}>
                    <Button variant="ghost" size="small" onClick={() => handleEdit(article.id)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="small" color="error" onClick={() => handleDelete(article.id)}>
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Box>
    </AdminShell>
  );
}
