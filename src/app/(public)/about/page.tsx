'use client';

import { useLanguage } from '@/contexts/language-context';

export default function AboutPage() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <main className="min-h-screen bg-[var(--news-page)]">

      {/* Hero Header */}
      <section className="border-b border-[var(--news-grid)] bg-[var(--news-paper)]">
        <div className="mx-auto max-w-[960px] px-4 py-12 md:py-16">
          <p className="news-meta text-[var(--news-red-700)]">
            {isBn ? 'মেটা নিউজ রিসার্চ ইনিশিয়েটিভ' : 'Meta News Research Initiative'}
          </p>
          <h1 className="mt-3 [font-family:var(--font-serif)] text-4xl font-bold tracking-[-0.04em] text-[var(--news-ink)] md:text-6xl">
            {isBn ? 'আমাদের কথা' : 'About Us'}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--news-muted)]">
            {isBn
              ? 'মুক্তচিন্তা, প্রগতি ও গণতন্ত্রের পক্ষে একটি দায়িত্বশীল ডিজিটাল সংবাদমাধ্যম।'
              : 'A responsible digital news platform committed to free thought, progress, and democracy.'}
          </p>
        </div>
      </section>

      {/* Body Sections */}
      <section className="mx-auto max-w-[960px] px-4 py-10">
        <div className="grid gap-6 text-base leading-8 text-[var(--news-muted)]">

          {/* Section 1 — Mission */}
          <AboutBlock title={isBn ? 'আমাদের অবস্থান' : 'Our Position'}>
            {isBn
              ? 'মুক্তচিন্তা, প্রগতি, বাক-চিন্তার স্বাধীনতা, গণতন্ত্র ও মানবাধিকার রক্ষাকে আমরা কেবল আদর্শ হিসেবে নয়, সাংবাদিকতার মৌলিক নৈতিক ভিত্তি হিসেবে বিবেচনা করি। আমরা বিশ্বাস করি—একটি গণতান্ত্রিক সমাজে সংবাদমাধ্যমের ভূমিকা শুধু তথ্য সরবরাহ নয়, বরং সত্য অনুসন্ধান, ক্ষমতার জবাবদিহি নিশ্চিতকরণ এবং নাগরিক চেতনার বিকাশে সক্রিয় অংশগ্রহণ।'
              : 'We consider free thought, progress, freedom of expression, democracy, and the protection of human rights not merely as ideals, but as the fundamental ethical foundation of journalism. We believe that in a democratic society, the role of the press is not simply to provide information — but to seek truth, ensure accountability of power, and actively participate in developing civic consciousness.'}
          </AboutBlock>

          {/* Section 2 — Who We Are */}
          <AboutBlock title={isBn ? 'আমরা কারা' : 'Who We Are'}>
            {isBn
              ? "আমরা বাংলাদেশের 'মেটা নিউজ রিসার্চ ইনিশিয়েটিভ'। ২০২৫ সালের অক্টোবর মাসে সোশ্যাল মিডিয়ায় আমাদের যাত্রা শুরু হয় একটি ছোট, কিন্তু সুস্পষ্ট লক্ষ্য নিয়ে—সাংবাদিকতাকে কেবল তাৎক্ষণিক খবরের সীমায় না রেখে তাকে বিশ্লেষণ, গবেষণা ও অনুসন্ধানের গভীর পরিসরে নিয়ে যাওয়া। প্রতিষ্ঠার ছয় মাসের মধ্যেই আমরা ধীরে ধীরে একটি নবীন কিন্তু উচ্চাকাঙ্ক্ষী ডিজিটাল সংবাদমাধ্যম হিসেবে নিজেদের অবস্থান গড়ে তোলার চেষ্টা করছি।"
              : "We are Bangladesh's 'Meta News Research Initiative'. Our journey began on social media in October 2025 with a small but clearly defined goal — to take journalism beyond the confines of immediate news, and into the deeper space of analysis, research, and investigation. Within six months of founding, we are gradually working to establish ourselves as a young but ambitious digital news platform."}
          </AboutBlock>

          {/* Section 3 — Editorial Standards */}
          <AboutBlock title={isBn ? 'সাংবাদিকতার মূল ভিত্তি' : 'Editorial Foundation'}>
            {isBn
              ? 'আমাদের সাংবাদিকতার মূল ভিত্তি হলো—বিশ্লেষণী প্রতিবেদন এবং অনুসন্ধানী সাংবাদিকতা। আমরা ঘটনাকে শুধু "কি ঘটেছে" এই প্রশ্নে সীমাবদ্ধ না রেখে, "কেন ঘটেছে", "কারা এর পেছনে", এবং "এর সামাজিক-রাজনৈতিক প্রভাব কী"—এই গভীর প্রশ্নগুলোর উত্তর খোঁজার চেষ্টা করি। তথ্যের নির্ভুলতা, উৎসের যাচাই এবং নৈতিক দায়বদ্ধতা আমাদের সম্পাদকীয় চর্চার কেন্দ্রবিন্দু।'
              : 'The core foundation of our journalism is analytical reporting and investigative journalism. We do not limit events to the question of "what happened," but seek answers to the deeper questions of "why it happened," "who is behind it," and "what are its social and political implications." Accuracy of information, verification of sources, and ethical accountability are at the centre of our editorial practice.'}
          </AboutBlock>

          {/* Section 4 — Independence */}
          <AboutBlock title={isBn ? 'স্বাধীনতা ও সাহস' : 'Independence and Courage'}>
            {isBn
              ? 'আমরা এমন একটি সাংবাদিকতা চর্চার পক্ষে, যা ভয়, চাপ বা ক্ষমতার প্রভাব থেকে মুক্ত থেকে সত্যকে তুলে ধরতে পারে। বাংলাদেশের প্রেক্ষাপটে যেখানে উগ্রবাদ, কর্তৃত্ববাদ, দুর্নীতি এবং ভয়ের সংস্কৃতি গণতান্ত্রিক পরিসরকে সংকুচিত করে, সেখানে আমাদের অবস্থান স্পষ্ট—আমরা এই বাস্তবতাকে অতিক্রম করে একটি স্বচ্ছ, জবাবদিহিমূলক ও মানবিক গণমাধ্যম সংস্কৃতির পক্ষে কাজ করে যাব।'
              : 'We advocate for a journalism practice that can speak truth free from fear, pressure, or the influence of power. In the context of Bangladesh, where extremism, authoritarianism, corruption, and a culture of fear have narrowed democratic space, our position is clear — we will continue to work towards a transparent, accountable, and humane media culture, transcending this reality.'}
          </AboutBlock>

          {/* Section 5 — Commitment */}
          <AboutBlock title={isBn ? 'আমাদের অঙ্গীকার' : 'Our Commitment'}>
            {isBn
              ? 'আমরা বিশ্বাস করি, সংবাদমাধ্যম কেবল তথ্যের বাহক নয়; এটি একটি সামাজিক দায়িত্ব। তাই আমাদের প্রতিটি প্রতিবেদন, বিশ্লেষণ এবং অনুসন্ধানী কাজ জনস্বার্থ, মানবাধিকার এবং গণতান্ত্রিক মূল্যবোধকে কেন্দ্র করেই পরিচালিত হবে। ভবিষ্যতের পথচলায় আমরা পাঠক, গবেষক এবং নাগরিক সমাজের সঙ্গে একটি দায়িত্বশীল তথ্য-পরিসর গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।'
              : 'We believe that the press is not merely a carrier of information; it is a social responsibility. Therefore, every report, analysis, and investigative piece we produce will be guided by public interest, human rights, and democratic values. In the path ahead, we are committed to building a responsible information space together with our readers, researchers, and civil society.'}
          </AboutBlock>

          {/* Contact CTA */}
          <AboutBlock title={isBn ? 'যোগাযোগ করুন' : 'Get in Touch'}>
            {isBn
              ? <>যোগাযোগের জন্য ই-মেইল করুন: <a href="mailto:newsdesk@thecontemporary.news" className="text-[var(--news-red-700)] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity">newsdesk@thecontemporary.news</a></>
              : <>Reach us at: <a href="mailto:newsdesk@thecontemporary.news" className="text-[var(--news-red-700)] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity">newsdesk@thecontemporary.news</a></>
            }
          </AboutBlock>

        </div>
      </section>
    </main>
  );
}

function AboutBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="border-b border-[var(--news-grid)] pb-6">
      <h2 className="[font-family:var(--font-serif)] text-2xl font-bold text-[var(--news-ink)]">{title}</h2>
      <div className="mt-3">{children}</div>
    </article>
  );
}
