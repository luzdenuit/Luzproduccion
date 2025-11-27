import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, BadgePercent } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";

const toLocalDT = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

export default function EditarDescuento() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    producto_id: "",
    porcentaje: "",
    fecha_inicio: "",
    fecha_fin: "",
    activo: true,
  });

  const actualizar = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const cargarProductos = async () => {
    const { data } = await supabase
      .from("productos")
      .select("id, nombre, imagen_principal, fragancia, precio")
      .order("nombre", { ascending: true });
    setProductos(data || []);
  };

  const cargar = async () => {
    const { data, error } = await supabase
      .from("descuentos_productos")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      toast.error("No se pudo cargar el descuento");
      navigate("/admin/descuentos");
      return;
    }
    actualizar("producto_id", data.producto_id || "");
    actualizar("porcentaje", String(data.porcentaje ?? ""));
    actualizar("fecha_inicio", toLocalDT(data.fecha_inicio));
    actualizar("fecha_fin", toLocalDT(data.fecha_fin));
    actualizar("activo", Boolean(data.activo));
    setLoading(false);
  };

  const guardar = async () => {
    const payload = {
      producto_id: form.producto_id,
      porcentaje: parseFloat(form.porcentaje),
      fecha_inicio: form.fecha_inicio ? new Date(form.fecha_inicio).toISOString() : null,
      fecha_fin: form.fecha_fin ? new Date(form.fecha_fin).toISOString() : null,
      activo: form.activo,
    };
    const { error } = await supabase
      .from("descuentos_productos")
      .update(payload)
      .eq("id", id);
    if (error) {
      toast.error("No se pudo actualizar");
      return;
    }
    toast.success("Descuento actualizado");
    navigate("/admin/descuentos");
  };

  useEffect(() => {
    cargarProductos();
    cargar();
  }, []);

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );

  const selected = productos.find((p) => String(p.id) === String(form.producto_id));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </div>

        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-6">
          <BadgePercent className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Editar descuento
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <div className="space-y-6">
            <div>
              <Label>Producto *</Label>
              <Select value={form.producto_id} onValueChange={(val) => actualizar("producto_id", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Porcentaje *</Label>
              <Input type="number" step="0.01" value={form.porcentaje} onChange={(e) => actualizar("porcentaje", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Fecha inicio</Label>
                <Input type="datetime-local" value={form.fecha_inicio} onChange={(e) => actualizar("fecha_inicio", e.target.value)} />
              </div>
              <div>
                <Label>Fecha fin</Label>
                <Input type="datetime-local" value={form.fecha_fin} onChange={(e) => actualizar("fecha_fin", e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.activo} onChange={(e) => actualizar("activo", e.target.checked)} />
              <label>Activo</label>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={guardar} className="bg-amber-600 hover:bg-amber-700 text-white">Guardar cambios</Button>
            </div>
          </div>
        </div>

        <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
          {selected ? (
            <ProductCard
              image={selected.imagen_principal || ""}
              name={selected.nombre}
              fragrance={selected.fragancia || ""}
              price={Number(selected.precio || 0)}
              id={selected.id}
              hideFavoriteButton
            />
          ) : (
            <div className="text-muted-foreground">Selecciona un producto para ver su vista previa</div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}