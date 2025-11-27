import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star } from "lucide-react";
import { useFavoritos } from "@/hooks/useFavoritos";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface ProductCardProps {
  image: string;
  name: string;
  fragrance: string;
  price: number;
  id?: string;
  hideFavoriteButton?: boolean;
}

const ProductCard = ({ image, name, fragrance, price, id, hideFavoriteButton }: ProductCardProps) => {
  const { favoritos, addFavorito, removeFavorito, isFavorito } = useFavoritos();
  const [favorito, setFavorito] = useState(false);

  const [rating, setRating] = useState<number | null>(null);
  const [reviews, setReviews] = useState<number>(0);
  const [descuentoPct, setDescuentoPct] = useState<number | null>(null);
  const [precioConDescuento, setPrecioConDescuento] = useState<number | null>(null);

  // ⭐ Obtener rating promedio y número de reseñas
  useEffect(() => {
    const fetchRatings = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("product_reviews")
        .select("rating")
        .eq("product_id", id);

      if (error) return console.error(error);

      if (data.length === 0) {
        setRating(null);
        setReviews(0);
        return;
      }

      const totalReviews = data.length;
      const average =
        data.reduce((acc, r) => acc + r.rating, 0) / totalReviews;

      setRating(average);
      setReviews(totalReviews);
    };

    fetchRatings();
  }, [id]);

  // ❤️ Detectar si el producto YA ES favorito
  useEffect(() => {
    if (!id) return;
    setFavorito(isFavorito(id));
  }, [favoritos, id]);

  // ❤️ Toggle favorito
  const toggleFavorito = async (e: any) => {
    e.preventDefault();

    if (!id) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Debes iniciar sesión");

    if (favorito) {
      await removeFavorito(id, user.id);
      setFavorito(false);
      toast("Quitado de favoritos 🤍");
    } else {
      await addFavorito(id, user.id);
      setFavorito(true);
      toast.success("Agregado a favoritos ❤️");
    }
  };

  useEffect(() => {
    const loadDescuento = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("descuentos_productos")
        .select("*")
        .eq("producto_id", id)
        .eq("activo", true)
        .order("porcentaje", { ascending: false });
      if (error) return;
      const now = Date.now();
      const activo = (data || []).find((d: any) => {
        const ini = d.fecha_inicio ? new Date(d.fecha_inicio).getTime() : null;
        const fin = d.fecha_fin ? new Date(d.fecha_fin).getTime() : null;
        const okIni = ini === null || ini <= now;
        const okFin = fin === null || fin >= now;
        return okIni && okFin;
      });
      if (activo && typeof activo.porcentaje === "number") {
        const pct = Number(activo.porcentaje);
        if (!Number.isNaN(pct) && pct > 0) {
          setDescuentoPct(pct);
          const p = Number(price) * (1 - pct / 100);
          setPrecioConDescuento(p);
          return;
        }
      }
      setDescuentoPct(null);
      setPrecioConDescuento(null);
    };
    loadDescuento();
  }, [id, price]);

  return (
    <Link to={`/producto/${id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="group relative"
      >
        {hideFavoriteButton ? null : (
          <button
            onClick={toggleFavorito}
            className="absolute top-3 right-3 z-20 bg-background/70 border border-border backdrop-blur p-2 rounded-full hover:bg-muted transition"
          >
            <Heart
              className={`w-5 h-5 transition ${
                favorito ? "text-rose-500 fill-rose-500" : "text-gray-400"
              }`}
            />
          </button>
        )}

        <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {descuentoPct ? (
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                -{descuentoPct}%
              </div>
            ) : null}
          </div>

          <CardContent className="p-4">
            <h3 className="font-display text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
              {name}
            </h3>

            <p className="text-muted-foreground text-xs mb-2">{fragrance}</p>

            {/* ⭐ RATING + REVIEWS */}
            {reviews > 0 ? (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {rating?.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({reviews} reseñas)
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-2">Sin reseñas aún</p>
            )}

            {precioConDescuento ? (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground line-through">${price.toFixed(2)}</span>
                <span className="text-primary font-semibold">${precioConDescuento.toFixed(2)}</span>
              </div>
            ) : (
              <p className="text-primary font-semibold">${price.toFixed(2)}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
