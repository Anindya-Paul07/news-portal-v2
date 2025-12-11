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
              <Typography variant="caption">© {new Date().getFullYear()} The Contemporary | Powered by Anindya</Typography>
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
              <Typography variant="body2">Dhaka · Singapore · Remote</Typography>
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
              <MuiLink
                href="https://www.facebook.com/share/1E3oE7uaAq/"
                underline="hover"
                color="secondary.main"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: 14, fontWeight: 600 }}
              >
                Facebook
              </MuiLink>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
