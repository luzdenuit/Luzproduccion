import { Link } from "react-router-dom";
import { Instagram, Facebook, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-display text-2xl text-primary mb-4">Luz de Nuit</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Velas artesanales hechas con intención y cuidado. Cada aroma transforma tu espacio, cada llama acompaña tu día.
            </p>
            <div className="flex items-center space-x-4 mt-6">
              <a
                href="https://www.instagram.com/luzdenuitvelas/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61572037095512"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Pinterest"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/+573196791189?text=Hola,%20quiero%20más%20información!"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Phone  className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4">Explorar</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/coleccion" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Colecciones
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <FooterPolicies />
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Luz de Nuit. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

function FooterPolicies() {
  const [items, setItems] = useState<Array<{ id: string; titulo: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("politicas")
        .select("id,titulo,slug,activo")
        .eq("activo", true)
        .order("titulo", { ascending: true });
      setItems((data || []).map((d: any) => ({ id: d.id, titulo: d.titulo, slug: d.slug })));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <h4 className="font-display text-lg text-foreground mb-4">Información</h4>
      <ul className="space-y-2">
        <li>
          <Link to="/contacto" className="text-muted-foreground hover:text-primary transition-colors text-sm">
            Contacto
          </Link>
        </li>
        {loading ? (
          <li className="text-muted-foreground text-sm">Cargando políticas…</li>
        ) : items.length === 0 ? (
          <li className="text-muted-foreground text-sm">No hay políticas disponibles</li>
        ) : (
          items.map((p) => (
            <li key={p.id}>
              <Link to={`/politicas/${p.slug}`} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {p.titulo}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
