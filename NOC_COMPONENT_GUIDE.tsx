/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎯 NOC DESIGN SYSTEM - COMPONENT USAGE GUIDE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file provides code examples for using the new Newsroom Operations Center
 * (NOC) design system components and utilities.
 * 
 * IMPORTANT: All Admin Panel components should now follow these patterns.
 * 
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// ═══════════════════════════════════════════════════════════════════════════
// ✅ CORRECT: NOC-COMPLIANT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Example 1: NOC Card (MUI) ───
export function NocCardExample() {
  return (
    <Card 
      sx={{
        // Theme automatically applies:
        // - borderRadius: 0
        // - border: 1px solid divider
        // - hover effect with red border
      }}
    >
      <CardContent>
        {/* Content here */}
      </CardContent>
    </Card>
  );
}

// ─── Example 2: NOC Input (MUI) ───
export function NocInputExample() {
  return (
    <TextField
      label="Article Title"
      variant="outlined"
      fullWidth
      // Theme automatically applies:
      // - borderRadius: 0
      // - focus border: 2px red
      // - uppercase label
      sx={{
        '& .MuiOutlinedInput-input': {
          padding: '10px 14px', // High density
        }
      }}
    />
  );
}

// ─── Example 3: NOC Button (MUI) ───
export function NocButtonExample() {
  return (
    <Button 
      variant="contained"
      // Theme automatically applies:
      // - borderRadius: 0
      // - uppercase text
      // - letterSpacing: 0.05em
      // - backgroundColor: red
    >
      Save Article
    </Button>
  );
}

// ─── Example 4: NOC Data Table ───
export function NocTableExample() {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          {/* Theme applies:
              - uppercase headers
              - gray background
              - 2px bottom border
              - fontSize: 0.65rem
          */}
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Article Title</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>Published</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Example 5: Using CSS Utility Classes (Tailwind) ───
export function NocUtilityClassExample() {
  return (
    <div className="noc-card">
      <h2 className="noc-headline">Breaking News</h2>
      <p className="noc-label">Category: Politics</p>
      
      <input 
        type="text" 
        className="noc-input w-full" 
        placeholder="Search articles..."
      />
      
      <button className="noc-button">
        Publish Now
      </button>
    </div>
  );
}

// ─── Example 6: High-Density Data Grid ───
export function NocDataGridExample() {
  return (
    <div className="noc-grid">
      <div className="noc-grid-row">
        <div className="noc-grid-cell">Cell 1</div>
        <div className="noc-grid-cell">Cell 2</div>
        <div className="noc-grid-cell">Cell 3</div>
      </div>
      <div className="noc-grid-row">
        <div className="noc-grid-cell">Cell 4</div>
        <div className="noc-grid-cell">Cell 5</div>
        <div className="noc-grid-cell">Cell 6</div>
      </div>
    </div>
  );
}

// ─── Example 7: Dark Mode Sidebar (AdminShell) ───
export function NocSidebarExample() {
  const theme = useTheme();
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: theme.palette.mode === 'dark' 
            ? '#000000'         // Pure black in dark mode
            : '#FFFFFF',        // White in light mode
          borderRight: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,      // Square edges
        },
      }}
    >
      {/* Navigation items */}
    </Drawer>
  );
}

// ─── Example 8: Status Chip (NOC Style) ───
export function NocChipExample() {
  return (
    <Chip 
      label="Published"
      color="success"
      // Theme automatically applies:
      // - borderRadius: 0 (square)
      // - uppercase
      // - fontSize: 0.65rem
      // - letterSpacing: 0.05em
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ❌ INCORRECT: AVOID THESE PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

// ❌ DON'T: Add rounded corners
const BadCard = () => (
  <Card sx={{ borderRadius: '12px' }}> {/* NO! Always 0 */}
    Content
  </Card>
);

// ❌ DON'T: Use blue accents
const BadButton = () => (
  <Button variant="contained" color="info"> {/* NO! Use primary (red) */}
    Click Me
  </Button>
);

// ❌ DON'T: Add soft shadows
const BadBox = () => (
  <Box sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}> {/* NO! Use borders */}
    Content
  </Box>
);

// ❌ DON'T: Use warm gray backgrounds in dark mode
const BadDarkBg = () => (
  <Box sx={{ 
    backgroundColor: '#1A1G13' /* NO! This is warm-toned */
  }}>
    Content
  </Box>
);

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 CSS VARIABLE REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Use these CSS variables for custom Tailwind components:
 * 
 * BACKGROUNDS:
 * - var(--noc-bg-canvas)         - Main background
 * - var(--noc-bg-canvas-alt)     - Alternate background
 * - var(--noc-bg-surface)        - Card/panel backgrounds
 * - var(--noc-bg-input)          - Input backgrounds
 * - var(--noc-bg-sidebar)        - Sidebar background
 * 
 * BORDERS:
 * - var(--noc-border-subtle)     - Default borders (1px)
 * - var(--noc-border-medium)     - Input borders
 * - var(--noc-border-strong)     - Dividers
 * - var(--noc-border-grid)       - Grid lines
 * 
 * TEXT:
 * - var(--noc-text-primary)      - Headlines, titles
 * - var(--noc-text-secondary)    - Body text
 * - var(--noc-text-tertiary)     - Labels
 * - var(--noc-text-muted)        - Placeholders
 * 
 * ACCENT:
 * - var(--noc-red-primary)       - Primary red (BBC)
 * - var(--noc-red-hover)         - Hover state
 * - var(--noc-red-light)         - Light background
 * - var(--noc-red-border)        - Border accent
 */

// ═══════════════════════════════════════════════════════════════════════════
// 📏 SPACING GUIDELINES (High Density)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Standard padding/margin values (reduced by ~30%):
 * 
 * - Buttons: 8px 16px
 * - Inputs: 10px 14px (text fields)
 * - Card Content: 16px
 * - Table Cells: 10px 12px
 * - Card Headers: 12px 16px
 * 
 * Grid Gaps:
 * - Small: 8px
 * - Medium: 12px
 * - Large: 16px
 * 
 * Border Widths:
 * - Default: 1px
 * - Emphasis: 2px
 * - Focus: 2px (red)
 */
