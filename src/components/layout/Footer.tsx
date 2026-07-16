'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

const footerNav = [
  { label: 'About', href: '/about' },
  { label: 'Editorial Standards', href: '/standards' },
  { label: 'Advertise', href: '/advertise' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/1E3oE7uaAq/' },
  { label: 'Instagram', href: 'https://www.instagram.com/thecontemporary.news' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@the.contemporary.news' },
  { label: 'YouTube', href: 'https://www.youtube.com/@TheContemporaryNews' },
  { label: 'X / Twitter', href: 'https://twitter.com/thecontempo' },
  { label: 'Threads', href: 'https://www.threads.net/@thecontemporarynews' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setSubscribeStatus('error');
      return;
    }

    setSubscribeStatus('loading');
    setErrorMessage('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus('idle'), 5000);
    } catch {
      setSubscribeStatus('error');
      setErrorMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <footer className="mt-10 border-t border-[var(--news-footer-border)] bg-[var(--news-footer-bg)] text-[var(--news-footer-text)] md:mt-14">
      <div className="mx-auto max-w-[1440px] px-4">
        <div className="grid gap-8 border-b border-[var(--news-footer-border)] py-8 md:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] md:items-start md:py-10">
          <div>
            <p className="news-meta text-[var(--news-footer-accent)]">The Contemporary</p>
            <h2 className="mt-2 [font-family:var(--font-serif)] text-3xl font-bold leading-tight text-[var(--news-footer-text)] md:text-4xl">
              A public-facing news experience with sharper hierarchy and a cleaner read.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--news-footer-muted)]">
              Keep an eye on our reporting for politics, business, international affairs, culture, sport, and rapid
              analysis from Bangladesh and beyond.
            </p>
          </div>

          {/* Newsletter Form commented out at client request
          <form onSubmit={handleSubscribe} className="border border-[var(--news-footer-border)] bg-[var(--news-footer-surface)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center bg-[var(--news-red-700)] text-white">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="news-meta text-[var(--news-footer-accent)]">Newsletter</p>
                <h3 className="mt-1 text-xl font-semibold text-[var(--news-footer-text)]">Start the day with the headlines</h3>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                className="min-w-0 flex-1 border border-[var(--news-footer-border)] bg-black/28 px-4 py-3 text-sm text-[var(--news-footer-text)] placeholder:text-[var(--news-footer-soft)] focus:border-[var(--news-red-700)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                required
              />
              <button
                type="submit"
                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                className="bg-[var(--news-red-700)] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--news-red-hover)] disabled:cursor-not-allowed disabled:bg-white/20"
              >
                {subscribeStatus === 'loading'
                  ? 'Subscribing...'
                  : subscribeStatus === 'success'
                    ? 'Subscribed'
                    : 'Subscribe'}
              </button>
            </div>

            {subscribeStatus === 'success' ? (
              <p className="mt-3 text-sm font-semibold text-[#ffd7d7]">
                Subscription received. Check your inbox for confirmation.
              </p>
            ) : null}

            {subscribeStatus === 'error' && errorMessage ? (
              <p className="mt-3 text-sm text-[#ffd7d7]">{errorMessage}</p>
            ) : null}

            <p className="mt-3 text-xs leading-5 text-[var(--news-footer-soft)]">
              By subscribing, you agree to our{' '}
              <Link href="/privacy" className="underline transition-colors hover:text-[var(--news-footer-text)]">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms" className="underline transition-colors hover:text-[var(--news-footer-text)]">
                Terms of Service
              </Link>
              .
            </p>
          </form>
          */}
        </div>

        <div className="grid gap-8 py-8 md:grid-cols-[minmax(0,1fr)_200px_240px_180px] md:py-10">
          <div>
            <h3 className="[font-family:var(--font-serif)] text-2xl font-bold text-[var(--news-footer-text)]">The Contemporary News</h3>
            <div className="mt-4 space-y-2 text-sm text-[var(--news-footer-muted)]">
              <p>Chattogram, Bangladesh</p>
              <p>
                <a href="mailto:newsdesk@thecontemporary.news" className="transition-colors hover:text-[var(--news-footer-text)]">
                  newsdesk@thecontemporary.news
                </a>
              </p>
            </div>
          </div>

          <div>
            <h4 className="news-meta text-[var(--news-footer-accent)]">Navigate</h4>
            <ul className="mt-4 space-y-3">
              {footerNav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--news-footer-muted)] transition-colors hover:text-[var(--news-footer-text)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="news-meta text-[var(--news-footer-accent)]">Follow</h4>
            <ul className="mt-4 space-y-3">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--news-footer-muted)] transition-colors hover:text-[var(--news-footer-text)]"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="news-meta text-[var(--news-footer-accent)]">Apps</h4>
            <div className="mt-4 space-y-2 text-sm text-[var(--news-footer-muted)]">
              <p>iOS</p>
              <p>Android</p>
              <p className="text-[var(--news-footer-soft)]">Coming soon</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--news-footer-border)] py-4 text-sm text-[var(--news-footer-soft)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} The Contemporary. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="transition-colors hover:text-[var(--news-footer-text)]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[var(--news-footer-text)]">
              Terms of Service
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-[var(--news-footer-text)]">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
