'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Bookmark, Clock, PlayCircle, Share2, Video } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { EmptyState } from '@/components/states/EmptyState';
import { TransitionLink } from '@/components/navigation/TransitionLink';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/components/news/FbShortsRail';
import { useLanguage } from '@/contexts/language-context';
import { fetchReelById, fetchReels, type ReelItem } from '@/lib/reels-store';
import { formatDate } from '@/lib/utils';

function VideoThumb({ item }: { item: ReelItem }) {
  const thumbnail = getYouTubeThumbnail(item);

  if (!thumbnail) {
    return <div className="h-full w-full bg-[linear-gradient(135deg,#5f161c,#15110f)]" />;
  }

  return (
    <Image
      src={thumbnail}
      alt={item.title}
      fill
      sizes="(min-width: 1024px) 320px, 100vw"
      unoptimized
      className="object-cover"
    />
  );
}

export default function YouTubeArticlePage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { language } = useLanguage();
  const [item, setItem] = useState<ReelItem | null>(null);
  const [related, setRelated] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([id ? fetchReelById(id) : Promise.resolve(null), fetchReels()]).then(([selected, list]) => {
      if (!mounted) return;
      setItem(selected);
      setRelated(list.items.filter((entry) => entry.id !== selected?.id).slice(0, 4));
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  const embedUrl = useMemo(() => (item ? getYouTubeEmbedUrl(item) : undefined), [item]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] animate-pulse px-4 py-8">
        <div className="mb-4 h-8 w-3/4 bg-[var(--news-gray-200)]" />
        <div className="mb-8 h-4 w-1/2 bg-[var(--news-gray-200)]" />
        <div className="aspect-video w-full bg-[var(--news-gray-200)]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-12">
        <EmptyState title="Video article not found" description="The requested YouTube article could not be loaded." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--news-page)]">
      <div className="mx-auto max-w-[1200px] px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <main className="lg:col-span-8">
            <article>
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--news-red-700)] text-white">
                    <Video size={15} />
                  </span>
                  <span className="text-sm font-bold uppercase tracking-wider text-[var(--news-red-700)]">
                    {language === 'bn' ? 'ইউটিউব আর্টিকেল' : 'YouTube article'}
                  </span>
                </div>

                <h1 className="[font-family:var(--font-serif)] text-3xl font-bold leading-tight text-[var(--news-black)] md:text-5xl">
                  {item.title}
                </h1>

                {item.description ? (
                  <p className="mt-5 border-l-4 border-[var(--news-red-700)] bg-[var(--news-offwhite)] py-3 pl-4 pr-3 text-lg leading-8 text-[var(--news-gray-600)]">
                    {item.description}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-[var(--news-gray-200)] py-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--news-darkgray)]">
                    <Clock size={16} className="text-[var(--news-gray-400)]" />
                    <span>{item.updatedAt ? formatDate(item.updatedAt, language) : ''}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold text-[var(--news-gray-600)] transition-colors hover:bg-[var(--news-red-50)] hover:text-[var(--news-red-700)]">
                      <Share2 size={16} />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                    <button className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold text-[var(--news-gray-600)] transition-colors hover:bg-[var(--news-red-50)] hover:text-[var(--news-red-700)]">
                      <Bookmark size={16} />
                      <span className="hidden sm:inline">Save</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-8 overflow-hidden bg-[#7a1821] shadow-[0_18px_50px_rgba(18,24,31,0.10)]">
                <div className="relative aspect-video bg-black">
                  {embedUrl ? (
                    <iframe
                      title={item.title}
                      src={embedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  ) : (
                    <VideoThumb item={item} />
                  )}
                </div>
              </div>

              {item.description ? (
                <div className="prose prose-lg max-w-none font-serif text-[var(--news-black)] prose-p:text-lg prose-p:leading-8">
                  <p>{item.description}</p>
                </div>
              ) : null}

              <div className="my-10 border-t border-[var(--news-gray-200)] pt-8">
                <h2 className="mb-5 text-xl font-extrabold text-[var(--news-mahogany)]">
                  {language === 'bn' ? 'সম্পর্কিত' : 'Related'}
                </h2>
                <div className="grid gap-5 md:grid-cols-2">
                  {related.map((entry) => (
                    <TransitionLink key={entry.id} href={`/youtube-article/${entry.id}`} className="group block">
                      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--news-gray-200)]">
                        <VideoThumb item={entry} />
                        <span className="absolute inset-0 grid place-items-center bg-black/10 text-white">
                          <PlayCircle className="h-12 w-12 drop-shadow" />
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold leading-snug text-[var(--news-ink)] transition-colors group-hover:text-[var(--news-red-700)]">
                        {entry.title}
                      </h3>
                    </TransitionLink>
                  ))}
                </div>
              </div>
            </article>
          </main>

          <aside className="lg:col-span-4 lg:border-l lg:border-[var(--news-gray-200)] lg:pl-8">
            <div className="sticky top-24">
              <div className="mb-8">
                <AdSlot slot="article_sidebar_tall" page="article" />
              </div>

              <div className="border-t-4 border-[var(--news-red-700)] bg-[var(--news-offwhite)] p-6">
                <h3 className="mb-6 text-lg font-bold uppercase tracking-wide text-[var(--news-red-700)]">
                  {language === 'bn' ? 'আরও ভিডিও' : 'More video'}
                </h3>
                <div className="flex flex-col gap-5">
                  {related.slice(0, 5).map((entry) => (
                    <TransitionLink key={entry.id} href={`/youtube-article/${entry.id}`} className="group flex gap-3">
                      <div className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden bg-[var(--news-gray-200)]">
                        <VideoThumb item={entry} />
                      </div>
                      <h4 className="line-clamp-3 text-sm font-bold leading-snug text-[var(--news-black)] transition-colors group-hover:text-[var(--news-red-700)]">
                        {entry.title}
                      </h4>
                    </TransitionLink>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
