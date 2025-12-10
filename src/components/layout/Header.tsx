'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useMenuCategories } from '@/hooks/api-hooks';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { sampleCategories } from '@/lib/fallbacks';
import { cn, getLocalizedText } from '@/lib/utils';

export function Header() {
  const { data: menu } = useMenuCategories();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`/search?query=${encodeURIComponent(keyword.trim())}`);
  };

  const navItems = useMemo(() => {
    if (menu && menu.length > 0) return menu;
    return sampleCategories;
  }, [menu]);
  const dateline = useMemo(() => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now);
  }, []);

  const renderNavLinks = (isMobile = false) =>
    navItems?.map((cat) => (
      <Link
        key={cat.id}
        href={`/category/${cat.slug}`}
        className={cn(
          'rounded-full border-b-2 border-transparent px-3 py-1 text-[var(--color-nav-link)] transition-all duration-200 hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-link-active)] hover:shadow-[0_0_12px_rgba(252,186,4,0.35)]',
          pathname.includes(`/category/${cat.slug}`) && 'border-[var(--color-nav-link-active)] text-[var(--color-nav-link-active)]',
          isMobile && 'flex w-full justify-between border px-4 py-2 text-base',
        )}
        onClick={isMobile ? () => setMobileNavOpen(false) : undefined}
      >
        {getLocalizedText(cat.name, language)}
        {isMobile && <span>→</span>}
      </Link>
    ));

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-header-bg)] text-[var(--color-header-text)] shadow-[0_6px_24px_rgba(27,23,22,0.15)] backdrop-blur transition-colors">
      <div className="container flex flex-col gap-2 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-header-text)]">
          <span>{dateline}</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-header-chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-header-chip-text)]"
              onClick={toggleLanguage}
            >
              {language === 'en' ? 'বাংলা' : 'EN'}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-header-text)] text-xl font-black text-[#c53727] shadow-[0_10px_18px_rgba(0,0,0,0.15)]">
              CN
            </div>
            <div>
              <p className="headline text-lg font-extrabold leading-tight text-[var(--color-header-text)]">The Contemporary News</p>
              <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-[var(--color-header-chip-bg)] px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-header-chip-text)]">
                Clarity over noise
              </p>
            </div>
          </Link>
          <form onSubmit={onSearch} className="flex flex-1 justify-center">
            <div className="flex w-full max-w-xl items-center gap-2 rounded-full border border-[var(--color-search-border)] bg-[var(--color-search-bg)] px-4 py-2 text-[var(--color-search-text)] shadow-[0_8px_18px_rgba(27,23,22,0.16)] transition">
              <span className="text-sm text-[var(--color-primary)]">🔍</span>
              <input
                aria-label="Search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded-full bg-[var(--color-surface)] text-sm text-[var(--color-search-text)] placeholder:text-[var(--color-search-placeholder)] focus:outline-none"
                placeholder="Search news"
              />
            </div>
          </form>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant="outline"
                  className="border-[var(--color-secondary)] text-[var(--color-secondary)] hover:text-[var(--color-secondary-contrast)]"
                  onClick={logout}
                >
                  Logout
                </Button>
                <Button
                  variant="primary"
                  className="rounded-xl border border-transparent px-4 py-2 text-xs font-bold"
                  onClick={() => router.push('/admin')}
                >
                  Admin
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="secondary" className="px-4 py-2 text-xs font-bold">
                  Login
                </Button>
              </Link>
            )}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-header-text)] transition md:hidden"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileNavOpen}
            >
              <span className="flex h-4 w-5 flex-col justify-between">
                <span
                  className={cn(
                    'h-0.5 w-full rounded-full bg-current transition-transform',
                    mobileNavOpen && 'translate-y-1.5 rotate-45',
                  )}
                />
                <span className={cn('h-0.5 w-4 rounded-full bg-current transition', mobileNavOpen && 'opacity-0')} />
                <span
                  className={cn(
                    'h-0.5 w-full rounded-full bg-current transition-transform',
                    mobileNavOpen && '-translate-y-1.5 -rotate-45',
                  )}
                />
              </span>
            </button>
          </div>
        </div>
        <nav className="hidden items-center justify-center gap-2 overflow-x-auto border-t border-[var(--color-accent)]/30 pt-2 text-sm font-semibold md:flex">
          {renderNavLinks()}
        </nav>
        <div className={cn('flex flex-col gap-2 border-t border-[var(--color-accent)]/30 pt-2 md:hidden', !mobileNavOpen && 'hidden')}>
          {renderNavLinks(true)}
        </div>
      </div>
    </header>
  );
}
