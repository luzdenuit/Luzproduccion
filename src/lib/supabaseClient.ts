import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // 👈 guarda la sesión en localStorage
    autoRefreshToken: true,      // 👈 renueva el token automáticamente
    detectSessionInUrl: true,    // 👈 permite recuperar sesión de URL si hay redirección
  },
});
