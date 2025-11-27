'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: any;
  role: string | null;
  loading: boolean;
  refreshProfile: (targetUser?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (targetUser?: any) => {
    const currentUser = targetUser || user;
    if (!currentUser) {
      setRole(null);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (error) {
      console.warn("⚠️ No se pudo obtener perfil:", error.message);
      setRole("user");
    } else {
      setRole(profile?.role ?? "user");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Desbloquea la UI rápido y refresca perfil en background
          setLoading(false);
          refreshProfile(session.user);
        } else {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      } catch (e) {
        // En caso de error inesperado, desbloquea la UI
        setUser(null);
        setRole(null);
        setLoading(false);
        console.error("Error inicializando sesión", e);
      }
    };
  
    init();
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("⚡ Auth event:", event);
        if (session?.user) {
          setUser(session.user);
          refreshProfile(session.user);
        } else {
          setUser(null);
          setRole(null);
        }
      }
    );
  
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, refreshProfile }}>
      {loading ? (
        <div className="flex justify-center items-center h-screen bg-neutral-900 text-white">
          <p className="animate-pulse text-lg">Cargando sesión...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
