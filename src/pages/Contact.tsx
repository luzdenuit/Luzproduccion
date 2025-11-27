import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import CandleSuccess from "@/components/CandleSuccess";
import { Mail, Instagram, Phone } from "lucide-react";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">

          {/* TITULO PRINCIPAL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-6">
              Nos encantaría saber de ti
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ¿Tienes una pregunta, comentario o simplemente quieres conectar? Estamos aquí para ti.
            </p>
          </motion.div>

          {/* GRID PRINCIPAL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">

            {/* FORMULARIO / ANIMACIÓN */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card texture-paper rounded-lg p-8 shadow-lg min-h-[420px] flex items-center justify-center"
            >
              {!submitted ? (
                <div className="w-full">
                  <h2 className="font-display text-2xl text-foreground mb-6">
                    Envíanos un mensaje
                  </h2>

                  {/* Aquí se envía el formulario y dispara la animación */}
                  <ContactForm onSuccess={() => setSubmitted(true)} />
                </div>
              ) : (
                <CandleSuccess />
              )}
            </motion.div>

            {/* INFO DE CONTACTO (INTACTA) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-display text-2xl text-foreground mb-6">
                  Conecta con nosotros
                </h2>

                <div className="space-y-6">

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Correo electrónico
                      </h3>
                      <a
                        href="mailto:luzdenuit3@gmail.com"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        luzdenuit3@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Instagram
                      </h3>
                      <a
                        href="https://instagram.com/luzdenuitvelas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        @luzdenuitvelas
                      </a>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Whatsapp
                      </h3>
                      <p className="text-muted-foreground">
                        3196791189
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* HORARIO DE RESPUESTA */}
              <div className="bg-muted/20 texture-paper rounded-lg p-8">
                <h3 className="font-display text-xl text-foreground mb-4">
                  Horario de respuesta
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Respondemos todos los mensajes en un plazo de 24-48 horas. 
                  Si tienes una consulta urgente, contáctanos por Instagram para una respuesta más rápida.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
