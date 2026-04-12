import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
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
  if (!items?.length && !loading && !error) return null;

  const headlines = items.map((item) => ({
    id: item.id,
    identifier: item.slug || item.id,
    title: getLocalizedText(item.title, language),
  }));

  return (
    <Box
      sx={{
        px: condensed ? 0 : 0.4,
        py: 0,
        color: 'var(--news-ticker-text)',
        display: 'flex',
        alignItems: 'center',
        gap: condensed ? 1 : 2,
        minHeight: condensed ? 32 : 38,
      }}
    >
      <Chip
        label={language === 'bn' ? 'ব্রেকিং' : 'Breaking'}
        size="small"
        sx={{
          height: condensed ? 22 : 24,
          borderRadius: 0.5,
          border: '1px solid rgba(255,255,255,0.85)',
          bgcolor: alpha('#8f0c16', 0.9),
          color: '#fff',
          fontWeight: 800,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          '& .MuiChip-label': {
            px: 1.2,
          },
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
              color: 'var(--news-ticker-text)',
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
                    color: 'var(--news-ticker-text)',
                    textDecoration: 'none',
                    transition: 'color 180ms ease',
                    '&:hover': { color: 'var(--news-ticker-hover)' },
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: 'var(--news-red-300)',
                      boxShadow: '0 0 0 2px rgba(255,255,255,0.08)',
                    }}
                  />
                  <Typography
                    variant={condensed ? 'caption' : 'body2'}
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 0.1,
                    }}
                  >
                    {item.title}
                  </Typography>
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
                    color: 'var(--news-ticker-text)',
                    textDecoration: 'none',
                    transition: 'color 180ms ease',
                    '&:hover': { color: 'var(--news-ticker-hover)' },
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: 'var(--news-red-300)',
                      boxShadow: '0 0 0 2px rgba(255,255,255,0.08)',
                    }}
                  />
                  <Typography
                    variant={condensed ? 'caption' : 'body2'}
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 0.1,
                    }}
                  >
                    {item.title}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
