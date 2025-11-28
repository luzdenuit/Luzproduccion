import { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, Strikethrough as StrikethroughIcon, List as ListIcon, ListOrdered, Quote, Code2, Link2, Undo2, Redo2, Heading1, Heading2, Heading3, Pilcrow } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  imageFolder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder = "Escribe el contenido aquí...", imageFolder = "editor" }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      Typography,
      Image.configure({ inline: false }),
      TextStyle,
      Color,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: { attributes: { class: "prose prose-lg max-w-none min-h-[260px] p-4 bg-background text-foreground focus:outline-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-h1:text-4xl md:prose-h1:text-5xl prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-2xl md:prose-h3:text-3xl prose-p:leading-relaxed prose-a:text-primary prose-a:underline hover:prose-a:no-underline prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-foreground prose-li:marker:text-muted-foreground" } },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const handlePaste = (e: React.ClipboardEvent) => {
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    if (html || /<\w+[^>]*>.*<\/\w+>/.test(text)) {
      e.preventDefault();
      editor?.chain().focus().insertContent(html || text).run();
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `rt_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `${imageFolder}/${fileName}`;
    const { error } = await supabase.storage.from("imagenes").upload(filePath, file);
    if (error) return null;
    const { data } = supabase.storage.from("imagenes").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const insertImage = async (file: File | null) => {
    if (!file || !editor) return;
    const url = await uploadImage(file);
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const applyHeading = (level: 1 | 2 | 3) => {
    if (!editor) return;
    const { empty, from, to } = editor.state.selection;
    const chain = editor.chain().focus();
    if (!empty) {
      const selectedText = editor.state.doc.textBetween(from, to, "\n");
      if (!selectedText.trim()) return;
      if (editor.isActive("bulletList") || editor.isActive("orderedList")) chain.liftListItem("listItem");
      if (editor.isActive("blockquote")) chain.toggleBlockquote();
      chain.insertContent({ type: "heading", attrs: { level }, content: [{ type: "text", text: selectedText }] }).run();
      return;
    }
    if (editor.isActive("bulletList") || editor.isActive("orderedList")) chain.liftListItem("listItem");
    if (editor.isActive("blockquote")) chain.toggleBlockquote();
    chain.setHeading({ level }).run();
  };

  if (!editor) return <div className="border rounded-xl p-4 text-sm text-muted-foreground">Cargando editor...</div>;

  return (
    <div className="border rounded-xl overflow-hidden bg-background">
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b bg-card text-xs">
        <div className="flex items-center gap-1 pr-2 border-r border-border/60">
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("paragraph") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().setParagraph().run()}>
            <Pilcrow className="w-3 h-3" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("heading", { level: 1 }) ? "bg-amber-100" : "hover:bg-muted"} onClick={() => applyHeading(1)}>
            <Heading1 className="w-3 h-3" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("heading", { level: 2 }) ? "bg-amber-100" : "hover:bg-muted"} onClick={() => applyHeading(2)}>
            <Heading2 className="w-3 h-3" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("heading", { level: 3 }) ? "bg-amber-100" : "hover:bg-muted"} onClick={() => applyHeading(3)}>
            <Heading3 className="w-3 h-3" />
          </Button>
          <div className="ml-2">
            <Select onValueChange={(val) => applyHeading(Number(val) as 1 | 2 | 3)}>
              <SelectTrigger className="h-7 w-36 text-xs">
                <SelectValue placeholder="Encabezado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1"><span className="font-display text-xl">H1</span><span className="ml-2 text-muted-foreground">Título grande</span></SelectItem>
                <SelectItem value="2"><span className="font-display text-lg">H2</span><span className="ml-2 text-muted-foreground">Subtítulo</span></SelectItem>
                <SelectItem value="3"><span className="font-display text-base">H3</span><span className="ml-2 text-muted-foreground">Sección</span></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-border/60">
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("bold") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleBold().run()}>
            <BoldIcon className="w-3 h-3" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("italic") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <ItalicIcon className="w-3 h-3" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("underline") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="w-3 h-3" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("strike") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <StrikethroughIcon className="w-3 h-3" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("blockquote") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote className="w-3 h-3" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("codeBlock") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
            <Code2 className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-border/60">
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("bulletList") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <ListIcon className="w-3 h-3" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive("orderedList") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-border/60">
          <Button type="button" variant="ghost" size="icon" onClick={setLink}>
            <Link2 className="w-3 h-3" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="w-3 h-3" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: "left" }) ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="currentColor" d="M3 5h18v2H3V5m0 4h12v2H3V9m0 4h18v2H3v-2m0 4h12v2H3v-2Z"/></svg>
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: "center" }) ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="currentColor" d="M3 5h18v2H3V5m3 4h12v2H6V9m-3 4h18v2H3v-2m3 4h12v2H6v-2Z"/></svg>
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: "right" }) ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="currentColor" d="M3 5h18v2H3V5m6 4h12v2H9V9M3 13h18v2H3v-2m6 4h12v2H9v-2Z"/></svg>
          </Button>
          <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: "justify" }) ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
            <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="currentColor" d="M3 5h18v2H3V5m0 4h18v2H3V9m0 4h18v2H3v-2m0 4h18v2H3v-2Z"/></svg>
          </Button>
        </div>

        <div className="flex items-center gap-2 px-2">
          <input type="color" className="w-6 h-6 p-0 border rounded" onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()} />
          <Button type="button" variant="ghost" size="sm" onClick={() => editor?.chain().focus().unsetColor().run()}>Quitar color</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>Insertar imagen</Button>
          <input type="file" accept="image/*" ref={inputRef} className="hidden" onChange={(e) => insertImage(e.target.files?.[0] || null)} />
        </div>
      </div>

      <div className="max-h-[65vh] overflow-auto">
        <EditorContent editor={editor} onPaste={handlePaste} />
      </div>
    </div>
  );
}