import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';

const BTN = 'px-2 py-1 rounded text-xs font-bold transition-colors';
const active = 'bg-accentBlue text-white';
const inactive = 'text-slate-400 hover:text-white hover:bg-darkBorder';

const ToolbarButton = ({ onClick, isActive, title, children }) => (
  <button type="button" onMouseDown={e => { e.preventDefault(); onClick(); }}
    title={title} className={`${BTN} ${isActive ? active : inactive}`}>
    {children}
  </button>
);

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
    ],
    content: content || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return <div className="h-64 bg-darkBg border border-darkBorder rounded-xl animate-pulse" />;

  return (
    <div className="border border-darkBorder rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-darkBg border-b border-darkBorder">
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="H2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="H3">H3</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} isActive={editor.isActive('heading', { level: 4 })} title="H4">H4</ToolbarButton>
        <div className="w-px h-4 bg-darkBorder mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><strong>B</strong></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><em>I</em></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><u>U</u></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strike"><s>S</s></ToolbarButton>
        <div className="w-px h-4 bg-darkBorder mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">•≡</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">1.</ToolbarButton>
        <div className="w-px h-4 bg-darkBorder mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">"</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">{'</>'}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} isActive={false} title="Horizontal Rule">──</ToolbarButton>
        <div className="w-px h-4 bg-darkBorder mx-1" />
        <ToolbarButton
          onClick={() => { const url = window.prompt('URL:'); if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run(); }}
          isActive={editor.isActive('link')} title="Link">🔗</ToolbarButton>
        <ToolbarButton
          onClick={() => { const url = window.prompt('Image URL:'); if (url) editor.chain().focus().setImage({ src: url }).run(); }}
          isActive={false} title="Image">🖼</ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          isActive={false} title="Insert Table">⊞</ToolbarButton>
      </div>
      {/* Editor */}
      <div className="min-h-96 p-4 bg-darkBg">
        <EditorContent editor={editor} className="tiptap-editor outline-none" />
      </div>
    </div>
  );
};

export default RichTextEditor;
