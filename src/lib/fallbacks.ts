import { Advertisement, Article, Category, DashboardOverview } from '@/lib/types';

export const sampleCategories: Category[] = [
  {
    id: 'world',
    name: { en: 'World', bn: 'বিশ্ব' },
    slug: 'world',
    description: { en: 'Global headlines', bn: 'বিশ্বের প্রধান খবর' },
    showInMenu: true,
  },
  {
    id: 'business',
    name: { en: 'Business', bn: 'ব্যবসা' },
    slug: 'business',
    description: { en: 'Markets & money', bn: 'বাজার ও আর্থিক খাত' },
    showInMenu: true,
  },
  {
    id: 'tech',
    name: { en: 'Technology', bn: 'প্রযুক্তি' },
    slug: 'technology',
    description: { en: 'Innovation & AI', bn: 'উদ্ভাবন ও এআই' },
    showInMenu: true,
  },
  {
    id: 'culture',
    name: { en: 'Culture', bn: 'সংস্কৃতি' },
    slug: 'culture',
    description: { en: 'Arts & life', bn: 'শিল্প ও জীবন' },
    showInMenu: true,
  },
  {
    id: 'sport',
    name: { en: 'Sport', bn: 'খেলা' },
    slug: 'sport',
    description: { en: 'Scores & stories', bn: 'ফলাফল ও গল্প' },
    showInMenu: true,
  },
];

export const sampleArticles: Article[] = [
  {
    id: 'a-1',
    title: {
      en: 'Dawn Express: High-speed rail connects coast-to-coast in four hours',
      bn: 'ডন এক্সপ্রেস: চার ঘণ্টায় উপকূল থেকে উপকূলে দ্রুতগতির রেল',
    },
    slug: 'dawn-express-coast-to-coast',
    excerpt: {
      en: 'A new era of sustainable travel links major cities with whisper-quiet trains and material-efficient lines.',
      bn: 'টেকসই ভ্রমণের নতুন যুগ নীরব ট্রেন ও দক্ষ লাইনের মাধ্যমে বড় শহরগুলোকে যুক্ত করেছে।',
    },
    content: {
      en: 'Engineers describe the line as the cleanest infrastructure project of the decade, cutting flight demand by 40% in its first season.',
      bn: 'প্রকৌশলীরা এই লাইনকে দশকের সবচেয়ে পরিচ্ছন্ন অবকাঠামো প্রকল্প বলছেন, যা প্রথম মৌসুমেই ফ্লাইটের চাহিদা ৪০% কমিয়েছে।',
    },
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1600&q=80',
      alt: { en: 'High speed train', bn: 'উচ্চগতির ট্রেন' },
    },
    coverImage: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1600&q=80',
    categoryId: 'world',
    readingTime: 4,
    tags: [{ en: 'infrastructure', bn: 'অবকাঠামো' }],
    isFeatured: true,
  },
  {
    id: 'a-2',
    title: {
      en: 'AI weather desk issues live micro-forecasts for coastal towns',
      bn: 'এআই আবহাওয়া ডেস্কে উপকূলীয় শহরের লাইভ মাইক্রো-পূর্বাভাস',
    },
    slug: 'ai-weather-desk',
    excerpt: {
      en: 'Localized predictions now update every 90 seconds, with community safety teams plugged into the network.',
      bn: 'স্থানীয় পূর্বাভাস এখন প্রতি ৯০ সেকেন্ডে আপডেট হয় এবং নিরাপত্তা দল নেটওয়ার্কে সংযুক্ত থাকে।',
    },
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1600&q=80',
      alt: { en: 'Weather dashboard', bn: 'আবহাওয়া ড্যাশবোর্ড' },
    },
    coverImage: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1600&q=80',
    categoryId: 'technology',
    readingTime: 3,
    isTrending: true,
  },
  {
    id: 'a-3',
    title: {
      en: 'Circular fashion startups turn textile waste into premium fibers',
      bn: 'সার্কুলার ফ্যাশন টেক্সটাইল বর্জ্যকে প্রিমিয়াম ফাইবারে রূপান্তর করছে',
    },
    slug: 'circular-fashion-startups',
    excerpt: {
      en: 'Studios in Dhaka and Nairobi lead a renaissance in recycled textiles with zero-dye dyeing processes.',
      bn: 'ঢাকা ও নাইরোবির স্টুডিওগুলো শূন্য রঙিন প্রক্রিয়া দিয়ে পুনর্ব্যবহৃত টেক্সটাইলের নবজাগরণ ঘটাচ্ছে।',
    },
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
      alt: { en: 'Circular fashion studio', bn: 'সার্কুলার ফ্যাশন স্টুডিও' },
    },
    coverImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
    categoryId: 'business',
    readingTime: 5,
    isTrending: true,
  },
  {
    id: 'a-4',
    title: {
      en: 'Night markets reinvent the post-commute meal with chef-led stalls',
      bn: 'শেফ-নেতৃত্বাধীন স্টলে নাইট মার্কেট নতুন ভ্রমণ-পরবর্তী খাবার',
    },
    slug: 'night-markets-reinvent-dinner',
    excerpt: {
      en: 'Pop-up alleys bring regional recipes to downtown corridors while keeping queues digital-first.',
      bn: 'পপ-আপ গলিগুলো শহরের কেন্দ্রে আঞ্চলিক খাবার নিয়ে আসে এবং সারি থাকে পুরোপুরি ডিজিটাল।',
    },
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
      alt: { en: 'Night market food stalls', bn: 'নাইট মার্কেট খাবার স্টল' },
    },
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    categoryId: 'culture',
    readingTime: 2,
    isBreaking: true,
  },
  {
    id: 'a-5',
    title: {
      en: 'Renewable surge: rooftop wind tiles join solar on skyline',
      bn: 'নবায়নযোগ্য উত্থান: ছাদের উইন্ড টাইল সৌর প্যানেলের সাথে যুক্ত',
    },
    slug: 'renewable-surge-rooftop-wind',
    excerpt: {
      en: 'Lightweight rotors add 18% more clean power to existing buildings without structural retrofits.',
      bn: 'হালকা রটার বিদ্যমান ভবনে ১৮% বেশি পরিষ্কার শক্তি যোগ করে।',
    },
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1542601098-8fc114e148e8?auto=format&fit=crop&w=1600&q=80',
      alt: { en: 'Rooftop turbines', bn: 'ছাদের টারবাইন' },
    },
    coverImage: 'https://images.unsplash.com/photo-1542601098-8fc114e148e8?auto=format&fit=crop&w=1600&q=80',
    categoryId: 'business',
    readingTime: 4,
    isFeatured: false,
  },
];

export const sampleAds: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'The Contemporary Studio',
    name: 'Studio banner',
    type: 'banner',
    position: 'top',
    page: 'home',
    image: {
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      alt: { en: 'Studio creative', bn: 'স্টুডিও সৃজন' },
    },
    linkUrl: 'https://thecontemporary.news',
    targetUrl: 'https://thecontemporary.news',
    priority: 10,
  },
  {
    id: 'ad-2',
    title: 'Data & Climate Summit',
    name: 'Summit sidebar',
    type: 'sidebar',
    position: 'sidebar_top',
    page: 'home',
    image: {
      url: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
      alt: { en: 'Conference poster', bn: 'সম্মেলনের পোস্টার' },
    },
    linkUrl: 'https://thecontemporary.news',
    targetUrl: 'https://thecontemporary.news',
    priority: 8,
  },
];

export const sampleDashboard: DashboardOverview = {
  articles: { published: 182, draft: 24, scheduled: 12 },
  users: { total: 26, admins: 4, journalists: 12 },
  ads: { active: 8, paused: 3 },
  media: { library: 420 },
};
