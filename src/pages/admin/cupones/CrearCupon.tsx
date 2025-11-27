import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { TicketPercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CrearCupon() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    codigo: "",
    descripcion: "",
    tipo: "porcentaje",
    valor: "",
    max_usos: 0,
    max_usos_por_usuario: 1,
    fecha_inicio: "",
    fecha_fin: "",
    activo: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.codigo || !form.valor || !form.fecha_inicio || !form.fecha_fin) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    const { error } = await supabase.from("cupones").insert([
      {
        codigo: form.codigo.toUpperCase(),
        descripcion: form.descripcion,
        tipo: form.tipo,
        valor: parseFloat(form.valor),
        max_usos: form.max_usos,
        max_usos_por_usuario: form.max_usos_por_usuario,
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_fin: new Date(form.fecha_fin).toISOString(),
        activo: form.activo,
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("No se pudo crear el cupón");
      return;
    }

    toast.success("Cupón creado ✨");

    navigate("/admin/cupones");
  };

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
          Crear cupón
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
              placeholder="EJ: LUZ10"
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
              placeholder="Opcional"
            />
          </div>

          {/* Tipo y valor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo *</Label>
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
                step="0.01"
                value={form.valor}
                onChange={handleChange}
                placeholder="Ej: 10"
                required
              />
            </div>
          </div>

          {/* Usos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Máx. usos globales</Label>
              <Input
                type="number"
                name="max_usos"
                value={form.max_usos}
                onChange={handleChange}
                min={0}
              />
            </div>

            <div>
              <Label>Máx. usos por usuario</Label>
              <Input
                type="number"
                name="max_usos_por_usuario"
                value={form.max_usos_por_usuario}
                onChange={handleChange}
                min={1}
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
              id="activo"
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
            />
            <Label htmlFor="activo">Cupón activo</Label>
          </div>

          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            Crear cupón
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
