import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Pencil } from "lucide-react";
import Navbar from "@/components/Navbar";

type RitualForm = { nombre: string; descripcion: string };

export default function EditarRitual() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<RitualForm>({ nombre: "", descripcion: "" });

  const actualizar = (k: keyof RitualForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const cargar = async () => {
    const { data, error } = await supabase
      .from("rituales")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast.error("No se pudo cargar el ritual");
      navigate("/admin/rituales");
      return;
    }

    setForm({ nombre: data.nombre || "", descripcion: data.descripcion || "" });
    setLoading(false);
  };

  const guardar = async () => {
    const { error } = await supabase
      .from("rituales")
      .update({ nombre: form.nombre, descripcion: form.descripcion })
      .eq("id", id);

    if (error) {
      toast.error("No se pudo actualizar");
      return;
    }

    toast.success("Ritual actualizado");
    navigate("/admin/rituales");
  };

  useEffect(() => {
    cargar();
  }, []);

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
      <div className="pt-16 w-full px-4 md:px-8 pb-32 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </div>

        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 mb-6 flex items-center gap-2">
          <Pencil className="h-8 w-8" /> Editar ritual
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); guardar(); }} className="space-y-6 bg-card text-card-foreground p-8 shadow-sm rounded-xl border border-border">
          <div>
            <Label>Nombre *</Label>
            <Input value={form.nombre} onChange={(e) => actualizar("nombre", e.target.value)} required />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea rows={3} value={form.descripcion} onChange={(e) => actualizar("descripcion", e.target.value)} />
          </div>

          <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            Guardar cambios
          </Button>
        </form>
      </div>
    </div>
  );
}