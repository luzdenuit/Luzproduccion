import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Folder } from "lucide-react";

export default function CrearCategoriaBlog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("blog_categorias").insert({ nombre: n });
    setLoading(false);
    if (error) {
      toast.error("Error creando categoría de blog");
      return;
    }
    toast.success("Categoría creada");
    navigate("/admin/blog/categorias");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 w-full px-4 md:px-8 pb-32 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </div>
        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-6"> 
          <Folder className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Crear categoría de blog
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 shadow-sm rounded-xl border border-border">
          <div>
            <Label>Nombre *</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Noticias" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700">
            {loading ? "Guardando..." : "Crear Categoría"}
          </Button>
        </form>
      </div>
 
    </div>
  );
}