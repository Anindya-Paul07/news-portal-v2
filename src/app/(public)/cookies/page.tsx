export const metadata = {
  title: 'Cookie Policy | The Contemporary',
  description: 'Cookie and analytics notice for The Contemporary readers.',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[var(--news-page)]">
      <section className="border-b border-[var(--news-grid)] bg-[var(--news-paper)]">
        <div className="mx-auto max-w-[960px] px-4 py-12 md:py-16">
          <p className="news-meta text-[var(--news-red-700)]">Browser storage</p>
          <h1 className="mt-3 [font-family:var(--font-serif)] text-4xl font-bold tracking-[-0.04em] text-[var(--news-ink)] md:text-6xl">
            Cookie Policy
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--news-muted)]">
            Cookies and similar storage help us keep the site usable, secure, and measurable.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[960px] px-4 py-10">
        <div className="grid gap-6 text-base leading-8 text-[var(--news-muted)]">
          <CookieBlock title="Essential cookies">
            These support core website functions such as authentication, preferences, language selection, and secure sessions.
          </CookieBlock>
          <CookieBlock title="Analytics cookies">
            Analytics may help us understand page performance, popular stories, and reliability issues without exposing raw technical errors to readers.
          </CookieBlock>
          <CookieBlock title="Managing cookies">
            You can block or remove cookies from your browser settings. Some features may work less smoothly if essential storage is disabled.
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
      <p className="mt-3">{children}</p>
    </article>
  );
}
