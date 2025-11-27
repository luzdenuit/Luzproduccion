import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  TicketPercent,
  Clock,
  RefreshCcw
} from "lucide-react";

export default function ListaCupones() {
  const [cupones, setCupones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarCupones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cupones")
      .select("*")
      .order("fecha_inicio", { ascending: false });

    if (error) {
      toast.error("Error cargando cupones");
    } else {
      setCupones(data);
    }

    setLoading(false);
  };

  const eliminarCupon = async (id: string) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    const { error } = await supabase.from("cupones").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar");
    } else {
      toast.success("Cupón eliminado");
      cargarCupones();
    }
  };

  useEffect(() => {
    cargarCupones();
  }, []);  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <TicketPercent className="h-10 w-10 text-amber-700 dark:text-amber-300" />
            Cupones
          </h1>

          <Link to="/admin/cupones/crear">
            <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg shadow-amber-600/20">
              <Plus className="w-5 h-5" /> Crear cupón
            </Button>
          </Link>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        )}

        {/* LISTA */}
        {!loading && cupones.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {cupones.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-xl border border-border bg-card shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-display text-2xl text-amber-700 dark:text-amber-300">
                    {c.codigo}
                  </h2>
                  <TicketPercent className="text-amber-700 dark:text-amber-300" />
                </div>

                <p className="text-muted-foreground mb-2">
                  {c.descripcion || "Sin descripción"}
                </p>

                <p className="text-sm">
                  <strong>Tipo:</strong> {c.tipo}
                </p>
                <p className="text-sm">
                  <strong>Valor:</strong>{" "}
                  {c.tipo === "porcentaje" ? `${c.valor}%` : `$${c.valor}`}
                </p>

                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(c.fecha_inicio).toLocaleDateString()} →{" "}
                  {new Date(c.fecha_fin).toLocaleDateString()}
                </p>

                <p
                  className={`mt-2 text-sm ${
                    c.activo ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {c.activo ? "Activo" : "Desactivado"}
                </p>

                {/* ACCIONES */}
                <div className="flex justify-between mt-6">
                  <Link to={`/admin/cupones/editar/${c.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Pencil className="w-4 h-4" />
                      Editar
                    </Button>
                  </Link>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => eliminarCupon(c.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && cupones.length === 0 && (
          <p className="text-center text-muted-foreground py-20">
            Aún no hay cupones creados.
          </p>
        )}
      </div>
    </div>
  );
}
