import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

interface Favorito {
  id: string;
  usuario_id: string;
  producto_id: string;
}

interface FavoritosState {
  favoritos: Favorito[];
  loading: boolean;

  // Actions
  fetchFavoritos: (userId: string) => Promise<void>;
  addFavorito: (productoId: string, userId: string) => Promise<void>;
  removeFavorito: (productoId: string, userId: string) => Promise<void>;
  isFavorito: (productoId: string) => boolean;
}

export const useFavoritos = create<FavoritosState>((set, get) => ({
  favoritos: [],
  loading: true,

  // 📥 Cargar todos los favoritos del usuario
  fetchFavoritos: async (userId: string) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("favoritos")
      .select("*")
      .eq("usuario_id", userId);

    if (!error && data) {
      set({ favoritos: data });
    }

    set({ loading: false });
  },

  // ❤️ Agregar favorito
  addFavorito: async (productoId: string, userId: string) => {
    const { data, error } = await supabase
      .from("favoritos")
      .insert({
        usuario_id: userId,
        producto_id: productoId,
      })
      .select("*")
      .single();

    if (!error && data) {
      set((state) => ({
        favoritos: [...state.favoritos, data],
      }));
    }
  },

  // 🤍 Quitar favorito
  removeFavorito: async (productoId: string, userId: string) => {
    const { data, error } = await supabase
      .from("favoritos")
      .delete()
      .eq("usuario_id", userId)
      .eq("producto_id", productoId)
      .select("id")
      .single();

    if (!error && data) {
      set((state) => ({
        favoritos: state.favoritos.filter(
          (f) => f.producto_id !== productoId
        ),
      }));
    }
  },

  // 🔍 Saber si un producto ya está en favoritos
  isFavorito: (productoId: string) => {
    return get().favoritos.some((f) => f.producto_id === productoId);
  },
}));
