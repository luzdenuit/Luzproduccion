import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import workshopImage from "@/assets/about-workshop.jpg";
import { 
  Sparkles, Leaf, Heart, 
  Flame, Stars, Sun 
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className=" pb-20">
        
        {/* HERO (se mantiene tal cual) */}
        <section className="relative h-[65vh] md:h-[60vh] mb-20 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-top md:bg-center"
            style={{ backgroundImage: `url(${workshopImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
          <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl"
            >
              <h1 className="font-display text-5xl md:text-6xl text-foreground mb-6">
                Hechas con alma y propósito
              </h1>
              <p className="text-xl text-muted-foreground">
                Cada vela es una invitación a la calma
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4">

          {/* LOGO GRANDE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-16"
          >
            <img
              src="https://fnsxwtmuoxyxhptzefsy.supabase.co/storage/v1/object/public/public-assets/Logo_nuit.svg"
              alt="Luz de Nuit Logo"
              className="w-56 md:w-64 opacity-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
            />
          </motion.div>

          {/* ===================== BENTO GRID – HISTORIA + MISIÓN + VISIÓN ===================== */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24"
          >
            {/* HISTORIA (2 columnas) */}
            <div className="md:col-span-2 bg-muted/10 texture-paper p-10 rounded-xl shadow-sm">
              <h2 className="font-display text-4xl text-foreground mb-6">
                Nuestra historia
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Luz de Nuit nació en noches tranquilas donde la luz suave de una vela iluminaba 
                pensamientos y emociones. Lo que comenzó como un gesto personal se transformó 
                en un oficio: dar forma a objetos que acompañan momentos íntimos.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                En nuestro pequeño taller trabajamos con cera vegetal, fragancias naturales y 
                mechas de algodón. Cada vela es un ritual: calma, intención y presencia.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Diseñamos aromas para tus rituales diarios: despertar, crear, agradecer, 
                descansar y volver a ti.
              </p>
            </div>

            {/* MISIÓN */}
            <div className="bg-muted/10 texture-paper p-10 rounded-xl shadow-sm flex flex-col justify-center">
              <h3 className="font-display text-3xl text-foreground mb-4">Misión</h3>
              <p className="text-muted-foreground leading-relaxed">
                Iluminar momentos significativos con velas artesanales que inspiran bienestar, 
                calma y conexión interior, hechas con ingredientes naturales y propósito.
              </p>
            </div>

            {/* VISIÓN */}
            <div className="bg-muted/10 texture-paper p-10 rounded-xl shadow-sm flex flex-col justify-center md:col-start-3">
              <h3 className="font-display text-3xl text-foreground mb-4">Visión</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ser un refugio sensorial: una experiencia que trascienda el objeto y invite a vivir 
                con intención, belleza y sostenibilidad.
              </p>
            </div>
          </motion.section>

          {/* ===================== FILOSOFÍA (BENTO GRID 3 CARDS) ===================== */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-12 text-center">
              Nuestra filosofía
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "Hecho a mano",
                  description:
                    "Cada vela es creada con cuidado, tiempo y amor por lo artesanal.",
                },
                {
                  icon: Leaf,
                  title: "Natural y vegano",
                  description:
                    "Ingredientes de origen vegetal, respetuosos con tu espacio y la tierra.",
                },
                {
                  icon: Heart,
                  title: "Intención pura",
                  description:
                    "Cada pieza nace para acompañar tus rituales y emociones.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-muted/20 texture-paper rounded-xl p-8 text-center shadow-sm"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ===================== TIMELINE (MEJORADO) ===================== */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-28 max-w-3xl mx-auto"
          >
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-12 text-center">
              Nuestro camino
            </h2>

            <div className="relative pl-10 border-l border-border space-y-14">

              {[
                { year: "2019", icon: Flame, text: "Primera vela creada y el inicio de nuestra historia." },
                { year: "2020", icon: Sun, text: "Se abre nuestro primer taller artesanal." },
                { year: "2021", icon: Leaf, text: "Compromiso total con ingredientes naturales y veganos." },
                { year: "2022", icon: Sparkles, text: "Nace oficialmente la identidad ‘Luz de Nuit’." },
                { year: "2023", icon: Stars, text: "Lanzamos colecciones rituales diseñadas para el alma." },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  {/* Icono separado de la fecha */}
                  <div className="absolute -left-10 top-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shadow-sm">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>

                  <h4 className="font-display text-2xl text-foreground mb-1">
                    {item.year}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              ))}

            </div>
          </motion.section>

          {/* CTA FINAL (se mantiene igual) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center py-16 bg-muted/20 texture-paper rounded-lg"
          >
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
              Encuentra la luz que habita en ti
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Explora nuestra colección de velas artesanales y comienza tu propio ritual
            </p>
            <Link to="/coleccion">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Descubre nuestras velas
              </Button>
            </Link>
          </motion.section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
