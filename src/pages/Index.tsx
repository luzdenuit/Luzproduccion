import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import BlogCard from "@/components/BlogCard";
import NewsletterForm from "@/components/NewsletterForm";

import { Sparkles, Leaf, Heart } from "lucide-react";

const Index = () => {
  // ⭐ Productos destacados
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // ⭐ Blog posts
  const [blogPosts, setBlogPosts] = useState([]);

  // -------- Cargar productos --------
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre, precio, fragancia, imagen_principal")
        .eq("activa", true)
        .limit(3);

      if (error) {
        console.error("Error cargando productos:", error);
        return;
      }

      setFeaturedProducts(data);
    };

    loadProducts();
  }, []);

  // -------- Cargar posts del blog --------
  useEffect(() => {
    const loadBlogPosts = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("titulo, slug, categoria, fecha_publicacion, excerpt, imagen_principal")
        .order("fecha_publicacion", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error cargando posts:", error);
        return;
      }

      setBlogPosts(data);
    };

    loadBlogPosts();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Featured Products */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Productos destacados
          </h2>
          <p className="text-muted-foreground text-lg">
            Encendé tu momento favorito
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.length === 0 ? (
            <p className="col-span-3 text-center text-muted-foreground">
              Cargando productos...
            </p>
          ) : (
            featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard
                  id={product.id}
                  image={product.imagen_principal}
                  name={product.nombre}
                  fragrance={product.fragancia}
                  price={product.precio}
                />
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Ritual & Purpose Section */}
      <section className="py-20 bg-muted/20 texture-paper">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                Tu momento comienza con una llama
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-12">
                Cada aroma cuenta una historia. Cada llama enciende un momento
                de conexión contigo mismo. Nuestras velas están hechas a mano
                con ingredientes naturales y la intención de crear ambientes cálidos y especiales en tu día a día.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                { icon: Sparkles, title: "Hecho a mano", text: "Con calma y propósito" },
                { icon: Leaf, title: "Natural y vegano", text: "Ingredientes puros" },
                { icon: Heart, title: "Energía con intención", text: "Creadas con amor" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Historias que iluminan
          </h2>
          <p className="text-muted-foreground text-lg">
            Inspírate a crear espacios que se sientan bien
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.length === 0 ? (
            <p className="col-span-3 text-center text-muted-foreground">
              Cargando artículos...
            </p>
          ) : (
            blogPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <BlogCard
                  image={post.imagen_principal}
                  title={post.titulo}
                  category={post.categoria}
                  date={new Date(post.fecha_publicacion).toLocaleDateString(
                    "es-ES",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                  excerpt={post.excerpt}
                  slug={post.slug}
                />
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterForm />

      <Footer />
    </div>
  );
};

export default Index;
