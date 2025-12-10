'use client';

import { useThemeMode } from '@/contexts/theme-context';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 13.35A8 8 0 0 1 10.65 3 6.5 6.5 0 1 0 21 13.35Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useThemeMode();
  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      className="rounded-full border border-transparent bg-transparent px-1 py-1 shadow-none hover:bg-transparent"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
    >
      <span className="relative inline-flex h-6 w-12 items-center rounded-full bg-[var(--color-surface-elevated)] px-1">
        <span
          className={cn(
            'inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-contrast)] transition-transform',
            isDark ? 'translate-x-5' : 'translate-x-0',
          )}
        >
          {isDark ? <MoonIcon className="h-3 w-3" /> : <SunIcon className="h-3 w-3" />}
        </span>
      </span>
    </Button>
  );
}
