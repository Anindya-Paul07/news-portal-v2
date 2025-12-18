'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

export function NewsPortalLoader({ label = 'Loading headlines…' }: { label?: string }) {
  const theme = useTheme();
  const track = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.14);
  const bar = theme.palette.primary.main;

  return (
    <Stack alignItems="center" spacing={1.25} sx={{ userSelect: 'none' }}>
      <Box
        sx={{
          width: 132,
          height: 10,
          borderRadius: 999,
          bgcolor: track,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.18)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              theme.palette.mode === 'dark'
                ? `linear-gradient(90deg, transparent, ${alpha('#fff', 0.12)}, transparent)`
                : `linear-gradient(90deg, transparent, ${alpha('#fff', 0.35)}, transparent)`,
            transform: 'translateX(-60%)',
            animation: 'np-shimmer 1.1s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 56,
            borderRadius: 999,
            bgcolor: bar,
            filter: 'blur(0px)',
            animation: 'np-ticker 1.1s ease-in-out infinite',
          },
          '@keyframes np-ticker': {
            '0%': { transform: 'translateX(-20px)', opacity: 0.65 },
            '50%': { transform: 'translateX(96px)', opacity: 1 },
            '100%': { transform: 'translateX(-20px)', opacity: 0.65 },
          },
          '@keyframes np-shimmer': {
            '0%': { transform: 'translateX(-60%)' },
            '100%': { transform: 'translateX(60%)' },
          },
        }}
        aria-hidden="true"
      />
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6 }}>
        {label}
      </Typography>
    </Stack>
  );
}

