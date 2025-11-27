import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CandleSuccess from "@/components/CandleSuccess";

const EDGE_URL = "https://fnsxwtmuoxyxhptzefsy.supabase.co/functions/v1/newsletter";

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // 🔥 NUEVO

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      // 1️⃣ Verificar usuario existente
      const { data: usuarioExistente } = await supabase
        .from("usuarios_perfil")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (usuarioExistente) {
        toast.info("Este correo ya pertenece a un usuario registrado 💛");
        setEmail("");
        setLoading(false);
        return;
      }

      // 2️⃣ Verificar si ya está suscrito
      const { data: subsExistente } = await supabase
        .from("newsletter_subscribers")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (subsExistente) {
        toast.info("Este correo ya está suscrito a nuestras noticias ✨");
        setEmail("");
        setLoading(false);
        return;
      }

      // 3️⃣ Insertar
      const response = await fetch(EDGE_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email,
          source: window.location.href,
          user_agent: navigator.userAgent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(result);
        toast.error("Hubo un problema al registrarte 💔");
        setLoading(false);
        return;
      }

      toast.success("¡Gracias por unirte a nuestra tribu luminosa! ✨");
      setEmail("");     

      // 🔥 MUESTRA LA ANIMACIÓN
      setSubmitted(true);

    } catch (error) {
      console.error(error);
      toast.error("Error inesperado al procesar tu suscripción.");
    }

    setLoading(false);
  };

  return (
    <section className="py-20 texture-paper bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">

          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Únete a nuestra tribu luminosa
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Recibe inspiración, rituales y ofertas especiales en tu correo
          </p>

          {/* 🔥 SI YA SE SUSCRIBIÓ → MUESTRA ANIMACIÓN */}
          {submitted ? (
            <div className="flex justify-center">
              <CandleSuccess />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="flex-1 bg-background"
              />

              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Enviando..." : "Suscribirme"}
              </Button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
};

export default NewsletterForm;
