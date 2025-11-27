import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2, PlusCircle, Folder } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

type BlogCategoria = { id: string; nombre: string };

export default function ListaCategoriaBlog() {
  const [categorias, setCategorias] = useState<BlogCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchCategorias = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_categorias")
      .select("*")
      .order("nombre");
    if (error) {
      toast.error("Error cargando categorías del blog");
    } else {
      setCategorias(data || []);
    }
    setLoading(false);
  };

  const eliminarCategoria = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from("blog_categorias")
      .delete()
      .eq("id", deleteId);
    setDeleting(false);
    if (error) {
      toast.error("No se pudo eliminar la categoría del blog");
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Folder className="h-10 w-10 text-amber-700 dark:text-amber-300" />
            Categorías de Blog
          </h1>

          <Link to="/admin/blog/categorias/crear">
            <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg shadow-amber-600/20">
              <PlusCircle className="h-5 w-5" />
              Nueva categoría
            </Button>
          </Link>
        </div>

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
          <p className="text-muted-foreground">No hay categorías de blog.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {categorias.map((c) => (
              <Card key={c.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition">
                <CardHeader>
                  <CardTitle className="text-amber-700 dark:text-amber-300">{c.nombre}</CardTitle>
                  <CardDescription className="font-mono text-xs text-muted-foreground">{String(c.id).slice(0, 8)}...</CardDescription>
                </CardHeader>

                <CardContent className="flex justify-between mt-2">
                  <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => navigate(`/admin/blog/categorias/editar/${c.id}`)}>
                    <Pencil className="h-4 w-4" /> Editar
                  </Button>

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
                        <AlertDialogTitle>¿Eliminar categoría del blog?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer.
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
      </div>

    </div>
  );
}