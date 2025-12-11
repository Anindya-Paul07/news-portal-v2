import Link from 'next/link';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { Article } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText } from '@/lib/utils';

export function BreakingTicker({ items }: { items: Article[] }) {
  const { language } = useLanguage();
  const theme = useTheme();
  if (!items?.length) return null;

  const headlines = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: getLocalizedText(item.title, language),
  }));

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 3,
        px: 2.5,
        py: 1.5,
        borderColor: 'primary.main',
        bgcolor: alpha(theme.palette.primary.light, theme.palette.mode === 'dark' ? 0.12 : 0.06),
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius:
          typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : theme.shape.borderRadius,
        boxShadow: theme.shadows[3],
      }}
    >
      <Chip
        label="Breaking"
        color="primary"
        size="small"
        sx={{
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          borderRadius: 999,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            gap: 3,
            pr: 3,
            animation: 'ticker var(--marquee-duration, 22s) linear infinite',
            '@keyframes ticker': {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(-50%)' },
            },
          }}
        >
          <Stack direction="row" spacing={3} pr={3} alignItems="center">
            {headlines.map((item) => (
              <Stack
                key={`headline-${item.id}`}
                direction="row"
                spacing={1}
                alignItems="center"
                component={Link}
                href={`/article/${item.slug}`}
                sx={{
                  color: 'text.primary',
                  textDecoration: 'none',
                  '&:hover': { color: 'secondary.main' },
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }}
                />
                <Typography variant="body2">{item.title}</Typography>
              </Stack>
            ))}
          </Stack>
          <Stack direction="row" spacing={3} pr={3} alignItems="center" aria-hidden="true">
            {headlines.map((item) => (
              <Stack
                key={`headline-ghost-${item.id}`}
                direction="row"
                spacing={1}
                alignItems="center"
                component={Link}
                href={`/article/${item.slug}`}
                sx={{
                  color: 'text.primary',
                  textDecoration: 'none',
                  '&:hover': { color: 'secondary.main' },
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }}
                />
                <Typography variant="body2">{item.title}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
