'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <SentimentDissatisfiedRoundedIcon color="disabled" fontSize="large" />
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );
}
