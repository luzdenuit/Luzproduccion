import { motion } from "framer-motion";

type Props = {
  title: string;
  subtitle: string;
};

export default function ShopHero({ title, subtitle }: Props) {
  return (
    <section className="pt-32 pb-12 bg-gradient-to-b from-muted/20 to-background texture-paper">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}