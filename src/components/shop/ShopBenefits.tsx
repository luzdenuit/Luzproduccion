import { motion } from "framer-motion";
import { Package, CreditCard, Headphones } from "lucide-react";

export default function ShopBenefits() {
  return (
    <section className="py-12 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground mb-1">Envío Gratuito</h3>
              <p className="text-sm text-muted-foreground">En pedidos superiores a $50</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground mb-1">Pago Flexible</h3>
              <p className="text-sm text-muted-foreground">Múltiples opciones de pago seguro</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground mb-1">Soporte cercano</h3>
              <p className="text-sm text-muted-foreground">Estamos aquí para acompañar tu ritual.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}