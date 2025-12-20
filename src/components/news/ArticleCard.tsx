'use client';

import Image from 'next/image';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { Article } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';
import { formatDate, getLocalizedText, resolveMediaUrl } from '@/lib/utils';
import { TransitionLink } from '@/components/navigation/TransitionLink';

export function ArticleCard({ article }: { article: Article }) {
  const { language } = useLanguage();
  const theme = useTheme();
  const categoryLabel = getLocalizedText(article.category?.name, language) || 'News';
  const title = getLocalizedText(article.title, language);
  const summary = getLocalizedText(article.excerpt, language);
  const imageUrl = resolveMediaUrl(article.featuredImage?.url || article.coverImage);
  const imageAlt = getLocalizedText(article.featuredImage?.alt, language) || title;

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        boxShadow: theme.shadows[1],
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <CardActionArea
        component={TransitionLink}
        href={`/article/${article.slug || article.id}`}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {imageUrl ? (
          <CardMedia sx={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', borderBottom: 3, borderColor: 'primary.main' }}>
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </CardMedia>
        ) : null}
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {categoryLabel}
            </Typography>
            {article.isBreaking && <Chip size="small" label="Breaking" color="primary" />}
            {article.isTrending && <Chip size="small" label="Trending" variant="outlined" color="secondary" />}
          </Stack>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {title}
          </Typography>
          {summary && (
            <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {summary}
            </Typography>
          )}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 'auto', color: 'text.secondary' }}>
            <Typography variant="caption">{article.author?.name || 'Staff Desk'}</Typography>
            {article.publishedAt && <Typography variant="caption">{formatDate(article.publishedAt)}</Typography>}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
