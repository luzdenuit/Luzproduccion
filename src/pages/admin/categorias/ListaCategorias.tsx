import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import Navbar from "@/components/Navbar";


import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
 

import { Pencil, Trash2, PlusCircle, Folder } from "lucide-react";
import { toast } from "sonner";

type Categoria = { id: string; nombre: string; descripcion?: string };

export default function ListaCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  

  const fetchCategorias = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("nombre");

    if (error) {
      toast.error("Error cargando categorías");
    } else {
      setCategorias(data || []);
    }

    setLoading(false);
  };

  

  const eliminarCategoria = async () => {
    if (!deleteId) return;
    setDeleting(true);

    const { error } = await supabase
      .from("categorias")
      .delete()
      .eq("id", deleteId);

    setDeleting(false);

    if (error) {
      toast.error("No se puede eliminar. Puede tener productos asociados.");
    } else {
      toast.success("Categoría eliminada");
      fetchCategorias();
    }

    setDeleteId(null); 
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Folder className="h-10 w-10 text-amber-700 dark:text-amber-300" />
            Categorías
          </h1>

          <Link to="/admin/categorias/crear">
            <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg shadow-amber-600/20">
              <PlusCircle className="h-5 w-5" />
              Nueva categoría
            </Button>
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </Card>
            ))}
          </div>
        ) : categorias.length === 0 ? (
          <p className="text-muted-foreground">Aún no hay categorías.</p>
        ) : (
          /* Grid de categorías (producto) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {categorias.map((c) => (
              <Card key={c.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition">
                <CardHeader>
                  <CardTitle className="text-amber-700 dark:text-amber-300">{c.nombre}</CardTitle>

                  {c.descripcion && (
                    <CardDescription>{c.descripcion}</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex justify-between mt-2">
                  <Link to={`/admin/categorias/editar/${c.id}`}>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Pencil className="h-4 w-4" /> Editar
                    </Button>
                  </Link>

                  {/* Botón Eliminar con Modal */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-1"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </Button>
                    </AlertDialogTrigger>

                  <AlertDialogContent>
  <AlertDialogHeader>
    <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
    <AlertDialogDescription>
      Esta acción no se puede deshacer.  
      Si esta categoría tiene productos asociados, la eliminación fallará.
    </AlertDialogDescription>
  </AlertDialogHeader>

  <AlertDialogFooter>
    <AlertDialogCancel>Cancelar</AlertDialogCancel>

    <AlertDialogAction
      onClick={eliminarCategoria}
      className="bg-red-600 hover:bg-red-700"
      disabled={deleting}
    >
      {deleting ? "Eliminando..." : "Eliminar"}
    </AlertDialogAction>
  </AlertDialogFooter>
</AlertDialogContent>

                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        

        {/* edición ahora se realiza en página dedicada */}
      </div>

     
    </div>
  );
}
