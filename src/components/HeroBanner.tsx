import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-candles.jpg";

const HeroBanner = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl"
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-6 leading-tight">
            Ilumina tu vida 
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Velas artesanales hechas con alma y propósito
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/coleccion">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                Explorar colección
              </Button>
            </Link>
            <Link to="/nosotros">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2">
                Conoce la historia
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      {/* Scroll Indicator (mobile hand icon) */}
<motion.div
  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 md:hidden"
  animate={{ y: [0, 14, 0] }}
  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
>
<svg
    width="34"
    height="34"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-foreground/40 rotate-180"
  >
    {/* dedo índice (ahora el largo) */}
    <path d="M15 3v10" />

    {/* dedo medio corto (para evitar el gesto ofensivo) */}
    <path d="M12 7v6" />

    {/* dedo anular corto */}
    <path d="M9 8v5" />

    {/* palma */}
    <path d="M6 12v2c0 4 2 6 6 6s6-2 6-6v-2" />
  </svg>
</motion.div>

{/* Scroll Indicator (desktop mouse icon) */}
<motion.div
  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden md:block"
  animate={{ y: [0, 10, 0] }}
  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
>
  <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
    <div className="w-1 h-3 bg-foreground/30 rounded-full" />
  </div>
</motion.div>

    </section>
  );
};

export default HeroBanner;
