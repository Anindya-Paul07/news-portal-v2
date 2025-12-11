'use client';

import TextField, { type TextFieldProps } from '@mui/material/TextField';

type Props = TextFieldProps & { helper?: string };

export function Textarea({ label, helper, minRows = 4, ...props }: Props) {
  return (
    <TextField
      fullWidth
      label={label}
      helperText={helper}
      multiline
      minRows={minRows}
      variant="outlined"
      size="small"
      {...props}
    />
  );
}
