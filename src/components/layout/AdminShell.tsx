'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Paper
        elevation={3}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: alpha('#ffffff', 0.8),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="lg" sx={{ py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Backoffice
            </Typography>
            <Typography variant="caption" sx={{ letterSpacing: 2, textTransform: 'uppercase', color: 'text.secondary' }}>
              The Contemporary CMS
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
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
        <Paper
          elevation={2}
          sx={{
            position: 'sticky',
            top: 96,
            p: 2,
            borderRadius: 2,
          }}
        >
          <List dense sx={{ p: 0 }}>
            {nav.map((item) => {
              const selected = pathname === item.href;
              return (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  selected={selected}
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
        </Paper>

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
    </Box>
  );
}
