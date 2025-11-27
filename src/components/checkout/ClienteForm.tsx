import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCheckout } from "@/context/CheckoutContext";

export default function ClienteForm() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { setCliente } = useCheckout();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
  });

  // -------------------------------
  // 1️⃣ Cargar datos del usuario (logueado o invitado)
  // -------------------------------
  const loadUserData = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();

      // 👤 INVITADO → permitir seguir
      if (!authData?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      // 👤 USUARIO LOGUEADO
      setUser(authData.user);
      const userEmail = authData.user.email;

      const { data: perfil } = await supabase
        .from("usuarios_perfil")
        .select("*")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (perfil) {
        // Cargar datos desde perfil
        setFormData({
          nombre: perfil.nombre || "",
          apellido: perfil.apellido || "",
          telefono: perfil.telefono || "",
          email: perfil.email || userEmail,
        });
      } else {
        // Crear perfil por primera vez
        await supabase.from("usuarios_perfil").insert({
          user_id: authData.user.id,
          email: userEmail,
        });

        setFormData({
          nombre: "",
          apellido: "",
          telefono: "",
          email: userEmail,
        });
      }

    } catch (e) {
      console.error("Error cargando datos de cliente", e);
      toast.error("No se pudo cargar tu información");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // -------------------------------
  // 2️⃣ ACTUALIZAR CheckoutContext SIEMPRE que cambie formData
  // -------------------------------
  useEffect(() => {
    setCliente({
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      email: formData.email,
    });
  }, [formData]);

  // -------------------------------
  // UI
  // -------------------------------
  if (loading)
    return <p className="text-muted-foreground">Cargando información...</p>;

  return (
    <div>
      <h2 className="font-display text-2xl mb-4">Información del Cliente</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Estos datos se usarán para tu pedido.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Nombre */}
        <div>
          <Label>Nombre</Label>
          <Input
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            placeholder="Tu nombre"
          />
        </div>

        {/* Apellido */}
        <div>
          <Label>Apellido</Label>
          <Input
            value={formData.apellido}
            onChange={(e) =>
              setFormData({ ...formData, apellido: e.target.value })
            }
            placeholder="Tu apellido"
          />
        </div>

        {/* Teléfono */}
        <div>
          <Label>Teléfono</Label>
          <Input
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            placeholder="+34 000 000 000"
          />
        </div>

        {/* Email */}
        <div>
          <Label>Email</Label>
          <Input
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            readOnly={!!user} // solo bloquea si el usuario está logueado
            className={user ? "bg-card" : ""}
            placeholder="tu@email.com"
          />
        </div>
      </div>
    </div>
  );
}
