'use client';

import TextField, { type TextFieldProps } from '@mui/material/TextField';

type Props = TextFieldProps & { helper?: string };

export function Input({ label, helper, size = 'small', InputLabelProps, ...props }: Props) {
  return (
    <TextField
      fullWidth
      label={label}
      helperText={helper}
      size={size}
      variant="outlined"
      InputLabelProps={{ shrink: props.type === 'date' || props.type === 'time' ? true : undefined, ...InputLabelProps }}
      {...props}
    />
  );
}
