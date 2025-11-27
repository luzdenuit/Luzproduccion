import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo } from "lucide-react";
import { cn } from "@/lib/utils"; // si no tienes esta función, puedes quitar cn y usar className normal

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Escribe el contenido del post..."
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[220px] text-foreground",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // actualizar contenido cuando value externo cambie (para editar)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const buttonBase =
    "h-8 w-8 inline-flex items-center justify-center rounded-md text-xs border border-border bg-background hover:bg-muted transition-colors";

  const Button = ({
    isActive,
    onClick,
    children,
    ariaLabel,
  }: {
    isActive?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    ariaLabel?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        buttonBase,
        isActive ? "bg-primary/10 text-primary border-primary/40" : "text-muted-foreground"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="border rounded-lg bg-background shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b px-2 py-2 bg-muted/50">
        <div className="flex gap-1">
          <Button
            isActive={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            ariaLabel="Negrita"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            isActive={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            ariaLabel="Cursiva"
          >
            <Italic className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1 ml-2">
          <Button
            isActive={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            ariaLabel="Lista desordenada"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            isActive={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            ariaLabel="Lista ordenada"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1 ml-2">
          <Button
            isActive={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            ariaLabel="Cita"
          >
            <Quote className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1 ml-auto">
          <Button
            onClick={() => editor.chain().focus().undo().run()}
            ariaLabel="Deshacer"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().redo().run()}
            ariaLabel="Rehacer"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        {!value && (
          <p className="text-xs text-muted-foreground mb-1">{placeholder}</p>
        )}
        <div className="max-h-[65vh] overflow-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
