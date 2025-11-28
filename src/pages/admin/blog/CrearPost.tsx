// src/pages/admin/blog/CrearPost.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
import {
  Upload,
  ImagePlus,
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
  FileText,
} from "lucide-react";

// TipTap
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

interface BlogCategoria {
  id: string;
  nombre: string;
}

const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const CrearPost = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<BlogCategoria[]>([]);
  const [slugEdited, setSlugEdited] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    slug: "",
    categoriaId: "",
    fecha_publicacion: "",
    excerpt: "",
  });

  // Imagen principal
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorImageInputRef = useRef<HTMLInputElement | null>(null);

  // ---------------- TipTap Editor ----------------
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      Typography,
      Image.configure({ inline: false }),
      TextStyle,
      Color,
      
      Placeholder.configure({
        placeholder: "Escribe aquí el contenido de tu artículo...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[260px] p-4 bg-background text-muted-foreground focus:outline-none focus:ring-0 prose-headings:font-display prose-headings:text-foreground prose-h1:text-4xl md:prose-h1:text-5xl prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-2xl md:prose-h3:text-3xl prose-p:leading-relaxed prose-a:text-primary prose-a:underline hover:prose-a:no-underline prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-foreground prose-li:marker:text-muted-foreground",
      },
    },
  });

  // ---------------- Toolbar helpers ----------------
  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace", previousUrl || "https://");

    if (url === null) return; // cancel
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
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
      if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
        chain.liftListItem("listItem");
      }
      if (editor.isActive("blockquote")) {
        chain.toggleBlockquote();
      }
      chain.insertContent({
        type: "heading",
        attrs: { level },
        content: [{ type: "text", text: selectedText }],
      }).run();
      return;
    }

    if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
      chain.liftListItem("listItem");
    }
    if (editor.isActive("blockquote")) {
      chain.toggleBlockquote();
    }
    chain.setHeading({ level }).run();
  };

  // ---------------- Cargar categorías ----------------
  const loadCategorias = async () => {
    const { data, error } = await supabase
      .from("blog_categorias")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Error cargando categorías de blog");
      return;
    }

    setCategorias(data as BlogCategoria[]);
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  // ---------------- Handlers básicos ----------------
  const handleTituloChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      titulo: value,
      slug: slugEdited ? prev.slug : slugify(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, slug: slugify(value) }));
  };

  const handleChangeExcerpt = (value: string) => {
    setForm((prev) => ({ ...prev, excerpt: value }));
  };

  const handleFechaChange = (value: string) => {
    setForm((prev) => ({ ...prev, fecha_publicacion: value }));
  };

  // ---------------- Imagen principal (drag & drop) ----------------
  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `blog_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const filePath = `blog/${fileName}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(filePath, file);

    if (error) {
      console.error(error);
      toast.error("Error subiendo la imagen");
      return null;
    }

    const { data } = supabase.storage.from("imagenes").getPublicUrl(filePath);
    return data.publicUrl;
  };

  // ---------------- Guardar post ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.titulo || !form.slug) {
      toast.error("El título y el slug son obligatorios");
      return;
    }

    if (!form.categoriaId) {
      toast.error("Selecciona una categoría");
      return;
    }

    if (!imageFile) {
      toast.error("Selecciona una imagen principal");
      return;
    }

    const contentHtml = editor?.getHTML() || "";
    if (!contentHtml || contentHtml === "<p></p>") {
      toast.error("El contenido del post no puede estar vacío");
      return;
    }

    setLoading(true);

    try {
      // subir imagen
      const imageUrl = await uploadImage(imageFile);
      if (!imageUrl) throw new Error("No se pudo subir la imagen");

      // obtener nombre de categoría (guardamos el texto en blog_posts.categoria)
      const categoriaNombre =
        categorias.find((c) => c.id === form.categoriaId)?.nombre || null;

      // preparar fecha
      const fecha = form.fecha_publicacion
        ? form.fecha_publicacion
        : undefined; // si está vacía, usamos default de la DB

      const { error } = await supabase.from("blog_posts").insert([
        {
          titulo: form.titulo,
          slug: form.slug,
          categoria: categoriaNombre,
          fecha_publicacion: fecha,
          excerpt: form.excerpt,
          contenido: contentHtml,
          imagen_principal: imageUrl,
        },
      ]);

      if (error) throw error;

      toast.success("Post creado correctamente");
      navigate("/admin/blog");
    } catch (err) {
      console.error(err);
      toast.error("Error creando el post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-2">
            <FileText className="h-10 w-10 text-amber-700 dark:text-amber-300" />
            Nuevo artículo del blog
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/blog")}
            className="hidden sm:inline-flex"
          >
            Volver al listado
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Título + slug */}
          <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Título *</Label>
              <Input
                value={form.titulo}
                onChange={(e) => handleTituloChange(e.target.value)}
                placeholder="Ej. Crea tu ritual nocturno con velas"
                required
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="ritual-nocturno-con-velas"
                required
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Se usará en la URL: /blog/{form.slug || "tu-slug"}
              </p>
            </div>
            </div>
          </div>

          {/* Categoría + fecha + excerpt */}
          <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Categoría *</Label>
              <Select
                value={form.categoriaId}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, categoriaId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha de publicación</Label>
              <Input
                type="date"
                value={form.fecha_publicacion}
                onChange={(e) => handleFechaChange(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Si la dejas vacía, se usará la fecha de hoy.
              </p>
            </div>

            <div className="md:col-span-1">
              <Label>Descripción corta (excerpt)</Label>
              <Textarea
                rows={3}
                value={form.excerpt}
                onChange={(e) => handleChangeExcerpt(e.target.value)}
                placeholder="Texto breve que se mostrará en la tarjeta del blog."
              />
            </div>
            </div>
          </div>

          {/* Imagen principal */}
          <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <Label className="font-semibold text-amber-700">
              Imagen principal *
            </Label>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-3 relative flex flex-col items-center justify-center border-2 rounded-2xl bg-muted/40 transition cursor-pointer min-h-[220px] ${dragActive ? "border-amber-400 bg-muted/60" : "border-dashed"}`}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    className="w-full h-72 object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-3 pointer-events-none">
                    <Button
                      type="button"
                      variant="secondary"
                      className="bg-white/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      style={{ pointerEvents: "auto" }}
                    >
                      Quitar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-muted-foreground">
                  <Upload className="h-10 w-10 mb-2" />
                  <p className="text-sm font-medium">
                    Arrastra una imagen aquí
                  </p>
                  <p className="text-xs">o haz clic para seleccionar</p>
                </div>
              )}

              <Input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={onInputChange}
                ref={fileInputRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
              />
            </div>

            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <ImagePlus className="w-3 h-3" />
              Usa una imagen horizontal de buena calidad (mínimo 1200px de
              ancho).
            </p>
          </div>

          {/* Contenido (TipTap Pro-style) */}
          <div className="lg:col-span-3 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <Label className="font-semibold text-amber-700 mb-2 block">
              Contenido *
            </Label>
            {!editor ? (
              <div className="border rounded-xl p-4 text-sm text-muted-foreground">
                Cargando editor...
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden bg-background">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b bg-muted/60 text-xs">
                  {/* Bloques */}
                  <div className="flex items-center gap-1 pr-2 border-r border-border/60">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("paragraph")
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() =>
                        editor.chain().focus().setParagraph().run()
                      }
                    >
                      <Pilcrow className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("heading", { level: 1 })
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() => applyHeading(1)}
                    >
                      <Heading1 className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("heading", { level: 2 })
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() => applyHeading(2)}
                    >
                      <Heading2 className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("heading", { level: 3 })
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() => applyHeading(3)}
                    >
                      <Heading3 className="w-3 h-3" />
                    </Button>

                    <div className="ml-2">
                      <Select onValueChange={(val) => applyHeading(Number(val) as 1 | 2 | 3)}>
                        <SelectTrigger className="h-7 w-36 text-xs">
                          <SelectValue placeholder="Encabezado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">
                            <span className="font-display text-xl">H1</span>
                            <span className="ml-2 text-muted-foreground">Título grande</span>
                          </SelectItem>
                          <SelectItem value="2">
                            <span className="font-display text-lg">H2</span>
                            <span className="ml-2 text-muted-foreground">Subtítulo</span>
                          </SelectItem>
                          <SelectItem value="3">
                            <span className="font-display text-base">H3</span>
                            <span className="ml-2 text-muted-foreground">Sección</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Inline */}
                  <div className="flex items-center gap-1 px-2 border-r border-border/60">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("bold")
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() =>
                        editor.chain().focus().toggleBold().run()
                      }
                    >
                      <BoldIcon className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("italic")
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                    >
                      <ItalicIcon className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("underline")
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                      }
                    >
                      <UnderlineIcon className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("strike")
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                      }
                    >
                      <StrikethroughIcon className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("code")
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() =>
                        editor.chain().focus().toggleCode().run()
                      }
                    >
                      <Code2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Listas / quote / hr */}
                  <div className="flex items-center gap-1 px-2 border-r border-border/60">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("bulletList")
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                    >
                      <ListIcon className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("orderedList")
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                    >
                      <ListOrdered className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
                      disabled={!editor.can().chain().focus().sinkListItem("listItem").run()}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => editor.chain().focus().liftListItem("listItem").run()}
                      disabled={!editor.can().chain().focus().liftListItem("listItem").run()}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("blockquote")
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                      }
                    >
                      <Quote className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                      }
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    >
                      <Eraser className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-1 px-2 border-r border-border/60">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        editor.isActive("link")
                          ? "bg-amber-100"
                          : "hover:bg-muted"
                      }
                      onClick={setLink}
                    >
                      <Link2 className="w-3 h-3" />
                    </Button>
                    {editor.isActive("link") && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          editor.chain().focus().unsetLink().run()
                        }
                      >
                        <Link2 className="w-3 h-3 line-through" />
                      </Button>
                    )}
                  </div>

                  {/* Alineación */}
                  <div className="flex items-center gap-1 px-2 border-r border-border/60">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={editor.isActive({ textAlign: "left" }) ? "bg-amber-100" : "hover:bg-muted"}
                      onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="currentColor" d="M3 5h18v2H3V5m0 4h12v2H3V9m0 4h18v2H3v-2m0 4h12v2H3v-2Z"/></svg>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={editor.isActive({ textAlign: "center" }) ? "bg-amber-100" : "hover:bg-muted"}
                      onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="currentColor" d="M3 5h18v2H3V5m3 4h12v2H6V9m-3 4h18v2H3v-2m3 4h12v2H6v-2Z"/></svg>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={editor.isActive({ textAlign: "right" }) ? "bg-amber-100" : "hover:bg-muted"}
                      onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="currentColor" d="M3 5h18v2H3V5m6 4h12v2H9V9M3 13h18v2H3v-2m6 4h12v2H9v-2Z"/></svg>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={editor.isActive({ textAlign: "justify" }) ? "bg-amber-100" : "hover:bg-muted"}
                      onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="currentColor" d="M3 5h18v2H3V5m0 4h18v2H3V9m0 4h18v2H3v-2m0 4h18v2H3v-2Z"/></svg>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 px-2">
                    <input
                      type="color"
                      className="w-6 h-6 p-0 border rounded"
                      onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor?.chain().focus().unsetColor().run()}
                    >
                      Quitar color
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editorImageInputRef.current?.click()}
                    >
                      Insertar imagen
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={editorImageInputRef}
                      className="hidden"
                      onChange={(e) => insertEditorImage(e.target.files?.[0] || null)}
                    />
                  </div>

                  {/* Undo / redo */}
                  <div className="flex items-center gap-1 px-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().chain().focus().undo().run()}
                    >
                      <Undo2 className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().chain().focus().redo().run()}
                    >
                      <Redo2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="max-h-[65vh] overflow-auto">
                  <EditorContent
                    editor={editor}
                    onPaste={(e) => {
                      const html = e.clipboardData.getData("text/html");
                      const text = e.clipboardData.getData("text/plain");
                      if (html || /<\w+[^>]*>.*<\/\w+>/.test(text)) {
                        e.preventDefault();
                        editor?.chain().focus().insertContent(html || text).run();
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          </div>

          {/* Botón guardar */}
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-3 rounded-xl text-lg"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Publicar artículo"}
            </Button>
          </div>
        </form>
      </div>

      
    </div>
  );
};

export default CrearPost;
