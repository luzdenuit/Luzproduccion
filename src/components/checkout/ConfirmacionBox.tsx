import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock } from "lucide-react";
import { useCheckout } from "@/context/CheckoutContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/lib/utils";

export default function ConfirmacionBox() {
  const navigate = useNavigate();

  const {
    subtotal,
    iva,
    ivaRate,
    envio,
    cupon,
    total,
    cliente,
    direccion,
    procesarPedido,
    triggerCommit, // 👈 sincroniza formularios
  } = useCheckout();

  const [acepta, setAcepta] = useState(false);
  const [cargando, setCargando] = useState(false);

  const sub = typeof subtotal === "number" ? subtotal : Number(subtotal || 0);
  const costoEnvio = typeof envio?.costo === "number" ? envio.costo : Number(envio?.costo || 0);
  const descCupon = typeof cupon?.descuento === "number" ? cupon.descuento : Number(cupon?.descuento || 0);
  const codigoCupon = cupon?.codigo ?? null;
  const tot = typeof total === "number" ? total : Math.max(sub + iva - descCupon + costoEnvio, 0);

  // --------------------------------------------
  // VALIDACIONES
  // --------------------------------------------
  const validar = () => {
    if (!cliente.nombre || !cliente.apellido || !cliente.email) {
      toast.error("Faltan tus datos personales.");
      return false;
    }

    if (!direccion.calle || !direccion.cp || !direccion.ciudad) {
      toast.error("Completa tu dirección de envío.");
      return false;
    }

    if (!envio?.metodo_envio_id) {
      toast.error("Selecciona un método de envío.");
      return false;
    }

    return true;
  };

  // --------------------------------------------
  // CONFIRMAR PEDIDO
  // --------------------------------------------
  const handleConfirm = async () => {
    setCargando(true);

    // 🔥 sincroniza TODOS los inputs antes de validar
    await triggerCommit();

    if (!validar()) {
      setCargando(false);
      return;
    }

    try {
      await procesarPedido(navigate); // 👈 ahora sí envía navigate
    } finally {
      setCargando(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border shadow-sm rounded-2xl p-6 flex flex-col gap-6"
    >
      <div className="flex items-center gap-2">
        <h2 className="font-display text-2xl text-foreground">Confirmación</h2>
        <span className="text-sm text-muted-foreground">Revisa tu pedido antes de confirmar</span>
      </div>

      {/* Costos */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">${formatPrice(sub)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-semibold">
            {costoEnvio === 0 ? "Gratis" : `$${formatPrice(costoEnvio)}`}
          </span>
        </div>
        {/* IVA dinámico */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">IVA ({Math.round((ivaRate || 0) * 100)}%)</span>
          <span className="font-semibold">${formatPrice(iva)}</span>
        </div>
        {descCupon > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Cupón aplicado ({codigoCupon})</span>
            <span>- ${formatPrice(descCupon)}</span>
          </div>
        )}

        <div className="border-t pt-3 mt-3 flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-primary">${formatPrice(tot)}</span>
        </div>
      </div>

      {/* Confirmación legal */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="acepto"
          checked={acepta}
          onCheckedChange={(v) => setAcepta(Boolean(v))}
        />
        <label htmlFor="acepto" className="text-sm leading-tight">
          Confirmo que he revisado mi pedido y acepto los{" "}
          <span className="text-primary underline cursor-pointer">
            términos y condiciones
          </span>{" "}
          y la{" "}
          <span className="text-primary underline cursor-pointer">
            política de privacidad
          </span>
          .
        </label>
      </div>

      {/* Seguridad */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-4 w-4" />
        Pago 100% seguro y cifrado
      </div>

      <Button
        disabled={!acepta || cargando || !envio?.metodo_envio_id}
        onClick={handleConfirm}
        className="w-full bg-primary hover:bg-primary/90 text-white"
        size="lg"
      >
        {cargando ? "Procesando..." : "Realizar pedido"}
      </Button>
    </motion.div>
  );
}
