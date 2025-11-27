import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Pencil } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function EditarEnvio() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);

  const actualizar = (k: string, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const cargar = async () => {
    const { data, error } = await supabase
      .from("metodos_envio")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("No se pudo cargar el método");
      return;
    }

    setForm(data);
    setLoading(false);
  };

  const guardar = async () => {
    const { error } = await supabase
      .from("metodos_envio")
      .update({
        codigo: form.codigo,
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        icono: form.icono,
        orden: form.orden,
        activo: form.activo,
      })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar");
      return;
    }

    toast.success("Método actualizado ✔");
    navigate("/admin/envios");
  };

  useEffect(() => {
    cargar();
  }, []);

  if (loading || !form)
    return (
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
      <div className="pt-16 w-full px-4 md:px-8 pb-32 max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </div>

        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 mb-6 flex items-center gap-2">
          <Pencil /> Editar método de envío
        </h1>

        <div className="space-y-6 bg-card text-card-foreground rounded-xl border border-border p-6 shadow-sm">

        <div>
          <label className="text-sm font-medium">Código</label>
          <Input
            value={form.codigo}
            onChange={(e) => actualizar("codigo", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Nombre</label>
          <Input
            value={form.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Descripción</label>
          <Textarea
            rows={3}
            value={form.descripcion}
            onChange={(e) => actualizar("descripcion", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Precio</label>
          <Input
            type="number"
            step="0.01"
            value={form.precio}
            onChange={(e) => actualizar("precio", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Icono</label>
          <Input
            value={form.icono}
            onChange={(e) => actualizar("icono", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Orden</label>
          <Input
            type="number"
            value={form.orden}
            onChange={(e) => actualizar("orden", Number(e.target.value))}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => actualizar("activo", e.target.checked)}
          />
          <label className="text-sm">Activo</label>
        </div>

        <Button onClick={guardar} className="bg-amber-600 hover:bg-amber-700 text-white">Guardar cambios</Button>
        </div>
      </div>
    </div>
  );
}
