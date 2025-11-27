import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { ShoppingCart } from "lucide-react";

export default function DetallePedido() {
  const { id } = useParams();
  const [pedido, setPedido] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ivaRate, setIvaRate] = useState<number>(0.19);


  // =========================================================
  // CARGAR PEDIDO + ITEMS
  // =========================================================
  const fetchPedido = async () => {
    const { data: p, error: pedidoError } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", id)
      .single();

    if (pedidoError) {
      toast.error("No se pudo cargar el pedido");
      return;
    }

    const { data: i, error: itemsError } = await supabase
      .from("pedido_items")
      .select("*")
      .eq("pedido_id", id);

    if (itemsError) {
      toast.error("No se pudieron cargar los productos");
      return;
    }

    // Imagen principal de productos
    const itemsConImagen = await Promise.all(
      (i || []).map(async (item) => {
        const { data: prod } = await supabase
          .from("productos")
          .select("imagen_principal")
          .eq("id", item.producto_id)
          .maybeSingle();

        return {
          ...item,
          imagen_url: prod?.imagen_principal || null,
        };
      })
    );

    // Enriquecer pedido con método de envío y cupón
    let enriched = { ...p } as any;
    try {
      if (!enriched.metodo_envio && enriched.metodo_envio_id) {
        const { data: metodo } = await supabase
          .from("metodos_envio")
          .select("*")
          .eq("id", enriched.metodo_envio_id)
          .maybeSingle();
        if (metodo) enriched.metodo_envio = metodo;
      }
      if (!enriched.cupon && enriched.cupon_id) {
        const { data: cup } = await supabase
          .from("cupones")
          .select("*")
          .eq("id", enriched.cupon_id)
          .maybeSingle();
        if (cup) enriched.cupon = cup;
      }
    } catch (_) {}

    setPedido(enriched);
    setItems(itemsConImagen);
    setLoading(false);
  };

  useEffect(() => {
    fetchPedido();
  }, [id]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("configuracion_iva").select("*").single();
      if (data && typeof data.porcentaje !== "undefined") {
        const r = Number(data.porcentaje);
        if (!Number.isNaN(r) && r > 0) setIvaRate(r / 100);
      }
    })();
  }, []);

  // =========================================================
  // ACTUALIZAR ESTADO (ANTI-SPAM + ENVÍO DE FACTURA)
  // =========================================================
  const actualizarEstado = async (nuevoEstado: string) => {
  const oldEstado = pedido.estado;

  // 1) Actualizar en Supabase
  const { error } = await supabase
    .from("pedidos")
    .update({ estado: nuevoEstado })
    .eq("id", id);

  if (error) {
    toast.error("No se pudo actualizar el estado");
    return;
  }

  toast.success("Estado actualizado ✔");
  setPedido((prev: any) => ({ ...prev, estado: nuevoEstado }));

  
  // 2) Solo enviar factura si pasa de cualquier estado A "pagado"
if (nuevoEstado === "pagado" && oldEstado !== "pagado") {
  try {
    await fetch(
      "https://fnsxwtmuoxyxhptzefsy.supabase.co/functions/v1/swift-processor",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pedido_id: pedido.id,
          pdfBase64: null,  // si luego generas un PDF, lo pones aquí
        }),
      }
    );

    toast.success("Factura enviada al cliente ✉️");
  } catch (e) {
    console.error("Error enviando factura:", e);
    toast.error("No se pudo enviar la factura");
  }
}

};



  // Estos hooks deben llamarse SIEMPRE en el mismo orden
  const totalItems = useMemo(() => items.reduce((s, it) => s + Number(it.cantidad ?? 1), 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, it) => s + Number(it.precio) * Number(it.cantidad ?? 1), 0), [items]);
  const ivaCalc = useMemo(() => subtotal * ivaRate, [subtotal, ivaRate]);
  const envioCosto = useMemo(() => Number(pedido?.metodo_envio?.precio ?? 0), [pedido]);
  const cuponDescuento = useMemo(() => {
    if (!pedido?.cupon) return 0;
    const tipo = pedido.cupon.tipo;
    const val = Number(pedido.cupon.valor ?? 0);
    const base = subtotal + ivaCalc + envioCosto;
    return tipo === "porcentaje" ? base * (val / 100) : val;
  }, [pedido, subtotal, ivaCalc, envioCosto]);
  const totalCalc = useMemo(() => {
    const t = subtotal + ivaCalc + envioCosto - cuponDescuento;
    return t < 0 ? 0 : t;
  }, [subtotal, ivaCalc, envioCosto, cuponDescuento]);

  if (loading) return <p className="p-8">Cargando...</p>;

  // =========================================================
  // UI COMPLETA
  // =========================================================
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 w-full px-4 md:px-8 pb-32">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <ShoppingCart className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Pedido
        </h1>
        <p className="text-muted-foreground">Resumen y estado del pedido</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="font-mono text-lg">{pedido.id}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Estado</p>
            <div className="mt-1">
              {pedido.estado === "pendiente_pago" && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/15 text-yellow-700 dark:text-yellow-300">Pendiente de pago</span>
              )}
              {pedido.estado === "en_revision" && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/15 text-blue-700 dark:text-blue-300">En revisión</span>
              )}
              {pedido.estado === "pagado" && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-300">Pagado</span>
              )}
              {!["pendiente_pago","en_revision","pagado"].includes(pedido.estado) && pedido.estado}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-semibold">${Number(pedido.total ?? 0).toFixed(2)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Productos</p>
            <p className="text-xl font-semibold">{totalItems}</p>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* INFORMACIÓN DEL PEDIDO */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="font-display text-xl mb-4">Información</h2>

          <p><strong>ID:</strong> {pedido.id}</p>
          <p><strong>Cliente:</strong> {pedido.nombre} {pedido.apellido}</p>
          <p><strong>Teléfono:</strong> {pedido.telefono}</p>
          <p><strong>Dirección:</strong> {pedido.direccion}</p>
          <p><strong>Ciudad:</strong> {pedido.ciudad}</p>
          <p><strong>País:</strong> {pedido.pais}</p>
          <p><strong>Código Postal:</strong> {pedido.codigo_postal}</p>
          <p><strong>Total registrado:</strong> ${Number(pedido.total ?? 0).toFixed(2)}</p>

          {/* Método de pago */}
          <p className="mt-4">
            <strong>Método de pago:</strong>{" "}
            {pedido.metodo_pago === "transferencia"
              ? "Transferencia bancaria"
              : "Efectivo"}
          </p>

          {/* Comprobante */}
          {pedido.metodo_pago === "transferencia" && (
            <div className="mt-4">
              <p className="font-semibold mb-2">Comprobante:</p>

              {!pedido.comprobante_url && (
                <p className="text-red-500">No se ha subido comprobante.</p>
              )}

              {pedido.comprobante_url && (
                <div className="space-y-2">
                  {pedido.comprobante_url.match(/\.(jpg|jpeg|png|gif)$/) ? (
                    <>
                      <img
                        src={pedido.comprobante_url}
                        className="w-full max-w-xs rounded border shadow"
                      />
                      <a
                        href={pedido.comprobante_url}
                        target="_blank"
                        className="text-blue-600 underline text-sm"
                      >
                        Abrir imagen
                      </a>
                    </>
                  ) : (
                    <a
                      href={pedido.comprobante_url}
                      target="_blank"
                      className="text-blue-600 underline text-sm"
                    >
                      Ver archivo adjunto
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Select de estado */}
          <div className="mt-6">
            <label className="font-semibold block mb-2">Estado del pedido</label>

            <select
              className="border border-border p-2 rounded-xl w-full bg-background"
              value={pedido.estado}
              onChange={(e) => actualizarEstado(e.target.value)}
            >
              <option value="pendiente_pago">Pendiente de pago</option>
              <option value="en_revision">En revisión</option>
              <option value="pagado">Pagado</option>
              <option value="enviado">Enviado</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>Método de envío:</strong> {pedido.metodo_envio ? `${pedido.metodo_envio.nombre} ($${Number(pedido.metodo_envio.precio ?? 0).toFixed(2)})` : "No especificado"}
            </p>
            <p>
              <strong>Cupón:</strong> {pedido.cupon ? `${pedido.cupon.codigo}` : "No aplicado"}
            </p>
          </div>
        </div>

        {/* ITEMS */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Productos</h2>
            <p className="text-sm text-muted-foreground">Subtotal: ${subtotal.toFixed(2)}</p>
          </div>

          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-left">Imagen</th>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-left">Precio</th>
                <th className="p-2 text-left">Cantidad</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="p-2">
                    {item.imagen_url ? (
                      <img
                        src={item.imagen_url}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Sin imagen
                      </span>
                    )}
                  </td>

                  <td className="p-2">{item.nombre}</td>
                  <td className="p-2">${Number(item.precio ?? 0).toFixed(2)}</td>
                  <td className="p-2">{item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm md:col-span-1">
          <h2 className="font-display text-xl mb-4">Resumen</h2>
            <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IVA ({Math.round(ivaRate * 100)}%)</span><span>${ivaCalc.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Envío</span><span>{envioCosto > 0 ? `$${envioCosto.toFixed(2)}` : "Gratis"}</span></div>
            {cuponDescuento > 0 && (
              <div className="flex justify-between text-green-700 dark:text-green-300"><span>Cupón aplicado{pedido.cupon?.codigo ? ` (${pedido.cupon.codigo})` : ""}</span><span>- ${cuponDescuento.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t"><span>Total</span><span>${totalCalc.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
