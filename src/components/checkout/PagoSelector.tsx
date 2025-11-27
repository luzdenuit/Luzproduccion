import { motion } from "framer-motion";
import { useCheckout } from "@/context/CheckoutContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Wallet, Landmark } from "lucide-react";

export default function PagoSelector() {
  const { pago, setPago } = useCheckout();

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border shadow rounded-2xl p-6 space-y-4"
    >
      <h2 className="font-display text-2xl">Método de Pago</h2>

      <RadioGroup
        value={pago ?? ""}
        onValueChange={(v) => setPago(v as any)}
        className="space-y-4"
      >
        {/* EFECTIVO */}
        <label
          htmlFor="efectivo"
          className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer ${
            pago === "efectivo"
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/30"
          }`}
        >
          <RadioGroupItem id="efectivo" value="efectivo" />
          <Wallet className="h-6 w-6 text-primary" />
          <span className="font-medium">Pagar en efectivo</span>
        </label>

        {/* TRANSFERENCIA */}
        <label
          htmlFor="transferencia"
          className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer ${
            pago === "transferencia"
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/30"
          }`}
        >
          <RadioGroupItem id="transferencia" value="transferencia" />
          <Landmark className="h-6 w-6 text-primary" />
          <span className="font-medium">Transferencia bancaria</span>
        </label>
      </RadioGroup>
    </motion.div>
  );
}
