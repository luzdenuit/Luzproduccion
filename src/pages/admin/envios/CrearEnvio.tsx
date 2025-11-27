import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, PlusCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function CrearEnvio() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    icono: "",
    orden: 0,
    activo: true,
  });

  const actualizar = (k: string, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const crear = async () => {
    if (!form.codigo || !form.nombre || form.precio === "") {
      return toast.error("Completa los campos obligatorios");
    }

    const { error } = await supabase.from("metodos_envio").insert({
      codigo: form.codigo.toLowerCase(),
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      icono: form.icono,
      orden: form.orden,
      activo: form.activo,
    });

    if (error) {
      toast.error("Error al crear método de envío");
      return;
    }

    toast.success("Método creado ✔");
    navigate("/admin/envios");
  };

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
          <PlusCircle /> Nuevo método de envío
        </h1>

        <div className="space-y-6 bg-card text-card-foreground rounded-xl border border-border p-6 shadow-sm">

        {/* Código */}
        <div>
          <label className="text-sm font-medium">Código (único)</label>
          <Input
            value={form.codigo}
            onChange={(e) => actualizar("codigo", e.target.value)}
            placeholder="standard / express / pickup"
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="text-sm font-medium">Nombre</label>
          <Input
            value={form.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            placeholder="Envío estándar"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="text-sm font-medium">Descripción</label>
          <Textarea
            rows={3}
            value={form.descripcion}
            onChange={(e) => actualizar("descripcion", e.target.value)}
            placeholder="Llega entre 3 y 5 días hábiles"
          />
        </div>

        {/* Precio */}
        <div>
          <label className="text-sm font-medium">Precio</label>
          <Input
            type="number"
            step="0.01"
            value={form.precio}
            onChange={(e) => actualizar("precio", e.target.value)}
          />
        </div>

        {/* Icono */}
        <div>
          <label className="text-sm font-medium">Icono (opcional)</label>
          <Input
            value={form.icono}
            onChange={(e) => actualizar("icono", e.target.value)}
            placeholder="standard / express / pickup"
          />
        </div>

        {/* Orden */}
        <div>
          <label className="text-sm font-medium">Orden</label>
          <Input
            type="number"
            value={form.orden}
            onChange={(e) => actualizar("orden", Number(e.target.value))}
          />
        </div>

        {/* Activo */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => actualizar("activo", e.target.checked)}
          />
          <label className="text-sm">Activo</label>
        </div>

        <Button onClick={crear} className="bg-amber-600 hover:bg-amber-700 text-white">Crear método de envío</Button>
        </div>
      </div>
    </div>
  );
}
