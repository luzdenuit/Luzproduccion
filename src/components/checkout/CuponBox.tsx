import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCheckout } from "@/context/CheckoutContext";

export default function CuponBox({
  subtotal,
  base,
  userId,
  onApply,
}: {
  subtotal: number;
  base?: number;
  userId?: string;
  onApply: (data: { id: string; codigo: string; descuento: number }) => void;
}) {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const { cliente } = useCheckout();

  const validarCupon = async () => {
    if (loading || applied) return;
    if (!codigo.trim()) return toast.error("Ingresa un código");

    setLoading(true);

    // Buscar cupón por código
    const { data: cupon, error } = await supabase
      .from("cupones")
      .select("*")
      .eq("codigo", codigo.trim().toUpperCase())
      .single();

    setLoading(false);

    if (error || !cupon) return toast.error("Cupón no válido ❌");

    // ⛔ Cupón activo
    if (!cupon.activo) return toast.error("Este cupón no está activo");

    const ahora = new Date();

    // ⛔ Fecha inicio
    if (cupon.fecha_inicio && ahora < new Date(cupon.fecha_inicio))
      return toast.error("Este cupón aún no está disponible");

    // ⛔ Fecha fin
    if (cupon.fecha_fin && ahora > new Date(cupon.fecha_fin))
      return toast.error("Este cupón ya expiró ⏳");

    // ⛔ Máximo de usos globales (contado desde usos_cupones para evitar carreras)
    const { count: globalCount } = await supabase
      .from("usos_cupones")
      .select("*", { count: "exact", head: true })
      .eq("cupon_id", cupon.id);

    if (cupon.max_usos > 0 && (globalCount ?? 0) >= cupon.max_usos)
      return toast.error("Este cupón ya alcanzó su límite de usos");

    // ⛔ Máximo de usos por usuario (cuenta desde pedidos)
    const limiteUsuario = cupon.max_usos_por_usuario ?? 0;
    if (limiteUsuario > 0) {
      const email = cliente?.email || null;
      if (!userId && !email) {
        return toast.error("Ingresa tu email o inicia sesión para usar este cupón");
      }
      let pedidoQuery = supabase
        .from("pedidos")
        .select("*", { count: "exact", head: true })
        .eq("cupon_id", cupon.id);
      if (userId) {
        pedidoQuery = pedidoQuery.eq("usuario_id", userId);
      } else if (email) {
        pedidoQuery = pedidoQuery.eq("email", email);
      }
      const { count: used } = await pedidoQuery;
      if ((used ?? 0) >= limiteUsuario) {
        return toast.error("Ya has usado este cupón el máximo permitido");
      }
    }

    // 🎁 Calcular descuento
    let descuento = 0;
    const amountBase = typeof base === "number" ? base : subtotal;

    if (cupon.tipo === "porcentaje") {
      descuento = amountBase * (cupon.valor / 100);
    } else if (cupon.tipo === "fijo") {
      descuento = cupon.valor;
    }

    if (descuento < 0) descuento = 0;

    // Registrar uso por usuario/global
    if (userId) {
      await supabase.from("usos_cupones").insert({
        usuario_id: userId,
        cupon_id: cupon.id,
      });
    } else {
      await supabase.from("usos_cupones").insert({
        usuario_id: null,
        cupon_id: cupon.id,
      });
    }

    toast.success(`Cupón aplicado: ${cupon.codigo} 🎉`);

    // ⬇⬇ NUEVO — devolvemos el id, código y descuento
    onApply({
      id: cupon.id,
      codigo: cupon.codigo,
      descuento,
    });

    setApplied(true);
  };

  return (
    <div className="p-6 bg-card border border-border shadow-sm rounded-2xl flex flex-col gap-4">
      <h2 className="font-display text-xl text-foreground">¿Tienes un cupón?</h2>

      <div className="flex gap-2">
        <Input
          placeholder="INGRESA TU CÓDIGO"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="uppercase font-semibold"
        />

        <Button
          className="bg-primary hover:bg-primary/90"
          disabled={loading || applied}
          onClick={validarCupon}
        >
          Aplicar
        </Button>
      </div>
    </div>
  );
}
