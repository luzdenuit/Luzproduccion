import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import NewsletterForm from "@/components/NewsletterForm";
import { supabase } from "@/lib/supabaseClient";

interface BlogPost {
  id: string;
  titulo: string;
  slug: string;
  categoria: string | null;
  fecha_publicacion: string | null;
  excerpt: string | null;
  imagen_principal: string | null;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("fecha_publicacion", { ascending: false });

      if (error) {
        console.error(error);
        setPosts([]);
      } else {
        setPosts(data as BlogPost[]);
      }
      setLoading(false);
    };

    load();
  }, []);

  const categories = useMemo(() => {
    const base = ["Todos"];
    const cats = Array.from(
      new Set(posts.map((p) => p.categoria).filter(Boolean) as string[])
    );
    return [...base, ...cats];
  }, [posts]);

  const filtered = useMemo(() => {
    if (selectedCategory === "Todos") return posts;
    return posts.filter((p) => p.categoria === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-6">
              Historias que iluminan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Inspírate a crear espacios que se sientan bien
            </p>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full border-2 text-sm transition-colors ${
                  selectedCategory === category
                    ? "border-primary text-primary bg-primary/5"
                    : "border-border text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Blog Grid */}
          {loading ? (
            <p className="text-center text-muted-foreground">
              Cargando artículos...
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No hay publicaciones en esta categoría todavía.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {filtered.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 * index }}
                >
                  <BlogCard
                    image={post.imagen_principal || ""}
                    title={post.titulo}
                    category={post.categoria || ""}
                    date={
                      post.fecha_publicacion
                        ? new Date(post.fecha_publicacion).toLocaleDateString(
                            "es-ES",
                            { day: "2-digit", month: "long", year: "numeric" }
                          )
                        : ""
                    }
                    excerpt={post.excerpt || ""}
                    slug={post.slug}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter */}
        <NewsletterForm />
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
