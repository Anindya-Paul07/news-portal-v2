'use client';

import { useState, type FormEvent } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { LanguageTabs } from '@/components/editor/LanguageTabs';
import { MediaPickerDialog } from '@/components/media/MediaPickerDialog';
import { useAdminArticles, useAdminCategories, useDeleteArticle, useSaveArticle, useUploadMedia } from '@/hooks/api-hooks';
import { useAlert } from '@/contexts/alert-context';
import { useAuth } from '@/contexts/auth-context';
import { useAdminAreaGuard } from '@/hooks/useAdminAreaGuard';
import { ErrorState } from '@/components/states/ErrorState';
import { getDisplayErrorMessage } from '@/lib/errors';
import { canDeleteArticle } from '@/lib/rbac';
import { ArticleStatus, LocalizedText, ImageAsset } from '@/lib/types';
import { getLocalizedText, resolveMediaUrl } from '@/lib/utils';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🖥️ NEWSROOM OPERATING SYSTEM (NewsOS) - ARTICLES "INBOX" VIEW
 * ═══════════════════════════════════════════════════════════════════════════
 */

type FilterType = 'all' | 'draft' | 'published' | 'breaking' | 'my-desk';

const statusColors: Record<ArticleStatus, string> = {
  draft: 'var(--newsos-status-draft)',
  published: 'var(--newsos-status-published)',
  archived: 'var(--newsos-status-archived)',
  scheduled: 'var(--newsos-status-scheduled)',
};

const initialDraft = {
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
  isFeatured: false,
  isBreaking: false,
  isTrending: false,
};

export default function ArticlesPage() {
  useAdminAreaGuard('articles');

  const { user } = useAuth();
  const { showAlert } = useAlert();
  const { data: articles, isLoading, isError: isArticlesError, error: articlesError, refetch: refetchArticles } = useAdminArticles();
  const { data: categories, isError: isCategoriesError, error: categoriesError, refetch: refetchCategories } = useAdminCategories();
  const deleteMutation = useDeleteArticle();
  const saveMutation = useSaveArticle();
  const uploadMutation = useUploadMedia();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadMutation.mutateAsync({ file });
      if (res.success && res.data.url) {
        setDraft(prev => ({ ...prev, imageUrl: res.data.url }));
        showAlert('Image uploaded successfully', 'success');
      }
    } catch (error) {
      showAlert(getDisplayErrorMessage(error, 'media-upload'), 'error', 'Image upload failed');
    }
  };

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(initialDraft);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Helper to safely get string from LocalizedText
  const getStr = (text: LocalizedText | undefined | null, lang: 'en' | 'bn'): string => {
    if (!text) return '';
    if (typeof text === 'string') return lang === 'en' ? text : '';
    return text[lang] || '';
  };

  // Helper to safely get image URL
  const getImgUrl = (img: ImageAsset | undefined | null): string => {
    return img?.url || '';
  };

  // Filter articles
  const filteredArticles = (articles || []).filter((article) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'draft') return article.status === 'draft';
    if (activeFilter === 'published') return article.status === 'published';
    if (activeFilter === 'breaking') return article.isBreaking;
    if (activeFilter === 'my-desk') return article.author?.id === user?.id; // Fixed: authorId -> author.id
    return true;
  });

  const selectedArticle = filteredArticles.find((a) => a.id === selectedArticleId);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      showAlert('Article deleted', 'success');
      setSelectedArticleId(null);
      setIsEditing(false);
    } catch (error) {
      showAlert(getDisplayErrorMessage(error, 'article-delete'), 'error', 'Delete failed');
    }
  };

  const handleEdit = (article: typeof selectedArticle) => {
    if (!article) return;
    setEditingId(article.id);
    setDraft({
      titleEn: getStr(article.title, 'en'),
      titleBn: getStr(article.title, 'bn'),
      slug: article.slug || '',
      excerptEn: getStr(article.excerpt, 'en'),
      excerptBn: getStr(article.excerpt, 'bn'),
      contentEn: getStr(article.content, 'en'),
      contentBn: getStr(article.content, 'bn'),
      category: article.category?.id || article.categoryId || '',
      status: article.status || 'draft',
      imageUrl: getImgUrl(article.featuredImage) || article.coverImage || '',
      isFeatured: article.isFeatured || false,
      isBreaking: article.isBreaking || false,
      isTrending: article.isTrending || false,
    });
    setIsEditing(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setDraft(initialDraft);
    setIsEditing(true);
    setSelectedArticleId(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setDraft(initialDraft);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!draft.titleEn.trim() || !draft.titleBn.trim()) {
      showAlert('Both English and Bangla titles are required by the backend.', 'error', 'Missing title');
      return;
    }

    if (!draft.contentEn.trim() || !draft.contentBn.trim()) {
      showAlert('Both English and Bangla article content are required by the backend.', 'error', 'Missing content');
      return;
    }

    if (!draft.category) {
      showAlert('Select a category before saving this article.', 'error', 'Missing category');
      return;
    }

    try {
      await saveMutation.mutateAsync({
        id: editingId || undefined,
        slug: draft.slug || undefined,
        title: { en: draft.titleEn, bn: draft.titleBn },
        excerpt: { en: draft.excerptEn, bn: draft.excerptBn },
        content: { en: draft.contentEn, bn: draft.contentBn },
        category: draft.category || undefined,
        featuredImage: draft.imageUrl ? { url: draft.imageUrl } : undefined,
        status: draft.status,
        isFeatured: draft.isFeatured,
        isBreaking: draft.isBreaking,
        isTrending: draft.isTrending,
      });
      showAlert(editingId ? 'Article updated' : 'Article created', 'success');
      setIsEditing(false);
      setEditingId(null);
      setDraft(initialDraft);
    } catch (error) {
      showAlert(getDisplayErrorMessage(error, 'article-save'), 'error', 'Save failed');
    }
  };

  return (
    <AdminShell title="Articles" description="Manage news articles">
      {/* 3-Pane Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_400px_1fr] h-[calc(100vh-44px-32px)] overflow-hidden">
        
        {/* ═══ PANE 1: FILTERS ═══ */}
        <aside className="hidden lg:block border-r border-[var(--newsos-border-default)] overflow-y-auto bg-[var(--newsos-bg-secondary)]">
          <div className="sticky top-0 bg-[var(--newsos-bg-secondary)] border-b border-[var(--newsos-border-default)] px-3 py-2 text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)]">
            Filters
          </div>
          
          <FilterItem label="All Articles" count={articles?.length || 0} active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
          <FilterItem label="Drafts" count={articles?.filter((a) => a.status === 'draft').length || 0} active={activeFilter === 'draft'} onClick={() => setActiveFilter('draft')} />
          <FilterItem label="Published" count={articles?.filter((a) => a.status === 'published').length || 0} active={activeFilter === 'published'} onClick={() => setActiveFilter('published')} />
          <FilterItem label="Breaking" count={articles?.filter((a) => a.isBreaking).length || 0} active={activeFilter === 'breaking'} onClick={() => setActiveFilter('breaking')} />
          <FilterItem label="My Desk" count={articles?.filter((a) => a.author?.id === user?.id).length || 0} active={activeFilter === 'my-desk'} onClick={() => setActiveFilter('my-desk')} />
        </aside>

        {/* ═══ PANE 2: THE WIRE ═══ */}
        <div className="hidden lg:block border-r border-[var(--newsos-border-default)] overflow-y-auto bg-[var(--newsos-bg-primary)]">
          <div className="sticky top-0 z-10 bg-[var(--newsos-bg-primary)] border-b border-[var(--newsos-border-default)] px-3 py-2 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)]">
              The Wire ({filteredArticles.length})
            </div>
            <button 
              onClick={handleNew}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--newsos-accent-primary)] text-white text-[0.688rem] font-bold uppercase tracking-wide hover:bg-[var(--newsos-accent-hover)]"
            >
              <AddRoundedIcon sx={{ fontSize: 14 }} />
              New
            </button>
          </div>

          {isLoading ? (
            <div className="p-5 text-center text-[var(--newsos-text-tertiary)]">Loading articles...</div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-5 text-center text-[var(--newsos-text-tertiary)]">No articles found</div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => { setSelectedArticleId(article.id); setIsEditing(false); }}
                className={`px-3 py-2.5 border-b border-[var(--newsos-border-default)] cursor-pointer transition-all ${selectedArticleId === article.id && !isEditing ? 'bg-[var(--newsos-bg-active)] border-l-2 border-l-[var(--newsos-accent-primary)] pl-[10px]' : 'hover:bg-[var(--newsos-bg-hover)]'}`}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: article.status ? statusColors[article.status] : statusColors.draft }} />
                  <div className="text-[0.813rem] font-semibold text-[var(--newsos-text-primary)] leading-tight flex-1">
                    {getStr(article.title, 'en') || getStr(article.title, 'bn') || 'Untitled'}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[0.688rem] text-[var(--newsos-text-tertiary)] ml-[14px]">
                  <span>{(article.status || 'draft').toUpperCase()}</span>
                  {article.isBreaking && <span className="px-1.5 py-0.5 bg-[var(--newsos-status-live)] text-white text-[0.65rem] font-bold uppercase tracking-wide">BREAKING</span>}
                  {article.isFeatured && <span className="px-1.5 py-0.5 bg-[var(--newsos-bg-hover)] text-[0.65rem] font-bold uppercase tracking-wide">FEATURED</span>}
                  <span>•</span>
                  <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unscheduled'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ═══ PANE 3: PREVIEW/EDIT ═══ */}
        <div className="overflow-y-auto bg-[var(--newsos-bg-primary)]">
          {isArticlesError || isCategoriesError ? (
            <div className="p-4">
              <ErrorState
                title={getDisplayErrorMessage(articlesError || categoriesError, 'fetch')}
                onRetry={() => {
                  refetchArticles();
                  refetchCategories();
                }}
              />
            </div>
          ) : isEditing ? (
            /* ─── EDITOR ─── */
            <form onSubmit={handleSave} className="h-full flex flex-col">
              <div className="sticky top-0 z-10 bg-[var(--newsos-bg-primary)] border-b border-[var(--newsos-border-default)] px-4 py-3">
                <div className="text-base font-bold text-[var(--newsos-text-primary)] mb-1.5">
                  {editingId ? 'Edit Article' : 'New Article'}
                </div>
                <div className="flex gap-2 mt-3">
                  <button type="submit" className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--newsos-accent-primary)] text-white border-none text-xs font-bold uppercase tracking-wide hover:bg-[var(--newsos-accent-hover)]">
                    <SaveRoundedIcon sx={{ fontSize: 16 }} />
                    Save
                  </button>
                  <button type="button" onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--newsos-border-default)] bg-transparent text-[var(--newsos-text-primary)] text-xs font-bold uppercase tracking-wide hover:bg-[var(--newsos-bg-hover)]">
                    <CloseRoundedIcon sx={{ fontSize: 16 }} />
                    Cancel
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Title Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Title (English) *</label>
                    <input type="text" value={draft.titleEn} onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-[var(--newsos-border-default)] text-[var(--newsos-text-primary)] text-sm focus:outline-none focus:border-[var(--newsos-accent-primary)]" placeholder="Enter title..." />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Title (Bangla) *</label>
                    <input type="text" value={draft.titleBn} onChange={(e) => setDraft({ ...draft, titleBn: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-[var(--newsos-border-default)] text-[var(--newsos-text-primary)] text-sm focus:outline-none focus:border-[var(--newsos-accent-primary)]" placeholder="শিরোনাম..." />
                  </div>
                </div>

                {/* Slug + Dropdowns */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Slug</label>
                    <input type="text" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-[var(--newsos-border-default)] text-[var(--newsos-text-primary)] text-sm focus:outline-none focus:border-[var(--newsos-accent-primary)]" placeholder="slug" />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Category *</label>
                    <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="w-full px-3 py-2 bg-[var(--newsos-bg-primary)] border border-[var(--newsos-border-default)] text-[var(--newsos-text-primary)] text-sm focus:outline-none focus:border-[var(--newsos-accent-primary)]">
                      <option value="">Select...</option>
                      {(categories || []).map((cat) => <option key={cat.id} value={cat.id}>{getLocalizedText(cat.name, 'en') || getLocalizedText(cat.name, 'bn')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Status</label>
                    <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ArticleStatus })} className="w-full px-3 py-2 bg-[var(--newsos-bg-primary)] border border-[var(--newsos-border-default)] text-[var(--newsos-text-primary)] text-sm focus:outline-none focus:border-[var(--newsos-accent-primary)]">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Excerpt with Tabs */}
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Excerpt</label>
                  <LanguageTabs
                    tabs={[
                      {
                        label: 'English',
                        value: 'en',
                        content: <RichTextEditor key={`excerpt-en-${editingId || 'new'}`} value={draft.excerptEn} onChange={(html) => setDraft({ ...draft, excerptEn: html })} placeholder="Brief summary..." minHeight="120px" />
                      },
                      {
                        label: 'বাংলা',
                        value: 'bn',
                        content: <RichTextEditor key={`excerpt-bn-${editingId || 'new'}`} value={draft.excerptBn} onChange={(html) => setDraft({ ...draft, excerptBn: html })} placeholder="সংক্ষিপ্ত বিবরণ..." minHeight="120px" />
                      }
                    ]}
                  />
                </div>

                {/* Content with Tabs */}
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Content</label>
                  <LanguageTabs
                    tabs={[
                      {
                        label: 'English',
                        value: 'en',
                        content: <RichTextEditor key={`content-en-${editingId || 'new'}`} value={draft.contentEn} onChange={(html) => setDraft({ ...draft, contentEn: html })} placeholder="Write your article content..." minHeight="400px" />
                      },
                      {
                        label: 'বাংলা',
                        value: 'bn',
                        content: <RichTextEditor key={`content-bn-${editingId || 'new'}`} value={draft.contentBn} onChange={(html) => setDraft({ ...draft, contentBn: html })} placeholder="নিবন্ধ লিখুন..." minHeight="400px" />
                      }
                    ]}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Featured Image</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className={`flex items-center gap-2 px-3 py-2 border border-[var(--newsos-border-default)] cursor-pointer hover:bg-[var(--newsos-bg-hover)] transition-colors ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <CloudUploadRoundedIcon className="text-[var(--newsos-accent-primary)]" sx={{ fontSize: 18 }} />
                        <span className="text-xs font-bold text-[var(--newsos-text-primary)] uppercase tracking-wide">
                          {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          disabled={uploadMutation.isPending}
                          className="hidden" 
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 border border-[var(--newsos-border-default)] text-xs font-bold uppercase tracking-wide text-[var(--newsos-text-primary)] transition-colors hover:bg-[var(--newsos-bg-hover)]"
                      >
                        <PhotoLibraryRoundedIcon sx={{ fontSize: 18 }} />
                        Library
                      </button>
                      <span className="text-[0.65rem] text-[var(--newsos-text-tertiary)]">
                        upload, choose from library, or paste URL below
                      </span>
                    </div>
                    
                    <input 
                      type="text" 
                      value={draft.imageUrl} 
                      onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} 
                      className="w-full px-3 py-2 bg-transparent border border-[var(--newsos-border-default)] text-[var(--newsos-text-primary)] text-sm focus:outline-none focus:border-[var(--newsos-accent-primary)]" 
                      placeholder="/uploads/image.jpg" 
                    />

                    {draft.imageUrl && (
                      <div className="relative w-full aspect-video rounded-sm overflow-hidden border border-[var(--newsos-border-default)] bg-[var(--newsos-bg-secondary)]">
                        <img 
                          src={resolveMediaUrl(draft.imageUrl)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Flags */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={draft.isFeatured} onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })} className="w-4 h-4" />
                    <span className="text-xs text-[var(--newsos-text-primary)]">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={draft.isBreaking} onChange={(e) => setDraft({ ...draft, isBreaking: e.target.checked })} className="w-4 h-4" />
                    <span className="text-xs text-[var(--newsos-text-primary)]">Breaking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={draft.isTrending} onChange={(e) => setDraft({ ...draft, isTrending: e.target.checked })} className="w-4 h-4" />
                    <span className="text-xs text-[var(--newsos-text-primary)]">Trending</span>
                  </label>
                </div>
              </div>
            </form>
          ) : !selectedArticle ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--newsos-text-tertiary)]">
              <div className="text-5xl opacity-30">📄</div>
              <div className="text-[0.813rem]">Select an article from the wire</div>
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 bg-[var(--newsos-bg-primary)] border-b border-[var(--newsos-border-default)] px-4 py-3">
                <div className="text-base font-bold text-[var(--newsos-text-primary)] mb-1.5">{getStr(selectedArticle.title, 'en') || getStr(selectedArticle.title, 'bn') || 'Untitled'}</div>
                <div className="flex gap-3 text-xs text-[var(--newsos-text-tertiary)]">
                  <span>Status: {(selectedArticle.status || 'draft').toUpperCase()}</span>
                  <span>•</span>
                  <span>Created: {selectedArticle.publishedAt ? new Date(selectedArticle.publishedAt).toLocaleDateString() : 'Unscheduled'}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleEdit(selectedArticle)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--newsos-border-default)] bg-transparent text-[var(--newsos-text-primary)] text-xs font-bold uppercase tracking-wide hover:bg-[var(--newsos-bg-hover)]">
                    <EditRoundedIcon sx={{ fontSize: 16 }} />
                    Edit
                  </button>
                  {canDeleteArticle(user?.role) && (
                    <button onClick={() => handleDelete(selectedArticle.id)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--newsos-border-default)] bg-transparent text-[var(--newsos-text-primary)] text-xs font-bold uppercase tracking-wide hover:bg-[var(--newsos-bg-hover)] hover:border-[var(--newsos-accent-primary)] hover:text-[var(--newsos-accent-primary)]">
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4">
                {getImgUrl(selectedArticle.featuredImage) && (
                  <div className="mb-5">
                    <div className="text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Featured Image</div>
                    <img src={resolveMediaUrl(getImgUrl(selectedArticle.featuredImage))} alt={getStr(selectedArticle.title, 'en') || 'Article'} className="w-full max-w-2xl h-auto border border-[var(--newsos-border-default)]" />
                  </div>
                )}
                <div className="mb-5">
                  <div className="text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Slug</div>
                  <div className="text-sm text-[var(--newsos-text-primary)]">{selectedArticle.slug}</div>
                </div>
                {getStr(selectedArticle.excerpt, 'en') && (
                  <div className="mb-5">
                    <div className="text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Excerpt (EN)</div>
                    <div className="text-sm text-[var(--newsos-text-primary)] prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: getStr(selectedArticle.excerpt, 'en') }} />
                  </div>
                )}
                {getStr(selectedArticle.content, 'en') && (
                  <div className="mb-5">
                    <div className="text-[0.65rem] font-bold uppercase tracking-wide text-[var(--newsos-text-tertiary)] mb-1.5">Content (EN)</div>
                    <div className="text-sm text-[var(--newsos-text-primary)] prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: getStr(selectedArticle.content, 'en') }} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <MediaPickerDialog
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(item) => {
          setDraft((prev) => ({ ...prev, imageUrl: item.url }));
          showAlert('Image selected from media library', 'success');
        }}
      />
    </AdminShell>
  );
}

function FilterItem({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between px-3 py-2 border-b border-[var(--newsos-border-default)] cursor-pointer text-[0.813rem] transition-all ${active ? 'bg-[var(--newsos-bg-active)] border-l-2 border-l-[var(--newsos-accent-primary)] pl-[10px] font-bold' : 'hover:bg-[var(--newsos-bg-hover)]'}`}>
      <span>{label}</span>
      <span className="text-xs font-bold text-[var(--newsos-text-tertiary)]">{count}</span>
    </div>
  );
}
