'use client';

import { useLanguage } from '@/contexts/language-context';

export default function CookiesPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <main className="min-h-screen bg-[var(--news-page)]">
      {/* Header */}
      <section className="border-b border-[var(--news-grid)] bg-[var(--news-paper)]">
        <div className="mx-auto max-w-[960px] px-4 py-12 md:py-16">
          <p className="news-meta text-[var(--news-red-700)]">
            {isBn ? 'ব্রাউজার স্টোরেজ' : 'Browser storage'}
          </p>
          <h1 className="mt-3 [font-family:var(--font-serif)] text-4xl font-bold tracking-[-0.04em] text-[var(--news-ink)] md:text-6xl">
            {isBn ? 'কুকি নীতিমালা' : 'Cookie Policy'}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--news-muted)]">
            {isBn
              ? 'কুকিজ এবং অনুরূপ স্টোরেজ আমাদের সাইটকে ব্যবহারযোগ্য, নিরাপদ এবং পরিমাপযোগ্য রাখতে সাহায্য করে।'
              : 'Cookies and similar storage help us keep the site usable, secure, and measurable.'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[960px] px-4 py-10">
        <div className="grid gap-6 text-base leading-8 text-[var(--news-muted)]">

          {/* Essential Cookies */}
          <CookieBlock title={isBn ? 'অপরিহার্য কুকিজ' : 'Essential cookies'}>
            {isBn
              ? 'এই কুকিজগুলো মূল ওয়েবসাইট ফাংশনগুলো সমর্থন করে—যেমন প্রমাণীকরণ (লগইন/লগআউট), ব্যবহারকারীর পছন্দ, ভাষা নির্বাচন (বাংলা/ইংরেজি) এবং নিরাপদ সেশন বজায় রাখা। এই কুকিজগুলো ছাড়া সাইটের মূল সুবিধাগুলো সঠিকভাবে কাজ করবে না।'
              : 'These support core website functions such as authentication (login/logout), user preferences, language selection (Bangla/English), and maintaining secure sessions. Without these cookies, the core features of the site will not function correctly.'}
          </CookieBlock>

          {/* Analytics Cookies */}
          <CookieBlock title={isBn ? 'বিশ্লেষণ কুকিজ' : 'Analytics cookies'}>
            {isBn
              ? 'বিশ্লেষণ কুকিজ আমাদের পেজের কার্যক্ষমতা, জনপ্রিয় সংবাদ এবং প্রযুক্তিগত নির্ভরযোগ্যতা বুঝতে সাহায্য করে। এই তথ্য কোনো ব্যক্তিগত সনাক্তকরণ ছাড়াই সমষ্টিগতভাবে সংগ্রহ করা হয় এবং এটি আমাদের কনটেন্ট ও পাঠক অভিজ্ঞতা উন্নত করতে ব্যবহৃত হয়।'
              : 'Analytics cookies help us understand page performance, popular stories, and technical reliability. This information is collected in aggregate without personal identification, and is used to improve our content and reader experience.'}
          </CookieBlock>

          {/* Third-Party Cookies */}
          <CookieBlock title={isBn ? 'তৃতীয় পক্ষের কুকিজ' : 'Third-party cookies'}>
            {isBn
              ? 'আমাদের সাইটে এমবেড করা ভিডিও বা সোশ্যাল মিডিয়া উইজেটের মতো তৃতীয় পক্ষের কনটেন্ট থাকতে পারে যা নিজস্ব কুকিজ সেট করতে পারে। এই কুকিজগুলো সংশ্লিষ্ট তৃতীয় পক্ষের গোপনীয়তা নীতির আওতাভুক্ত এবং আমাদের নিয়ন্ত্রণের বাইরে।'
              : 'Our site may contain third-party content such as embedded videos or social media widgets that may set their own cookies. These cookies are governed by the privacy policies of the respective third parties and are outside our control.'}
          </CookieBlock>

          {/* Managing Cookies */}
          <CookieBlock title={isBn ? 'কুকিজ নিয়ন্ত্রণ' : 'Managing cookies'}>
            {isBn
              ? 'আপনি আপনার ব্রাউজার সেটিংসের মাধ্যমে কুকিজ ব্লক বা মুছে ফেলতে পারবেন। তবে মনে রাখবেন, প্রয়োজনীয় কুকিজ নিষ্ক্রিয় করলে লগইন, ভাষা পছন্দ সংরক্ষণ বা অন্যান্য মূল বৈশিষ্ট্যগুলো সঠিকভাবে কাজ নাও করতে পারে।'
              : 'You can block or remove cookies from your browser settings. Note that disabling essential cookies may affect features such as login, saved language preferences, or other core site functions.'}
          </CookieBlock>

          {/* Contact */}
          <CookieBlock title={isBn ? 'যোগাযোগ' : 'Contact'}>
            {isBn
              ? <>কুকি নীতি সম্পর্কে প্রশ্ন থাকলে ই-মেইল করুন: <a href="mailto:newsdesk@thecontemporary.news" className="text-[var(--news-red-700)] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity">newsdesk@thecontemporary.news</a></>
              : <>For questions about our cookie policy, contact: <a href="mailto:newsdesk@thecontemporary.news" className="text-[var(--news-red-700)] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity">newsdesk@thecontemporary.news</a></>
            }
          </CookieBlock>

        </div>
      </section>
    </main>
  );
}

function CookieBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="border-b border-[var(--news-grid)] pb-6">
      <h2 className="[font-family:var(--font-serif)] text-2xl font-bold text-[var(--news-ink)]">{title}</h2>
      <div className="mt-3">{children}</div>
    </article>
  );
}
