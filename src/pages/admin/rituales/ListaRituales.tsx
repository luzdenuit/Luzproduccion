import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { PlusCircle, ScrollText, Pencil } from "lucide-react";

type Ritual = { id: string; nombre: string; descripcion: string | null };

export default function ListaRituales() {
  const [rituales, setRituales] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRituales = async () => {
    const { data, error } = await supabase
      .from("rituales")
      .select("*")
      .order("creado_en", { ascending: false });

    if (error) toast.error("Error al cargar rituales");
    else setRituales(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchRituales();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <ScrollText className="w-8 h-8" /> Rituales
          </h1>

          <Link to="/admin/rituales/crear">
            <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg shadow-amber-600/20">
              <PlusCircle className="w-5 h-5" /> Nuevo ritual
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : rituales.length === 0 ? (
          <p className="text-muted-foreground">No hay rituales aún</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {rituales.map((r) => (
              <Card key={r.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition">
                <CardHeader>
                  <CardTitle className="text-amber-700 dark:text-amber-300">{r.nombre}</CardTitle>
                  <CardDescription className="text-muted-foreground line-clamp-2">{r.descripcion || ""}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end mt-2">
                  <Link to={`/admin/rituales/editar/${r.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Pencil className="w-4 h-4" /> Editar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}