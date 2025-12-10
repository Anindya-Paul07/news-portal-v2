'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const nav = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Articles', href: '/admin/articles' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Advertisements', href: '/admin/ads' },
  { label: 'Media Library', href: '/admin/media' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Settings', href: '/admin/settings' },
];

export function AdminShell({ children, title, description }: { children: ReactNode; title: string; description?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/90 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div>
            <p className="headline text-xl font-extrabold">Backoffice</p>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">The Contemporary CMS</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <p className="font-semibold text-[var(--color-ink)]">{user ? `${user.name} (${user.role})` : 'Guest'}</p>
            <Button variant="ghost" className="px-3" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="container grid gap-6 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="surface-card sticky top-24 h-max space-y-2 p-4 text-sm font-semibold">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-xl px-3 py-2 transition-colors hover:bg-[rgba(35,53,84,0.08)]',
                pathname === item.href && 'bg-[rgba(197,55,39,0.12)] text-[var(--color-primary)]',
              )}
            >
              {item.label}
            </Link>
          ))}
        </aside>
        <section className="space-y-6">
          <div className="surface-card p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="headline text-2xl font-extrabold text-[var(--color-ink)]">{title}</p>
                {description && <p className="text-sm text-[var(--color-muted)]">{description}</p>}
              </div>
              <div className="hidden md:block rounded-full bg-[rgba(13,59,102,0.06)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                Protected area
              </div>
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
