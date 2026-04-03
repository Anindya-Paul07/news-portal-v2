'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { canAccessAdminArea, type AdminArea } from '@/lib/rbac';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SignalCellularAltRoundedIcon from '@mui/icons-material/SignalCellularAltRounded';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🖥️ NEWSROOM OPERATING SYSTEM (NewsOS) - ADMIN SHELL
 * ═══════════════════════════════════════════════════════════════════════════
 */

const nav: Array<{ label: string; href: string; area: AdminArea }> = [
  { label: 'Dashboard', href: '/admin', area: 'dashboard' },
  { label: 'Articles', href: '/admin/articles', area: 'articles' },
  { label: 'Categories', href: '/admin/categories', area: 'categories' },
  { label: 'Advertisements', href: '/admin/ads', area: 'ads' },
  { label: 'Media Library', href: '/admin/media', area: 'media' },
  { label: 'Users', href: '/admin/users', area: 'users' },
  { label: 'Settings', href: '/admin/settings', area: 'settings' },
];

export function AdminShell({ 
  children, 
  title, 
  description 
}: { 
  children: ReactNode; 
  title: string; 
  description?: string;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredNav = nav.filter((item) => canAccessAdminArea(user?.role, item.area));

  return (
    <div className="grid grid-rows-[1fr_32px] lg:grid-cols-[280px_1fr] lg:grid-rows-[1fr_32px] h-screen w-screen overflow-hidden bg-[var(--newsos-bg-primary)] text-[var(--newsos-text-primary)]">
      
      {/* ═══ SIDEBAR (Desktop Only) ═══ */}
      <aside className="hidden lg:flex flex-col bg-[var(--newsos-bg-sidebar,var(--newsos-bg-primary))] border-r border-[var(--newsos-border-default)] overflow-y-auto">
        {/* Sidebar Header */}
        <div className="sticky top-0 z-10 bg-[var(--newsos-bg-primary)] border-b border-[var(--newsos-border-default)] p-3">
          <div className="text-lg font-bold uppercase tracking-wider text-[var(--newsos-text-primary)]">
            NewsOS
          </div>
          <div className="mt-2 text-xs text-[var(--newsos-text-tertiary)]">
            {user?.name || user?.email || 'USER'}
            <span className="ml-2 opacity-60">
              {user?.role?.toUpperCase() || 'GUEST'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-[var(--newsos-text-tertiary)] mb-1">
            Navigation
          </div>
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-3 py-2 mb-px text-[0.813rem] font-medium
                  border-l-2 transition-all duration-100
                  ${isActive 
                    ? 'bg-[var(--newsos-bg-active)] border-l-[var(--newsos-accent-primary)] font-bold text-[var(--newsos-accent-primary)]' 
                    : 'border-l-transparent text-[var(--newsos-text-primary)] hover:bg-[var(--newsos-bg-hover)] hover:border-l-[var(--newsos-border-strong)]'
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-[var(--newsos-border-default)] p-3">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-transparent border border-[var(--newsos-border-default)] text-[var(--newsos-text-primary)] text-xs font-bold uppercase tracking-wide cursor-pointer transition-all hover:bg-[var(--newsos-bg-hover)] hover:border-[var(--newsos-accent-primary)] hover:text-[var(--newsos-accent-primary)]"
          >
            <LogoutRoundedIcon sx={{ fontSize: 16 }} />
            Logout
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex flex-col overflow-y-auto bg-[var(--newsos-bg-primary)] lg:col-start-2">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[var(--newsos-bg-primary)] border-b border-[var(--newsos-border-default)] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wide text-[var(--newsos-text-primary)]">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-xs text-[var(--newsos-text-tertiary)]">
                  {description}
                </p>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden flex items-center justify-center p-2 bg-transparent border border-[var(--newsos-border-default)] text-[var(--newsos-text-primary)] cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuRoundedIcon />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* ═══ MOBILE MENU ═══ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-[var(--newsos-bg-primary)] lg:hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--newsos-border-default)]">
            <div className="text-lg font-bold uppercase tracking-wider">NewsOS</div>
            <button
              className="p-2 bg-transparent border border-[var(--newsos-border-default)] cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <CloseRoundedIcon />
            </button>
          </div>

          <nav className="flex-1 p-2 overflow-y-auto">
            <div className="px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-[var(--newsos-text-tertiary)] mb-1">
              Navigation
            </div>
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-3 py-2 mb-px text-[0.813rem] font-medium border-l-2 transition-all
                    ${isActive 
                      ? 'bg-[var(--newsos-bg-active)] border-l-[var(--newsos-accent-primary)] font-bold text-[var(--newsos-accent-primary)]' 
                      : 'border-l-transparent hover:bg-[var(--newsos-bg-hover)]'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[var(--newsos-border-default)] p-3">
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-[var(--newsos-border-default)] text-xs font-bold uppercase tracking-wide"
            >
              <LogoutRoundedIcon sx={{ fontSize: 16 }} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ═══ STATUS BAR ═══ */}
      <footer className="col-span-full flex items-center gap-4 px-4 h-8 bg-[var(--newsos-statusbar-bg)] border-t border-[var(--newsos-border-default)] text-xs text-[var(--newsos-statusbar-text)]">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--newsos-status-live)]" />
          API: Online
        </div>
        
        <div className="w-px h-4 bg-[var(--newsos-border-default)]" />
        
        <div className="flex items-center gap-1.5">
          <SignalCellularAltRoundedIcon sx={{ fontSize: 14 }} />
          Active Readers: 12.4k
        </div>
        
        <div className="w-px h-4 bg-[var(--newsos-border-default)]" />
        
        <div className="flex items-center gap-1.5">
          Breaking Wire: <span className="text-[var(--newsos-status-archived)]">OFF</span>
        </div>

        <div className="ml-auto text-[0.688rem] opacity-60">
          NewsOS v1.0.0
        </div>
      </footer>
    </div>
  );
}
