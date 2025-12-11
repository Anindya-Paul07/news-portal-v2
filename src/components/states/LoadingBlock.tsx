'use client';

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export function LoadingBlock({ lines = 3 }: { lines?: number }) {
  return (
    <Stack spacing={1.2}>
      <Skeleton variant="rectangular" height={20} width="40%" />
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton key={idx} variant="rectangular" height={14} width={`${70 + idx * 5}%`} />
      ))}
    </Stack>
  );
}
