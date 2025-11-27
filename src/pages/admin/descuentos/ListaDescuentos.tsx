import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { BadgePercent, Pencil, Trash2 } from "lucide-react";

type Descuento = {
  id: string;
  producto_id: string;
  porcentaje: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  activo: boolean;
};

export default function ListaDescuentos() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [productosMap, setProductosMap] = useState<Record<string, { nombre: string; imagen: string | null }>>({});
  const [loading, setLoading] = useState(true);

  const fetchDescuentos = async () => {
    const { data, error } = await supabase
      .from("descuentos_productos")
      .select("*")
      .order("fecha_inicio", { ascending: false });

    if (error) {
      toast.error("Error al cargar descuentos");
      setLoading(false);
      return;
    }

    const list = (data || []) as Descuento[];
    setDescuentos(list);

    const ids = Array.from(new Set(list.map((d) => d.producto_id).filter(Boolean)));
    if (ids.length > 0) {
      const { data: prods } = await supabase
        .from("productos")
        .select("id, nombre, imagen_principal")
        .in("id", ids);
      const map: Record<string, { nombre: string; imagen: string | null }> = {};
      (prods || []).forEach((p: any) => (map[p.id] = { nombre: p.nombre, imagen: p.imagen_principal || null }));
      setProductosMap(map);
    }

    setLoading(false);
  };

  const eliminar = async (id: string) => {
    const { error } = await supabase
      .from("descuentos_productos")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar");
      return;
    }
    toast.success("Descuento eliminado");
    fetchDescuentos();
  };

  useEffect(() => {
    fetchDescuentos();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <BadgePercent className="w-8 h-8" /> Descuentos
          </h1>

          <Link to="/admin/descuentos/crear">
            <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg shadow-amber-600/20">
              Nuevo descuento
            </Button>
          </Link>
        </div>

      {loading && <p className="text-muted-foreground">Cargando...</p>}
      {!loading && descuentos.length === 0 && (
        <p className="text-muted-foreground">No hay descuentos aún</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {descuentos.map((d) => {
          const info = productosMap[d.producto_id];
          return (
            <div key={d.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-video bg-muted">
                {info?.imagen ? (
                  <img src={info.imagen} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="p-4 flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg text-amber-700 dark:text-amber-300">{info?.nombre || d.producto_id}</p>
                  <p className="text-muted-foreground text-sm">{d.porcentaje}% • {d.activo ? "Activo" : "Inactivo"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {d.fecha_inicio ? new Date(d.fecha_inicio).toLocaleString() : ""} - {d.fecha_fin ? new Date(d.fecha_fin).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/admin/descuentos/editar/${d.id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => eliminar(d.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}