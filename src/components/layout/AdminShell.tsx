'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/Button';

const nav = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Articles', href: '/admin/articles' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Advertisements', href: '/admin/ads' },
  { label: 'Media Library', href: '/admin/media' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Settings', href: '/admin/settings' },
];

export function AdminShell({ children, title, description }: { children: ReactNode; title: string; description?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setCompact(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navList = useMemo(
    () => (
      <List dense sx={{ p: 0 }}>
        {nav.map((item) => {
          const selected = pathname === item.href;
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
              onClick={() => setSidebarOpen(false)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: alpha('#c53727', 0.12),
                  color: 'primary.main',
                },
              }}
            >
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          );
        })}
      </List>
    ),
    [pathname],
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Paper
        elevation={3}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: alpha('#ffffff', 0.85),
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 8,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: compact ? 1.5 : 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'padding 200ms ease',
          }}
        >
          <Box>
            <Typography variant={compact ? 'subtitle1' : 'h6'} sx={{ fontWeight: 800 }}>
              Backoffice
            </Typography>
            <Typography variant="caption" sx={{ letterSpacing: 2, textTransform: 'uppercase', color: 'text.secondary' }}>
              The Contemporary CMS
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            {!isLgUp && (
              <IconButton aria-label="Open admin navigation" onClick={() => setSidebarOpen(true)}>
                <MenuRoundedIcon />
              </IconButton>
            )}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user ? `${user.name} (${user.role})` : 'Guest'}
            </Typography>
            <Button variant="ghost" size="small" onClick={logout}>
              Logout
            </Button>
          </Stack>
        </Container>
      </Paper>

      <Container
        maxWidth="lg"
        sx={{
          py: 5,
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: '260px 1fr' },
          alignItems: 'start',
        }}
      >
        {isLgUp && (
          <Paper
            elevation={2}
            sx={{
              position: 'sticky',
              top: 120,
              p: 2,
              borderRadius: 2,
            }}
          >
            {navList}
          </Paper>
        )}

        <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, boxShadow: 6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
              {description && (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                borderRadius: 999,
                bgcolor: alpha('#0d3b66', 0.08),
                color: 'warning.main',
                px: 2.5,
                py: 0.75,
                fontSize: 12,
                letterSpacing: 1,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Protected area
            </Box>
          </Stack>
          <Divider sx={{ my: 3 }} />
          {children}
        </Paper>
      </Container>

      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            p: 2,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Navigate
          </Typography>
          <IconButton aria-label="Close navigation" onClick={() => setSidebarOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        {navList}
      </Drawer>
    </Box>
  );
}
