export const metadata = {
  title: 'Privacy Policy | The Contemporary',
  description: 'How The Contemporary handles reader data, newsletter information, analytics, and privacy requests.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--news-page)]">
      <section className="border-b border-[var(--news-grid)] bg-[var(--news-paper)]">
        <div className="mx-auto max-w-[960px] px-4 py-12 md:py-16">
          <p className="news-meta text-[var(--news-red-700)]">Reader information</p>
          <h1 className="mt-3 [font-family:var(--font-serif)] text-4xl font-bold tracking-[-0.04em] text-[var(--news-ink)] md:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--news-muted)]">
            This page explains the basic privacy commitments for The Contemporary readers, subscribers, and newsroom contacts.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[960px] px-4 py-10">
        <div className="grid gap-6 text-base leading-8 text-[var(--news-muted)]">
          <PolicyBlock title="Information we collect">
            We may collect information you submit directly, such as newsletter email addresses, contact messages, account details, and editorial correspondence.
          </PolicyBlock>
          <PolicyBlock title="How we use information">
            We use this information to operate the site, improve reader experience, send requested updates, protect accounts, and respond to support or editorial inquiries.
          </PolicyBlock>
          <PolicyBlock title="Analytics and cookies">
            We may use cookies and analytics tools to understand site performance, popular coverage, and technical reliability. You can control cookies through your browser settings.
          </PolicyBlock>
          <PolicyBlock title="Contact">
            For privacy questions or data requests, contact newsdesk@thecontemporary.news.
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
