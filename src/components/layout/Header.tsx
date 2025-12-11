'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SyntheticEvent, useMemo, useState, type FormEvent } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
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
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`/search?query=${encodeURIComponent(keyword.trim())}`);
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
      }}
    >
      <Toolbar disableGutters>
        <Container maxWidth="lg" sx={{ py: 1 }}>
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              spacing={2}
              sx={{ color: 'primary.contrastText' }}
            >
              <Typography variant="body2" component="span">
                {dateline}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="small"
                  onClick={toggleLanguage}
                  sx={{
                    color: 'primary.contrastText',
                    borderColor: 'primary.contrastText',
                    '&:hover': {
                      borderColor: 'secondary.light',
                    },
                  }}
                >
                  {language === 'en' ? 'বাংলা' : 'EN'}
                </Button>
              </Stack>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              flexWrap="wrap"
              justifyContent="space-between"
            >
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'primary.contrastText',
                      color: 'primary.main',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 18,
                      boxShadow: theme.shadows[3],
                    }}
                  >
                    CN
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                      The Contemporary News
                    </Typography>
                    <Chip
                      size="small"
                      label="Clarity over noise"
                      color="secondary"
                      sx={{
                        mt: 0.5,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 2,
                        borderRadius: 999,
                      }}
                    />
                  </Box>
                </Stack>
              </Link>

              <Box component="form" onSubmit={onSearch} sx={{ flex: 1, minWidth: { xs: '100%', md: 320 } }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search news"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon color="secondary" fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: 'background.paper',
                      borderRadius: 999,
                    },
                  }}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 999,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'secondary.main',
                    },
                  }}
                  inputProps={{ 'aria-label': 'Search news' }}
                />
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={logout}
                      sx={{
                        borderColor: 'secondary.light',
                        color: 'primary.contrastText',
                        '&:hover': { color: 'secondary.contrastText' },
                      }}
                    >
                      Logout
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => router.push('/admin')}
                      sx={{ px: 2.5 }}
                    >
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
                {!isMdUp && (
                  <IconButton
                    color="inherit"
                    onClick={() => setMobileNavOpen((prev) => !prev)}
                    aria-label="Toggle navigation menu"
                    edge="end"
                  >
                    {mobileNavOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
                  </IconButton>
                )}
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: 'primary.contrastText', opacity: 0.2 }} />

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
                    minHeight: 44,
                    borderRadius: 2,
                    px: 2,
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
                  <Tab
                    key={cat.id}
                    value={cat.slug}
                    label={getLocalizedText(cat.name, language)}
                  />
                ))}
              </Tabs>
            ) : null}
          </Stack>
        </Container>
      </Toolbar>

      <Drawer
        anchor="top"
        open={mobileNavOpen && !isMdUp}
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
    </AppBar>
  );
}
