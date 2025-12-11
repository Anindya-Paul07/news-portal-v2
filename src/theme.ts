import { PaletteMode, Theme, alpha, createTheme, responsiveFontSizes } from '@mui/material/styles';

const lightPalette = {
  primary: { main: '#b5543a', contrastText: '#fff7f2' },
  secondary: { main: '#22344d', contrastText: '#eef3ff' },
  background: { default: '#fdf7f2', paper: '#f6e9df' },
  text: { primary: '#1b120f', secondary: '#60433a' },
  divider: '#e0c3b3',
};

const darkPalette = {
  primary: { main: '#ffbdb0', contrastText: '#1a0705' },
  secondary: { main: '#a9c2ef', contrastText: '#0f1a2b' },
  background: { default: '#250001', paper: '#32100d' },
  text: { primary: '#ffefe9', secondary: '#dcb1a3' },
  divider: '#a45b4c',
};

export function getTheme(mode: PaletteMode): Theme {
  const base = createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightPalette : darkPalette),
      warning: { main: '#ffb703' },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: 'var(--font-sans), "Inter", system-ui, -apple-system, sans-serif',
      fontWeightBold: 800,
      h1: { fontFamily: 'var(--font-serif), "Times New Roman", serif' },
      h2: { fontFamily: 'var(--font-serif), "Times New Roman", serif' },
      h3: { fontFamily: 'var(--font-serif), "Times New Roman", serif' },
      h4: { fontFamily: 'var(--font-serif), "Times New Roman", serif' },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableRipple: true,
        },
      },
    },
  });

  const radius = typeof base.shape.borderRadius === 'number' ? base.shape.borderRadius : 12;

  const theme = createTheme(base, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: base.palette.background.default,
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 1,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          outlined: {
            borderColor: alpha(base.palette.primary.main, 0.2),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: typeof radius === 'number' ? radius * 1.5 : radius,
            border: `1px solid ${alpha(base.palette.primary.main, 0.18)}`,
            boxShadow: base.shadows[4],
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: base.shadows[6],
          },
          colorPrimary: {
            backgroundImage: `linear-gradient(120deg, ${alpha(
              base.palette.primary.main,
              0.94,
            )}, ${alpha(base.palette.secondary.main, 0.9)})`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            letterSpacing: 1,
            fontWeight: 700,
            textTransform: 'uppercase',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 3,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            borderRadius: radius,
            textTransform: 'none',
            minHeight: 44,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: typeof radius === 'number' ? radius * 1.6 : radius,
            backgroundColor: alpha(base.palette.background.paper, 0.8),
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(base.palette.secondary.main, 0.6),
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: base.palette.secondary.main,
              boxShadow: `0 0 0 3px ${alpha(base.palette.secondary.main, 0.2)}`,
            },
          },
          input: {
            padding: '10px 14px',
          },
        },
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
    },
  });

  return responsiveFontSizes(theme);
}
