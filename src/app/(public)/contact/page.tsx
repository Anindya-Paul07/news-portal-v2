import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Contact | The Contemporary',
  description: 'Contact The Contemporary newsroom, advertising desk, and reader support.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--news-page)]">
      <section className="border-b border-[var(--news-grid)] bg-[var(--news-paper)]">
        <div className="mx-auto max-w-[1120px] px-4 py-12 md:py-16">
          <p className="news-meta text-[var(--news-red-700)]">Reach the newsroom</p>
          <h1 className="mt-3 [font-family:var(--font-serif)] text-4xl font-bold tracking-[-0.04em] text-[var(--news-ink)] md:text-6xl">
            Contact The Contemporary
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--news-muted)]">
            Send corrections, tips, advertising inquiries, partnership notes, or general reader support requests.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1120px] gap-6 px-4 py-10 md:grid-cols-3">
        <ContactCard title="Newsdesk" href="mailto:newsdesk@thecontemporary.news" label="newsdesk@thecontemporary.news">
          Send tips, corrections, interview requests, and editorial inquiries.
        </ContactCard>
        <ContactCard title="Advertising" href="mailto:newsdesk@thecontemporary.news" label="Advertise with us">
          Ask about campaigns, sponsored placements, and newsroom-safe ad inventory.
        </ContactCard>
        <div className="border border-[var(--news-grid)] bg-[var(--news-paper)] p-6">
          <div className="flex h-11 w-11 items-center justify-center bg-[var(--news-red-700)] text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <h2 className="mt-4 [font-family:var(--font-serif)] text-2xl font-bold text-[var(--news-ink)]">Office</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--news-muted)]">Chattogram, Bangladesh</p>
        </div>
      </section>
    </main>
  );
}

function ContactCard({
  title,
  href,
  label,
  children,
}: {
  title: string;
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[var(--news-grid)] bg-[var(--news-paper)] p-6">
      <div className="flex h-11 w-11 items-center justify-center bg-[var(--news-red-700)] text-white">
        <Mail className="h-5 w-5" />
      </div>
      <h2 className="mt-4 [font-family:var(--font-serif)] text-2xl font-bold text-[var(--news-ink)]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--news-muted)]">{children}</p>
      <Link href={href} className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-[var(--news-red-700)]">
        {label}
      </Link>
    </div>
  );
}
