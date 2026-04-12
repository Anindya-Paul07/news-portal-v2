import type { AdPlacement, AdPresetKey, Advertisement, AdvertisementType, Category } from '@/lib/types';

export type AdRenderMode = 'leaderboard' | 'sidebarTall' | 'inlineWide' | 'promoCompact';

export type AdPresetDefinition = {
  key: AdPresetKey;
  label: string;
  description: string;
  type: AdvertisementType;
  position: AdPlacement;
  page: 'home' | 'category' | 'article';
  displayPages: string[];
  aspectRatio: string;
  renderMode: AdRenderMode;
  preview: { width: number; height: number };
};

export const AD_PRESETS: Record<AdPresetKey, AdPresetDefinition> = {
  home_top_leaderboard: {
    key: 'home_top_leaderboard',
    label: 'Homepage top leaderboard',
    description: 'Wide masthead banner shown above the lead package.',
    type: 'banner',
    position: 'top',
    page: 'home',
    displayPages: ['home', 'all'],
    aspectRatio: '6:1',
    renderMode: 'leaderboard',
    preview: { width: 1200, height: 200 },
  },
  home_mid_leaderboard: {
    key: 'home_mid_leaderboard',
    label: 'Homepage mid leaderboard',
    description: 'Wide banner between homepage editorial blocks.',
    type: 'banner',
    position: 'middle',
    page: 'home',
    displayPages: ['home', 'all'],
    aspectRatio: '5:1',
    renderMode: 'leaderboard',
    preview: { width: 1200, height: 240 },
  },
  home_sidebar_tall: {
    key: 'home_sidebar_tall',
    label: 'Homepage sidebar tall',
    description: 'Tall skyscraper unit aligned with most-read and supporting rails.',
    type: 'sidebar',
    position: 'sidebar_top',
    page: 'home',
    displayPages: ['home', 'all'],
    aspectRatio: '5:8',
    renderMode: 'sidebarTall',
    preview: { width: 360, height: 560 },
  },
  category_top_banner: {
    key: 'category_top_banner',
    label: 'Category top banner',
    description: 'Section banner directly under the category intro.',
    type: 'banner',
    position: 'top',
    page: 'category',
    displayPages: ['category', 'all'],
    aspectRatio: '4:1',
    renderMode: 'leaderboard',
    preview: { width: 1200, height: 260 },
  },
  category_sidebar_tall: {
    key: 'category_sidebar_tall',
    label: 'Category sidebar tall',
    description: 'Tall section-specific creative beside the category feed.',
    type: 'sidebar',
    position: 'sidebar_middle',
    page: 'category',
    displayPages: ['category', 'all'],
    aspectRatio: '5:8',
    renderMode: 'sidebarTall',
    preview: { width: 360, height: 560 },
  },
  article_inline_wide: {
    key: 'article_inline_wide',
    label: 'Article inline wide',
    description: 'Wide sponsorship unit placed inside the article flow.',
    type: 'in_content',
    position: 'middle',
    page: 'article',
    displayPages: ['article', 'all'],
    aspectRatio: '3:1',
    renderMode: 'inlineWide',
    preview: { width: 920, height: 280 },
  },
  article_sidebar_tall: {
    key: 'article_sidebar_tall',
    label: 'Article sidebar tall',
    description: 'Tall supporting unit beside the article body.',
    type: 'sidebar',
    position: 'sidebar_top',
    page: 'article',
    displayPages: ['article', 'all'],
    aspectRatio: '5:8',
    renderMode: 'sidebarTall',
    preview: { width: 360, height: 560 },
  },
  article_footer_banner: {
    key: 'article_footer_banner',
    label: 'Article footer banner',
    description: 'Wide unit below related coverage and follow-up stories.',
    type: 'banner',
    position: 'bottom',
    page: 'article',
    displayPages: ['article', 'all'],
    aspectRatio: '4:1',
    renderMode: 'leaderboard',
    preview: { width: 1200, height: 260 },
  },
};

export const AD_PRESET_ORDER: AdPresetKey[] = [
  'home_top_leaderboard',
  'home_mid_leaderboard',
  'home_sidebar_tall',
  'category_top_banner',
  'category_sidebar_tall',
  'article_inline_wide',
  'article_sidebar_tall',
  'article_footer_banner',
];

export const getAdPreset = (key?: AdPresetKey | null) => (key ? AD_PRESETS[key] : undefined);

export const inferAdPreset = (ad: Partial<Advertisement>): AdPresetKey | undefined => {
  if (ad.preset && ad.preset in AD_PRESETS) return ad.preset;

  const pages = ad.displayPages?.length ? ad.displayPages : ad.page ? [ad.page] : [];
  const pageHints = new Set(pages.filter(Boolean));

  return AD_PRESET_ORDER.find((key) => {
    const preset = AD_PRESETS[key];
    return (
      preset.type === ad.type &&
      preset.position === ad.position &&
      (pageHints.size === 0 || preset.displayPages.some((page) => pageHints.has(page)))
    );
  });
};

export const getAdCategoryIds = (ad?: Partial<Advertisement>) =>
  (ad?.categories ?? [])
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      return (entry as Category)?.id;
    })
    .filter((value): value is string => Boolean(value));

