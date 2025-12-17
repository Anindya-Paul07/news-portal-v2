'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { SyntheticEvent, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
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
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useMenuCategories } from '@/hooks/api-hooks';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { getLocalizedText } from '@/lib/utils';

export function Header() {
  const { data: menu } = useMenuCategories();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const lastScroll = useRef(0);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;
    router.push(`/search?query=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
  };

  const navItems = useMemo(() => {
    if (menu && menu.length > 0) return menu;
    return [];
  }, [menu]);
  const dateline = useMemo(() => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(now);
  }, []);

  const navValue = useMemo(() => {
    const active = navItems?.find((cat) => pathname.includes(`/category/${cat.slug}`));
    return active ? active.slug : false;
  }, [navItems, pathname]);

  const handleNavChange = (_: SyntheticEvent | null, slug: string) => {
    setMobileNavOpen(false);
    router.push(`/category/${slug}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setCompact(current > 40);
      if (current > lastScroll.current + 12 && current > 160) {
        setNavHidden(true);
      } else if (current < lastScroll.current - 12) {
        setNavHidden(false);
      }
      lastScroll.current = current;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppBar
      position="sticky"
      color="primary"
      enableColorOnDark
      sx={{
        color: 'primary.contrastText',
        bgcolor: 'primary.main',
        backgroundImage: `linear-gradient(125deg, ${alpha(
          theme.palette.primary.main,
          0.95,
        )}, ${alpha(theme.palette.secondary.main, 0.9)})`,
        boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.25)}`,
        backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.16)}`,
        transition: 'padding 200ms ease',
      }}
    >
      <Toolbar disableGutters>
        <Container maxWidth="lg" sx={{ py: compact ? 0.25 : 1, transition: 'padding 200ms ease' }}>
          <Stack spacing={compact ? 1 : 1.25}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconButton
                  aria-label="Open search"
                  onClick={() => setSearchOpen(true)}
                  sx={{ color: 'primary.contrastText' }}
                >
                  <SearchRoundedIcon />
                </IconButton>
                <IconButton
                  aria-label="Toggle navigation menu"
                  onClick={() => setMobileNavOpen(true)}
                  sx={{ color: 'primary.contrastText' }}
                >
                  {mobileNavOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
                </IconButton>
              </Stack>

              <Stack spacing={0.25} alignItems="center">
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: compact ? 34 : 48,
                        height: compact ? 34 : 48,
                        borderRadius: 2,
                        bgcolor: 'primary.contrastText',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: theme.shadows[3],
                        overflow: 'hidden',
                        transition: 'all 200ms ease',
                      }}
                    >
                      <Image
                        src="/Logo_Canva.jpg"
                        alt="The Contemporary logo"
                        width={52}
                        height={52}
                        priority
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                    <Typography variant={compact ? 'body1' : 'h6'} sx={{ fontWeight: 800, letterSpacing: compact ? 0.5 : 0 }}>
                      The Contemporary
                    </Typography>
                  </Stack>
                </Link>
                <Typography variant="caption" sx={{ letterSpacing: 1.5, color: 'primary.contrastText', opacity: compact ? 0.85 : 1 }}>
                  {dateline}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="small"
                  onClick={toggleLanguage}
                  sx={{
                    color: 'primary.contrastText',
                    borderColor: alpha(theme.palette.primary.contrastText, 0.5),
                    '&:hover': { borderColor: 'secondary.light' },
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
                      sx={{ color: 'primary.contrastText' }}
                    >
                      Logout
                    </Button>
                    <Button variant="secondary" size="small" onClick={() => router.push('/admin')}>
                      Admin
                    </Button>
                  </>
                ) : (
                  <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" size="small">
                      Login
                    </Button>
                  </Link>
                )}
              </Stack>
            </Stack>

            <Box
              sx={{
                display: navHidden ? 'none' : 'block',
                transition: 'opacity 200ms ease',
              }}
            >
              <Divider sx={{ borderColor: 'primary.contrastText', opacity: 0.15 }} />
            </Box>

            <Box
              sx={{
                transition: 'max-height 280ms ease, opacity 200ms ease',
                maxHeight: navHidden ? 0 : 120,
                opacity: navHidden ? 0 : 1,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
                {isMdUp ? (
                  <Tabs
                    value={navValue}
                    onChange={handleNavChange}
                    variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  textColor="inherit"
                  indicatorColor="secondary"
                  sx={{
                    '.MuiTab-root': {
                      fontWeight: 700,
                      textTransform: 'none',
                      minHeight: compact ? 30 : 36,
                      borderRadius: 2,
                      px: compact ? 1.5 : 2,
                      mx: 0.25,
                      transition: 'box-shadow 200ms ease, background-color 200ms ease, color 150ms ease',
                      '&:hover': {
                        boxShadow: `0 0 14px ${alpha(theme.palette.secondary.light, 0.45)}`,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.18),
                      },
                    },
                    '.Mui-selected': {
                      color: 'secondary.contrastText',
                      backgroundColor: alpha(theme.palette.secondary.main, 0.24),
                      boxShadow: `0 0 16px ${alpha(theme.palette.secondary.main, 0.55)}`,
                    },
                    '.MuiTabs-indicator': {
                      height: 3,
                      borderRadius: 2,
                    },
                  }}
                >
                  {navItems?.map((cat) => (
                    <Tab key={cat.id} value={cat.slug} label={getLocalizedText(cat.name, language)} />
                  ))}
                </Tabs>
              ) : null}
            </Box>
          </Stack>
        </Container>
      </Toolbar>

      <Drawer
        anchor="top"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
            color: 'text.primary',
            pt: 1,
          },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1.25} py={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Sections
              </Typography>
              <IconButton aria-label="Close menu" onClick={() => setMobileNavOpen(false)}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
            {navItems?.map((cat) => (
              <Button
                key={cat.id}
                variant="ghost"
                onClick={() => handleNavChange(null, cat.slug)}
                sx={{
                  justifyContent: 'space-between',
                  width: '100%',
                  px: 1.5,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {getLocalizedText(cat.name, language)}
                </Typography>
              </Button>
            ))}
          </Stack>
        </Container>
      </Drawer>

      <Drawer
        anchor="top"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary',
            pt: 2,
          },
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={2} py={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Search The Contemporary
              </Typography>
              <IconButton aria-label="Close search" onClick={() => setSearchOpen(false)}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
            <Box component="form" onSubmit={onSearch}>
              <TextField
                fullWidth
                size="medium"
                autoFocus
                placeholder="Search news, categories, authors"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon color="secondary" />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ 'aria-label': 'Search news' }}
              />
            </Box>
          </Stack>
        </Container>
      </Drawer>
    </AppBar>
  );
}
