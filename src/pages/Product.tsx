import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import FavoriteButton from "@/components/FavoriteButton";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductoGallery from "@/components/ProductoGallery";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Leaf, Sparkles, Flame, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

// ⭐ NUEVOS COMPONENTES
import ReviewForm from "@/components/ReviewForm";
import RatingStars from "@/components/RatingStars";

export default function ProductoDetalle() {
  const { id } = useParams();
  const [producto, setProducto] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);
  const [descuentoPct, setDescuentoPct] = useState<number | null>(null);
  const [precioConDescuento, setPrecioConDescuento] = useState<number | null>(null);

  // ⭐ RESEÑAS
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [userReview, setUserReview] = useState<any>(null);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("product_reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        user_id,
        usuarios_perfil!inner (
          nombre,
          apellido
        )
      `)
      .eq("product_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setReviews(data || []);

    if (data && data.length > 0) {
      const avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
      setAverageRating(avg);
    } else {
      setAverageRating(null);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const myReview = data?.find((r) => r.user_id === user.id);
      setUserReview(myReview || null);
    }
  };

  const fetchProducto = async () => {
    const { data, error } = await supabase
       .from("productos")
  .select(`
    *,
    ritual:rituales (
      id,
      nombre,
      descripcion
    )
  `)
  .eq("id", id)
  .maybeSingle();

    if (error || !data) {
      toast.error("Producto no encontrado");
      return;
    }

    setProducto(data);

    if (data.categoria_id) {
      const { data: relatedData } = await supabase
        .from("productos")
        .select("*")
        .eq("categoria_id", data.categoria_id)
        .neq("id", id)
        .limit(4);

      setRelated(relatedData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducto();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    const channel = supabase
      .channel(`product_reviews_realtime_${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_reviews', filter: `product_id=eq.${id}` },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [id]);

  const { addToCart } = useCart();
  const handleAddToCart = () => {
    if (!producto) return;
    addToCart(
      {
        id: producto.id,
        nombre: producto.nombre,
        precio: precioConDescuento ?? producto.precio,
        precio_original: producto.precio,
        descuento_pct: descuentoPct ?? null,
        imagen_principal: producto.imagen_principal,
        fragancia: producto.fragancia,
      },
      quantity
    );
    toast.success("Producto agregado al carrito");
  };

  useEffect(() => {
    const loadDescuento = async () => {
      if (!id || !producto) return;
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
          const p = Number(producto.precio) * (1 - pct / 100);
          setPrecioConDescuento(p);
          return;
        }
      }
      setDescuentoPct(null);
      setPrecioConDescuento(null);
    };
    loadDescuento();
  }, [id, producto]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando producto...</p>
      </div>
    );

  if (!producto)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Producto no encontrado</p>
      </div>
    );

  const imagenes = [
    producto.imagen_principal,
    ...(producto.galeria_imagenes ?? []),
  ];

  return (
    <div className="pt-24 min-h-screen">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Product Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-lg overflow-hidden relative"
            >
              <ProductoGallery imagenes={imagenes} />
              {descuentoPct ? (
                <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  -{descuentoPct}%
                </div>
              ) : null}
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center"
            >
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                {producto.nombre}
              </h1>

              {/* ⭐ PROMEDIO */}
              {averageRating ? (
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-6 h-6 text-[hsl(var(--primary))] fill-[hsl(var(--primary))]" />
                  <span className="text-xl font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviews.length} reseñas)</span>
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">Sin reseñas aún</p>
              )}
                
              {producto.fragancia && (
                <p className="text-xl text-primary mb-6">{producto.fragancia}</p>
              )}

              {/* Description */}
              <div className="prose prose-lg mb-6">
                <p className="text-muted-foreground leading-relaxed">
                  {producto.descripcion}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                {precioConDescuento ? (
                  <div className="flex items-end gap-3">
                    <span className="text-2xl text-muted-foreground line-through">${producto.precio.toFixed(2)}</span>
                    <span className="text-3xl font-bold text-foreground">${precioConDescuento.toFixed(2)}</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-foreground">
                    ${producto.precio.toFixed(2)}
                  </p>
                )}

                <p className="text-sm text-muted-foreground">
                  Tamaño: {producto.peso_gramos || "—"} g · Duración:{" "}
                  {producto.duracion_horas || "—"} horas
                </p>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-muted transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Agregar al carrito
                </Button>
                <FavoriteButton productoId={producto.id} />
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex items-start gap-3">
                  <Leaf className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <h3 className="font-semibold">Ceras y parafinas</h3>
                    <p className="text-sm text-muted-foreground">
                      Ingredientes de calida
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <h3 className="font-semibold">Hecho a Mano</h3>
                    <p className="text-sm text-muted-foreground">
                      Cada vela es única y creada con intención
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Flame className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <h3 className="font-semibold">Mecha de Algodón</h3>
                    <p className="text-sm text-muted-foreground">
                      Sin plomo, combustión limpia
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

         {/* Ritual Recomendado */}
{producto.ritual && (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="bg-amber-50/40 border border-amber-200 rounded-2xl p-8 md:p-12 mb-20 shadow-sm"
  >
    <h2 className="font-display text-3xl md:text-4xl mb-4 text-amber-800 flex items-center gap-2">
      🔮 {producto.ritual.nombre}
    </h2>

    <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
      {producto.ritual.descripcion}
    </p>
  </motion.section>
)}


          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full mb-20"
          >
            <h2 className="font-display text-3xl md:text-4xl mb-6">
              Opiniones de clientes
            </h2>

            {/* Lista */}
            <div className="mt-6 space-y-6">
              {reviews.filter((r) => Boolean(r.comment)).map((r) => (
                <div key={r.id} className="p-5 border border-border rounded-xl bg-card shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <RatingStars rating={r.rating} size={22} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="font-semibold">
                    {r.usuarios_perfil.nombre} {r.usuarios_perfil.apellido}
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    {r.comment}
                  </p>
                </div>

              ))}

              {reviews.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Sé el primero en dejar una reseña ✨
                </p>
              )}
            </div>

            {/* Form */}
            <div className="mt-10">
              <ReviewForm
                productId={producto.id}
                existingReview={userReview}
                onDone={fetchReviews}
              />
            </div>
          </motion.section>

          {/* Related */}
          {related.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl md:text-4xl text-center mb-8">
                Puede que también te guste
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {related.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.nombre}
                    fragrance={p.fragancia}
                    price={p.precio}
                    image={p.imagen_principal}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
