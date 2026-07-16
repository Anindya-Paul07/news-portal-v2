'use client';

import { useLanguage } from '@/contexts/language-context';

export default function PrivacyPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <main className="min-h-screen bg-[var(--news-page)]">
      {/* Header */}
      <section className="border-b border-[var(--news-grid)] bg-[var(--news-paper)]">
        <div className="mx-auto max-w-[960px] px-4 py-12 md:py-16">
          <p className="news-meta text-[var(--news-red-700)]">
            {isBn ? 'পাঠক তথ্য' : 'Reader information'}
          </p>
          <h1 className="mt-3 [font-family:var(--font-serif)] text-4xl font-bold tracking-[-0.04em] text-[var(--news-ink)] md:text-6xl">
            {isBn ? 'গোপনীয়তার নীতিমালা' : 'Privacy Policy'}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--news-muted)]">
            {isBn
              ? 'এই পৃষ্ঠায় The Contemporary-এর পাঠক, সাবস্ক্রাইবার ও নিউজরুম যোগাযোগের জন্য মৌলিক গোপনীয়তার প্রতিশ্রুতি ব্যাখ্যা করা হয়েছে।'
              : 'This page explains the basic privacy commitments for The Contemporary readers, subscribers, and newsroom contacts.'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[960px] px-4 py-10">
        <div className="grid gap-6 text-base leading-8 text-[var(--news-muted)]">

          {/* Intro */}
          <PolicyBlock title={isBn ? 'সাধারণ ভূমিকা' : 'Introduction'}>
            {isBn
              ? 'এই গোপনীয়তার নীতিমালা Contemporary-এর সকল ডিজিটাল প্ল্যাটফর্ম, সেবা ও কনটেন্টের ক্ষেত্রে প্রযোজ্য। আমাদের ওয়েবসাইট, মোবাইল অ্যাপ বা সংশ্লিষ্ট যোগাযোগমাধ্যম ব্যবহার, ব্রাউজ বা তাতে তথ্য প্রদান করার মাধ্যমে ব্যবহারকারী এই নীতিমালার শর্তসমূহে সম্মতি প্রদান করেছেন বলে বিবেচিত হবে।'
              : 'This Privacy Policy applies to all digital platforms, services and content operated by The Contemporary. By using, browsing, or submitting information through our website, mobile app or associated communication channels, users are considered to have agreed to the terms of this policy.'}
          </PolicyBlock>

          {/* Information We Collect */}
          <PolicyBlock title={isBn ? 'তথ্য সংগ্রহ' : 'Information we collect'}>
            {isBn
              ? 'আমরা ব্যবহারকারীর কাছ থেকে সরাসরি বা স্বয়ংক্রিয়ভাবে কিছু নির্দিষ্ট তথ্য সংগ্রহ করতে পারি। এর মধ্যে থাকতে পারে নাম, ই-মেইল, ফোন নম্বর, সামাজিক যোগাযোগমাধ্যমের তথ্য, অবস্থান, ডিভাইস ও ব্রাউজার সংক্রান্ত তথ্য, আইপি অ্যাড্রেস, এবং প্ল্যাটফর্মে ব্যবহারকারীর কার্যক্রম ও মিথস্ক্রিয়া সম্পর্কিত ডেটা।'
              : 'We may collect certain information from users directly or automatically. This may include names, email addresses, phone numbers, social media information, location data, device and browser information, IP addresses, and data related to user activity and interactions on the platform.'}
          </PolicyBlock>

          {/* How We Use Information */}
          <PolicyBlock title={isBn ? 'তথ্য ব্যবহারের উদ্দেশ্য' : 'How we use information'}>
            {isBn
              ? 'সংগৃহীত তথ্য মূলত ব্যবহারকারীর অভিজ্ঞতা উন্নত করা, কনটেন্টকে আরও প্রাসঙ্গিক ও মানসম্পন্ন করা, নিরাপত্তা নিশ্চিত করা এবং অপব্যবহার প্রতিরোধের জন্য ব্যবহৃত হয়। পাশাপাশি সেবার কার্যকারিতা বিশ্লেষণ এবং প্রয়োজনীয় ক্ষেত্রে আইনি ও প্রশাসনিক সহায়তার জন্যও এসব তথ্য ব্যবহৃত হতে পারে। আমরা তথ্য ব্যবহারে স্বচ্ছতা ও দায়বদ্ধতা বজায় রাখতে প্রতিশ্রুতিবদ্ধ।'
              : 'Collected information is primarily used to improve user experience, make content more relevant and high-quality, ensure security, and prevent misuse. It may also be used to analyse service effectiveness and, where necessary, for legal and administrative assistance. We are committed to maintaining transparency and accountability in our use of information.'}
          </PolicyBlock>

          {/* Data Policy and Application */}
          <PolicyBlock title={isBn ? 'তথ্য নীতি ও প্রয়োগ' : 'Data policy and application'}>
            {isBn
              ? 'আমরা ব্যবহারকারীর ব্যক্তিগত তথ্য অযথা তৃতীয় পক্ষের কাছে বিক্রি বা বাণিজ্যিকভাবে হস্তান্তর করি না। তবে নির্দিষ্ট পরিস্থিতিতে—যেমন আইনগত বাধ্যবাধকতা, প্রযুক্তিগত সহায়তা, নিরীক্ষা বা সেবা পরিচালনার প্রয়োজনে—বিশ্বস্ত তৃতীয় পক্ষের সঙ্গে সীমিত আকারে তথ্য ভাগ করা হতে পারে। এসব ক্ষেত্রে সংশ্লিষ্ট পক্ষগুলো গোপনীয়তা রক্ষার চুক্তির আওতায় থাকে।'
              : 'We do not unnecessarily sell or commercially transfer user personal data to third parties. However, in certain circumstances — such as legal obligations, technical support, auditing, or operational service needs — limited data sharing with trusted third parties may occur. In such cases, the relevant parties are bound by confidentiality agreements.'}
          </PolicyBlock>

          {/* Analytics and Cookies */}
          <PolicyBlock title={isBn ? 'বিশ্লেষণ ও কুকিজ' : 'Analytics and cookies'}>
            {isBn
              ? 'আমরা সাইটের কার্যক্ষমতা, জনপ্রিয় কনটেন্ট এবং প্রযুক্তিগত নির্ভরযোগ্যতা বুঝতে কুকিজ ও বিশ্লেষণ সরঞ্জাম ব্যবহার করতে পারি। আপনি আপনার ব্রাউজার সেটিংসের মাধ্যমে কুকিজ নিয়ন্ত্রণ করতে পারবেন।'
              : 'We may use cookies and analytics tools to understand site performance, popular coverage, and technical reliability. You can control cookies through your browser settings.'}
          </PolicyBlock>

          {/* Contact */}
          <PolicyBlock title={isBn ? 'যোগাযোগ' : 'Contact'}>
            {isBn
              ? 'গোপনীয়তা সংক্রান্ত প্রশ্ন বা তথ্যের অনুরোধের জন্য, newsdesk@thecontemporary.news-এ যোগাযোগ করুন।'
              : 'For privacy questions or data requests, contact newsdesk@thecontemporary.news.'}
          </PolicyBlock>

        </div>
      </section>
    </main>
  );
}

function PolicyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="border-b border-[var(--news-grid)] pb-6">
      <h2 className="[font-family:var(--font-serif)] text-2xl font-bold text-[var(--news-ink)]">{title}</h2>
      <p className="mt-3">{children}</p>
    </article>
  );
}
