'use client';

import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

type Variant = 'primary' | 'ghost' | 'outline' | 'subtle' | 'secondary';

type ButtonProps = Omit<MuiButtonProps, 'variant' | 'color'> & {
  variant?: Variant;
};

type VariantStyles = {
  muiVariant: MuiButtonProps['variant'];
  color?: MuiButtonProps['color'];
  sx?: SxProps<Theme>;
};

const variantStyles: Record<Variant, VariantStyles> = {
  primary: {
    muiVariant: 'contained',
    color: 'primary',
    sx: (theme) => ({
      boxShadow: theme.shadows[2],
    }),
  },
  secondary: {
    muiVariant: 'contained',
    color: 'secondary',
    sx: (theme) => ({
      boxShadow: theme.shadows[3],
    }),
  },
  ghost: {
    muiVariant: 'text',
    color: 'inherit',
    sx: (theme) => ({
      color: theme.palette.text.primary,
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      },
    }),
  },
  outline: {
    muiVariant: 'outlined',
    color: 'inherit',
    sx: (theme) => ({
      borderColor: theme.palette.divider,
      color: theme.palette.text.secondary,
      '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
    }),
  },
  subtle: {
    muiVariant: 'contained',
    color: 'inherit',
    sx: (theme) => ({
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      boxShadow: theme.shadows[1],
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        boxShadow: theme.shadows[2],
      },
    }),
  },
};

export function Button({ children, variant = 'primary', sx, size = 'medium', ...props }: ButtonProps) {
  const styles = variantStyles[variant];

  return (
    <MuiButton
      disableElevation
      variant={styles.muiVariant}
      color={styles.color}
      size={size}
      sx={(theme) => {
        const radius = typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 3 : theme.shape.borderRadius;
        const baseStyles = {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: radius,
          px: 2.5,
          py: 1,
        } as const;

        const resolved = typeof styles.sx === 'function' ? styles.sx(theme) : styles.sx;
        const extra = typeof sx === 'function' ? sx(theme) : sx;

        return {
          ...baseStyles,
          ...(resolved as Record<string, unknown> | undefined),
          ...(extra as Record<string, unknown> | undefined),
        };
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
