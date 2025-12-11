'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { Button } from '@/components/ui/Button';

export function ErrorState({ title, onRetry }: { title: string; onRetry?: () => void }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'error.light',
        bgcolor: 'error.light',
        color: 'error.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorOutlineRoundedIcon />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      {onRetry && (
        <Button variant="outline" size="small" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Box>
  );
}
