import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck, Zap, Package, Info } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useCheckout } from "@/context/CheckoutContext";
//

export default function EnvioSelector() {
  const { envio, setEnvio } = useCheckout();
  type MetodoEnvio = {
    id: string;
    nombre: string;
    descripcion?: string | null;
    precio: number;
    icono?: string | null;
    activo?: boolean;
  };
  const [metodos, setMetodos] = useState<MetodoEnvio[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 cargar métodos desde supabase
  const loadMetodos = async () => {
    const { data, error } = await supabase
      .from("metodos_envio")
      .select("*")
      .eq("activo", true)
      .order("precio", { ascending: true });

    if (!error) setMetodos((data || []) as MetodoEnvio[]);
    setLoading(false);
  };

  useEffect(() => {
    loadMetodos();
  }, []);

  if (loading)
    return (
      <div className="p-6 border border-border rounded-2xl bg-card shadow-sm animate-pulse">
        Cargando métodos de envío...
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border shadow-sm rounded-2xl p-4 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-display text-2xl text-foreground">Método de Envío</h2>
        <span className="text-sm text-muted-foreground truncate max-w-[60%]">
          {(() => {
            const metodo = metodos.find((m) => m.id === envio.metodo_envio_id);
            if (!metodo) return "Selecciona un método de envío";
            return metodo.descripcion || "Sin descripción";
          })()}
        </span>
      </div>
      <RadioGroup
        value={envio.metodo_envio_id ?? ""}
        onValueChange={(id) => {
          const metodo = metodos.find((m) => m.id === id);
          if (!metodo) return;

          setEnvio({
            metodo_envio_id: metodo.id,
            costo: Number(metodo.precio) || 0,
            nombre: metodo.nombre,
            descripcion: metodo.descripcion,
          });
        }}
        className="flex flex-wrap gap-3"
      >
        {metodos.map((m) => (
          <label
            key={m.id}
            htmlFor={m.id}
            className={`
              inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors
              ${
                envio.metodo_envio_id === m.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40"
              }
            `}
          >
            <RadioGroupItem id={m.id} value={m.id} />

            <div className="p-1 rounded bg-muted">
              {m.icono === "express" ? (
                <Zap className="h-4 w-4 text-primary" />
              ) : m.icono === "pickup" ? (
                <Package className="h-4 w-4 text-primary" />
              ) : (
                <Truck className="h-4 w-4 text-primary" />
              )}
            </div>

            <span className="text-sm font-medium">{m.nombre}</span>
            <span className="text-sm font-semibold text-primary">
              {Number(m.precio) === 0 ? "Gratis" : `$${Number(m.precio).toFixed(2)}`}
            </span>

            
          </label>
        ))}
      </RadioGroup>
    </motion.div>
  );
}
