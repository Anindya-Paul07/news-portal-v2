'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { SyntheticEvent, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Search, ExternalLink, Facebook, Youtube, Instagram, Twitter } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useThemeMode } from '@/contexts/theme-context';
import { useMenuCategories } from '@/hooks/api-hooks';
import { canAccessAdmin } from '@/lib/rbac';
import { getLocalizedText } from '@/lib/utils';

const DRAWER_SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/1E3oE7uaAq/', icon: Facebook },
  { label: 'YouTube', href: 'https://www.youtube.com/@TheContemporaryNews', icon: Youtube },
  { label: 'Instagram', href: 'https://www.instagram.com/thecontemporary.news', icon: Instagram },
  { label: 'X / Twitter', href: 'https://twitter.com/thecontempo', icon: Twitter },
];

export function Header() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const pathname = usePathname();
  const router = useRouter();
  const { data: menu } = useMenuCategories();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [drawerSearch, setDrawerSearch] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [drawerAnchor, setDrawerAnchor] = useState<'left' | 'right'>('left');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showStickyNav, setShowStickyNav] = useState(false);

  // Smooth mouse-wheel horizontal scrolling for navigation tabs (desktop & laptop)
  const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) > 0) {
      const scroller = e.currentTarget.querySelector('.MuiTabs-scroller');
      if (scroller) {
        scroller.scrollLeft += e.deltaY;
      }
    }
  };

  // Mouse drag-to-scroll for category navigation tabs (desktop swipe)
  const isDraggingNavRef = useRef(false);
  const startXNavRef = useRef(0);
  const scrollLeftNavRef = useRef(0);
  const hasDraggedNavRef = useRef(false);

  const handleNavMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Main button only
    const scroller = e.currentTarget.querySelector('.MuiTabs-scroller') as HTMLElement;
    if (!scroller) return;
    isDraggingNavRef.current = true;
    hasDraggedNavRef.current = false;
    startXNavRef.current = e.pageX;
    scrollLeftNavRef.current = scroller.scrollLeft;
  };

  const handleNavMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingNavRef.current) return;
    const scroller = e.currentTarget.querySelector('.MuiTabs-scroller') as HTMLElement;
    if (!scroller) return;
    const deltaX = e.pageX - startXNavRef.current;
    if (Math.abs(deltaX) > 5) {
      hasDraggedNavRef.current = true;
    }
    scroller.scrollLeft = scrollLeftNavRef.current - deltaX;
  };

  const handleNavMouseUp = () => {
    isDraggingNavRef.current = false;
  };

  const handleNavClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedNavRef.current) {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        hasDraggedNavRef.current = false;
      }, 60);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingNavRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Categories managed dynamically from Admin Dashboard
  const navCategories = useMemo(() => {
    return (menu ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [menu]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 260) {
        setShowStickyNav(true);
      } else if (scrollY < 180) {
        setShowStickyNav(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawers on route navigation
  useEffect(() => {
    setMobileNavOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock background page scroll when hamburger sidebar or search drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (mobileNavOpen || searchOpen) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [mobileNavOpen, searchOpen]);

  const dateline = useMemo(() => {
    const now = new Date();
    return new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    }).format(now);
  }, [language]);

  const navValue = useMemo(() => {
    if (pathname === '/latest' || pathname.startsWith('/latest/')) return 'latest';
    if (pathname === '/contact') return 'contact';
    const active = navCategories.find((cat) => pathname.includes(`/category/${cat.slug}`));
    return active ? active.slug : false;
  }, [navCategories, pathname]);

  const handleNavChange = (_: SyntheticEvent | null, slug: string) => {
    setMobileNavOpen(false);
    if (slug === 'latest') {
      router.push('/latest');
    } else if (slug === 'video') {
      window.open('https://www.youtube.com/@TheContemporaryNews', '_blank', 'noopener,noreferrer');
    } else if (slug === 'contact') {
      router.push('/contact');
    } else {
      router.push(`/category/${slug}`);
    }
  };

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;
    router.push(`/search?query=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
  };

  const onDrawerSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = drawerSearch.trim();
    if (!trimmed) return;
    router.push(`/search?query=${encodeURIComponent(trimmed)}`);
    setMobileNavOpen(false);
    setDrawerSearch('');
  };

  return (
    <>
      <AppBar
        position="relative"
        color="transparent"
        enableColorOnDark
        elevation={0}
        sx={{
          bgcolor: 'var(--news-page)',
          color: 'var(--news-ink)',
          boxShadow: 'none !important',
          border: 'none !important',
          borderTop: 'none !important',
          borderBottom: 'none !important',
          maxWidth: '100vw',
          overflowX: 'hidden',
        }}
      >
        {/* Top Date Bar */}
        <Box sx={{ bgcolor: 'var(--news-black)', color: '#fff', borderTop: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 } }}>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            sx={{
              minHeight: 34,
              py: 0.5,
              fontSize: { xs: '0.68rem', sm: '0.72rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.85)',
              overflow: 'hidden',
            }}
          >
            <Typography
              component="p"
              sx={{
                fontSize: 'inherit',
                fontWeight: 700,
                letterSpacing: 'inherit',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {dateline}
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Main Brand & Action Toolbar - Fully Responsive */}
      <Toolbar disableGutters sx={{ minHeight: 'unset' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 1, md: 1.5 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              gap: { xs: 1, sm: 2 },
            }}
          >
            {/* Left Action Box: Hamburger on mobile; Hamburger + Search on desktop */}
            <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: 42, md: 'auto' }, minWidth: { md: 88 }, flexShrink: 0 }}>
              <IconButton
                aria-label="Toggle navigation menu"
                onClick={() => {
                  setDrawerAnchor('left');
                  setMobileNavOpen(true);
                }}
                sx={{
                  border: '1px solid var(--news-grid-strong)',
                  color: 'var(--news-ink)',
                  borderRadius: 0,
                  width: { xs: 38, md: 40 },
                  height: { xs: 38, md: 40 },
                  p: 0,
                  transition: 'all 160ms ease',
                  '&:hover': { bgcolor: 'rgba(180, 20, 20, 0.06)', borderColor: 'var(--news-red-700)', color: 'var(--news-red-700)' },
                }}
              >
                <MenuRoundedIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
              </IconButton>
              <IconButton
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
                sx={{
                  ml: 1,
                  border: '1px solid var(--news-grid-strong)',
                  color: 'var(--news-ink)',
                  borderRadius: 0,
                  width: 40,
                  height: 40,
                  p: 0,
                  display: { xs: 'none', md: 'inline-flex' },
                  transition: 'all 160ms ease',
                  '&:hover': { bgcolor: 'rgba(180, 20, 20, 0.06)', borderColor: 'var(--news-red-700)', color: 'var(--news-red-700)' },
                }}
              >
                <SearchRoundedIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Box>

            {/* Center Brand Identity - Fully Visible & Perfectly Centered on Mobile & Desktop */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 0, flex: 1, px: 0.5 }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none', maxWidth: '100%' }}>
                <Stack
                  direction="row"
                  spacing={{ xs: 1, sm: 1.25 }}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ minWidth: 0, textAlign: 'center' }}
                >
                  <Box
                    sx={{
                      width: { xs: 34, sm: 52, md: 74 },
                      height: { xs: 34, sm: 52, md: 74 },
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    <Image src="/logo.png" alt="The Contemporary logo" fill priority style={{ objectFit: 'contain' }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: { xs: '1.25rem', sm: '1.6rem', md: '2.45rem' },
                        lineHeight: 1.05,
                        fontWeight: 800,
                        letterSpacing: '-0.025em',
                        color: 'var(--news-ink)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      The Contemporary
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.5,
                        display: { xs: 'none', md: 'block' },
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--news-soft)',
                      }}
                    >
                      {language === 'bn' ? 'বাংলাদেশ ও বিশ্বের সংবাদ' : 'Bangladesh and the world'}
                    </Typography>
                  </Box>
                </Stack>
              </Link>
            </Box>

            {/* Right Action Box: Search button on mobile; Theme, Language, Auth on desktop (NO login button) */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: { xs: 42, md: 'auto' }, minWidth: { md: 88 }, flexShrink: 0 }}>
              {/* Mobile Search Button */}
              <IconButton
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
                sx={{
                  border: '1px solid var(--news-grid-strong)',
                  color: 'var(--news-ink)',
                  borderRadius: 0,
                  width: 38,
                  height: 38,
                  p: 0,
                  display: { xs: 'inline-flex', md: 'none' },
                  transition: 'all 160ms ease',
                  '&:hover': { bgcolor: 'rgba(180, 20, 20, 0.06)', borderColor: 'var(--news-red-700)', color: 'var(--news-red-700)' },
                }}
              >
                <SearchRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>

              {/* Desktop Controls (md and up) */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="small"
                  onClick={toggleLanguage}
                  sx={{
                    borderRadius: 0,
                    borderColor: 'var(--news-grid-strong)',
                    color: 'var(--news-ink)',
                    minWidth: 'unset',
                    px: 1.4,
                    py: 0.75,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    transition: 'all 160ms ease',
                    '&:hover': { borderColor: 'var(--news-red-700)', color: 'var(--news-red-700)' },
                  }}
                >
                  {language === 'en' ? 'বাংলা' : 'EN'}
                </Button>
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={logout}
                      sx={{ borderRadius: 0, color: 'var(--news-ink)', fontWeight: 600 }}
                    >
                      {language === 'bn' ? 'লগআউট' : 'Logout'}
                    </Button>
                    {canAccessAdmin(user.role) ? (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => router.push('/admin')}
                        sx={{
                          borderRadius: 0,
                          bgcolor: 'var(--news-red-700)',
                          color: '#fff',
                          fontWeight: 700,
                          '&:hover': { bgcolor: 'var(--news-red-hover)' },
                        }}
                      >
                        Admin
                      </Button>
                    ) : null}
                  </>
                ) : null}
              </Stack>
            </Box>
          </Box>
        </Container>
      </Toolbar>

      {/* Dynamic Navbar: Admin Managed Categories + Latest + Video + Contact with High-Contrast Bold Typography */}
      <Box
        onWheel={handleTabsWheel}
        onMouseDown={handleNavMouseDown}
        onMouseMove={handleNavMouseMove}
        onMouseUp={handleNavMouseUp}
        onMouseLeave={handleNavMouseUp}
        onClickCapture={handleNavClickCapture}
        sx={{
          borderTop: '1px solid var(--news-grid)',
          borderBottom: '1px solid var(--news-grid)',
          bgcolor: 'var(--news-paper)',
          width: '100%',
          overflowX: 'hidden',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
          userSelect: 'none',
        }}
      >
        <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3, lg: 4, xl: 6 } }}>
          <Tabs
            value={navValue}
            onChange={handleNavChange}
            variant="scrollable"
            scrollButtons={false}
            allowScrollButtonsMobile
            textColor="inherit"
            sx={{
              minHeight: { xs: 42, md: 48 },
              borderBottom: 'none !important',
              '.MuiTabs-scroller': {
                overflowX: 'auto !important',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
              },
              '.MuiTab-root': {
                minHeight: { xs: 42, md: 48 },
                px: { xs: 1.2, sm: 1.5, md: 1.8, lg: 2.2 },
                color: 'var(--news-ink)',
                fontSize: { xs: '0.9rem', md: '1.02rem', lg: '1.06rem' },
                fontWeight: 700,
                letterSpacing: '0.01em',
                textTransform: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                userSelect: 'none',
                transition: 'color 160ms ease, background-color 160ms ease',
                '&:hover': {
                  color: 'var(--news-red-700)',
                  backgroundColor: 'rgba(180, 20, 20, 0.04)',
                },
              },
              '.Mui-selected': {
                color: 'var(--news-red-700) !important',
                fontWeight: 800,
              },
              '.MuiTabs-indicator': {
                height: 2.5,
                backgroundColor: 'var(--news-red-700)',
              },
            }}
          >
            {/* 1. Latest */}
            <Tab
              value="latest"
              label={language === 'bn' ? 'লেটেস্ট' : 'Latest'}
            />

            {/* 2. Admin Managed Categories from Database */}
            {navCategories.map((cat) => (
              <Tab
                key={cat.id}
                value={cat.slug}
                label={getLocalizedText(cat.name, language)}
              />
            ))}

            {/* 3. Video Channel */}
            <Tab
              value="video"
              label={language === 'bn' ? 'ভিডিও' : 'Video'}
            />

            {/* 4. Contact */}
            <Tab
              value="contact"
              label={language === 'bn' ? 'যোগাযোগ' : 'Contact'}
            />
          </Tabs>
        </Box>
      </Box>

      {/* Drawer: Search Box + Dynamic Categories + Video + Contact + Socials */}
      <Drawer
        anchor={drawerAnchor}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        transitionDuration={{ enter: 360, exit: 260 }}
        SlideProps={{
          timeout: { enter: 360, exit: 260 },
          easing: { enter: 'cubic-bezier(0.16, 1, 0.3, 1)', exit: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        }}
        BackdropProps={{
          sx: {
            touchAction: 'none',
          },
          onWheel: (e) => {
            e.preventDefault();
            e.stopPropagation();
          },
          onTouchMove: (e) => {
            e.preventDefault();
            e.stopPropagation();
          },
        }}
        PaperProps={{
          sx: {
            width: { xs: '88vw', sm: 380 },
            maxWidth: 420,
            bgcolor: 'var(--news-page)',
            color: 'var(--news-ink)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: drawerAnchor === 'left' ? '10px 0 36px rgba(0, 0, 0, 0.25)' : '-10px 0 36px rgba(0, 0, 0, 0.25)',
            borderRight: drawerAnchor === 'left' ? '1px solid var(--news-grid)' : 'none',
            borderLeft: drawerAnchor === 'right' ? '1px solid var(--news-grid)' : 'none',
            overscrollBehavior: 'contain',
          },
        }}
      >
        <Box sx={{ overflowY: 'auto', flex: 1, p: { xs: 2.5, sm: 3 }, overscrollBehavior: 'contain' }}>
          {/* Header with Brand & Close Button */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 2, borderBottom: '1px solid var(--news-grid)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 38, height: 38, position: 'relative', flexShrink: 0 }}>
                <Image src="/logo.png" alt="The Contemporary" fill style={{ objectFit: 'contain' }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--news-ink)', lineHeight: 1.1 }}>
                  The Contemporary
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--news-soft)' }}>
                  {language === 'bn' ? 'নতুন সময়ের গণমাধ্যম' : 'Media for a New Era'}
                </Typography>
              </Box>
            </Box>
            <IconButton
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
              sx={{
                border: '1px solid var(--news-grid)',
                borderRadius: 0,
                color: 'var(--news-ink)',
                '&:hover': { bgcolor: 'rgba(180, 20, 20, 0.08)', color: 'var(--news-red-700)' },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          {/* Drawer Top Utility Bar: Language & Dark Mode — mobile only (md+ has these in the main navbar) */}
          <Box
            sx={{
              my: 2,
              p: 1.5,
              bgcolor: 'var(--news-paper)',
              border: '1px solid var(--news-grid)',
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            {/* Language Switch Segmented Pill */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--news-soft)', textTransform: 'uppercase' }}>
                {language === 'bn' ? 'ভাষা' : 'Lang'}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  border: '1px solid var(--news-grid-strong)',
                  p: '2px',
                  bgcolor: 'var(--news-page)',
                }}
              >
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => language !== 'bn' && toggleLanguage()}
                  sx={{
                    minWidth: 'unset',
                    px: 1.2,
                    py: 0.35,
                    fontSize: '0.78rem',
                    fontWeight: language === 'bn' ? 800 : 600,
                    borderRadius: 0,
                    color: language === 'bn' ? '#fff' : 'var(--news-ink)',
                    bgcolor: language === 'bn' ? 'var(--news-red-700)' : 'transparent',
                    '&:hover': { bgcolor: language === 'bn' ? 'var(--news-red-hover)' : 'rgba(0,0,0,0.04)' },
                  }}
                >
                  বাংলা
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => language !== 'en' && toggleLanguage()}
                  sx={{
                    minWidth: 'unset',
                    px: 1.2,
                    py: 0.35,
                    fontSize: '0.78rem',
                    fontWeight: language === 'en' ? 800 : 600,
                    borderRadius: 0,
                    color: language === 'en' ? '#fff' : 'var(--news-ink)',
                    bgcolor: language === 'en' ? 'var(--news-red-700)' : 'transparent',
                    '&:hover': { bgcolor: language === 'en' ? 'var(--news-red-hover)' : 'rgba(0,0,0,0.04)' },
                  }}
                >
                  EN
                </Button>
              </Box>
            </Box>

            {/* Theme Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--news-soft)', textTransform: 'uppercase' }}>
                {language === 'bn' ? 'থিম' : 'Theme'}
              </Typography>
              <ThemeToggle />
            </Box>
          </Box>

          {/* Drawer Search Box: "কিছু খুঁজছেন?" (Client PDF Page 1) */}
          <Box component="form" onSubmit={onDrawerSearch} sx={{ mb: 2.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={language === 'bn' ? 'কিছু খুঁজছেন?' : 'Looking for something?'}
              value={drawerSearch}
              onChange={(e) => setDrawerSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="h-4 w-4 text-[var(--news-soft)]" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: theme.palette.mode === 'dark' ? 'var(--news-paper)' : 'rgba(0,0,0,0.03)',
                  borderColor: 'var(--news-grid-strong)',
                  '& input': {
                    py: 1.2,
                    fontSize: '0.92rem',
                    color: 'var(--news-ink)',
                  },
                },
              }}
            />
          </Box>

          {/* Category Section Label */}
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--news-soft)', mb: 1, px: 0.5 }}>
            {language === 'bn' ? 'সংবাদ বিভাগসমূহ' : 'News Sections'}
          </Typography>

          {/* Navigation Items: Latest + Dynamic Categories + Video + Contact */}
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {/* Latest Link */}
            <Button
              variant="ghost"
              onClick={() => handleNavChange(null, 'latest')}
              sx={{
                justifyContent: 'flex-start',
                width: '100%',
                borderRadius: 0,
                px: 1.5,
                py: 1.1,
                color: navValue === 'latest' ? 'var(--news-red-700)' : 'var(--news-ink)',
                bgcolor: navValue === 'latest' ? 'rgba(180, 20, 20, 0.06)' : 'transparent',
                borderLeft: navValue === 'latest' ? '3px solid var(--news-red-700)' : '3px solid transparent',
                transition: 'all 150ms ease',
                '&:hover': {
                  color: 'var(--news-red-700)',
                  bgcolor: 'rgba(180, 20, 20, 0.04)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Typography sx={{ fontSize: '1.02rem', fontWeight: navValue === 'latest' ? 800 : 700, color: 'inherit' }}>
                {language === 'bn' ? 'লেটেস্ট' : 'Latest'}
              </Typography>
            </Button>

            {/* Dynamic Categories from DB */}
            {navCategories.map((cat) => {
              const isSelected = navValue === cat.slug;
              return (
                <Button
                  key={cat.id}
                  variant="ghost"
                  onClick={() => handleNavChange(null, cat.slug)}
                  sx={{
                    justifyContent: 'flex-start',
                    width: '100%',
                    borderRadius: 0,
                    px: 1.5,
                    py: 1.1,
                    color: isSelected ? 'var(--news-red-700)' : 'var(--news-ink)',
                    bgcolor: isSelected ? 'rgba(180, 20, 20, 0.06)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--news-red-700)' : '3px solid transparent',
                    transition: 'all 150ms ease',
                    '&:hover': {
                      color: 'var(--news-red-700)',
                      bgcolor: 'rgba(180, 20, 20, 0.04)',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '1.02rem', fontWeight: isSelected ? 800 : 700, color: 'inherit' }}>
                    {getLocalizedText(cat.name, language)}
                  </Typography>
                </Button>
              );
            })}

            {/* Video (YouTube) */}
            <Button
              variant="ghost"
              onClick={() => handleNavChange(null, 'video')}
              sx={{
                justifyContent: 'space-between',
                width: '100%',
                borderRadius: 0,
                px: 1.5,
                py: 1.1,
                color: 'var(--news-ink)',
                borderLeft: '3px solid transparent',
                transition: 'all 150ms ease',
                '&:hover': {
                  color: 'var(--news-red-700)',
                  bgcolor: 'rgba(180, 20, 20, 0.04)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Typography sx={{ fontSize: '1.02rem', fontWeight: 700, color: 'inherit' }}>
                {language === 'bn' ? 'ভিডিও' : 'Video'}
              </Typography>
              <ExternalLink className="h-4 w-4 text-[var(--news-soft)] opacity-70" />
            </Button>

            {/* Contact */}
            <Button
              variant="ghost"
              onClick={() => handleNavChange(null, 'contact')}
              sx={{
                justifyContent: 'flex-start',
                width: '100%',
                borderRadius: 0,
                px: 1.5,
                py: 1.1,
                color: navValue === 'contact' ? 'var(--news-red-700)' : 'var(--news-ink)',
                bgcolor: navValue === 'contact' ? 'rgba(180, 20, 20, 0.06)' : 'transparent',
                borderLeft: navValue === 'contact' ? '3px solid var(--news-red-700)' : '3px solid transparent',
                transition: 'all 150ms ease',
                '&:hover': {
                  color: 'var(--news-red-700)',
                  bgcolor: 'rgba(180, 20, 20, 0.04)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Typography sx={{ fontSize: '1.02rem', fontWeight: navValue === 'contact' ? 800 : 700, color: 'inherit' }}>
                {language === 'bn' ? 'যোগাযোগ' : 'Contact'}
              </Typography>
            </Button>
          </Stack>

          {/* User / Account Section: ONLY shown when logged in. No login button for public readers */}
          {user ? (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid var(--news-grid)' }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--news-soft)', mb: 1.5, px: 0.5 }}>
                {language === 'bn' ? 'অ্যাকাউন্ট' : 'Account'} ({user.name || user.email})
              </Typography>
              <Stack spacing={1}>
                {canAccessAdmin(user.role) ? (
                  <Button
                    variant="secondary"
                    onClick={() => { setMobileNavOpen(false); router.push('/admin'); }}
                    sx={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      borderRadius: 0,
                      bgcolor: 'var(--news-red-700)',
                      color: '#fff',
                      py: 1.1,
                      fontWeight: 700,
                      '&:hover': { bgcolor: 'var(--news-red-hover)' },
                    }}
                  >
                    <AdminPanelSettingsRoundedIcon sx={{ mr: 1, fontSize: 18 }} />
                    {language === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  onClick={() => { setMobileNavOpen(false); logout(); }}
                  sx={{
                    justifyContent: 'flex-start',
                    width: '100%',
                    borderRadius: 0,
                    color: 'var(--news-ink)',
                    py: 1.1,
                    border: '1px solid var(--news-grid-strong)',
                    '&:hover': { color: 'var(--news-red-700)', borderColor: 'var(--news-red-700)' },
                  }}
                >
                  <LogoutRoundedIcon sx={{ mr: 1, fontSize: 18 }} />
                  {language === 'bn' ? 'লগআউট' : 'Logout'}
                </Button>
              </Stack>
            </Box>
          ) : null}
        </Box>

        {/* Bottom Drawer Section: Social Icons & Tagline */}
        <Box sx={{ p: { xs: 2.5, sm: 3 }, borderTop: '1px solid var(--news-grid)', bgcolor: 'var(--news-paper)' }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--news-soft)', mb: 1.5 }}>
            {language === 'bn' ? 'আমাদের সাথে যুক্ত থাকুন' : 'Connect With Us'}
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {DRAWER_SOCIAL_LINKS.map((s) => {
              const IconComp = s.icon;
              return (
                <IconButton
                  key={s.label}
                  component="a"
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '1px solid var(--news-grid-strong)',
                    color: 'var(--news-ink)',
                    transition: 'all 180ms ease',
                    '&:hover': {
                      bgcolor: 'var(--news-red-700)',
                      borderColor: 'var(--news-red-700)',
                      color: '#fff',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <IconComp className="h-4 w-4" />
                </IconButton>
              );
            })}
          </Stack>
          <Typography sx={{ mt: 2, fontSize: '0.75rem', color: 'var(--news-soft)' }}>
            {language === 'bn' ? 'চট্টগ্রাম, বাংলাদেশ' : 'Chattogram, Bangladesh'}
          </Typography>
        </Box>
      </Drawer>

      {/* Search Overlay Drawer */}
      <Drawer
        anchor="top"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        BackdropProps={{
          sx: { touchAction: 'none' },
          onWheel: (e) => {
            e.preventDefault();
            e.stopPropagation();
          },
          onTouchMove: (e) => {
            e.preventDefault();
            e.stopPropagation();
          },
        }}
        PaperProps={{
          sx: {
            bgcolor: 'var(--news-page)',
            color: 'var(--news-ink)',
            borderBottom: '1px solid var(--news-grid-strong)',
            overscrollBehavior: 'contain',
          },
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={2} py={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--news-red-700)' }}>
                  Search
                </Typography>
                <Typography sx={{ mt: 0.75, fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700 }}>
                  {language === 'bn' ? 'সংবাদ খুঁজুন' : 'Search the news'}
                </Typography>
              </Box>
              <IconButton aria-label="Close search" onClick={() => setSearchOpen(false)}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
            <Box component="form" onSubmit={onSearch}>
              <TextField
                fullWidth
                size="medium"
                autoFocus
                placeholder={language === 'bn' ? 'শিরোনাম, বিষয়, বিভাগ' : 'Headlines, topics, sections'}
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'var(--news-red-700)' }} />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ 'aria-label': 'Search news' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    bgcolor: theme.palette.mode === 'dark' ? 'var(--news-paper)' : 'rgba(255, 255, 255, 0.7)',
                    '& input': {
                      color: 'var(--news-ink)',
                    },
                  },
                }}
              />
            </Box>
          </Stack>
        </Container>
      </Drawer>
    </AppBar>

    {/* Floating Sticky Navbar — TEMPORARILY HIDDEN, uncomment to re-enable */}
    {false && <Box
      component="nav"
      aria-label="Sticky navigation"
      sx={{
        position: 'fixed',
        top: -1,
        left: 0,
        right: 0,
        zIndex: 1200,
        bgcolor: '#8a0e16',
        color: '#ffffff',
        boxShadow: showStickyNav ? '0 4px 20px rgba(0, 0, 0, 0.28)' : 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
        borderTop: 'none',
        transform: showStickyNav ? 'translate3d(0, 0, 0)' : 'translate3d(0, -105%, 0)',
        visibility: showStickyNav ? 'visible' : 'hidden',
        transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 380ms ease, visibility 380ms ease',
        pointerEvents: showStickyNav ? 'auto' : 'none',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        backfaceVisibility: 'hidden',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: { xs: 52, md: 56 },
            gap: { xs: 1, md: 2 },
          }}
        >
          {/* Left: Compact Logo & Brand Title */}
          <Link
            href="/"
            style={{ color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
          >
            <Box sx={{ width: 32, height: 32, position: 'relative', flexShrink: 0, bgcolor: '#fff', borderRadius: '50%', p: '2px' }}>
              <Image src="/logo.png" alt="The Contemporary" fill style={{ objectFit: 'contain' }} />
            </Box>
            <Typography
              sx={{
                fontFamily: 'var(--font-serif)',
                fontSize: { xs: '1.15rem', md: '1.35rem' },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                whiteSpace: 'nowrap',
                lineHeight: 1,
              }}
            >
              The Contemporary
            </Typography>
          </Link>

          {/* Center: Desktop Navigation Categories (hidden on small mobile) with smooth wheel scroll */}
          <Box
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: { lg: 0.8, xl: 1.4 },
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              flex: 1,
              justifyContent: 'flex-start',
              px: 2,
            }}
          >
            <Button
              variant="ghost"
              size="small"
              onClick={() => router.push('/latest')}
              sx={{
                color: navValue === 'latest' ? '#ffffff' : 'rgba(255, 255, 255, 0.92)',
                fontSize: '0.96rem',
                fontWeight: navValue === 'latest' ? 800 : 700,
                px: 1.5,
                py: 0.6,
                borderRadius: '4px',
                bgcolor: navValue === 'latest' ? 'rgba(0, 0, 0, 0.25)' : 'transparent',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 150ms ease',
                '&:hover': { color: '#ffffff', bgcolor: 'rgba(0, 0, 0, 0.18)' },
              }}
            >
              {language === 'bn' ? 'লেটেস্ট' : 'Latest'}
            </Button>

            {navCategories.map((cat) => {
              const isSelected = navValue === cat.slug;
              return (
                <Button
                  key={cat.id}
                  variant="ghost"
                  size="small"
                  onClick={() => router.push(`/category/${cat.slug}`)}
                  sx={{
                    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.92)',
                    fontSize: '0.96rem',
                    fontWeight: isSelected ? 800 : 700,
                    px: 1.5,
                    py: 0.6,
                    borderRadius: '4px',
                    bgcolor: isSelected ? 'rgba(0, 0, 0, 0.25)' : 'transparent',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 150ms ease',
                    '&:hover': { color: '#ffffff', bgcolor: 'rgba(0, 0, 0, 0.18)' },
                  }}
                >
                  {getLocalizedText(cat.name, language)}
                </Button>
              );
            })}

            <Button
              variant="ghost"
              size="small"
              onClick={() => window.open('https://www.youtube.com/@TheContemporaryNews', '_blank', 'noopener,noreferrer')}
              sx={{
                color: 'rgba(255, 255, 255, 0.92)',
                fontSize: '0.96rem',
                fontWeight: 700,
                px: 1.5,
                py: 0.6,
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 150ms ease',
                '&:hover': { color: '#ffffff', bgcolor: 'rgba(0, 0, 0, 0.18)' },
              }}
            >
              {language === 'bn' ? 'ভিডিও' : 'Video'}
            </Button>
          </Box>

          {/* Right: Search, Hamburger Drawer Trigger */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
            <IconButton
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              sx={{
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                borderRadius: '4px',
                width: 36,
                height: 36,
                p: 0,
                transition: 'all 160ms ease',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.18)', borderColor: '#ffffff' },
              }}
            >
              <SearchRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton
              aria-label="Open menu"
              onClick={() => {
                setDrawerAnchor('right');
                setMobileNavOpen(true);
              }}
              sx={{
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                borderRadius: '4px',
                width: 36,
                height: 36,
                p: 0,
                transition: 'all 160ms ease',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.18)', borderColor: '#ffffff' },
              }}
            >
              <MenuRoundedIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </Box>}
  </>
);
}
