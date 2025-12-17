import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function PedidosUsuario() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");

  // -----------------------------------------------
  // CARGAR PEDIDOS DEL USUARIO LOGUEADO
  // -----------------------------------------------
  const cargarPedidos = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;

    if (!userId) {
      toast.error("No estás autenticado");
      return;
    }

    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        *,
        pedido_items(id)
      `)
      .eq("usuario_id", userId)
      .order("creado_en", { ascending: false });

    if (error) {
      toast.error("No se pudieron cargar tus pedidos");
      return;
    }

    setPedidos(data);
    setCargando(false);
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // -----------------------------------------------
  // UI helpers y filtros
  // -----------------------------------------------

  const getEstadoLabel = (estado: string) => {
    if (estado === "pendiente_pago") return "Pendiente de pago";
    if (estado === "en_revision") return "En revisión";
    if (estado === "pagado") return "Pagado";
    if (estado === "enviado") return "Enviado";
    if (estado === "finalizado") return "Finalizado";
    return estado;
  };

  const getEstadoBadge = (estado: string) => {
    if (estado === "pendiente_pago") return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300";
    if (estado === "en_revision") return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
    if (estado === "pagado") return "bg-green-500/15 text-green-700 dark:text-green-300";
    if (estado === "enviado") return "bg-purple-500/15 text-purple-700 dark:text-purple-300";
    if (estado === "finalizado") return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    return "bg-muted text-foreground";
  };

  const filteredPedidos = useMemo(() => {
    if (estadoFiltro === "todos") return pedidos;
    return pedidos.filter((p) => p.estado === estadoFiltro);
  }, [pedidos, estadoFiltro]);

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Tus pedidos</h2>
      </div>

      <Tabs value={estadoFiltro} onValueChange={setEstadoFiltro}>
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendiente_pago">Pendiente</TabsTrigger>
          <TabsTrigger value="en_revision">En revisión</TabsTrigger>
          <TabsTrigger value="pagado">Pagado</TabsTrigger>
          <TabsTrigger value="enviado">Enviado</TabsTrigger>
          <TabsTrigger value="finalizado">Finalizado</TabsTrigger>
        </TabsList>
      </Tabs>

      {cargando ? (
        <p className="text-center mt-8">Cargando pedidos...</p>
      ) : filteredPedidos.length === 0 ? (
        <p className="text-muted-foreground text-center mt-6">No tienes pedidos todavía.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPedidos.map((p) => {
            const productosCount = Array.isArray(p.pedido_items) ? p.pedido_items.length : 0;
            const estadoLabel = getEstadoLabel(p.estado);
            const badgeClass = getEstadoBadge(p.estado);
            return (
              <div key={p.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">Pedido #{p.id}</p>
                    <p className="text-sm text-muted-foreground">{new Date(p.creado_en).toLocaleDateString()}</p>
                  </div>
                  <Badge className={badgeClass}>{estadoLabel}</Badge>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>{productosCount} productos</p>
                    <p>Método: {p.metodo_pago ?? ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">${formatPrice(Number(p.total))}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  {p.estado === "pendiente_pago" && (
                    <Button asChild>
                      <Link to={`/pago/${p.id}`}>Pagar ahora</Link>
                    </Button>
                  )}
                  {p.estado === "en_revision" && p.comprobante_url && (
                    <Button variant="outline" asChild>
                      <a href={p.comprobante_url} target="_blank">Ver comprobante</a>
                    </Button>
                  )}
                  {p.estado !== "pendiente_pago" && (
                    <Button variant="ghost" asChild>
                      <Link to={`/pago/${p.id}`}>Ver detalles</Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
