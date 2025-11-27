import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Folder } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

export default function CrearCategoria() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("categorias")
      .insert([{ ...formData }]);

    if (error) {
      toast.error("Error creando categoría");
    } else {
      toast.success("Categoría creada");
      navigate("/admin/categorias");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-32 container mx-auto px-4 pb-20 max-w-2xl">
        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-6">
          <Folder className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Crear categoría
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 shadow-lg rounded-xl border border-amber-100"
        >
          <div>
            <Label>Nombre *</Label>
            <Input
              name="nombre"
              placeholder="Ej: Aromas Dulces"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Descripción (opcional)</Label>
            <Textarea
              name="descripcion"
              placeholder="Descripción breve de la categoría..."
              value={formData.descripcion}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {loading ? "Guardando..." : "Crear Categoría"}
          </Button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
