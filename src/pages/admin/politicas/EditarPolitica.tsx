import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import RichTextEditor from "@/components/editor/RichTextEditor";
import Navbar from "@/components/Navbar";
import { ArrowLeft, ScrollText } from "lucide-react";

const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function EditarPolitica() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ titulo: "", slug: "", activo: true });
  const [contenido, setContenido] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("politicas")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      toast.error("No encontrada");
      navigate("/admin/politicas");
      return;
    }
    setForm({ titulo: data.titulo || "", slug: data.slug || "", activo: !!data.activo });
    setContenido(data.contenido || "");
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleTituloChange = (value: string) => {
    setForm((prev) => ({ ...prev, titulo: value, slug: slugEdited ? prev.slug : slugify(value) }));
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, slug: slugify(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = contenido || "";
    if (!form.titulo || !form.slug || !content || content === "<p></p>") {
      toast.error("Completa título, slug y contenido");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("politicas")
      .update({ titulo: form.titulo, slug: form.slug, contenido: content, activo: form.activo })
      .eq("id", id);
    if (error) {
      toast.error("No se pudo guardar");
    } else {
      toast.success("Política actualizada");
      navigate("/admin/politicas");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/politicas")} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </div>
        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-6">
          <ScrollText className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Editar política
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8 bg-card text-card-foreground p-8 shadow-sm rounded-xl border border-border">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label>Título *</Label>
            <Input value={form.titulo} onChange={(e) => handleTituloChange(e.target.value)} required />
          </div>
          <div>
            <Label>Slug *</Label>
            <Input value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} required />
            <p className="text-[11px] text-muted-foreground mt-1">Se usará en la URL: /{form.slug || "tu-slug"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.activo} onChange={(e) => setForm((prev) => ({ ...prev, activo: e.target.checked }))} />
          <Label>Activo</Label>
        </div>
        <div>
          <Label>Contenido *</Label>
          <RichTextEditor value={contenido} onChange={setContenido} imageFolder="politicas" />
        </div>
        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
        </form>
      </div>
    </div>
  );
}