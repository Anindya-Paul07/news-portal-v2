'use client';

import { useLanguage } from '@/contexts/language-context';

export default function TermsPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <main className="min-h-screen bg-[var(--news-page)]">
      {/* Header */}
      <section className="border-b border-[var(--news-grid)] bg-[var(--news-paper)]">
        <div className="mx-auto max-w-[960px] px-4 py-12 md:py-16">
          <p className="news-meta text-[var(--news-red-700)]">
            {isBn ? 'সাইট ব্যবহার' : 'Site use'}
          </p>
          <h1 className="mt-3 [font-family:var(--font-serif)] text-4xl font-bold tracking-[-0.04em] text-[var(--news-ink)] md:text-6xl">
            {isBn ? 'সেবার শর্তাবলী' : 'Terms of Service'}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--news-muted)]">
            {isBn
              ? 'এই শর্তাবলী The Contemporary ওয়েবসাইট ও সংশ্লিষ্ট পাবলিক সেবাগুলোর দায়িত্বশীল ব্যবহারের প্রত্যাশা নির্ধারণ করে।'
              : 'These terms set expectations for responsible use of The Contemporary website and related public services.'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[960px] px-4 py-10">
        <div className="grid gap-6 text-base leading-8 text-[var(--news-muted)]">

          {/* Meta News Research Initiative */}
          <TermsBlock
            title={isBn ? 'সংবাদ ও গবেষণার দায়বদ্ধতা — মেটা নিউজ রিসার্চ ইনিশিয়েটিভ' : 'Journalistic Accountability — Meta News Research Initiative'}
          >
            {isBn ? (
              <>
                <span className="block mb-4">
                  আমরা বিশ্বাস করি, সংবাদ কেবল ঘটনার বিবরণ নয়; এটি বাস্তবতার গভীর অনুসন্ধান এবং সমাজকে বোঝার একটি দায়িত্বশীল প্রক্রিয়া। তাই প্রথাগতভাবে শুধু দুর্ঘটনা বা তাৎক্ষণিক ঘটনার সংবাদ উপস্থাপনের বাইরে গিয়ে আমরা &ldquo;সংবাদের পেছনের সংবাদ&rdquo; অনুসন্ধানে গুরুত্ব দিই—যেখানে কোনো ঘটনার কারণ, প্রেক্ষাপট, ক্ষমতার সম্পর্ক এবং এর দীর্ঘমেয়াদি সামাজিক প্রভাব বিশ্লেষণ করা হয়।
                </span>
                <span className="block mb-4">
                  এই প্রেক্ষাপটে মেটা নিউজ রিসার্চ ইনিশিয়েটিভ বাংলাদেশের সংবাদচর্চায় একটি প্রথম নিরীক্ষাধর্মী (meta-analytical) প্রচেষ্টা হিসেবে কাজ করছে, যেখানে সংবাদকে কেবল প্রকাশ নয়, বরং বিশ্লেষণ, পর্যালোচনা এবং গবেষণার দৃষ্টিকোণ থেকে দেখা হয়।
                </span>
                <span className="block mb-4">
                  একই সঙ্গে আমরা বাংলাদেশের মানুষের দৈনন্দিন জীবনের ছোট ছোট অর্জন, ইতিবাচক উদ্যোগ এবং অনুপ্রেরণামূলক গল্পগুলো তুলে ধরতে প্রতিশ্রুতিবদ্ধ। এই প্রচেষ্টা কেবল ইতিবাচকতা ছড়ানোর জন্য নয়, বরং একটি বাস্তবভিত্তিক ও ভারসাম্যপূর্ণ গণমাধ্যম চর্চার অংশ হিসেবে দেখা হয়, যা আগামী প্রজন্মকে ভাবতে, প্রশ্ন করতে এবং এগিয়ে যেতে অনুপ্রাণিত করবে।
                </span>
                <span className="block">
                  আমাদের এই দৃষ্টিভঙ্গি সংবাদকে শুধুমাত্র তথ্য নয়, বরং সামাজিক পরিবর্তন ও জ্ঞানচর্চার একটি দায়িত্বশীল মাধ্যম হিসেবে প্রতিষ্ঠিত করার অঙ্গীকার বহন করে।
                </span>
              </>
            ) : (
              <>
                <span className="block mb-4">
                  We believe that news is not merely a record of events; it is a responsible process of deep inquiry into reality and an effort to understand society. Beyond the conventional presentation of accidents or immediate incidents, we place importance on uncovering &ldquo;the news behind the news&rdquo; — where the causes, context, power dynamics, and long-term social impact of events are analysed.
                </span>
                <span className="block mb-4">
                  In this context, the Meta News Research Initiative operates as a pioneering meta-analytical effort in Bangladeshi journalism — treating news not merely as publication, but through the lens of analysis, review, and research.
                </span>
                <span className="block mb-4">
                  At the same time, we are committed to highlighting the small everyday achievements, positive initiatives, and inspiring stories of people in Bangladesh. This effort is not simply about spreading positivity — it is part of a grounded and balanced media practice that will inspire the next generation to think, question, and move forward.
                </span>
                <span className="block">
                  Our approach carries a commitment to establishing news not just as information, but as a responsible medium for social change and intellectual inquiry.
                </span>
              </>
            )}
          </TermsBlock>

          {/* Using Content */}
          <TermsBlock title={isBn ? 'আমাদের কনটেন্ট ব্যবহার' : 'Using our content'}>
            {isBn
              ? 'প্রবন্ধ, ছবি, ভিডিও, ব্র্যান্ডিং এবং ডিজাইন উপাদানগুলো The Contemporary বা কৃতিত্বপ্রাপ্ত উৎসের মালিকানাধীন। অনুমতি ছাড়া আমাদের কাজ পুনঃপ্রকাশ করবেন না।'
              : 'Articles, images, videos, branding, and design elements are owned by The Contemporary or credited sources. Do not republish our work without permission.'}
          </TermsBlock>

          {/* Accounts & Submissions */}
          <TermsBlock title={isBn ? 'অ্যাকাউন্ট ও তথ্য জমাদান' : 'Accounts and submissions'}>
            {isBn
              ? 'আপনি যদি একটি অ্যাকাউন্ট তৈরি করেন বা তথ্য জমা দেন, সঠিক তথ্য প্রদান করুন এবং ফর্ম, মন্তব্য, আপলোড বা সম্পাদকীয় যোগাযোগ চ্যানেলের অপব্যবহার করবেন না।'
              : 'If you create an account or submit information, provide accurate details and do not misuse forms, comments, uploads, or editorial contact channels.'}
          </TermsBlock>

          {/* Availability */}
          <TermsBlock title={isBn ? 'প্রাপ্যতা' : 'Availability'}>
            {isBn
              ? 'আমরা সাইটটি সচল ও নির্ভুল রাখতে কাজ করি, তবে কভারেজ, ফিচার এবং সেবা আগাম নোটিশ ছাড়াই পরিবর্তিত হতে পারে।'
              : 'We work to keep the site available and accurate, but coverage, features, and services may change without notice.'}
          </TermsBlock>

          {/* Contact */}
          <TermsBlock title={isBn ? 'যোগাযোগ' : 'Contact'}>
            {isBn
              ? 'শর্তাবলী, লাইসেন্সিং বা সংশোধনের অনুরোধের জন্য, newsdesk@thecontemporary.news-এ যোগাযোগ করুন।'
              : 'For terms, licensing, or correction requests, contact newsdesk@thecontemporary.news.'}
          </TermsBlock>

        </div>
      </section>
    </main>
  );
}

function TermsBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="border-b border-[var(--news-grid)] pb-6">
      <h2 className="[font-family:var(--font-serif)] text-2xl font-bold text-[var(--news-ink)]">{title}</h2>
      <div className="mt-3">{children}</div>
    </article>
  );
}
