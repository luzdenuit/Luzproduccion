import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface BlogPostData {
  id: string;
  titulo: string;
  slug: string;
  categoria: string | null;
  fecha_publicacion: string | null;
  excerpt: string | null;
  contenido: string | null;
  imagen_principal: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<BlogPostData[]>([]);

  // --------------------------------------------
  // CARGAR POST PRINCIPAL
  // --------------------------------------------
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error(error);
        setPost(null);
      } else {
        setPost(data);
        loadRelatedPosts(data.categoria, data.id);
      }

      setLoading(false);
    };

    if (slug) fetchPost();
  }, [slug]);

  // --------------------------------------------
  // CARGAR POSTS RELACIONADOS
  // --------------------------------------------
  const loadRelatedPosts = async (categoria: string | null, id: string) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, titulo, slug")
      .neq("id", id)
      .eq("categoria", categoria)
      .limit(3);

    if (data) setRelated(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-20 container mx-auto px-4">
          <p className="text-muted-foreground">Cargando artículo...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-20 container mx-auto px-4">
          <p className="text-muted-foreground">Este artículo no existe.</p>
          <Link to="/blog">
            <Button variant="outline" className="mt-6">Volver al blog</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate =
    post.fecha_publicacion &&
    new Date(post.fecha_publicacion).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-20">
        <article className="container mx-auto px-4 max-w-4xl">
          
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link to="/blog">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al blog
              </Button>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {post.categoria && (
              <Badge className="mb-4 bg-primary text-primary-foreground">
                {post.categoria}
              </Badge>
            )}

            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              {post.titulo}
            </h1>

            {formattedDate && (
              <p className="text-muted-foreground">{formattedDate}</p>
            )}
          </motion.header>

          {/* Featured Image */}
          {post.imagen_principal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-video rounded-lg overflow-hidden mb-12"
            >
              <img
                src={post.imagen_principal}
                alt={post.titulo}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="prose prose-lg max-w-none text-muted-foreground prose-headings:font-display prose-headings:text-foreground prose-h1:text-4xl md:prose-h1:text-5xl prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-2xl md:prose-h3:text-3xl prose-p:leading-relaxed prose-a:text-primary prose-a:underline hover:prose-a:no-underline prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-foreground prose-li:marker:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: post.contenido || "" }}
          />

          {/* Related Posts */}
          {related.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16 pt-12 border-t border-border"
            >
              <h3 className="font-display text-2xl text-foreground mb-6">
                Sigue leyendo
              </h3>

              <div className="space-y-4">
                {related.map((r) => (
                  <Link to={`/blog/${r.slug}`} key={r.id} className="block group">
                    <p className="text-lg text-foreground group-hover:text-primary transition-colors">
                      {r.titulo} →
                    </p>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
