'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔴 THE RED WIRE - FOOTER with Newsletter Subscription
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Professional news footer with:
 * - Newsletter subscription form
 * - Navigation links
 * - Social media links
 * - Contact information
 * - Copyright notice
 * 
 * Design: BBC/CNN style with Red Wire accents
 * 
 * ══════════════════════════════════════════════════════════════════════════
 */

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

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setSubscribeStatus('error');
      return;
    }

    setSubscribeStatus('loading');
    setErrorMessage('');

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubscribeStatus('success');
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubscribeStatus('idle');
      }, 5000);
    } catch (error) {
      setSubscribeStatus('error');
      setErrorMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <footer className="border-t border-[var(--news-gray-200)] bg-[var(--news-offwhite)] mt-16">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Newsletter Section */}
        <div className="border-b border-[var(--news-gray-200)] py-8 md:py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--news-red-700)] rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-['var(--font-playfair)'] text-[var(--news-black)] text-3xl md:text-4xl font-bold mb-3">
              Stay Informed
            </h2>
            <p className="font-['var(--font-work-sans)'] text-[var(--news-darkgray)] text-base md:text-lg mb-6">
              Get breaking news and in-depth analysis delivered to your inbox every morning
            </p>

            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                  className="flex-1 px-4 py-3 border border-[var(--news-gray-300)] bg-white text-[var(--news-black)] font-['var(--font-work-sans)'] text-sm focus:outline-none focus:border-[var(--news-red-700)] disabled:bg-[var(--news-gray-100)] disabled:cursor-not-allowed transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                  className="px-6 py-3 bg-[var(--news-red-700)] hover:bg-[var(--news-red-hover)] text-white font-['var(--font-work-sans)'] text-sm font-bold uppercase tracking-wide transition-colors disabled:bg-[var(--news-gray-400)] disabled:cursor-not-allowed"
                >
                  {subscribeStatus === 'loading' ? 'Subscribing...' : subscribeStatus === 'success' ? '✓ Subscribed' : 'Subscribe'}
                </button>
              </div>
              
              {subscribeStatus === 'success' && (
                <p className="font-['var(--font-work-sans)'] text-[var(--news-red-700)] text-sm font-bold mt-3">
                  ✓ Thank you for subscribing! Check your inbox for confirmation.
                </p>
              )}
              
              {subscribeStatus === 'error' && errorMessage && (
                <p className="font-['var(--font-work-sans)'] text-[var(--news-red-700)] text-sm mt-3">
                  {errorMessage}
                </p>
              )}
              
              <p className="font-['var(--font-work-sans)'] text-[var(--news-gray-600)] text-xs mt-3">
                By subscribing, you agree to our <Link href="/privacy" className="underline hover:text-[var(--news-red-700)]">Privacy Policy</Link> and <Link href="/terms" className="underline hover:text-[var(--news-red-700)]">Terms of Service</Link>
              </p>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
            {/* About Section */}
            <div className="lg:col-span-5">
              <h3 className="font-['var(--font-playfair)'] text-[var(--news-black)] text-2xl font-bold mb-4">
                The Contemporary News
              </h3>
              <p className="font-['var(--font-work-sans)'] text-[var(--news-darkgray)] text-sm leading-relaxed mb-4">
                Keep an eye on our News to get all the news including politics, business, sports, national-international breaking news, analytical and other news.
              </p>
              <div className="flex flex-col gap-2">
                <p className="font-['var(--font-work-sans)'] text-[var(--news-darkgray)] text-sm">
                  <span className="font-bold">Location:</span> Chattogram, Bangladesh
                </p>
                <p className="font-['var(--font-work-sans)'] text-[var(--news-darkgray)] text-sm">
                  <span className="font-bold">Email:</span>{' '}
                  <a href="mailto:newsdesk@thecontemporary.news" className="text-[var(--news-red-600)] hover:underline">
                    newsdesk@thecontemporary.news
                  </a>
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="lg:col-span-2">
              <h4 className="font-['var(--font-work-sans)'] text-[var(--news-black)] text-xs font-bold uppercase tracking-wide mb-4">
                Navigate
              </h4>
              <ul className="space-y-2">
                {footerNav.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-['var(--font-work-sans)'] text-[var(--news-darkgray)] text-sm hover:text-[var(--news-red-600)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media */}
            <div className="lg:col-span-3">
              <h4 className="font-['var(--font-work-sans)'] text-[var(--news-black)] text-xs font-bold uppercase tracking-wide mb-4">
                Follow Us
              </h4>
              <ul className="space-y-2">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-['var(--font-work-sans)'] text-[var(--news-darkgray)] text-sm hover:text-[var(--news-red-600)] transition-colors font-semibold"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile Apps */}
            <div className="lg:col-span-2">
              <h4 className="font-['var(--font-work-sans)'] text-[var(--news-black)] text-xs font-bold uppercase tracking-wide mb-4">
                Mobile Apps
              </h4>
              <p className="font-['var(--font-work-sans)'] text-[var(--news-darkgray)] text-sm mb-2">
                iOS · Android
              </p>
              <p className="font-['var(--font-work-sans)'] text-[var(--news-gray-600)] text-sm">
                Coming Soon
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[var(--news-gray-200)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-['var(--font-work-sans)'] text-[var(--news-gray-600)] text-sm">
              © {new Date().getFullYear()} The Contemporary. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="font-['var(--font-work-sans)'] text-[var(--news-gray-600)] text-sm hover:text-[var(--news-red-600)] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="font-['var(--font-work-sans)'] text-[var(--news-gray-600)] text-sm hover:text-[var(--news-red-600)] transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="font-['var(--font-work-sans)'] text-[var(--news-gray-600)] text-sm hover:text-[var(--news-red-600)] transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
