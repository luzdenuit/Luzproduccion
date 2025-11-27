import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { toast } from "sonner";
import { ArrowLeft, Folder } from "lucide-react";

export default function EditarCategoria() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const fetchCategoria = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("No se pudo cargar la categoría");
      navigate("/admin/categorias");
      return;
    }

    setFormData({
      nombre: data.nombre,
      descripcion: data.descripcion ?? "",
    });

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.nombre.trim().length === 0) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("categorias")
      .update({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        actualizado_en: new Date(),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      toast.error("Error guardando cambios");
    } else {
      toast.success("Categoría actualizada");
      navigate("/admin/categorias");
    }
  };

  useEffect(() => {
    fetchCategoria();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-32 container mx-auto px-4 pb-20 max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link to="/admin/categorias" className="hover:underline">
            Categorías
          </Link>
          <span>/</span>
          <span className="font-medium text-amber-700">Editar</span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </div>

        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-6">
          <Folder className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Editar categoría
        </h1>

        <Card className="border-amber-100 shadow-md">
          <CardHeader>
            <CardTitle className="text-amber-800">
              Información de la categoría
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
