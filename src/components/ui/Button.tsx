'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'outline' | 'subtle' | 'secondary';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const styles: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-primary-contrast)] shadow-sm shadow-[rgba(197,55,39,0.35)] hover:opacity-95',
  secondary:
    'bg-[var(--color-secondary)] text-[var(--color-secondary-contrast)] shadow-[0_10px_24px_rgba(35,53,84,0.25)] hover:opacity-95',
  ghost:
    'bg-transparent text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[rgba(35,53,84,0.08)]',
  outline:
    'border border-[var(--color-border)] bg-transparent text-[var(--color-muted)] hover:border-[var(--color-accent)]',
  subtle: 'bg-[var(--color-surface-elevated)] text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]',
};

export function Button({ className, children, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60',
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
