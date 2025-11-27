import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  X,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikethroughIcon,
  List as ListIcon,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Minus,
  ChevronLeft,
  ChevronRight,
  Eraser,
  ImagePlus,
  FileText,
} from "lucide-react";
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
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { slugify } from "@/lib/slugify";


interface BlogPost {
  id: string;
  titulo: string;
  slug: string;
  categoria: string | null;
  fecha_publicacion: string | null;
  excerpt: string | null;
  contenido: string | null;
  imagen_principal: string | null;
}

const EditarPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    slug: "",
    categoria: "",
    fecha_publicacion: "",
    excerpt: "",
    contenido: "",
  });

  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const editorImageInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      Typography,
      Image.configure({ inline: false }),
      TextStyle,
      Color,
      Placeholder.configure({ placeholder: "Escribe aquí el contenido de tu artículo..." }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[260px] p-4 bg-background text-muted-foreground focus:outline-none focus:ring-0 prose-headings:font-display prose-headings:text-foreground prose-h1:text-4xl md:prose-h1:text-5xl prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-2xl md:prose-h3:text-3xl prose-p:leading-relaxed prose-a:text-primary prose-a:underline hover:prose-a:no-underline prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-foreground prose-li:marker:text-muted-foreground",
      },
    },
  });

  useEffect(() => {
    if (editor) editor.commands.setContent(formData.contenido || "");
  }, [editor, formData.contenido]);

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

  const insertEditorImage = async (file: File | null) => {
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

  const loadPost = async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error(error);
      toast.error("No se pudo cargar el post");
      setLoading(false);
      return;
    }

    const post = data as BlogPost;

    setFormData({
      titulo: post.titulo,
      slug: post.slug,
      categoria: post.categoria || "",
      fecha_publicacion: post.fecha_publicacion
        ? post.fecha_publicacion.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      excerpt: post.excerpt || "",
      contenido: post.contenido || "",
    });

    setPreview(post.imagen_principal || null);
    setLoading(false);
  };

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "titulo") {
      const newSlug = slugify(value);
      setFormData((prev) => ({
        ...prev,
        titulo: value,
        slug: newSlug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagenFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `blog_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `blog/${fileName}`;

    const { error } = await supabase.storage.from("imagenes").upload(filePath, file);

    if (error) {
      console.error(error);
      toast.error("Error subiendo la imagen");
      return null;
    }

    const { data } = supabase.storage.from("imagenes").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const contentHtml = editor?.getHTML() || "";
    if (!formData.titulo || !formData.excerpt || !contentHtml || contentHtml === "<p></p>") {
      toast.error("Completa título, resumen y contenido");
      return;
    }

    setSaving(true);

    try {
      let imageUrl: string | null | undefined = undefined;

      if (imagenFile) {
        imageUrl = await uploadImage(imagenFile);
        if (!imageUrl) throw new Error("No se pudo subir la imagen");
      }

      const slug = formData.slug || slugify(formData.titulo);

      const updatePayload: any = {
        titulo: formData.titulo,
        slug,
        categoria: formData.categoria || null,
        fecha_publicacion: formData.fecha_publicacion || null,
        excerpt: formData.excerpt,
        contenido: contentHtml,
      };

      if (imageUrl) {
        updatePayload.imagen_principal = imageUrl;
      }

      const { error } = await supabase
        .from("blog_posts")
        .update(updatePayload)
        .eq("id", id);

      if (error) {
        if ((error as any).code === "23505") {
          toast.error("Ya existe un post con ese slug. Cambia el título.");
        } else {
          console.error(error);
          toast.error("Error actualizando el post");
        }
        setSaving(false);
        return;
      }

      toast.success("Post actualizado");
      navigate("/admin/blog");
    } catch (err) {
      console.error(err);
      toast.error("Error guardando cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-16 w-full px-4 md:px-8 pb-32">
          <p className="text-muted-foreground">Cargando post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-2">
          <FileText className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Editar publicación
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información general */}
            <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4">Información general</h2>
              <div className="space-y-4">
                <div>
                  <Label>Título *</Label>
                  <Input name="titulo" value={formData.titulo} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Slug (auto generado)</Label>
                  <Input name="slug" value={formData.slug} readOnly className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">Se usa en la URL: /blog/{formData.slug}</p>
                </div>
              </div>
            </div>

            {/* Imagen principal */}
            <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4">Imagen principal</h2>
              {preview ? (
                <div className="relative inline-block">
                  <img src={preview} className="rounded-xl w-full max-h-64 object-cover border" />
                  <button
                    type="button"
                    onClick={() => { setImagenFile(null); setPreview(null); }}
                    className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Este post no tiene imagen, o usarás la actual sin cambios.</p>
              )}
              <Input type="file" accept="image/*" onChange={handleImageSelect} className="mt-4" />
            </div>

            {/* Meta del artículo */}
            <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4">Meta del artículo</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Input name="categoria" value={formData.categoria} onChange={handleChange} />
                </div>
                <div>
                  <Label>Fecha de publicación</Label>
                  <Input type="date" name="fecha_publicacion" value={formData.fecha_publicacion} onChange={handleChange} />
                </div>
                <div className="md:col-span-1">
                  <Label>Resumen / excerpt *</Label>
                  <Textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} required />
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="lg:col-span-3 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4">Contenido</h2>
              {!editor ? (
                <div className="border rounded-xl p-4 text-sm text-muted-foreground">Cargando editor...</div>
              ) : (
                <div className="border rounded-xl overflow-hidden bg-background">
                  <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b bg-muted/60 text-xs">
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
                          <SelectTrigger className="h-7 w-36 text-xs"><SelectValue placeholder="Encabezado" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1"><span className="font-display text-xl">H1</span><span className="ml-2 text-muted-foreground">Título grande</span></SelectItem>
                            <SelectItem value="2"><span className="font-display text-lg">H2</span><span className="ml-2 text-muted-foreground">Subtítulo</span></SelectItem>
                            <SelectItem value="3"><span className="font-display text-base">H3</span><span className="ml-2 text-muted-foreground">Sección</span></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 border-r border-border/60">
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
                      <Button type="button" variant="ghost" size="icon" className={editor.isActive("code") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleCode().run()}>
                        <Code2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 px-2 border-r border-border/60">
                      <Button type="button" variant="ghost" size="icon" className={editor.isActive("bulletList") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <ListIcon className="w-3 h-3" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className={editor.isActive("orderedList") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                        <ListOrdered className="w-3 h-3" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().sinkListItem("listItem").run()} disabled={!editor.can().chain().focus().sinkListItem("listItem").run()}>
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().liftListItem("listItem").run()} disabled={!editor.can().chain().focus().liftListItem("listItem").run()}>
                        <ChevronLeft className="w-3 h-3" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className={editor.isActive("blockquote") ? "bg-amber-100" : "hover:bg-muted"} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                        <Quote className="w-3 h-3" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
                        <Eraser className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 px-2 border-r border-border/60">
                      <Button type="button" variant="ghost" size="icon" className={editor.isActive("link") ? "bg-amber-100" : "hover:bg-muted"} onClick={setLink}>
                        <Link2 className="w-3 h-3" />
                      </Button>
                      {editor.isActive("link") && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().unsetLink().run()}>
                          <Link2 className="w-3 h-3 line-through" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 px-2 border-r border-border/60">
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
                      <Button type="button" variant="ghost" size="sm" onClick={() => editor?.chain().focus().unsetColor().run()}>
                        Quitar color
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => editorImageInputRef.current?.click()}>
                        Insertar imagen
                      </Button>
                      <input type="file" accept="image/*" ref={editorImageInputRef} className="hidden" onChange={(e) => insertEditorImage(e.target.files?.[0] || null)} />
                    </div>
                    <div className="flex items-center gap-1 px-2">
                      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}>
                        <Undo2 className="w-3 h-3" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}>
                        <Redo2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-[65vh] overflow-auto">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-3 rounded-xl text-lg">
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPost;
