import { motion } from "framer-motion";
import { Check, Clock } from "lucide-react";

const estados = [
  { key: "pendiente_pago", label: "Pendiente de pago" },
  { key: "en_revision", label: "En revisión" },
  { key: "pagado", label: "Pagado" },
  { key: "enviado", label: "Enviado" },
  { key: "finalizado", label: "Finalizado" },
  { key: "cancelado", label: "Cancelado" },
];

export default function OrderStatusTimeline({ estadoActual }: { estadoActual: string }) {
  // posición del estado actual
  const indexActual = estados.findIndex((e) => e.key === estadoActual);

  return (
    <div className="py-6 px-4 rounded-xl border bg-white/60 shadow-sm">
      <h3 className="text-xl font-display text-amber-900 mb-6">
        Estado del Pedido
      </h3>

      <div className="relative border-l-2 border-amber-300 pl-6 space-y-8">
        {estados.map((estado, index) => {
          const completado = index < indexActual;
          const actual = index === indexActual;

          return (
            <motion.div
              key={estado.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              {/* ICONO */}
              <span
                className={`absolute -left-4 flex items-center justify-center w-6 h-6 rounded-full border 
                  ${
                    completado
                      ? "bg-green-600 text-white border-green-600"
                      : actual
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-muted-foreground border-amber-300"
                  }
                `}
              >
                {completado ? <Check size={14} /> : actual ? <Clock size={14} /> : ""}
              </span>

              {/* LABEL */}
              <div>
                <p
                  className={`font-medium ${
                    actual ? "text-amber-900" : "text-muted-foreground"
                  }`}
                >
                  {estado.label}
                </p>

                {actual && (
                  <p className="text-xs text-amber-700 mt-1 font-semibold">
                    ✨ Estado actual
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
