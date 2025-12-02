import { createContext, useContext, useState, useMemo, useEffect } from "react";

import { useCart } from "./CartContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CheckoutContext = createContext<any>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { cart, clearCart} = useCart();

  // 💰 Método de pago
  const [pago, setPago] = useState<"efectivo" | "transferencia" | null>(null);

  // 📎 Comprobante
  const [comprobante, setComprobante] = useState<string | null>(null);

  // 🧍 Cliente
  const [cliente, setCliente] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });

  // 📦 Dirección
  const [direccion, setDireccion] = useState({
    calle: "",
    ciudad: "",
    estado: "",
    cp: "",
    pais: "",
  });

  // 🚚 Envío
  const [envio, setEnvio] = useState({
    metodo_envio_id: null,
    costo: 0,
    dias: "",
  });

  // 🎟 Cupón
  const [cupon, setCupon] = useState({
    id: null, // 👈 ahora guardas el id del cupón
    codigo: null,
    descuento: 0,
  });

  // 🔄 Commit
  const [commitVersion, setCommitVersion] = useState(0);
  const triggerCommit = async () => {
    setCommitVersion((v) => v + 1);
    await new Promise((res) => setTimeout(res, 0));
  };


// 🛒 Total de items (precio incluye IVA)
const itemsTotal = useMemo(() => {
  return cart.reduce((s, i) => s + i.precio * i.qty, 0);
}, [cart]);

// IVA desde Supabase (fallback 19%)
const DEFAULT_IVA_RATE = 0.19;
const useIvaRate = () => {
  const [rate, setRate] = useState<number>(DEFAULT_IVA_RATE);
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("configuracion_iva").select("*").single();
      if (data && typeof data.porcentaje !== "undefined") {
        const r = Number(data.porcentaje);
        if (!Number.isNaN(r) && r > 0) setRate(r / 100);
      }
    };
    load();
  }, []);
  return rate;
};

// Calcular base (subtotal) e IVA a partir de precio con IVA incluido
const ivaRate = useIvaRate();
const subtotal = useMemo(() => {
  return itemsTotal / (1 + ivaRate);
}, [itemsTotal, ivaRate]);
const iva = useMemo(() => {
  return itemsTotal - subtotal;
}, [itemsTotal, subtotal]);

// Total final = total de items (con IVA) + envío - cupón
const total = useMemo(() => {
  const descuento = cupon?.descuento || 0;
  const costoEnvio = envio?.costo || 0;
  let t = itemsTotal + costoEnvio - descuento;
  return t < 0 ? 0 : t;
}, [itemsTotal, envio.costo, cupon.descuento]);


  // 🔥 PROCESAR PEDIDO (logueado o invitado)
  const procesarPedido = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    console.log("🔍 DEBUG cliente:", cliente);
    console.log("🔍 DEBUG direccion:", direccion);

    // VALIDACIÓN - CLIENTE
    if (!cliente.nombre || !cliente.apellido || !cliente.email) {
      toast.error("Faltan tus datos personales.");
      return;
    }

    // VALIDACIÓN - DIRECCIÓN
    if (!direccion.calle || !direccion.ciudad || !direccion.pais || !direccion.cp) {
      toast.error("Faltan datos de dirección.");
      return;
    }


    if (cart.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    // 1️⃣ Si el usuario está logueado → guardar / actualizar perfil
    if (userId) {
      const perfilPayload = {
        user_id: userId,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: direccion.calle,
        ciudad: direccion.ciudad,
        estado: direccion.estado,
        pais: direccion.pais,
        zip: direccion.cp,
      };

      const { error: perfilError } = await supabase
        .from("usuarios_perfil")
        .upsert(perfilPayload);

      if (perfilError) {
        console.log("❌ ERROR perfil:", perfilError);
        toast.error("No se pudieron guardar tus datos");
        return;
      }
    }

    // 2️⃣ Crear pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert({
    usuario_id: userId,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: direccion.calle,
    ciudad: direccion.ciudad,
    pais: direccion.pais,
    codigo_postal: direccion.cp,
metodo_envio_id: envio.metodo_envio_id,
cupon_id: cupon?.id ?? null,


    total: total < 0 ? 0 : total,
    estado: "pendiente_pago",
      })
      .select()
      .single();

    if (pedidoError || !pedido) {
      console.log("❌ ERROR pedido:", pedidoError);
      toast.error("No se pudo crear el pedido");
      return;
    }

    // 3️⃣ Guardar items del pedido
    const itemsPayload = cart.map((item) => ({
      pedido_id: pedido.id,
      producto_id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.qty,
    }));

    const { error: itemsError } = await supabase
      .from("pedido_items")
      .insert(itemsPayload);

   if (itemsError) {
  console.log("❌ ERROR items:", itemsError);
  toast.error("No se pudieron guardar los productos del pedido");
  return;
}

// 🧹 LIMPIAR CARRITO COMPLETAMENTE
clearCart();

toast.success("Pedido creado ✔ Redirigiendo al pago...");

navigate(`/pago/${pedido.id}`);

  };

  return (
    <CheckoutContext.Provider
      value={{
        cliente,
        setCliente,

        direccion,
        setDireccion,

        envio,
        setEnvio,

        cupon,
        setCupon,

        pago,
        setPago,

        comprobante,
        setComprobante,

        subtotal,
        iva,
        ivaRate,
        total: total < 0 ? 0 : total,


        commitVersion,
        triggerCommit,

        procesarPedido,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => useContext(CheckoutContext);
