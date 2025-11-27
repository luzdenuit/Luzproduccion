import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Pencil, Trash2, PlusCircle, Truck } from "lucide-react";
import { Link } from "react-router-dom";

export default function ListaEnvios() {
  const [envios, setEnvios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnvios = async () => {
    const { data, error } = await supabase
      .from("metodos_envio")
      .select("*")
      .order("orden", { ascending: true });

    if (error) toast.error("Error al cargar métodos de envío");
    else setEnvios(data);

    setLoading(false);
  };

  const eliminarEnvio = async (id) => {
    const { error } = await supabase
      .from("metodos_envio")
      .delete()
      .eq("id", id);

    if (error) toast.error("No se pudo eliminar");
    else {
      toast.success("Método de envío eliminado");
      fetchEnvios();
    }
  };

  useEffect(() => {
    fetchEnvios();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Truck className="w-8 h-8" /> Métodos de envío
          </h1>

          <Link to="/admin/envios/crear">
            <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg shadow-amber-600/20">
              <PlusCircle className="w-5 h-5" /> Nuevo método
            </Button>
          </Link>
        </div>

      {/* Skeleton */}
      {loading && (
        <p className="text-muted-foreground">Cargando...</p>
      )}

      {/* Empty */}
      {!loading && envios.length === 0 && (
        <p className="text-muted-foreground">No hay métodos de envío aún</p>
      )}

      {/* List */}
      <div className="space-y-4">
        {envios.map((e) => (
          <div
            key={e.id}
            className="border border-border rounded-xl p-4 bg-card shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-lg text-amber-700 dark:text-amber-300">{e.nombre}</p>
              <p className="text-muted-foreground">{e.descripcion}</p>
              <p className="font-semibold mt-1">${e.precio.toFixed(2)}</p>
            </div>

            <div className="flex gap-3">
              <Link to={`/admin/envios/editar/${e.id}`}>
                <Button variant="outline" size="sm">
                  <Pencil className="w-4 h-4" /> Editar
                </Button>
              </Link>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => eliminarEnvio(e.id)}
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
