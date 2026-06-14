export type Role = 'super_admin' | 'admin' | 'editorial';

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
};

export type LocalizedText =
  | string
  | {
      en?: string;
      bn?: string;
      [key: string]: string | undefined;
    };

export type ImageAsset = {
  url: string;
  alt?: LocalizedText;
  caption?: LocalizedText;
};

export type Category = {
  id: string;
  name: LocalizedText;
  slug: string;
  description?: LocalizedText;
  parent?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  showInMenu?: boolean;
  order?: number;
  image?: string | ImageAsset;
  metaTitle?: LocalizedText;
  metaDescription?: LocalizedText;
  subcategories?: Category[];
  children?: Category[];
};

export type ArticleStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export type Article = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt?: LocalizedText;
  content?: LocalizedText;
  featuredImage?: ImageAsset;
  /**
   * @deprecated use featuredImage instead. coverImage is kept for fallback fixtures.
   */
  coverImage?: string;
  categoryId?: string;
  category?: Category;
  author?: User;
  status?: ArticleStatus;
  isFeatured?: boolean;
  isBreaking?: boolean;
  isTrending?: boolean;
  publishedAt?: string;
  scheduledAt?: string | null;
  readTime?: number;
  readingTime?: number;
  views?: number;
  likes?: number;
  shares?: number;
  metaTitle?: LocalizedText;
  metaDescription?: LocalizedText;
  metaKeywords?: string[];
  allowComments?: boolean;
  gallery?: ImageAsset[];
  tags?: string[];
};

export type ArticlePayload = {
  id?: string;
  slug?: string;
  title: LocalizedText;
  excerpt?: LocalizedText;
  content?: LocalizedText;
  category?: string;
  status?: ArticleStatus;
  featuredImage?: ImageAsset;
  gallery?: ImageAsset[];
  tags?: string[];
  isFeatured?: boolean;
  isBreaking?: boolean;
  isTrending?: boolean;
  publishedAt?: string;
  scheduledAt?: string | null;
  likes?: number;
  shares?: number;
  metaTitle?: LocalizedText;
  metaDescription?: LocalizedText;
  metaKeywords?: string[];
  allowComments?: boolean;
};

export type AdPlacement =
  | 'top'
  | 'middle'
  | 'bottom'
  | 'sidebar_top'
  | 'sidebar_middle'
  | 'sidebar_bottom';

export type AdvertisementType = 'banner' | 'sidebar' | 'in_content' | 'popup';

export type AdPresetKey =
  | 'home_top_leaderboard'
  | 'home_mid_leaderboard'
  | 'home_sidebar_tall'
  | 'category_top_banner'
  | 'category_sidebar_tall'
  | 'article_inline_wide'
  | 'article_sidebar_tall'
  | 'article_footer_banner';

export type Advertisement = {
  id: string;
  name?: string;
  title?: LocalizedText;
  description?: LocalizedText;
  type: AdvertisementType;
  position: AdPlacement;
  page?: string;
  image?: ImageAsset;
  imageUrl?: string;
  targetUrl?: string;
  linkUrl?: string;
  openInNewTab?: boolean;
  client?: string | { name?: string };
  categories?: Array<string | Category>;
  activeFrom?: string;
  activeTo?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  displayPages?: string[];
  priority?: number;
  impressions?: number;
  clicks?: number;
  preset?: AdPresetKey;
};

export type AdvertisementPayload = {
  id?: string;
  name: string;
  title?: LocalizedText;
  description?: LocalizedText;
  type: AdvertisementType;
  position: AdPlacement;
  page?: string;
  image?: ImageAsset;
  linkUrl?: string;
  openInNewTab?: boolean;
  client?: string;
  categories?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  displayPages?: string[];
  priority?: number;
};

export type Media = {
  id: string;
  name?: string;
  filename?: string;
  url: string;
  alt?: LocalizedText;
  caption?: LocalizedText;
  folder?: string;
  type?: string;
  tags?: string[];
};

export type MediaUploadPayload = {
  file: File;
  type?: 'image' | 'video' | 'document';
  alt?: LocalizedText;
  caption?: LocalizedText;
  folder?: string;
  tags?: string[];
  isPublic?: boolean;
  cloudinaryId?: string;
};

export type MediaUpdatePayload = {
  id: string;
  alt?: LocalizedText;
  caption?: LocalizedText;
  folder?: string;
  tags?: string[];
  isPublic?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
};

export type DashboardOverview = {
  articles?: Record<string, number>;
  users?: Record<string, number>;
  ads?: Record<string, number>;
  media?: Record<string, number>;
  advertisements?: number;
  categories?: number;
  totalViews?: number;
  recentArticles?: Article[];
};

export type LayoutCuration = {
  adsEnabled?: boolean;
  homepageLeadId?: string;
  homepageSecondaryIds?: string[];
  sectionPromoBySlug?: Record<string, string>;
  mostReadOverrideIds?: string[];
};

export type ArticleStatPoint = {
  date: string;
  count?: number;
  views?: number;
};

export type CategoryDistributionPoint = {
  categoryId: string;
  categoryName: LocalizedText;
  count?: number;
  totalViews?: number;
};

export type TrafficTrendPoint = {
  date: string;
  articles?: number;
  views?: number;
  likes?: number;
  shares?: number;
};

export type AuthorActivityPoint = {
  id: string;
  name: string;
  articleCount?: number;
  views?: number;
};

export type AdPerformancePoint = {
  id: string;
  adId?: string;
  name?: string;
  title?: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
};

export type AnalyticsTrafficPoint = {
  ts: string;
  pageViews?: number;
  uniqueUsers?: number;
};

export type AnalyticsAdsPositionSummary = {
  position: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
};

export type AnalyticsAdsSummary = {
  totals?: {
    impressions?: number;
    clicks?: number;
    ctr?: number;
  };
  byPosition?: AnalyticsAdsPositionSummary[];
};

export type CategoryPayload = {
  id?: string;
  slug: string;
  name: LocalizedText;
  description?: LocalizedText;
  parent?: string | null;
  parentId?: string | null;
  order?: number;
  isActive?: boolean;
  showInMenu?: boolean;
  image?: ImageAsset;
  metaTitle?: LocalizedText;
  metaDescription?: LocalizedText;
};
