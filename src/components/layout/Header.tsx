'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { SyntheticEvent, useEffect, useMemo, useState, type FormEvent } from 'react';
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
import { alpha, useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useMenuCategories } from '@/hooks/api-hooks';
import { canAccessAdmin } from '@/lib/rbac';
import { getLocalizedText } from '@/lib/utils';

export function Header() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const pathname = usePathname();
  const router = useRouter();
  const { data: menu } = useMenuCategories();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  const navItems = useMemo(() => menu ?? [], [menu]);
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
    const active = navItems.find((cat) => pathname.includes(`/category/${cat.slug}`));
    return active ? active.slug : false;
  }, [navItems, pathname]);

  useEffect(() => {
    const handleScroll = () => setCompact(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavChange = (_: SyntheticEvent | null, slug: string) => {
    setMobileNavOpen(false);
    router.push(`/category/${slug}`);
  };

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;
    router.push(`/search?query=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
  };

  return (
    <AppBar
      position="sticky"
      color="transparent"
      enableColorOnDark
      sx={{
        bgcolor: 'var(--news-page)',
        color: 'var(--news-ink)',
        boxShadow: 'none',
        borderBottom: '1px solid var(--news-grid-strong)',
      }}
    >
      <Box sx={{ bgcolor: 'var(--news-black)', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Container maxWidth="xl">
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            sx={{
              minHeight: 36,
              py: 0.75,
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'rgba(255,255,255,0.78)',
            }}
          >
            <Typography component="p" sx={{ fontSize: 'inherit', fontWeight: 700, letterSpacing: 'inherit' }}>
              {dateline}
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Toolbar disableGutters sx={{ minHeight: 'unset' }}>
        <Container maxWidth="xl" sx={{ py: compact ? 1 : 1.5, transition: 'padding 180ms ease' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'auto 1fr auto', md: 'auto 1fr auto' },
              alignItems: 'center',
              gap: { xs: 1, md: 2 },
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                aria-label="Toggle navigation menu"
                onClick={() => setMobileNavOpen(true)}
                sx={{
                  border: '1px solid var(--news-grid)',
                  color: 'var(--news-ink)',
                  borderRadius: 0,
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
              <IconButton
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
                sx={{
                  border: '1px solid var(--news-grid)',
                  color: 'var(--news-ink)',
                  borderRadius: 0,
                }}
              >
                <SearchRoundedIcon />
              </IconButton>
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: 0 }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none', width: '100%' }}>
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ minWidth: 0, textAlign: 'center' }}
                >
                  <Box
                    sx={{
                      width: { xs: compact ? 48 : 64, sm: compact ? 58 : 74, md: compact ? 72 : 104 },
                      height: { xs: compact ? 48 : 64, sm: compact ? 58 : 74, md: compact ? 72 : 104 },
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
                        fontSize: { xs: compact ? '1.15rem' : '1.32rem', sm: compact ? '1.6rem' : '2rem', md: compact ? '2.25rem' : '3rem' },
                        lineHeight: 1,
                        fontWeight: 700,
                        letterSpacing: '-0.04em',
                        color: 'var(--news-ink)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      The Contemporary
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.5,
                        display: { xs: 'none', sm: 'block' },
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
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

            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" sx={{ minWidth: 0 }}>
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
                  px: { xs: 1.2, md: 1.6 },
                }}
              >
                {language === 'en' ? 'বাংলা' : 'EN'}
              </Button>
              {user ? (
                <>
                  {isMdUp ? (
                    <Button variant="ghost" size="small" onClick={logout} sx={{ borderRadius: 0, color: 'var(--news-ink)' }}>
                      Logout
                    </Button>
                  ) : (
                    <IconButton
                      aria-label="Logout"
                      onClick={logout}
                      sx={{
                        border: '1px solid var(--news-grid-strong)',
                        color: 'var(--news-ink)',
                        borderRadius: 0,
                      }}
                    >
                      <LogoutRoundedIcon fontSize="small" />
                    </IconButton>
                  )}
                  {canAccessAdmin(user.role) ? (
                    isMdUp ? (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => router.push('/admin')}
                        sx={{
                          borderRadius: 0,
                          bgcolor: 'var(--news-red-700)',
                          color: '#fff',
                          '&:hover': { bgcolor: 'var(--news-red-hover)' },
                        }}
                      >
                        Admin
                      </Button>
                    ) : (
                      <IconButton
                        aria-label="Open admin"
                        onClick={() => router.push('/admin')}
                        sx={{
                          border: '1px solid var(--news-red-700)',
                          bgcolor: 'var(--news-red-700)',
                          color: '#fff',
                          borderRadius: 0,
                          '&:hover': { bgcolor: 'var(--news-red-hover)' },
                        }}
                      >
                        <AdminPanelSettingsRoundedIcon fontSize="small" />
                      </IconButton>
                    )
                  ) : null}
                </>
              ) : (
                <IconButton
                  component={Link}
                  href="/auth/login"
                  aria-label="Login"
                  sx={{
                    border: '1px solid var(--news-red-700)',
                    bgcolor: 'var(--news-red-700)',
                    color: '#fff',
                    borderRadius: 0,
                    display: { xs: 'inline-flex', md: 'none' },
                    '&:hover': { bgcolor: 'var(--news-red-hover)' },
                  }}
                >
                  <LoginRoundedIcon fontSize="small" />
                </IconButton>
              )}
              {!user ? (
                <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="secondary"
                    size="small"
                    sx={{
                      borderRadius: 0,
                      bgcolor: 'var(--news-red-700)',
                      color: '#fff',
                      display: { xs: 'none', md: 'inline-flex' },
                      '&:hover': { bgcolor: 'var(--news-red-hover)' },
                    }}
                  >
                    Login
                  </Button>
                </Link>
              ) : null}
            </Stack>
          </Box>
        </Container>
      </Toolbar>

      <Box
        sx={{
          borderTop: '1px solid var(--news-grid)',
          borderBottom: '2px solid var(--news-black)',
          bgcolor: 'var(--news-paper)',
        }}
      >
        <Container maxWidth="xl">
          <Tabs
            value={navValue}
            onChange={handleNavChange}
            variant="scrollable"
            scrollButtons={false}
            allowScrollButtonsMobile
            textColor="inherit"
            sx={{
              minHeight: { xs: 44, md: 48 },
              '.MuiTabs-scroller': {
                overflowX: 'auto !important',
              },
              '.MuiTab-root': {
                minHeight: { xs: 44, md: 48 },
                px: { xs: 1.5, md: 2 },
                color: 'var(--news-ink)',
                fontSize: { xs: '0.78rem', md: '0.85rem' },
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              },
              '.Mui-selected': {
                color: 'var(--news-red-700)',
              },
              '.MuiTabs-indicator': {
                height: 3,
                backgroundColor: 'var(--news-red-700)',
              },
            }}
          >
            {navItems.map((cat) => (
              <Tab key={cat.id} value={cat.slug} label={getLocalizedText(cat.name, language)} />
            ))}
          </Tabs>
        </Container>
      </Box>

      <Drawer
        anchor="left"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '88vw', sm: 420 },
            bgcolor: 'var(--news-page)',
            color: 'var(--news-ink)',
          },
        }}
      >
        <Box sx={{ borderBottom: '1px solid var(--news-grid)', px: 3, py: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--news-red-700)' }}>
                {language === 'bn' ? 'সেকশন' : 'Sections'}
              </Typography>
              <Typography sx={{ mt: 0.5, fontFamily: 'var(--font-serif)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--news-ink)' }}>
                The Contemporary
              </Typography>
            </Box>
            <IconButton aria-label="Close menu" onClick={() => setMobileNavOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Box>
        <Stack spacing={0} sx={{ px: 3, py: 2 }}>
          {navItems.map((cat) => (
            <Button
              key={cat.id}
              variant="ghost"
              onClick={() => handleNavChange(null, cat.slug)}
              sx={{
                justifyContent: 'flex-start',
                width: '100%',
                borderRadius: 0,
                borderBottom: '1px solid var(--news-grid)',
                px: 0,
                py: 1.7,
                color: 'var(--news-ink)',
              }}
            >
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'inherit' }}>
                {getLocalizedText(cat.name, language)}
              </Typography>
            </Button>
          ))}
          {user ? (
            <Button
              variant="ghost"
              onClick={logout}
              sx={{
                justifyContent: 'flex-start',
                width: '100%',
                borderRadius: 0,
                px: 0,
                py: 1.7,
                color: 'var(--news-ink)',
              }}
            >
              Logout
            </Button>
          ) : null}
          {/* Static Links */}
          {[
            { href: '/about', label: language === 'bn' ? 'আমাদের কথা' : 'About Us' },
            { href: '/contact', label: language === 'bn' ? 'যোগাযোগ' : 'Contact' },
          ].map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              onClick={() => { setMobileNavOpen(false); router.push(link.href); }}
              sx={{
                justifyContent: 'flex-start',
                width: '100%',
                borderRadius: 0,
                borderTop: '1px solid var(--news-grid)',
                px: 0,
                py: 1.7,
                color: 'var(--news-ink)',
              }}
            >
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'inherit' }}>
                {link.label}
              </Typography>
            </Button>
          ))}
        </Stack>
      </Drawer>

      <Drawer
        anchor="top"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'var(--news-page)',
            color: 'var(--news-ink)',
            borderBottom: '1px solid var(--news-grid-strong)',
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
  );
}
