'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

type ComingSoonProps = {
  title?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function ComingSoon({ title, description, ctaHref = '/', ctaLabel = 'Back to home' }: ComingSoonProps) {
  return (
    <Box
      sx={{
        minHeight: { xs: '60vh', md: '70vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 2,
      }}
    >
      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        <Typography variant="overline" sx={{ letterSpacing: 6, color: 'text.secondary' }}>
          Coming Soon
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          {title || 'This section is on the way'}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {description ||
            'We are polishing the experience for this destination. Check back shortly for the latest updates and features.'}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 1 }}>
          <Button component={Link} href={ctaHref} variant="contained" size="large">
            {ctaLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
