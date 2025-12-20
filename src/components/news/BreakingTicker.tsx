import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { Article } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';
import { getLocalizedText } from '@/lib/utils';
import { TransitionLink } from '@/components/navigation/TransitionLink';

type BreakingTickerProps = {
  items: Article[];
  condensed?: boolean;
  loading?: boolean;
  error?: boolean;
};

export function BreakingTicker({ items, condensed = false, loading = false, error = false }: BreakingTickerProps) {
  const { language } = useLanguage();
  const theme = useTheme();
  if (!items?.length && !loading && !error) return null;

  const headlines = items.map((item) => ({
    id: item.id,
    identifier: item.slug || item.id,
    title: getLocalizedText(item.title, language),
  }));

  const borderRadius =
    typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * (condensed ? 1.4 : 2) : theme.shape.borderRadius;

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: condensed ? 2 : 3,
        px: condensed ? 1.5 : 2.5,
        py: condensed ? 0.9 : 1.4,
        borderColor: alpha(theme.palette.primary.main, 0.4),
        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        gap: condensed ? 1 : 2,
        borderRadius,
        boxShadow: condensed ? theme.shadows[1] : theme.shadows[3],
        position: 'sticky',
        top: condensed ? theme.spacing(1.5) : theme.spacing(2.5),
        zIndex: 5,
        backdropFilter: 'blur(6px)',
        transition: 'all 200ms ease',
      }}
    >
      <Chip
        label="Breaking"
        color="primary"
        size="small"
        sx={{
          fontWeight: 700,
          letterSpacing: condensed ? 1 : 2,
          textTransform: 'uppercase',
          borderRadius: 999,
          px: condensed ? 0.5 : 1,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {loading && headlines.length === 0 ? (
          <Stack direction="row" spacing={2} alignItems="center" sx={{ pr: 2 }}>
            <Skeleton variant="text" width="35%" />
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="22%" />
          </Stack>
        ) : error && headlines.length === 0 ? (
          <Typography variant={condensed ? 'caption' : 'body2'} sx={{ color: 'text.secondary' }}>
            Unable to load breaking headlines right now.
          </Typography>
        ) : (
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
                  component={TransitionLink}
                  href={`/article/${item.identifier}`}
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
                  <Typography variant={condensed ? 'caption' : 'body2'}>{item.title}</Typography>
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
                  component={TransitionLink}
                  href={`/article/${item.identifier}`}
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
                  <Typography variant={condensed ? 'caption' : 'body2'}>{item.title}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
