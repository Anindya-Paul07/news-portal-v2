'use client';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

type Props = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  children: React.ReactNode;
};

export function PaginatedGrid({ page, pageCount, onChange, children }: Props) {
  return (
    <Stack spacing={2}>
      {children}
      {pageCount > 1 && (
        <Pagination
          page={page}
          count={pageCount}
          onChange={(_, value) => onChange(value)}
          color="primary"
          shape="rounded"
          sx={{ alignSelf: 'center', mt: 1 }}
        />
      )}
    </Stack>
  );
}
