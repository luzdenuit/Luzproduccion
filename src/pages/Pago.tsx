import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";


function OrderStatusTimeline({ estadoActual }: { estadoActual: string }) {
  const steps = [
    { key: "pendiente_pago", label: "Pendiente de pago" },
    { key: "en_revision", label: "En revisión" },
    { key: "pagado", label: "Pagado" },
    { key: "enviado", label: "Enviado" },
  { key: "finalizado", label: "Finalizado" },
 
  ];
  const indexActual = steps.findIndex((s) => s.key === estadoActual);
  return (
    <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
      {steps.map((s, i) => {
        const done = i <= indexActual;
        const current = i === indexActual;
        return (
          <div key={s.key} className="flex items-center gap-2 md:gap-3">
            <div className={`h-2 w-2 rounded-full ${done ? "bg-primary" : "bg-muted"} ${current ? "ring-2 ring-primary/40" : ""}`} />
            <span className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            {i < steps.length - 1 && (
              <div className="md:w-8 md:h-px w-px h-6 bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );
}


export default function Pago() {
  const { id: pedidoId } = useParams();
  const [pedido, setPedido] = useState<any>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [configPago, setConfigPago] = useState<any>(null);
  const [ivaRate, setIvaRate] = useState<number>(0.19);

  // ============================
  // 1️⃣ Cargar pedido
  // ============================
  const cargarPedido = async () => {
    setCargando(true);

    const { data, error } = await supabase
  .from("pedidos")
  .select(`
    *,
    metodo_envio:metodos_envio!pedidos_metodo_envio_id_fkey(*),
    cupon:cupones!pedidos_cupon_id_fkey(*),
    pedido_items(
      id,
      cantidad,
      precio,
      nombre,
      producto_id,
      productos(precio, imagen_principal)
    )
  `)
  .eq("id", pedidoId)
  .single();


    if (error) {
      toast.error("Error al cargar pedido");
      return;
    }

    // Enriquecer datos si las relaciones no se resolvieron automáticamente
    let enriched = { ...data } as any;

    try {
      // Fallback: método de envío por id
      if (!enriched.metodo_envio && enriched.metodo_envio_id) {
        const { data: metodo } = await supabase
          .from("metodos_envio")
          .select("*")
          .eq("id", enriched.metodo_envio_id)
          .maybeSingle();
        if (metodo) enriched.metodo_envio = metodo;
      }

      // Fallback: cupón por id
      if (!enriched.cupon && enriched.cupon_id) {
        const { data: cup } = await supabase
          .from("cupones")
          .select("*")
          .eq("id", enriched.cupon_id)
          .maybeSingle();
        if (cup) enriched.cupon = cup;
      }
    } catch (e) {
      // Ignorar errores de enriquecimiento y continuar
    }

    setPedido(enriched);
    setCargando(false);
  };

  const cargarConfigPago = async () => {
    const { data } = await supabase
      .from("configuracion_pago")
      .select("*")
      .limit(1)
      .single();
    setConfigPago(data);
  };

  const cargarIVA = async () => {
    const { data } = await supabase
      .from("configuracion_iva")
      .select("*")
      .single();
    if (data && typeof data.porcentaje !== "undefined") {
      const r = Number(data.porcentaje);
      if (!Number.isNaN(r) && r > 0) setIvaRate(r / 100);
    }
  };

  useEffect(() => {
    cargarPedido();
    cargarConfigPago();
    cargarIVA();
  }, []);

  // ============================
  // 2️⃣ Cambiar método pago
  // ============================
  const cambiarMetodoPago = async (nuevoMetodo: "efectivo" | "transferencia") => {
    if (pedido.comprobante_url && nuevoMetodo === "efectivo") {
      toast.error("Ya enviaste un comprobante. No puedes cambiar a efectivo.");
      return;
    }

    const updateData: any = { metodo_pago: nuevoMetodo };

    if (nuevoMetodo === "efectivo") {
      updateData.comprobante_url = null;
      updateData.estado = "pendiente_pago";
    }

    await supabase.from("pedidos").update(updateData).eq("id", pedidoId);

    toast.success("Método de pago actualizado");
    cargarPedido();
  };

  // ============================
  // 3️⃣ Subir comprobante
  // ============================
  const subirComprobante = async () => {
    if (!archivo) {
      toast.error("Selecciona una imagen");
      return;
    }

    setSubiendo(true);

    const filePath = `comprobantes/${pedidoId}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(filePath, archivo);

    if (uploadError) {
      toast.error("Error al subir");
      setSubiendo(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("comprobantes")
      .getPublicUrl(filePath);

    await supabase
      .from("pedidos")
      .update({
        comprobante_url: urlData.publicUrl,
        metodo_pago: "transferencia",
        estado: "en_revision",
      })
      .eq("id", pedidoId);

    toast.success("Comprobante enviado ✓");
    setSubiendo(false);
    cargarPedido();
  };

  if (cargando || !pedido)
    return <p className="p-20 text-center">Cargando pedido...</p>;

  const imagenPrincipal =
    pedido.pedido_items?.[0]?.productos?.imagen_principal || null;

  const itemsTotalCalc = Array.isArray(pedido.pedido_items)
    ? pedido.pedido_items.reduce(
        (s: number, it: any) => s + Number(it.precio) * Number(it.cantidad ?? 1),
        0,
      )
    : 0;

  const envioCostoCalc = Number(pedido.metodo_envio?.precio ?? 0);

  const subtotalCalc = Array.isArray(pedido.pedido_items)
    ? pedido.pedido_items.reduce((s: number, it: any) => {
        const lineTotal = Number(it.precio) * Number(it.cantidad ?? 1);
        const netLine = Math.round((lineTotal / (1 + ivaRate)) * 100) / 100;
        return s + netLine;
      }, 0)
    : 0;
  const ivaCalc = itemsTotalCalc - subtotalCalc;

  const cuponCodigo = pedido.cupon?.codigo ?? null;
  const discountBase = itemsTotalCalc + envioCostoCalc;
  const cuponDescuentoCalc = pedido.cupon
    ? (pedido.cupon.tipo === "porcentaje"
        ? discountBase * (Number(pedido.cupon.valor) / 100)
        : Number(pedido.cupon.valor))
    : 0;

  const totalCalc =
    typeof pedido.total === "number"
      ? pedido.total
      : Math.max(itemsTotalCalc + envioCostoCalc - cuponDescuentoCalc, 0);

  // ============================
  // UI — LUZ DE NUIT ✨
  // ============================
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

     <main className="pt-32 pb-20 container mx-auto px-4">

 {/* ================================
    🌟 HEADER PREMIUM LUZ DE NUIT
   ================================ */}
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="mb-12"
>
  <h1 className="font-display text-4xl md:text-5xl mb-4 text-foreground drop-shadow-sm">
    Completar Pago 
  </h1>

  <div
    className="
      bg-card backdrop-blur-sm
      border border-border
      shadow-md
      rounded-2xl p-6
      flex flex-col md:flex-row
      items-start md:items-center
      justify-between gap-6
    "
  >
    {/* Pedido */}
    <div>
      <p className="text-sm text-muted-foreground mb-1">
        Número de pedido
      </p>
      <p className="font-mono text-base md:text-lg font-semibold text-amber-800 tracking-tight">
        {pedidoId}
      </p>
    </div>

   
    <OrderStatusTimeline estadoActual={pedido.estado} />
  </div>
</motion.div>


  {/* =============================
      🎨 LAYOUT TIPO STRIPE
     ============================= */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

    {/* ==========================================================
        📌 COLUMNA IZQUIERDA — Método + Comprobante
    =========================================================== */}
    <div className="flex flex-col gap-8">

      {/* 🔶 MÉTODO + COMPROBANTE */}
      <div className="rounded-2xl border border-border bg-card shadow-lg p-8">

        <h2 className="font-display text-2xl text-foreground mb-6">
          Método de Pago
        </h2>

        {/* SELECTOR */}
        <div className="mb-6">
          <label className="block text-sm text-muted-foreground mb-2">
            Selecciona una opción
          </label>

          <Select
            value={pedido.metodo_pago || "efectivo"}
            onValueChange={(nuevoMetodo) => {
              const nm = nuevoMetodo as "efectivo" | "transferencia";
              if (pedido.comprobante_url && nm === "efectivo") {
                toast.error("No puedes cambiar a efectivo porque ya subiste un comprobante.");
                return;
              }
              cambiarMetodoPago(nm);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="efectivo" disabled={!!pedido.comprobante_url}>💵 Pago en efectivo</SelectItem>
              <SelectItem value="transferencia">🏦 Transferencia bancaria</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">Si eliges transferencia, sube tu comprobante para acelerar la validación.</p>

          {pedido.comprobante_url && (
            <p className="text-destructive text-sm mt-2">
              Ya enviaste un comprobante. No puedes volver a efectivo.
            </p>
          )}
        </div>

        {/* SUBIR COMPROBANTE */}
        {pedido.metodo_pago === "transferencia" && (
          <div>
            <label className="block text-sm mb-2 text-muted-foreground">
              Subir comprobante
            </label>

            {pedido.comprobante_url ? (
              <div className="flex flex-col gap-4">
                <img
                  src={pedido.comprobante_url}
                  className="w-64 rounded-xl border shadow-lg"
                />
                <p className="text-primary text-sm font-semibold">
                  ✔ Comprobante recibido
                </p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-3 border border-border rounded-xl bg-background text-foreground shadow-sm"
                  onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                />
                {archivo && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate max-w-[70%]">{archivo.name}</span>
                    <Button variant="outline" size="sm" onClick={() => setArchivo(null)}>Quitar</Button>
                  </div>
                )}

                <button
                  onClick={subirComprobante}
                  disabled={subiendo}
                  className="mt-4 w-full bg-primary text-primary-foreground py-3 rounded-xl shadow hover:bg-primary/90 transition"
                >
                  {subiendo ? "Subiendo..." : "Enviar comprobante"}
                </button>
                </>
              )}
          </div>
        )}

      </div>

      {/* 🧺 TU PEDIDO */}
      <div className="rounded-2xl border border-border bg-card shadow-lg p-8">
        <h2 className="font-display text-2xl text-foreground mb-6">Tu Pedido</h2>

        <div className="space-y-4">
          {pedido.pedido_items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 border-b border-border pb-4">
              <img
                src={item.productos?.imagen_principal}
                className="w-16 h-16 object-cover rounded-lg border border-border"
              />
              <div className="flex-1">
                <p className="font-medium">{item.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  Cantidad: {item.cantidad}
                </p>
              </div>
              {item.productos?.precio && Number(item.productos.precio) > Number(item.precio) ? (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground line-through">${formatPrice(Number(item.productos.precio))}</div>
                  <div className="font-semibold">${formatPrice(Number(item.precio))}</div>
                  <div className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full inline-block mt-1">
                    -{Math.round(((Number(item.productos.precio) - Number(item.precio)) / Number(item.productos.precio)) * 100)}%
                  </div>
                </div>
              ) : (
                <p className="font-semibold">${formatPrice(Number(item.precio))}</p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>


    {/* ==========================================================
        📌 COLUMNA DERECHA — Datos Bancarios + QR + Resumen
    ========================================================== */}
    <div className="flex flex-col gap-8">

      {/* 🏦 Datos Bancarios */}
      <div className="rounded-2xl border border-border bg-card shadow-lg p-8">
        <h2 className="font-display text-2xl text-foreground mb-6">Datos Bancarios</h2>

        <p className="flex items-center"><strong>Banco:</strong> <span className="ml-1">{configPago?.banco}</span>
          <Button variant="ghost" size="sm" className="ml-2 px-2" onClick={() => navigator.clipboard.writeText(configPago?.banco ?? "")}>
            <Copy className="h-4 w-4" />
          </Button>
        </p>
        <p className="flex items-center"><strong>Cuenta:</strong> <span className="ml-1">{configPago?.cuenta}</span>
          <Button variant="ghost" size="sm" className="ml-2 px-2" onClick={() => navigator.clipboard.writeText(configPago?.cuenta ?? "")}>
            <Copy className="h-4 w-4" />
          </Button>
        </p>
        <p className="flex items-center"><strong>Titular:</strong> <span className="ml-1">{configPago?.titular}</span>
          <Button variant="ghost" size="sm" className="ml-2 px-2" onClick={() => navigator.clipboard.writeText(configPago?.titular ?? "")}>
            <Copy className="h-4 w-4" />
          </Button>
        </p>

        {configPago?.qr_url && (
         <Dialog>
  <DialogTrigger asChild>
    <img
      src={configPago.qr_url}
      className="w-64 rounded-2xl shadow-xl border border-border cursor-pointer hover:scale-105 transition"
    />
  </DialogTrigger>

  <DialogContent className="max-w-md p-0 bg-white rounded-xl shadow-2xl">
    <img
      src={configPago.qr_url}
      className="w-full rounded-xl"
    />
  </DialogContent>
</Dialog>

        )}
      </div>

    
      {/* 🧮 Resumen */}
{/* 🧮 Resumen */}
<div className="rounded-2xl border border-border bg-card shadow-lg p-8 lg:sticky lg:top-24">
  <h2 className="font-display text-xl text-foreground mb-4">Resumen</h2>

  {/* Subtotal */}
  <div className="flex justify-between mb-2">
    <span>Subtotal</span>
    <span className="font-semibold">${formatPrice(subtotalCalc)}</span>
  </div>

  {/* IVA dinámico */}
  <div className="flex justify-between mb-2">
    <span>IVA ({Math.round(ivaRate * 100)}%)</span>
    <span className="font-semibold">${formatPrice(ivaCalc)}</span>
  </div>

  {/* Cupón aplicado (estilo igual a ResumenPedido) */}
  {cuponCodigo && cuponDescuentoCalc > 0 && (
    <div className="flex justify-between text-base text-green-600 mb-2">
      <span>Cupón aplicado ({cuponCodigo})</span>
      <span className="font-semibold">- ${formatPrice(cuponDescuentoCalc)}</span>
    </div>
  )}

  {/* Envío */}
  <div className="flex justify-between mb-2">
    <span>Envío</span>
    <span className="font-semibold">
      {pedido.metodo_envio?.precio === 0
        ? "Gratis"
        : `$${formatPrice(Number(pedido.metodo_envio?.precio))}`
      }
    </span>
  </div>

  {/* Info método */}
  <p className="text-sm text-muted-foreground mb-3">
    Método: <strong>{pedido.metodo_envio?.nombre}</strong>
    <br />
    {pedido.metodo_envio?.descripcion}
  </p>

  {/* Total */}
  <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
    <span>Total</span>
    <span>${formatPrice(totalCalc)}</span>
  </div>

  <p className="text-xs text-muted-foreground mt-2">
    Sube el comprobante si pagas por transferencia.
  </p>
</div>




    </div>

  </div>
</main>



      <Footer />
    </div>
  );
}
