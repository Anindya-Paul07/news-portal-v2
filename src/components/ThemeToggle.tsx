'use client';

import { useThemeMode } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useThemeMode();
  const { language } = useLanguage();
  const isDark = theme === 'dark';

  const tooltipText = isDark
    ? language === 'bn'
      ? 'লাইট মোডে পরিবর্তন করুন'
      : 'Switch to Light Mode'
    : language === 'bn'
      ? 'ডার্ক মোডে পরিবর্তন করুন'
      : 'Switch to Dark Mode';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={tooltipText}
      title={tooltipText}
      onClick={toggle}
      className={cn(
        'group relative inline-flex h-[30px] w-[58px] cursor-pointer items-center rounded-full p-[3px] transition-all duration-300 ease-out select-none active:scale-[0.96]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--news-red-700)] focus-visible:ring-offset-2',
        isDark
          ? 'bg-[#181514] border border-[#3E3835] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]'
          : 'bg-[#EAE4DC] border border-[#C8BBB1] shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
      {/* Background Track Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-[7px] pointer-events-none">
        {/* Sun Icon on the left */}
        <Sun
          className={cn(
            'h-3.5 w-3.5 transition-all duration-200',
            isDark ? 'text-neutral-500 opacity-60' : 'text-amber-500 opacity-0',
          )}
        />
        {/* Moon Icon on the right */}
        <Moon
          className={cn(
            'h-3.5 w-3.5 transition-all duration-200',
            isDark ? 'text-amber-400 opacity-0' : 'text-neutral-500 opacity-60',
          )}
        />
      </div>

      {/* Tactile Sliding Knob (Thumb) */}
      <span
        className={cn(
          'relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          isDark
            ? 'translate-x-[28px] bg-gradient-to-b from-[#2E2825] to-[#1C1816] text-amber-300 border border-[#4D4540] shadow-[0_2px_5px_rgba(0,0,0,0.6),0_1px_2px_rgba(0,0,0,0.4)]'
            : 'translate-x-0 bg-gradient-to-b from-white to-[#F7F4F0] text-amber-600 border border-black/10 shadow-[0_2px_5px_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.08)]',
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
        ) : (
          <Sun className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
        )}
      </span>
    </button>
  );
}
