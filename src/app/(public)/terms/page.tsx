export const metadata = {
  title: 'Terms of Service | The Contemporary',
  description: 'Terms for using The Contemporary website, accounts, newsletter, and public-facing news services.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--news-page)]">
      <section className="border-b border-[var(--news-grid)] bg-[var(--news-paper)]">
        <div className="mx-auto max-w-[960px] px-4 py-12 md:py-16">
          <p className="news-meta text-[var(--news-red-700)]">Site use</p>
          <h1 className="mt-3 [font-family:var(--font-serif)] text-4xl font-bold tracking-[-0.04em] text-[var(--news-ink)] md:text-6xl">
            Terms of Service
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--news-muted)]">
            These terms set expectations for responsible use of The Contemporary website and related public services.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[960px] px-4 py-10">
        <div className="grid gap-6 text-base leading-8 text-[var(--news-muted)]">
          <TermsBlock title="Using our content">
            Articles, images, videos, branding, and design elements are owned by The Contemporary or credited sources. Do not republish our work without permission.
          </TermsBlock>
          <TermsBlock title="Accounts and submissions">
            If you create an account or submit information, provide accurate details and do not misuse forms, comments, uploads, or editorial contact channels.
          </TermsBlock>
          <TermsBlock title="Availability">
            We work to keep the site available and accurate, but coverage, features, and services may change without notice.
          </TermsBlock>
          <TermsBlock title="Contact">
            For terms, licensing, or correction requests, contact newsdesk@thecontemporary.news.
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
      <p className="mt-3">{children}</p>
    </article>
  );
}
