'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme, type Theme } from '@mui/material/styles';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import FormatUnderlinedRoundedIcon from '@mui/icons-material/FormatUnderlinedRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import StrikethroughSRoundedIcon from '@mui/icons-material/StrikethroughSRounded';
import { normalizeRichText, resolveRichTextMedia } from '@/lib/utils';

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  minHeight?: number;
};

type FormatButtonProps = {
  title: string;
  command: string;
  icon: React.ReactNode;
  onExecute: (command: string, value?: string) => void;
  themeMode: Theme;
  isActive?: boolean;
  value?: string;
};

const exec = (command: string, value?: string) => {
  document.execCommand(command, false, value);
};

// Check if a command is currently active
const queryCommandState = (command: string): boolean => {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
};

// Save and restore cursor position
const saveCursorPosition = (element: HTMLElement) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  
  const range = selection.getRangeAt(0);
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(element);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const start = preSelectionRange.toString().length;

  return {
    start,
    end: start + range.toString().length,
  };
};

const restoreCursorPosition = (element: HTMLElement, savedPosition: { start: number; end: number } | null) => {
  if (!savedPosition) return;

  const selection = window.getSelection();
  if (!selection) return;

  let charIndex = 0;
  const range = document.createRange();
  range.setStart(element, 0);
  range.collapse(true);

  const nodeStack: Node[] = [element];
  let node: Node | undefined;
  let foundStart = false;
  let stop = false;

  while (!stop && (node = nodeStack.pop())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const nextCharIndex = charIndex + (node.textContent?.length || 0);
      if (!foundStart && savedPosition.start >= charIndex && savedPosition.start <= nextCharIndex) {
        range.setStart(node, savedPosition.start - charIndex);
        foundStart = true;
      }
      if (foundStart && savedPosition.end >= charIndex && savedPosition.end <= nextCharIndex) {
        range.setEnd(node, savedPosition.end - charIndex);
        stop = true;
      }
      charIndex = nextCharIndex;
    } else {
      let i = node.childNodes.length;
      while (i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }

  selection.removeAllRanges();
  selection.addRange(range);
};

function FormatButton({
  title,
  command,
  icon,
  onExecute,
  themeMode,
  isActive,
  value,
}: FormatButtonProps) {
  return (
    <Tooltip title={title}>
      <IconButton
        size="small"
        onClick={() => onExecute(command, value)}
        aria-label={title}
        sx={{
          bgcolor: isActive ? alpha(themeMode.palette.primary.main, 0.12) : 'transparent',
          color: isActive ? 'primary.main' : 'text.primary',
          borderRadius: 1.5,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: isActive
              ? alpha(themeMode.palette.primary.main, 0.2)
              : alpha(themeMode.palette.secondary.main, 0.08),
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}

export function RichTextEditor({ label, value, onChange, helper, minHeight = 200 }: RichTextEditorProps) {
  const theme = useTheme();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);
  const isInitialized = useRef(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
  });

  const resolvedValue = useMemo(() => resolveRichTextMedia(normalizeRichText(value)), [value]);

  // Track active formatting states
  const updateActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: queryCommandState('bold'),
      italic: queryCommandState('italic'),
      underline: queryCommandState('underline'),
      strikeThrough: queryCommandState('strikeThrough'),
    });
  }, []);

  // Initialize editor content only once
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = resolvedValue;
      isInitialized.current = true;
    }
  }, [resolvedValue]);

  // Update content from external changes (like loading an article to edit)
  useEffect(() => {
    if (!editorRef.current || isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only update if the external value is significantly different from current content
    const currentHtml = editorRef.current.innerHTML;
    if (currentHtml !== resolvedValue && resolvedValue !== normalizeRichText(currentHtml)) {
      const savedPos = saveCursorPosition(editorRef.current);
      editorRef.current.innerHTML = resolvedValue;
      // Restore cursor position after a brief delay
      setTimeout(() => {
        if (editorRef.current) {
          restoreCursorPosition(editorRef.current, savedPos);
        }
      }, 0);
    }
  }, [resolvedValue]);

  useEffect(() => {
    exec('defaultParagraphSeparator', 'p');
  }, []);

  const syncValue = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
    updateActiveFormats();
  }, [onChange, updateActiveFormats]);

  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    exec(command, value);
    syncValue();
  }, [syncValue]);

  const handleFormatBlock = useCallback((tag: 'p' | 'h2' | 'h3') => {
    executeCommand('formatBlock', tag);
  }, [executeCommand]);

  const handleLink = useCallback(() => {
    const url = window.prompt('Paste a link URL');
    if (!url) return;
    executeCommand('createLink', url);
  }, [executeCommand]);

  const handleImage = useCallback(() => {
    const url = window.prompt('Paste an image URL');
    if (!url) return;
    executeCommand('insertImage', url);
  }, [executeCommand]);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 800, 
          mb: 1,
          color: 'text.primary',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
      <Paper 
        elevation={3}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          transition: 'all 0.3s ease',
          '&:focus-within': {
            borderColor: alpha(theme.palette.primary.main, 0.4),
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
        }}
      >
        {/* Toolbar with gradient */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack 
            direction="row" 
            spacing={0.5} 
            sx={{ 
              px: { xs: 1, sm: 1.5 }, 
              py: 1,
              flexWrap: 'wrap', 
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {/* Block format buttons */}
            <Tooltip title="Heading 2">
              <IconButton 
                size="small" 
                onClick={() => handleFormatBlock('h2')} 
                aria-label="Heading"
                sx={{
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <TitleRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Paragraph">
              <IconButton 
                size="small" 
                onClick={() => handleFormatBlock('p')} 
                aria-label="Paragraph"
                sx={{
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800 }}>P</Typography>
              </IconButton>
            </Tooltip>
            
            <Divider 
              flexItem 
              orientation="vertical" 
              sx={{ 
                mx: 1,
                borderColor: alpha(theme.palette.divider, 0.6),
              }} 
            />
            
            {/* Text formatting with active states */}
            <FormatButton 
              title="Bold" 
              command="bold" 
              icon={<FormatBoldRoundedIcon fontSize="small" />} 
              onExecute={executeCommand}
              themeMode={theme}
              isActive={activeFormats.bold}
            />
            <FormatButton 
              title="Italic" 
              command="italic" 
              icon={<FormatItalicRoundedIcon fontSize="small" />} 
              onExecute={executeCommand}
              themeMode={theme}
              isActive={activeFormats.italic}
            />
            <FormatButton 
              title="Underline" 
              command="underline" 
              icon={<FormatUnderlinedRoundedIcon fontSize="small" />} 
              onExecute={executeCommand}
              themeMode={theme}
              isActive={activeFormats.underline}
            />
            <FormatButton 
              title="Strikethrough" 
              command="strikeThrough" 
              icon={<StrikethroughSRoundedIcon fontSize="small" />} 
              onExecute={executeCommand}
              themeMode={theme}
              isActive={activeFormats.strikeThrough}
            />
            
            <Divider 
              flexItem 
              orientation="vertical" 
              sx={{ 
                mx: 1,
                borderColor: alpha(theme.palette.divider, 0.6),
              }} 
            />
            
            {/* List buttons */}
            <FormatButton 
              title="Bulleted list" 
              command="insertUnorderedList" 
              icon={<FormatListBulletedRoundedIcon fontSize="small" />} 
              onExecute={executeCommand}
              themeMode={theme}
            />
            <FormatButton 
              title="Numbered list" 
              command="insertOrderedList" 
              icon={<FormatListNumberedRoundedIcon fontSize="small" />} 
              onExecute={executeCommand}
              themeMode={theme}
            />
            
            <Divider 
              flexItem 
              orientation="vertical" 
              sx={{ 
                mx: 1,
                borderColor: alpha(theme.palette.divider, 0.6),
              }} 
            />
            
            {/* Special formatting */}
            <FormatButton 
              title="Quote" 
              command="formatBlock" 
              icon={<FormatQuoteRoundedIcon fontSize="small" />} 
              onExecute={executeCommand}
              themeMode={theme}
              value="blockquote"
            />
            <FormatButton 
              title="Code block" 
              command="formatBlock" 
              icon={<CodeRoundedIcon fontSize="small" />} 
              onExecute={executeCommand}
              themeMode={theme}
              value="pre"
            />
            
            <Divider 
              flexItem 
              orientation="vertical" 
              sx={{ 
                mx: 1,
                borderColor: alpha(theme.palette.divider, 0.6),
              }} 
            />
            
            {/* Media buttons */}
            <Tooltip title="Link">
              <IconButton 
                size="small" 
                onClick={handleLink} 
                aria-label="Insert link"
                sx={{
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <LinkRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Image">
              <IconButton 
                size="small" 
                onClick={handleImage} 
                aria-label="Insert image"
                sx={{
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <ImageRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        
        {/* Editor content area */}
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncValue}
          onBlur={syncValue}
          onMouseUp={updateActiveFormats}
          onKeyUp={updateActiveFormats}
          sx={{
            minHeight,
            maxHeight: { xs: 400, md: 600 },
            overflowY: 'auto',
            px: { xs: 2, sm: 3 },
            py: 2,
            outline: 'none',
            fontSize: '1rem',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            bgcolor: 'background.paper',
            transition: 'background-color 0.2s ease',
            '&:focus': {
              bgcolor: alpha(theme.palette.background.paper, 0.7),
            },
            '&:empty:before': {
              content: '"Start writing your content..."',
              color: 'text.disabled',
              fontStyle: 'italic',
            },
            '& h2': { 
              fontSize: '1.75rem', 
              fontWeight: 800, 
              margin: '20px 0 12px',
              lineHeight: 1.3,
              color: 'text.primary',
              fontFamily: theme.typography.h2.fontFamily,
            },
            '& h3': { 
              fontSize: '1.375rem', 
              fontWeight: 700, 
              margin: '16px 0 10px',
              lineHeight: 1.3,
              color: 'text.primary',
              fontFamily: theme.typography.h3.fontFamily,
            },
            '& p': { margin: '0 0 14px', color: 'text.primary' },
            '& ul, & ol': { 
              margin: '10px 0', 
              paddingLeft: '28px',
              '& li': { 
                margin: '6px 0',
                lineHeight: 1.7,
              },
            },
            '& a': { 
              color: 'primary.main', 
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              '&:hover': {
                color: 'primary.dark',
              },
            },
            '& img': { 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: 2,
              margin: '16px 0',
              boxShadow: theme.shadows[2],
            },
            '& blockquote': {
              margin: '16px 0',
              padding: '16px 20px',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
              color: 'text.secondary',
              fontStyle: 'italic',
              borderRadius: '0 8px 8px 0',
            },
            '& pre': {
              margin: '16px 0',
              padding: '16px',
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : alpha(theme.palette.grey[900], 0.95),
              color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.50',
              borderRadius: 2,
              overflow: 'auto',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            },
            '& code': {
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              color: theme.palette.mode === 'dark' ? 'secondary.light' : 'secondary.dark',
              padding: '2px 8px',
              borderRadius: 1,
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            },
          }}
        />
      </Paper>
      {helper ? (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            display: 'block', 
            mt: 1,
            fontStyle: 'italic',
          }}
        >
          {helper}
        </Typography>
      ) : null}
    </Box>
  );
}
