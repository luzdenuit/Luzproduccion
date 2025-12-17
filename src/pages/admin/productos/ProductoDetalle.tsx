import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Leaf, Sparkles, Flame } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function ProductoDetalle() {
  const { id } = useParams();
  const [producto, setProducto] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);

  const fetchProducto = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast.error("Producto no encontrado");
      return;
    }

    setProducto(data);

    // Productos relacionados por categoría
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
  }, [id]);

  const { addToCart } = useCart();
  const handleAddToCart = () => {
    if (!producto) return;
    addToCart(
      {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen_principal: producto.imagen_principal,
        fragancia: producto.fragancia,
      },
      quantity
    );
    toast.success("Producto agregado al carrito");
  };

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

  return (
    <div className="min-h-screen">
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
              className="relative aspect-square rounded-lg overflow-hidden"
            >
              <img
                src={producto.imagen_principal}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
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
                <p className="text-3xl font-bold text-foreground">
                  ${formatPrice(producto.precio)}
                </p>

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
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex items-start gap-3">
                  <Leaf className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <h3 className="font-semibold">100% Natural y Vegano</h3>
                    <p className="text-sm text-muted-foreground">
                      Cera de soja y aceites esenciales puros
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

          {/* Ritual Recomendado (puedes hacerlo dinámico si deseas) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-muted/20 texture-paper rounded-lg p-8 md:p-12 mb-20"
          >
            <h2 className="font-display text-3xl md:text-4xl mb-6">
              Ritual recomendado
            </h2>

            <p className="text-muted-foreground leading-relaxed prose prose-lg">
              Este espacio puede convertirse en contenido dinámico por categoría o fragancia.
              Por ahora, queda estático.
            </p>
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
