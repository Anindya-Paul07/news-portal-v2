import Image from 'next/image';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { Button } from '@/components/ui/Button';
import { Article } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';
import { formatDate, getLocalizedText, resolveMediaUrl } from '@/lib/utils';

export function HeroLead({ article }: { article: Article }) {
  const { language } = useLanguage();
  const theme = useTheme();
  if (!article) return null;

  const title = getLocalizedText(article.title, language);
  const summary = getLocalizedText(article.excerpt, language);
  const imageUrl = resolveMediaUrl(article.featuredImage?.url || article.coverImage);
  const imageAlt = getLocalizedText(article.featuredImage?.alt, language) || title;

  return (
    <Card
      elevation={6}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        backgroundImage: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.25)}, transparent 40%), radial-gradient(circle at 80% 0%, ${alpha(theme.palette.secondary.main, 0.3)}, transparent 36%)`,
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        border: `1px solid ${alpha(theme.palette.primary.light, 0.3)}`,
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4, lg: 5 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2.5}>
              <Chip
                label="Lead story"
                color="primary"
                size="small"
                sx={{ fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}
              />
              <Link href={`/article/${article.slug || article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                  {title}
                </Typography>
              </Link>
              {summary && (
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {summary}
                </Typography>
              )}
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ color: 'text.secondary', fontSize: 14 }}>
                <span>{article.author?.name || 'Staff Desk'}</span>
                {article.publishedAt && <span>• {formatDate(article.publishedAt)}</span>}
                {article.readingTime && <span>• {article.readingTime} min read</span>}
              </Stack>
              <Button
                component={Link as unknown as 'a'}
                href={`/article/${article.slug || article.id}`}
                variant="secondary"
                sx={{ alignSelf: 'flex-start', px: 3 }}
              >
                Read full story
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CardActionArea
              component={Link}
              href={`/article/${article.slug || article.id}`}
              sx={{
                position: 'relative',
                height: { xs: 240, sm: 300 },
                borderRadius: 3,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.primary.light, 0.25)}`,
                boxShadow: theme.shadows[4],
              }}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  sx={{ bgcolor: 'background.default', color: 'text.secondary' }}
                >
                  <Typography variant="body2">Image coming soon</Typography>
                </Stack>
              )}
            </CardActionArea>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
