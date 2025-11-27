import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Folder } from "lucide-react";

export default function EditarCategoriaBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState("");

  const fetchCategoria = async () => {
    const { data, error } = await supabase
      .from("blog_categorias")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("No se pudo cargar la categoría");
      navigate("/admin/blog/categorias");
      return;
    }

    setNombre(data.nombre || "");
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("blog_categorias")
      .update({ nombre: n })
      .eq("id", id);
    setSaving(false);
    if (error) {
      toast.error("Error guardando cambios");
    } else {
              toast.success("Categoría actualizada");
              navigate("/admin/blog/categorias");
          }
  };

  useEffect(() => {
    fetchCategoria();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 w-full px-4 md:px-8 pb-32 max-w-2xl mx-auto">
        {/* Breadcrumb */}
        

        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </div>

        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-6"> 
          <Folder className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Editar categoría de blog
        </h1>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-amber-700 dark:text-amber-300">Información</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                <div>
                  <Label>Nombre *</Label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <Button type="submit" disabled={saving} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
     
    </div>
  );
}