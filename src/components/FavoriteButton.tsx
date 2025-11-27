import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export default function FavoriteButton({ productoId }: { productoId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Obtener usuario autenticado
  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUserId(data.user.id);
  };

  // Verificar si el producto ya es favorito
  const checkFavorite = async (uid: string) => {
    const { data } = await supabase
      .from("favoritos")
      .select("*")
      .eq("usuario_id", uid)
      .eq("producto_id", productoId)
      .maybeSingle();

    setIsFavorite(!!data);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      await fetchUser();
    };
    init();
  }, []);

  useEffect(() => {
    if (userId) checkFavorite(userId);
  }, [userId]);

  const toggleFavorite = async () => {
    if (!userId) {
      toast.error("Debes iniciar sesión para guardar favoritos");
      return;
    }

    if (isFavorite) {
      // Quitar favorito
      const { error } = await supabase
        .from("favoritos")
        .delete()
        .eq("usuario_id", userId)
        .eq("producto_id", productoId);

      if (!error) {
        setIsFavorite(false);
        toast("Favorito eliminado 🤍");
      }
    } else {
      // Agregar favorito
      const { error } = await supabase.from("favoritos").insert({
        usuario_id: userId,
        producto_id: productoId,
      });

      if (!error) {
        setIsFavorite(true);
        toast("Guardado en favoritos ❤️");
      }
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className="p-2 rounded-full hover:bg-muted transition"
    >
      <Heart
        className={`w-7 h-7 transition ${
          isFavorite ? "fill-red-500 text-red-500" : "text-foreground"
        }`}
      />
    </button>
  );
}
