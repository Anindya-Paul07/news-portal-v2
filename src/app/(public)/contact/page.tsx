'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function ContactPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <main className="min-h-screen bg-[var(--news-page)]">

      {/* Header */}
      <section className="border-b border-[var(--news-grid)] bg-[var(--news-paper)]">
        <div className="mx-auto max-w-[960px] px-4 py-12 md:py-16">
          <p className="news-meta text-[var(--news-red-700)]">
            {isBn ? 'নিউজরুমে পৌঁছান' : 'Reach the newsroom'}
          </p>
          <h1 className="mt-3 [font-family:var(--font-serif)] text-4xl font-bold tracking-[-0.04em] text-[var(--news-ink)] md:text-6xl">
            {isBn ? 'The Contemporary-এ যোগাযোগ করুন' : 'Contact The Contemporary'}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--news-muted)]">
            {isBn
              ? 'সংশোধন, টিপস, বিজ্ঞাপন অনুসন্ধান, অংশীদারিত্বের নোট বা সাধারণ পাঠক সহায়তার অনুরোধ পাঠান।'
              : 'Send corrections, tips, advertising inquiries, partnership notes, or general reader support requests.'}
          </p>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="mx-auto max-w-[960px] px-4 py-10">
        <div className="grid gap-6 md:grid-cols-3">

          {/* Newsdesk */}
          <div className="border border-[var(--news-grid)] bg-[var(--news-paper)] p-6 flex flex-col">
            <div className="flex h-11 w-11 items-center justify-center bg-[var(--news-red-700)] text-white shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="mt-4 [font-family:var(--font-serif)] text-2xl font-bold text-[var(--news-ink)]">
              {isBn ? 'নিউজডেস্ক' : 'Newsdesk'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--news-muted)] flex-1">
              {isBn
                ? 'টিপস, সংশোধন, সাক্ষাৎকারের অনুরোধ এবং সম্পাদকীয় অনুসন্ধান পাঠান।'
                : 'Send tips, corrections, interview requests, and editorial inquiries.'}
            </p>
            <Link
              href="mailto:newsdesk@thecontemporary.news"
              className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-[var(--news-red-700)] hover:opacity-75 transition-opacity break-all"
            >
              newsdesk@thecontemporary.news
            </Link>
          </div>

          {/* Advertising */}
          <div className="border border-[var(--news-grid)] bg-[var(--news-paper)] p-6 flex flex-col">
            <div className="flex h-11 w-11 items-center justify-center bg-[var(--news-red-700)] text-white shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="mt-4 [font-family:var(--font-serif)] text-2xl font-bold text-[var(--news-ink)]">
              {isBn ? 'বিজ্ঞাপন' : 'Advertising'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--news-muted)] flex-1">
              {isBn
                ? 'ক্যাম্পেইন, স্পনসরড প্লেসমেন্ট এবং নিউজরুম-সেফ বিজ্ঞাপন সম্পর্কে জিজ্ঞাসা করুন।'
                : 'Ask about campaigns, sponsored placements, and newsroom-safe ad inventory.'}
            </p>
            <Link
              href="mailto:newsdesk@thecontemporary.news"
              className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-[var(--news-red-700)] hover:opacity-75 transition-opacity"
            >
              {isBn ? 'বিজ্ঞাপন দিন' : 'Advertise with us'}
            </Link>
          </div>

          {/* Office */}
          <div className="border border-[var(--news-grid)] bg-[var(--news-paper)] p-6 flex flex-col">
            <div className="flex h-11 w-11 items-center justify-center bg-[var(--news-red-700)] text-white shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="mt-4 [font-family:var(--font-serif)] text-2xl font-bold text-[var(--news-ink)]">
              {isBn ? 'অফিস' : 'Office'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--news-muted)] flex-1">
              {isBn ? 'চট্টগ্রাম, বাংলাদেশ' : 'Chattogram, Bangladesh'}
            </p>
          </div>

        </div>

        {/* Bottom divider note */}
        <div className="mt-10 border-t border-[var(--news-grid)] pt-8 text-sm text-[var(--news-muted)]">
          <p>
            {isBn
              ? 'আমরা সাধারণত ২–৩ কার্যদিবসের মধ্যে সাড়া দিই। জরুরি বিষয়ের জন্য সরাসরি নিউজডেস্ক ইমেইলে যোগাযোগ করুন।'
              : 'We typically respond within 2–3 business days. For urgent matters, contact the newsdesk email directly.'}
          </p>
        </div>
      </section>

    </main>
  );
}
