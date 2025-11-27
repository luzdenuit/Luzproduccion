import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";


export default function Favoritos() {
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
const navigate = useNavigate();

  const { addToCart } = useCart();

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUserId(data.user.id);
    else setLoading(false);
  };

  const fetchFavoritos = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("favoritos")
      .select("id, producto:productos(*)")
      .eq("usuario_id", userId);

    if (error) {
      toast.error("Error cargando favoritos");
    } else {
      setFavoritos(data);
    }

    setLoading(false);
  };

  const quitarFavorito = async (favoritoId: string) => {
    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("id", favoritoId);

    if (!error) {
      setFavoritos((prev) => prev.filter((f) => f.id !== favoritoId));
    }
  };

  /** ⭐ MOVER TODOS AL CARRITO */
  const moverTodosAlCarrito = async () => {
    if (favoritos.length === 0) return;

    // 1️⃣ Agregar todos al carrito local
    favoritos.forEach((f) => {
      addToCart({
        id: f.producto.id,
        nombre: f.producto.nombre,
        precio: f.producto.precio,
        imagen_principal: f.producto.imagen_principal,
        fragancia: f.producto.fragancia,
      });
    });

    // 2️⃣ Eliminar todos los favoritos del usuario en supabase
    await supabase.from("favoritos").delete().eq("usuario_id", userId);

    // 3️⃣ Limpiar estado local
    setFavoritos([]);

    toast.success("Todos los favoritos fueron movidos al carrito 🛒");
     setTimeout(() => {
    navigate("/carrito"); // Cambia aquí si tu ruta es distinta
  }, 800);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) fetchFavoritos();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Cargando favoritos...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-24 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <Heart className="w-16 h-16 mx-auto opacity-30 mb-4" />
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
              Inicia sesión para ver tus favoritos
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Conecta tu cuenta para guardar y consultar tus productos favoritos.
            </p>
            <Link to="/login">
              <Button className="bg-primary hover:bg-primary/90">Ir a iniciar sesión</Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-24 container mx-auto px-4">

        {/* 🔥 Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">
            Tus Favoritos
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Guarda lo que amas y vuelve cuando quieras ✨
          </p>
        </motion.div>

        {/* ⭐ BOTÓN — MOVER TODO AL CARRITO */}
        {favoritos.length > 0 && (
          <div className="flex justify-end mb-10">
            <button
              onClick={moverTodosAlCarrito}
              className="
                px-6 py-3 rounded-xl shadow 
                bg-primary text-primary-foreground
                hover:bg-primary/90 transition-all
                font-medium tracking-wide
              "
            >
              Mover todos al carrito 🛒
            </button>
          </div>
        )}

        {/* 🧡 Lista vacía */}
        {favoritos.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Heart className="w-16 h-16 mx-auto opacity-30 mb-4" />
            <p className="text-xl">Aún no tienes favoritos</p>
            <p className="mt-1 text-sm">Explora y encuentra tu próxima esencia.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {favoritos.map((f) => (
              <motion.div
                key={f.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="relative group"
              >
                {/* ❌ Eliminar de favoritos */}
                <button
                  onClick={() => quitarFavorito(f.id)}
                  className="
                    absolute top-3 right-3 z-10
                    p-2 rounded-full shadow-sm border border-border
                    bg-card/90 backdrop-blur
                    opacity-0 group-hover:opacity-100
                    transition-all
                    hover:bg-rose-100/70
                  "
                >
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                </button>

                <ProductCard
                  id={f.producto.id}
                  name={f.producto.nombre}
                  price={f.producto.precio}
                  fragrance={f.producto.fragancia}
                  image={f.producto.imagen_principal}
                  hideFavoriteButton
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
