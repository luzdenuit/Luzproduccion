import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

export default function Politica() {
  const { slug } = useParams();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement | null>(null);
  


  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("politicas")
        .select("*")
        .eq("slug", slug)
        .eq("activo", true)
        .maybeSingle();

      if (error) {
        toast.error("No se pudo cargar la política");
      }
      setItem(data || null);
      setLoading(false);
    };
    load();
  }, [slug]);

  

  return (
    <div className="pt-16 min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 container mx-auto px-4 pb-24 max-w-7xl">
        {loading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : !item ? (
          <div className="text-center py-20">
            <h1 className="font-display text-3xl mb-3">Política no encontrada</h1>
            <p className="text-muted-foreground">Verifica el enlace o vuelve más tarde.</p>
          </div>
        ) : (
          <article>
           
              <h1 className="font-display text-4xl md:text-5xl mb-4 text-foreground">{item.titulo}</h1>
              <div className="text-muted-foreground text-sm mb-8 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>Actualizado {item.actualizado_en ? new Date(item.actualizado_en).toLocaleDateString() : "—"}</span>
              </div>
            <div
              ref={contentRef}
              className="prose prose-lg max-w-none bg-background text-foreground dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-a:text-primary prose-a:underline hover:prose-a:no-underline prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-foreground prose-li:marker:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: item.contenido }}
            />
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}