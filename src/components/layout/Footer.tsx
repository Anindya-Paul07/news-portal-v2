'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Youtube, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/1E3oE7uaAq/', icon: Facebook },
  { label: 'YouTube', href: 'https://www.youtube.com/@TheContemporaryNews', icon: Youtube },
  { label: 'Instagram', href: 'https://www.instagram.com/thecontemporary.news', icon: Instagram },
  { label: 'X / Twitter', href: 'https://twitter.com/thecontempo', icon: Twitter },
];

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="mt-6 border-t border-[var(--news-footer-border)] bg-[var(--news-footer-bg)] text-[var(--news-footer-text)] md:mt-8 w-full overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 py-8 md:py-12">
        {/* Sleek Layout Matching BanglaStream / Modern Editorial Standards */}
        <div className="flex flex-col items-center justify-between gap-8 text-center md:flex-row md:gap-6 md:text-left">
          {/* Left / Brand Identity */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="inline-flex items-center gap-3 text-inherit no-underline">
              <div className="relative h-12 w-12 flex-shrink-0 md:h-16 md:w-16">
                <Image
                  src="/logo.png"
                  alt="The Contemporary logo"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="text-left">
                <span className="block [font-family:var(--font-serif)] text-2xl font-bold leading-tight tracking-tight text-[var(--news-footer-text)] md:text-3xl">
                  The Contemporary
                </span>
                <span className="block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--news-footer-soft)]">
                  {language === 'bn' ? 'নতুন সময়ের গণমাধ্যম' : 'Media for a New Era'}
                </span>
              </div>
            </Link>
          </div>

          {/* Right Column: Social Icons & Essential Links */}
          <div className="flex flex-col items-center space-y-4 md:items-end">
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => {
                const IconComp = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--news-footer-border)] bg-black/20 text-[var(--news-footer-text)] transition-all duration-200 hover:border-[var(--news-red-700)] hover:bg-[var(--news-red-700)] hover:text-white"
                  >
                    <IconComp className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--news-footer-muted)] md:justify-end">
              <Link
                href="/about"
                className="transition-colors hover:text-[var(--news-footer-accent)]"
              >
                {language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
              </Link>
              <span className="text-[var(--news-footer-border)]">|</span>
              <Link
                href="/contact"
                className="transition-colors hover:text-[var(--news-footer-accent)]"
              >
                {language === 'bn' ? 'যোগাযোগ' : 'Contact'}
              </Link>
              <span className="text-[var(--news-footer-border)]">|</span>
              <Link
                href="/privacy"
                className="transition-colors hover:text-[var(--news-footer-accent)]"
              >
                {language === 'bn' ? 'গোপনীয়তার নীতি' : 'Privacy Policy'}
              </Link>
              <span className="text-[var(--news-footer-border)]">|</span>
              <Link
                href="/terms"
                className="transition-colors hover:text-[var(--news-footer-accent)]"
              >
                {language === 'bn' ? 'সেবার শর্তাবলী' : 'Terms'}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Clean Copyright Notice */}
        <div className="mt-8 border-t border-[var(--news-footer-border)] pt-6 text-center text-xs text-[var(--news-footer-soft)] md:mt-10">
          <p>
            {language === 'bn'
              ? 'কপিরাইট © ২০২৬ দ্যা কনটেম্পরারি | সর্বস্বত্ব সংরক্ষিত'
              : 'Copyright © 2026 The Contemporary | All rights reserved'}
          </p>
        </div>
      </div>
    </footer>
  );
}
