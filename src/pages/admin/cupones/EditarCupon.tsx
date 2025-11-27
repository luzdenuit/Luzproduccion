import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { TicketPercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

export default function EditarCupon() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState<any>(null);

  const loadCupon = async () => {
    const { data, error } = await supabase
      .from("cupones")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Cupón no encontrado");
      navigate("/admin/cupones");
      return;
    }

    setForm({
      ...data,
      fecha_inicio: data.fecha_inicio.slice(0, 16),
      fecha_fin: data.fecha_fin.slice(0, 16),
    });
  };

  useEffect(() => {
    loadCupon();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("cupones")
      .update({
        codigo: form.codigo.toUpperCase(),
        descripcion: form.descripcion,
        tipo: form.tipo,
        valor: parseFloat(form.valor),
        max_usos: form.max_usos,
        max_usos_por_usuario: form.max_usos_por_usuario,
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_fin: new Date(form.fecha_fin).toISOString(),
        activo: form.activo,
      })
      .eq("id", id);

    if (error) {
      toast.error("No se pudo actualizar");
      return;
    }

    toast.success("Cupón actualizado ✨");
    navigate("/admin/cupones");
  };

  if (!form) return (
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
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-6"
        >
          <TicketPercent className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Editar cupón
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 bg-card p-8 rounded-2xl border border-border shadow-card"
        >
          {/* Código */}
          <div>
            <Label>Código *</Label>
            <Input
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <Label>Descripción</Label>
            <Textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
            />
          </div>

          {/* Tipo / valor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo</Label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="fijo">Monto fijo ($)</option>
              </select>
            </div>

            <div>
              <Label>Valor *</Label>
              <Input
                type="number"
                name="valor"
                min={1}
                value={form.valor}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Usos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Máximo usos globales</Label>
              <Input
                type="number"
                name="max_usos"
                value={form.max_usos}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Máximo usos por usuario</Label>
              <Input
                type="number"
                name="max_usos_por_usuario"
                value={form.max_usos_por_usuario}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha inicio *</Label>
              <Input
                type="datetime-local"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Fecha fin *</Label>
              <Input
                type="datetime-local"
                name="fecha_fin"
                value={form.fecha_fin}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Activo */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
            />
            <Label>Activo</Label>
          </div>

          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            Guardar cambios
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
