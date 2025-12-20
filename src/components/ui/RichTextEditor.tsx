'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import FormatUnderlinedRoundedIcon from '@mui/icons-material/FormatUnderlinedRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import { normalizeRichText, resolveRichTextMedia } from '@/lib/utils';

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  minHeight?: number;
};

const exec = (command: string, value?: string) => {
  document.execCommand(command, false, value);
};

export function RichTextEditor({ label, value, onChange, helper, minHeight = 200 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const resolvedValue = useMemo(() => resolveRichTextMedia(normalizeRichText(value)), [value]);

  useEffect(() => {
    exec('defaultParagraphSeparator', 'p');
  }, []);

  const syncValue = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? '';
    onChange(html);
  }, [onChange]);

  const handleFormatBlock = (tag: 'p' | 'h2' | 'h3') => {
    exec('formatBlock', tag);
    syncValue();
  };

  const handleLink = () => {
    const url = window.prompt('Paste a link URL');
    if (!url) return;
    exec('createLink', url);
    syncValue();
  };

  const handleImage = () => {
    const url = window.prompt('Paste an image URL');
    if (!url) return;
    exec('insertImage', url);
    syncValue();
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
        {label}
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Stack direction="row" spacing={0.5} sx={{ px: 1, py: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Tooltip title="Heading">
            <IconButton size="small" onClick={() => handleFormatBlock('h2')} aria-label="Heading">
              <TitleRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Paragraph">
            <IconButton size="small" onClick={() => handleFormatBlock('p')} aria-label="Paragraph">
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                P
              </Typography>
            </IconButton>
          </Tooltip>
          <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
          <Tooltip title="Bold">
            <IconButton size="small" onClick={() => { exec('bold'); syncValue(); }} aria-label="Bold">
              <FormatBoldRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton size="small" onClick={() => { exec('italic'); syncValue(); }} aria-label="Italic">
              <FormatItalicRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton size="small" onClick={() => { exec('underline'); syncValue(); }} aria-label="Underline">
              <FormatUnderlinedRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
          <Tooltip title="Bulleted list">
            <IconButton size="small" onClick={() => { exec('insertUnorderedList'); syncValue(); }} aria-label="Bulleted list">
              <FormatListBulletedRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered list">
            <IconButton size="small" onClick={() => { exec('insertOrderedList'); syncValue(); }} aria-label="Numbered list">
              <FormatListNumberedRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
          <Tooltip title="Quote">
            <IconButton size="small" onClick={() => { exec('formatBlock', 'blockquote'); syncValue(); }} aria-label="Quote">
              <FormatQuoteRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Link">
            <IconButton size="small" onClick={handleLink} aria-label="Insert link">
              <LinkRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Image">
            <IconButton size="small" onClick={handleImage} aria-label="Insert image">
              <ImageRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Divider />
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncValue}
          dangerouslySetInnerHTML={{ __html: resolvedValue }}
          sx={{
            minHeight,
            px: 2,
            py: 1.5,
            outline: 'none',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            '&:empty:before': {
              content: '"Start writing..."',
              color: 'text.disabled',
            },
            '& h2': { fontSize: '1.4rem', fontWeight: 700, margin: '16px 0 8px' },
            '& h3': { fontSize: '1.2rem', fontWeight: 700, margin: '14px 0 8px' },
            '& p': { margin: '0 0 12px' },
            '& img': { maxWidth: '100%', borderRadius: 8 },
            '& blockquote': {
              margin: '12px 0',
              padding: '8px 16px',
              borderLeft: '3px solid',
              borderColor: 'divider',
              color: 'text.secondary',
            },
          }}
        />
      </Paper>
      {helper ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
          {helper}
        </Typography>
      ) : null}
    </Box>
  );
}
