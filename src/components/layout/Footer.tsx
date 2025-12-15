 'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const footerNav = [
  { label: 'About', href: '/about' },
  { label: 'Editorial standards', href: '/standards' },
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
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        color: 'text.secondary',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', md: '2fr 3fr' },
            alignItems: 'start',
          }}
        >
          <Box>
            <Stack spacing={1.5}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                The Contemporary News
              </Typography>
              <Typography variant="body2" lineHeight={1.6}>
                Keep an eye on our News to get all the news including politics, business, sports, national-international
                breaking news, analytical and other news.
              </Typography>
              <Typography variant="caption">© {new Date().getFullYear()} The Contemporary | Powered by @</Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="overline"
                sx={{ letterSpacing: 2, fontWeight: 700, color: 'text.primary' }}
              >
                Navigate
              </Typography>
              <Stack spacing={0.5}>
                {footerNav.map((link) => (
                  <MuiLink
                    key={link.href}
                    href={link.href}
                    component={Link}
                    underline="hover"
                    color="secondary.main"
                    sx={{ fontSize: 14 }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Stack>
            </Stack>
            <Stack spacing={1}>
              <Typography
                variant="overline"
                sx={{ letterSpacing: 2, fontWeight: 700, color: 'text.primary' }}
              >
                Studios
              </Typography>
              <Typography variant="body2">Chattogram</Typography>
              <Typography variant="body2">newsdesk@thecontemporary.news</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography
                variant="overline"
                sx={{ letterSpacing: 2, fontWeight: 700, color: 'text.primary' }}
              >
                Apps
              </Typography>
              <Typography variant="body2">iOS · Android</Typography>
              <Typography variant="body2">Coming soon</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography
                variant="overline"
                sx={{ letterSpacing: 2, fontWeight: 700, color: 'text.primary' }}
              >
                Social
              </Typography>
              <Stack spacing={0.5}>
                {socialLinks.map((social) => (
                  <MuiLink
                    key={social.label}
                    href={social.href}
                    underline="hover"
                    color="secondary.main"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontSize: 14, fontWeight: 600 }}
                  >
                    {social.label}
                  </MuiLink>
                ))}
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
