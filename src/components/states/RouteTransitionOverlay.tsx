'use client';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import { alpha, useTheme } from '@mui/material/styles';
import { NewsPortalLoader } from '@/components/states/NewsPortalLoader';
import { useRouteTransition } from '@/contexts/route-transition-context';

export function RouteTransitionOverlay() {
  const { isNavigating } = useRouteTransition();
  const theme = useTheme();

  return (
    <Fade in={isNavigating} timeout={{ enter: 150, exit: 250 }} unmountOnExit>
      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.86 : 0.74),
          backdropFilter: 'blur(10px)',
          pointerEvents: 'auto',
          transition: 'opacity 200ms ease',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.25,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.72 : 0.85),
            boxShadow: `0 24px 80px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.55 : 0.18)}`,
          }}
        >
          <NewsPortalLoader label="Opening story…" />
        </Box>
      </Box>
    </Fade>
  );
}

