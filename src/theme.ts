import { PaletteMode, Theme, alpha, createTheme, responsiveFontSizes } from '@mui/material/styles';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🖥️ NEWSROOM OPERATING SYSTEM (NewsOS) - MUI THEME INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN PHILOSOPHY:
 * ☀️ LIGHT: "The News Paper" - Pure white with pure black text
 * 🌑 DARK: "The OLED Terminal" - Zinc-950 OLED black (NO BLUE TINTS)
 * 
 * REFERENCE: Bloomberg Terminal v3, Linear.app, Avid iNEWS
 * 
 * STRICT RULES:
 * 1. PURE NEUTRALS - Zinc scale only (no warm/blue tints)
 * 2. NO ROUNDED CORNERS - borderRadius: 0
 * 3. EXTREME DENSITY - 50% reduced padding
 * 4. RED ACCENT ONLY - #DC2626 (Light) / #EF4444 (Dark)
 * 
 * ══════════════════════════════════════════════════════════════════════════
 */

// ☀️ LIGHT MODE: "The News Paper"
const lightPalette = {
  primary: { main: '#DC2626', contrastText: '#FFFFFF' },      // Red-600
  secondary: { main: '#000000', contrastText: '#FFFFFF' },    // Pure black
  background: { 
    default: '#FFFFFF',                                       // Pure white
    paper: '#FFFFFF',                                         // Same as default
  },
  text: { 
    primary: '#000000',                                       // Pure black (STRICT)
    secondary: '#525252',                                     // Neutral-600
  },
  divider: '#E5E5E5',                                        // Neutral-200
  error: { main: '#DC2626' },                                // Red-600
  warning: { main: '#F59E0B' },                              // Amber-500
  info: { main: '#3B82F6' },                                 // Blue-500
  success: { main: '#10B981' },                              // Emerald-500
};

// 🌑 DARK MODE: "The OLED Terminal" (ZINC SCALE - NO BLUE TINTS)
const darkPalette = {
  primary: { main: '#EF4444', contrastText: '#09090b' },      // Red-500 (brighter)
  secondary: { main: '#FAFAFA', contrastText: '#09090b' },    // Zinc-50
  background: { 
    default: '#09090b',                                       // Zinc-950 OLED (NOT NAVY)
    paper: '#18181b',                                         // Zinc-900 (NOT SLATE)
  },
  text: { 
    primary: '#FAFAFA',                                       // Zinc-50
    secondary: '#A1A1AA',                                     // Zinc-400
  },
  divider: '#27272a',                                        // Zinc-800 (NOT SLATE)
  error: { main: '#EF4444' },                                // Red-500
  warning: { main: '#FBBF24' },                              // Amber-400
  info: { main: '#60A5FA' },                                 // Blue-400
  success: { main: '#10B981' },                              // Emerald-500
};

export function getTheme(mode: PaletteMode): Theme {
  const base = createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightPalette : darkPalette),
    },
    shape: {
      borderRadius: 0, // STRICT: Square corners only (BBC/Bloomberg style)
    },
    typography: {
      fontFamily: 'var(--font-sans), "Work Sans", "Fira Sans", system-ui, sans-serif',
      fontWeightBold: 700,
      fontWeightMedium: 600,
      h1: { 
        fontFamily: 'var(--font-serif), "Playfair Display", "Merriweather", serif',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: { 
        fontFamily: 'var(--font-serif), "Playfair Display", "Merriweather", serif',
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h3: { 
        fontFamily: 'var(--font-serif), "Playfair Display", "Merriweather", serif',
        fontWeight: 700,
      },
      h4: { 
        fontFamily: 'var(--font-serif), "Playfair Display", "Merriweather", serif',
        fontWeight: 700,
      },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { 
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontSize: '0.75rem',
      },
      overline: {
        fontWeight: 700,
        letterSpacing: '0.1em',
        fontSize: '0.65rem',
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableRipple: true,
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 0, // Square buttons only
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 700,
          },
        },
      },
    },
  });

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
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${base.palette.divider}`,
            borderRadius: 0, // Square cards
          },
          elevation1: {
            boxShadow: 'none',
            border: `1px solid ${base.palette.divider}`,
          },
          elevation2: {
            boxShadow: 'none',
            border: `2px solid ${base.palette.divider}`,
          },
          elevation3: {
            boxShadow: 'none',
            border: `2px solid ${base.palette.divider}`,
          },
          elevation6: {
            boxShadow: 'none',
            border: `2px solid ${base.palette.divider}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 0, // Square cards
            border: `1px solid ${base.palette.divider}`,
            boxShadow: 'none',
            transition: 'border-color 0.2s ease',
            '&:hover': {
              borderColor: base.palette.primary.main,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `2px solid ${base.palette.divider}`,
          },
          colorPrimary: {
            backgroundImage: 'none',
            backgroundColor: base.palette.background.paper,
            color: base.palette.text.primary,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 0, // Square chips
            letterSpacing: '0.05em',
            fontWeight: 700,
            fontSize: '0.65rem',
            height: 20,
            textTransform: 'uppercase',
          },
          filled: {
            border: `1px solid currentColor`,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            borderBottom: `2px solid ${base.palette.divider}`,
          },
          indicator: {
            height: 2,
            borderRadius: 0,
            backgroundColor: base.palette.primary.main,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            borderRadius: 0,
            textTransform: 'uppercase',
            minHeight: 48,
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            '&:hover': {
              backgroundColor: alpha(base.palette.primary.main, 0.04),
            },
            '&.Mui-selected': {
              color: base.palette.primary.main,
            },
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
            borderRadius: 0, // Square input fields
            backgroundColor: base.palette.background.paper,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: base.palette.divider,
              borderWidth: 1,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: base.palette.text.primary,
              borderWidth: 1,
            },
            '&.Mui-focused': {
              backgroundColor: base.palette.background.paper,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: base.palette.primary.main,
                borderWidth: 2,
              },
            },
          },
          input: {
            padding: '10px 14px',
            fontSize: '0.875rem',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: base.palette.text.secondary,
            '&.Mui-focused': {
              color: base.palette.primary.main,
            },
          },
        },
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            borderBottom: `2px solid ${base.palette.divider}`,
            padding: '12px 16px',
            backgroundColor: alpha(base.palette.divider, 0.3),
          },
          title: {
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          },
          subheader: {
            fontSize: '0.75rem',
            marginTop: '2px',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '16px',
            '&:last-child': {
              paddingBottom: '16px',
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 700,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: base.palette.text.secondary,
              backgroundColor: alpha(base.palette.divider, 0.3),
              borderBottom: `2px solid ${base.palette.divider}`,
              padding: '10px 12px',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: '0.813rem',
            padding: '10px 12px',
            borderBottom: `1px solid ${base.palette.divider}`,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            height: 4,
            backgroundColor: alpha(base.palette.primary.main, 0.1),
          },
          bar: {
            borderRadius: 0,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: base.palette.divider,
            borderWidth: 1,
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme);
}
