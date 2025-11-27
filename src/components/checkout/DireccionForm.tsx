import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCheckout } from "@/context/CheckoutContext";

export default function DireccionForm() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { setDireccion } = useCheckout();

  const [formData, setFormData] = useState({
    calle: "",
    ciudad: "",
    pais: "",
    cp: "",
  });

  // ------------------------------------------------------
  // 1️⃣ Cargar usuario + datos guardados (si existe)
  // ------------------------------------------------------
  const loadUserData = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();

      // 👤 Invitado → no cargar de supabase
      if (!authData?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      // 👤 Usuario logueado
      setUser(authData.user);

      const { data: perfil } = await supabase
        .from("usuarios_perfil")
        .select("*")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (perfil) {
        const loaded = {
          calle: perfil.direccion || "",
          ciudad: perfil.ciudad || "",
          pais: perfil.pais || "",
          cp: perfil.zip || "",
        };

        setFormData(loaded);
        setDireccion(loaded);
      }

    } catch (e) {
      console.error("Error cargando dirección", e);
      toast.error("No se pudo cargar tu dirección");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // ------------------------------------------------------
  // 2️⃣ Enviar SIEMPRE al checkout cuando cambie formData
  // ------------------------------------------------------
  useEffect(() => {
    setDireccion({
      calle: formData.calle,
      ciudad: formData.ciudad,
      pais: formData.pais,
      cp: formData.cp,
    });
  }, [formData]);

  // ------------------------------------------------------
  // UI
  // ------------------------------------------------------
  if (loading)
    return <p className="text-muted-foreground">Cargando dirección...</p>;

  return (
    <div>
      <h2 className="font-display text-2xl mb-4">Dirección de Envío</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Usaremos esta dirección para enviarte tu pedido.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Dirección */}
        <div className="md:col-span-2">
          <Label>Dirección</Label>
          <Input
            value={formData.calle}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, calle: e.target.value }))
            }
            placeholder="Calle, Número, Piso"
          />
        </div>

        {/* Ciudad */}
        <div>
          <Label>Ciudad</Label>
          <Input
            value={formData.ciudad}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, ciudad: e.target.value }))
            }
            placeholder="Ciudad"
          />
        </div>

        {/* País */}
        <div>
          <Label>País</Label>
          <Input
            value={formData.pais}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pais: e.target.value }))
            }
            placeholder="País"
          />
        </div>

        {/* Código Postal */}
        <div>
          <Label>Código Postal</Label>
          <Input
            value={formData.cp}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cp: e.target.value }))
            }
            placeholder="00000"
          />
        </div>

        
      </div>
    </div>
  );
}
