import { PaletteMode, Theme, alpha, createTheme, responsiveFontSizes } from '@mui/material/styles';

const lightPalette = {
  primary: { main: '#e21837', contrastText: '#fff9f5' },
  secondary: { main: '#5b5f63', contrastText: '#f6f7fb' },
  background: { default: '#fff8f5', paper: '#fff1ec' },
  text: { primary: '#1f1315', secondary: '#6b585d' },
  divider: '#f1d9d3',
};

const darkPalette = {
  primary: { main: '#ff6b81', contrastText: '#1a0f12' },
  secondary: { main: '#a7abb0', contrastText: '#141013' },
  background: { default: '#1a1013', paper: '#23151a' },
  text: { primary: '#fff2ed', secondary: '#d5bdc0' },
  divider: '#3d232a',
};

export function getTheme(mode: PaletteMode): Theme {
  const base = createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightPalette : darkPalette),
      warning: { main: '#ff9a7f' },
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
            minHeight: 38,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            overflowWrap: 'anywhere',
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
