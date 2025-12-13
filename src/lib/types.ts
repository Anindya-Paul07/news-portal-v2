export type Role = 'super_admin' | 'admin' | 'journalist' | 'reader';

export type Pagination = {
  page: number;
  limit: number;
  total: number;
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
};

export type Category = {
  id: string;
  name: LocalizedText;
  slug: string;
  description?: LocalizedText;
  parentId?: string | null;
  isActive?: boolean;
  showInMenu?: boolean;
  order?: number;
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
  readingTime?: number;
  tags?: LocalizedText[];
};

export type ArticlePayload = {
  id?: string;
  slug: string;
  title: LocalizedText;
  excerpt?: LocalizedText;
  content?: LocalizedText;
  categoryId?: string;
  status?: ArticleStatus;
  featuredImage?: ImageAsset;
  tags?: LocalizedText[];
  isFeatured?: boolean;
  isBreaking?: boolean;
  isTrending?: boolean;
};

export type AdPlacement = 'hero' | 'banner' | 'sidebar' | 'in_content' | 'popup';

export type AdvertisementType = 'banner' | 'sidebar' | 'native' | 'popup' | 'video' | 'html';

export type Advertisement = {
  id: string;
  name?: string;
  title?: string;
  type: AdvertisementType;
  position: string;
  page?: string;
  image?: ImageAsset;
  imageUrl?: string;
  targetUrl?: string;
  linkUrl?: string;
  activeFrom?: string;
  activeTo?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  displayPages?: string[];
  priority?: number;
  impressions?: number;
  clicks?: number;
};

export type AdvertisementPayload = {
  id?: string;
  name: string;
  type: AdvertisementType;
  position: string;
  page?: string;
  image?: ImageAsset;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  displayPages?: string[];
  priority?: number;
};

export type Media = {
  id: string;
  url: string;
  alt?: LocalizedText;
  caption?: string;
  folder?: string;
  type?: string;
  tags?: string[];
};

export type MediaUploadPayload = {
  file: File;
  alt?: LocalizedText;
  folder?: string;
  tags?: string[];
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
  name?: string;
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
  parentId?: string | null;
  order?: number;
  isActive?: boolean;
  showInMenu?: boolean;
};
