import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Clock, XCircle, Search, Filter, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useTheme } from "next-themes";

import Navbar from "@/components/Navbar";

import { formatPrice } from "@/lib/utils";

interface Pedido {
  id: string;
  creado_en: string;
  total: number;
  estado: string;
  nombre?: string;
  apellido?: string;
  metodo_pago?: string;
}

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [vista, setVista] = useState<"cards" | "table">("cards");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const axisTickColor = isDark ? "#cbd5e1" : "#374151";
  const gridColor = isDark ? "#334155" : "#e5e7eb";
  const tooltipStyle = { backgroundColor: isDark ? "#0b0b0d" : "#ffffff", border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`, color: isDark ? "#e5e7eb" : "#111827" } as any;
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(("matches" in e ? e.matches : (e as MediaQueryList).matches));
    handler(q);
    q.addEventListener("change", handler as any);
    return () => q.removeEventListener("change", handler as any);
  }, []);
  const chartHeight = isMobile ? 200 : 240;

  const fetchPedidos = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("creado_en", { ascending: false });

    if (!error) setPedidos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const pedidosFiltrados = useMemo(() => {
    const s = search.trim().toLowerCase();
    return pedidos.filter((p) => {
      const matchEstado = estadoFiltro === "todos" || p.estado === estadoFiltro;
      const texto = `${p.id} ${p.nombre} ${p.apellido}`.toLowerCase();
      const matchSearch = s === "" || texto.includes(s);
      return matchEstado && matchSearch;
    });
  }, [pedidos, search, estadoFiltro]);

  // =============================
  // DASHBOARD DERIVADOS
  // =============================
  const totalPedidos = pedidosFiltrados.length;
  const totalIngresos = pedidosFiltrados.reduce((s, p) => s + Number(p.total ?? 0), 0);
  const ticketPromedio = totalPedidos > 0 ? totalIngresos / totalPedidos : 0;

  const estadoMap: Record<string, number> = {};
  const metodoPagoMap: Record<string, number> = {};
  const monthMap: Record<string, number> = {};

  pedidosFiltrados.forEach((p) => {
    const est = p.estado || "pendiente_pago";
    estadoMap[est] = (estadoMap[est] || 0) + 1;

    const mp = p.metodo_pago || "efectivo";
    metodoPagoMap[mp] = (metodoPagoMap[mp] || 0) + 1;

    if (p.creado_en) {
      const d = new Date(p.creado_en);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    }
  });

  const estadosData = Object.entries(estadoMap).map(([label, value]) => ({ label, value }));
  const pagosData = Object.entries(metodoPagoMap).map(([label, value]) => ({ label, value }));
  const mesesData = Object.entries(monthMap)
    .map(([mes, total]) => ({ mes, total }))
    .sort((a, b) => (a.mes < b.mes ? -1 : 1));

  const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#6366f1", "#22c55e"]; // amber, green, blue, red, indigo, emerald

  const pendientes = estadoMap["pendiente_pago"] || 0;
  const enRevision = estadoMap["en_revision"] || 0;
  const pagados = estadoMap["pagado"] || 0;
  const pagadosPercent = totalPedidos > 0 ? Math.round((pagados / totalPedidos) * 100) : 0;

  const ahora = Date.now();
  const hace30 = 30 * 24 * 60 * 60 * 1000;
  const ingresos30d = pedidosFiltrados
    .filter((p) => p.creado_en && ahora - new Date(p.creado_en).getTime() <= hace30)
    .reduce((s, p) => s + Number(p.total ?? 0), 0);

  const topMetodo = Object.entries(metodoPagoMap).sort((a, b) => b[1] - a[1])[0];
  const topMetodoPagoLabel = topMetodo ? (topMetodo[0] === "transferencia" ? "Transferencia bancaria" : "Efectivo") : "Sin datos";
  const topMetodoPagoCount = topMetodo ? topMetodo[1] : 0;

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente_pago":
        return (
          <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-medium flex items-center gap-1">
            <Clock size={14} /> Pendiente de pago
          </span>
        );

      case "pagado":
        return (
          <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium flex items-center gap-1">
            <BadgeCheck size={14} /> Pagado
          </span>
        );

      case "cancelado":
        return (
          <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium flex items-center gap-1">
            <XCircle size={14} /> Cancelado
          </span>
        );

      default:
        return estado;
    }
  };

  if (loading) return <p>Cargando pedidos...</p>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 w-full px-4 md:px-8 pb-24">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <ShoppingCart className="h-10 w-10 text-amber-700 dark:text-amber-300" />
            Pedidos
          </h1>
          <p className="text-muted-foreground mt-1">Administra pedidos y visualiza su estado.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-4 bg-card border border-border rounded-xl text-sm">
          <p className="font-semibold">📦 Cumplimiento de pago</p>
          <p className="mt-1">{pagados} pedidos pagados ({pagadosPercent}%). Mantén ≥ 80% para buen flujo.</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl text-sm">
          <p className="font-semibold">⚠️ Atención a pendientes</p>
          <p className="mt-1">{pendientes} pendientes y {enRevision} en revisión. Revisa comprobantes y envía recordatorios.</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl text-sm">
          <p className="font-semibold">💳 Método preferido</p>
          <p className="mt-1">{topMetodoPagoLabel} ({topMetodoPagoCount} pedidos). Facilita este método para mejorar conversión.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 flex flex-col md:flex-row items-stretch md:items-center gap-3 min-w-0">
          <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm min-w-0">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ID o cliente"
              className="w-full outline-none text-sm bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setEstadoFiltro("todos")}
              className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                estadoFiltro === "todos" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setEstadoFiltro("pendiente_pago")}
              className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                estadoFiltro === "pendiente_pago" ? "bg-yellow-500 text-white border-yellow-500" : "bg-card border-border text-muted-foreground"
              }`}
            >
              Pendiente
            </button>
            <button
              onClick={() => setEstadoFiltro("en_revision")}
              className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                estadoFiltro === "en_revision" ? "bg-blue-500 text-white border-blue-500" : "bg-card border-border text-muted-foreground"
              }`}
            >
              En revisión
            </button>
            <button
              onClick={() => setEstadoFiltro("pagado")}
              className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                estadoFiltro === "pagado" ? "bg-green-600 text-white border-green-600" : "bg-card border-border text-muted-foreground"
              }`}
            >
              Pagado
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              {totalPedidos} resultados
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button onClick={() => setVista("cards")} className={`px-3 py-1 rounded-md text-xs ${vista === "cards" ? "bg-primary text-primary-foreground" : "hover:bg-muted/60"}`}>Tarjetas</button>
              <button onClick={() => setVista("table")} className={`px-3 py-1 rounded-md text-xs ${vista === "table" ? "bg-primary text-primary-foreground" : "hover:bg-muted/60"}`}>Tabla</button>
            </div>
          </div>
        </div>
      </div>


      {/* DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Total pedidos</p>
          <p className="text-3xl font-semibold">{totalPedidos}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Ingresos</p>
          <p className="text-3xl font-semibold">${formatPrice(totalIngresos)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Ticket promedio</p>
          <p className="text-3xl font-semibold">${formatPrice(ticketPromedio)}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Estados Pie */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-w-0">
          <h2 className="text-lg font-display text-amber-700 mb-3">Estado</h2>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie data={estadosData} dataKey="value" nameKey="label" innerRadius={40} outerRadius={isMobile ? 70 : 80}>
                {estadosData.map((_, i) => (
                  <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip contentStyle={tooltipStyle} itemStyle={{ color: tooltipStyle.color }} labelStyle={{ color: tooltipStyle.color }} wrapperStyle={{ outline: "none" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Métodos de pago Pie */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-w-0">
          <h2 className="text-lg font-display text-amber-700 mb-3">Método de pago</h2>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie data={pagosData} dataKey="value" nameKey="label" innerRadius={40} outerRadius={isMobile ? 70 : 80}>
                {pagosData.map((_, i) => (
                  <Cell key={`p-${i}`} fill={COLORS[(i + 2) % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip contentStyle={tooltipStyle} itemStyle={{ color: tooltipStyle.color }} labelStyle={{ color: tooltipStyle.color }} wrapperStyle={{ outline: "none" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pedidos por mes Bar */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-w-0">
          <h2 className="text-lg font-display text-amber-700 mb-3">Pedidos por mes</h2>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={mesesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="mes" tick={{ fill: axisTickColor, fontSize: isMobile ? 11 : 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: axisTickColor, fontSize: isMobile ? 11 : 12 }} />
              <ReTooltip contentStyle={tooltipStyle} itemStyle={{ color: tooltipStyle.color }} labelStyle={{ color: tooltipStyle.color }} wrapperStyle={{ outline: "none" }} />
              <Bar dataKey="total" fill="#f59e0b" background={{ fill: isDark ? "#1f2937" : "#f3f4f6", opacity: 0.2 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {vista === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {pedidosFiltrados.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 items-center gap-4 min-h-[72px]">
              <div className="md:col-span-6 min-w-0">
                <p className="text-sm font-medium truncate">{p.nombre} {p.apellido}</p>
                <p className="text-xs text-muted-foreground font-mono">{p.id.slice(0, 8)}...</p>
                <div className="mt-1">{getEstadoBadge(p.estado)}</div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{new Date(p.creado_en).toLocaleDateString()}</p>
              </div>
              <div className="md:col-span-4"></div>
              <div className="md:col-span-2 flex justify-end items-center gap-3 shrink-0">
                <p className="text-sm font-semibold whitespace-nowrap">{formatPrice(Number(p.total ?? 0))}</p>
                <Link to={`/admin/pedidos/${p.id}`}> 
                  <Button variant="outline" size="sm">Ver</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card text-card-foreground shadow-sm rounded-xl border border-border mt-2 overflow-x-auto overflow-y-visible max-w-full">
          <table className="w-full table-auto text-sm min-w-[900px]">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="p-4 text-left whitespace-nowrap">ID</th>
                <th className="p-4 text-left">Cliente</th>
                <th className="p-4 text-left whitespace-nowrap">Total</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left whitespace-nowrap">Fecha</th>
                <th className="p-4 text-left whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                  <td className="p-4 font-mono whitespace-nowrap">{p.id.slice(0, 8)}...</td>
                  <td className="p-4">{p.nombre} {p.apellido}</td>
                  <td className="p-4 font-semibold whitespace-nowrap">${formatPrice(Number(p.total ?? 0))}</td>
                  <td className="p-4">{getEstadoBadge(p.estado)}</td>
                  <td className="p-4 text-muted-foreground whitespace-nowrap">{new Date(p.creado_en).toLocaleDateString()}</td>
                  <td className="p-4 whitespace-nowrap">
                    <Link to={`/admin/pedidos/${p.id}`}>
                      <Button variant="outline" size="sm">Ver detalle</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}
