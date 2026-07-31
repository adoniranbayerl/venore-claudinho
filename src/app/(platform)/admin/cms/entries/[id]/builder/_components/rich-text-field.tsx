"use client";

import type { ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Heading2,
  Heading3,
  List as ListIcon,
  ListOrdered,
  Quote as QuoteIcon,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createRichTextExtensions } from "@/platform/page-builder/rich-text/extensions";

// Variante controlada (value/onChange), mesmo motivo de media-field.tsx: o valor mora na árvore de
// composição em memória do builder, não num FormData. Guarda JSON do Tiptap (JSONContent), nunca
// HTML — o render público usa @tiptap/static-renderer sobre esse mesmo JSON, sem
// dangerouslySetInnerHTML, então não existe string HTML pra sanitizar.
export function RichTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: JSONContent | null;
  onChange: (content: JSONContent | null) => void;
}) {
  const editor = useEditor({
    extensions: createRichTextExtensions(),
    content: value ?? undefined,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? null : editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-32 rounded-b-md px-3 py-2 text-sm text-foreground focus:outline-none [&_p]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold",
      },
    },
  });

  if (!editor) {
    return null;
  }
  // Variável renomeada (não `editor`): closures aninhadas (toggleLink) não herdam o narrowing do
  // `if (!editor) return null` acima — TS não rastreia isso através de function boundaries.
  const activeEditor = editor;

  function toggleLink() {
    if (activeEditor.isActive("link")) {
      activeEditor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("URL do link");
    if (!url) return;
    activeEditor.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="mt-1 overflow-hidden rounded-md border border-border">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1">
          <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <ItalicIcon />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <ListIcon />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <QuoteIcon />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("link")} onClick={toggleLink}>
            <LinkIcon />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button type="button" size="icon-sm" variant={active ? "secondary" : "ghost"} onClick={onClick}>
      {children}
    </Button>
  );
}
