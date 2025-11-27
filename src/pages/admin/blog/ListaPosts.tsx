import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Plus, Trash2, Pencil, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

type BlogCategoria = { id: string; nombre: string };

function CategoriasTab() {
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
    if (error) toast.error("Error cargando categorías del blog");
    else setCategorias(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-display text-amber-700 dark:text-amber-300">Categorías</h2>
        <Link to="/admin/blog/categorias/crear">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Nueva categoría
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando categorías...</p>
      ) : categorias.length === 0 ? (
        <p className="text-muted-foreground">No hay categorías.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {categorias.map((c) => (
            <Card key={c.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition">
              <CardContent className="flex items-center justify-between p-4">
                <div className="font-medium">{c.nombre}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/blog/categorias/editar/${c.id}`)} className="flex items-center gap-1">
                    <Pencil className="h-4 w-4" /> Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="flex items-center gap-1" onClick={() => setDeleteId(c.id)}>
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar categoría del blog?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={eliminarCategoria} className="bg-red-600 hover:bg-red-700" disabled={deleting}>
                          {deleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListaPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadPosts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("blog_posts") // 👈 MUY IMPORTANTE
      .select("*")
      .order("fecha_publicacion", { ascending: false });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      toast.error("Error cargando posts");
    } else {
      setPosts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const deletePost = async (id) => {
    if (!confirm("¿Eliminar este post?")) return;

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error eliminando post");
      return;
    }

    toast.success("Post eliminado");
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <FileText className="h-10 w-10 text-amber-700 dark:text-amber-300" />
            Blog
          </h1>
          <Button onClick={() => navigate("/admin/blog/crear")} className="bg-amber-600 hover:bg-amber-700 text-white"> 
            <Plus className="w-4 h-4 mr-2" />
            Nuevo post
          </Button>
        </div>

      <Tabs defaultValue="publicaciones">
        <TabsList>
          <TabsTrigger value="publicaciones">Publicaciones</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="publicaciones" className="mt-4">
          {loading ? (
            <p className="text-muted-foreground">Cargando posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground">No hay publicaciones.</p>
          ) : (
            <div className="bg-card text-card-foreground shadow-sm rounded-xl border border-border mt-2 overflow-x-auto overflow-y-visible max-w-full">
              <table className="w-full table-auto text-sm min-w-[900px]">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="p-4 text-left whitespace-nowrap">Título</th>
                    <th className="p-4 text-left">Categoría</th>
                    <th className="p-4 text-left whitespace-nowrap">Fecha</th>
                    <th className="p-4 text-left whitespace-nowrap">Slug</th>
                    <th className="p-4 text-right whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="p-4">{post.titulo}</td>
                      <td className="p-4">{post.categoria || "–"}</td>
                      <td className="p-4 whitespace-nowrap">
                        {new Date(post.fecha_publicacion).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-muted-foreground whitespace-nowrap">{post.slug}</td>

                      <td className="p-4 flex justify-end gap-2 whitespace-nowrap">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => navigate(`/admin/blog/editar/${post.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categorias" className="mt-4">
          <CategoriasTab />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
