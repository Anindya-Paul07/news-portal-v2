import Link from 'next/link';

const footerNav = [
  { label: 'About', href: '/about' },
  { label: 'Editorial standards', href: '/standards' },
  { label: 'Advertise', href: '/advertise' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--color-primary)]/30 bg-[var(--color-footer-bg)] text-sm text-[var(--color-footer-text)]">
      <div className="container flex flex-col gap-8 py-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md space-y-3">
          <p className="headline text-xl font-black text-[var(--color-footer-title)]">The Contemporary News</p>
          <p className="leading-relaxed">
            Keep an eye on our News to get all the news including politics, business, sports, national-international
            breaking news, analytical and other news.
          </p>
          <p className="text-xs">© {new Date().getFullYear()} The Contemporary | Powered by Anindya</p>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-footer-title)]">Navigate</h4>
            <div className="flex flex-col gap-1">
              {footerNav.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-[var(--color-footer-link)]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-footer-title)]">Studios</h4>
            <p>Dhaka · Singapore · Remote</p>
            <p>newsdesk@thecontemporary.news</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-footer-title)]">Apps</h4>
            <p>iOS · Android</p>
            <p>Coming soon</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
