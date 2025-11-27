import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { ScrollText } from "lucide-react";
import { Edit, Plus, Trash2, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ListaPoliticas() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("politicas")
      .select("*")
      .order("actualizado_en", { ascending: false });
    if (error) {
      toast.error("Error cargando políticas");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => `${p.titulo} ${p.slug}`.toLowerCase().includes(q));
  }, [items, query]);

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta política?")) return;
    const { error } = await supabase.from("politicas").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar");
      return;
    }
    toast.success("Política eliminada");
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
          <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <ScrollText className="h-10 w-10 text-amber-700 dark:text-amber-300" />
            Políticas
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8 w-64" placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => navigate("/admin/politicas/crear")}> 
              <Plus className="w-4 h-4" />
              Nueva política
            </Button>
          </div>
        </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No hay políticas.</p>
      ) : (
        <div className="overflow-x-auto border border-border rounded-xl bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Actualizado</th>
                <th className="px-4 py-3 text-left">Activo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">{p.titulo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.slug}</td>
                  <td className="px-4 py-3">{p.actualizado_en ? new Date(p.actualizado_en).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.activo ? "secondary" : "outline"}>{p.activo ? "Activa" : "Inactiva"}</Badge>
                  </td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => navigate(`/politicas/${p.slug}`)} title="Ver pública">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => navigate(`/admin/politicas/editar/${p.id}`)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => eliminar(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}