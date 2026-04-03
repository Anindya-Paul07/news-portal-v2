'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Link2,
  ImagePlus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from 'lucide-react';
import { useRef } from 'react';
import { useUploadMedia } from '@/hooks/api-hooks';
import { useAlert } from '@/contexts/alert-context';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🖥️ NEWSROOM OPERATING SYSTEM (NewsOS) - RICH TEXT EDITOR
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Tiptap-based rich text editor with:
 * - Image upload with drag-drop
 * - Full formatting toolbar
 * - NewsOS square, dense styling
 * 
 * ══════════════════════════════════════════════════════════════════════════
 */

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Start writing...',
  minHeight = '200px'
}: RichTextEditorProps) {
  const { showAlert } = useAlert();
  const uploadMutation = useUploadMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[var(--newsos-accent-primary)] underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto border border-[var(--newsos-border-default)]',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none text-[var(--newsos-text-primary)] min-h-[' + minHeight + '] p-3',
      },
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync({
        file,
        folder: 'articles',
      });

      if (result.data?.url && editor) {
        editor.chain().focus().setImage({ src: result.data.url }).run();
        showAlert('Image uploaded successfully', 'success');
      }
    } catch (error) {
      showAlert('Failed to upload image', 'error');
      console.error('Image upload error:', error);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showAlert('Please select an image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        showAlert('Image must be less than 5MB', 'error');
        return;
      }
      handleImageUpload(file);
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="border border-[var(--newsos-border-default)] bg-[var(--newsos-bg-primary)]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-[var(--newsos-border-default)] bg-[var(--newsos-bg-secondary)] flex-wrap">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--newsos-border-default)] mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--newsos-border-default)] mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--newsos-border-default)] mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight size={14} />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--newsos-border-default)] mx-1" />

        {/* Link & Image */}
        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <Link2 size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={handleImageButtonClick}
          isActive={false}
          title="Upload Image"
          disabled={uploadMutation.isPending}
        >
          <ImagePlus size={14} />
          {uploadMutation.isPending && (
            <span className="ml-1 text-[0.65rem]">...</span>
          )}
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--newsos-border-default)] mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          title="Undo"
          disabled={!editor.can().undo()}
        >
          <Undo size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          title="Redo"
          disabled={!editor.can().redo()}
        >
          <Redo size={14} />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}

// Toolbar Button Component
function ToolbarButton({ 
  onClick, 
  isActive, 
  children, 
  title,
  disabled = false
}: { 
  onClick: () => void; 
  isActive: boolean; 
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-1.5 transition-colors
        ${isActive 
          ? 'bg-[var(--newsos-accent-primary)] text-white' 
          : 'text-[var(--newsos-text-primary)] hover:bg-[var(--newsos-bg-hover)]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
}
