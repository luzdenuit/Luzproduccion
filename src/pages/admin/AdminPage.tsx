import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { ShoppingCart, DollarSign, TrendingUp, PieChart, BarChart3, Tag, Users, Mail, MessageSquare, Star, Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
  PieChart as ChartPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  type Pedido = { id: string; creado_en?: string; total?: number; estado?: string; usuario_id?: string | null; cupon_id?: string | null };
  type PedidoItem = { id: string; producto_id: string; cantidad?: number; precio_unitario?: number };
  type Producto = { id: string; nombre: string; precio?: number; categoria_id?: string | null; fragancia?: string | null; tamano?: string | null; tipo_cera?: string | null; color?: string | null; material_mecha?: string | null };
  type Categoria = { id: string; nombre: string };
  type Cupon = { id: string; codigo: string; activo?: boolean; fecha_fin?: string | null };
  type UsoCupon = { id: string; cupon_id?: string | null; creado_en?: string | null };
  type Newsletter = { id: string; email: string; created_at?: string | null; source?: string | null };
  type ContactMessage = { id: string; email?: string | null; created_at?: string | null; source?: string | null };
  type Review = { id: string; product_id?: string | null; rating?: number; source?: string | null };
  type Perfil = { id: string; user_id?: string; nombre?: string | null; apellido?: string | null; ciudad?: string | null; pais?: string | null };

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [usosCupones, setUsosCupones] = useState<UsoCupon[]>([]);
  const [subs, setSubs] = useState<Newsletter[]>([]);
  const [contactos, setContactos] = useState<ContactMessage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ped, items, prods, cats, cups, usos, ns, cm, rv, perf] = await Promise.all([
          supabase.from("pedidos").select("*").order("creado_en", { ascending: true }),
          supabase.from("pedido_items").select("*"),
          supabase
            .from("productos")
            .select("id, nombre, precio, categoria_id, fragancia, tamano, tipo_cera, color, material_mecha"),
          supabase.from("categorias").select("id, nombre"),
          supabase.from("cupones").select("*"),
          supabase.from("usos_cupones").select("*").order("creado_en", { ascending: true }),
          supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: true }),
          supabase.from("contact_messages").select("*").order("created_at", { ascending: true }),
          supabase.from("product_reviews").select("*"),
          supabase.from("usuarios_perfil").select("id, nombre, apellido, ciudad, pais, user_id"),
        ]);

        setPedidos(ped.data || []);
        setPedidoItems(items.data || []);
        setProductos(prods.data || []);
        setCategorias(cats.data || []);
        setCupones(cups.data || []);
        setUsosCupones(usos.data || []);
        setSubs(ns.data || []);
        setContactos(cm.data || []);
        setReviews(rv.data || []);
        setPerfiles(perf.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const ventas = useMemo(() => {
    const totalPedidos = pedidos.length;
    const totalIngresos = pedidos.reduce((s, p) => s + Number(p.total ?? 0), 0);
    const ticketPromedio = totalPedidos ? totalIngresos / totalPedidos : 0;

    const byDate: Record<string, { pedidos: number; ingresos: number }> = {};
    pedidos.forEach((p) => {
      const d = p.creado_en ? new Date(p.creado_en) : null;
      const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "unknown";
      const k = byDate[key] || { pedidos: 0, ingresos: 0 };
      k.pedidos += 1;
      k.ingresos += Number(p.total ?? 0);
      byDate[key] = k;
    });
    const pedidosPorFecha = Object.entries(byDate)
      .filter(([k]) => k !== "unknown")
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([fecha, v]) => ({ fecha, pedidos: v.pedidos, ingresos: v.ingresos }));

    const estados = pedidos.reduce((acc: Record<string, number>, p) => {
      const e = p.estado || "pendiente_pago";
      acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {});

    return { totalPedidos, totalIngresos, ticketPromedio, pedidosPorFecha, estados };
  }, [pedidos]);

  const productosVendidos = useMemo(() => {
    const byProduct: Record<string, { unidades: number; ingresos: number; nombre?: string }> = {};
    const precioMap = Object.fromEntries(productos.map((p) => [p.id, Number(p.precio ?? 0)]));
    const nombreMap = Object.fromEntries(productos.map((p) => [p.id, p.nombre]));
    pedidoItems.forEach((it) => {
      const id = it.producto_id;
      const qty = Number(it.cantidad ?? 0);
      const price = Number((it as any).precio ?? precioMap[id] ?? 0);
      const p = byProduct[id] || { unidades: 0, ingresos: 0 };
      p.unidades += qty;
      p.ingresos += qty * price;
      p.nombre = nombreMap[id];
      byProduct[id] = p;
    });
    const arr = Object.entries(byProduct).map(([id, v]) => ({ id, nombre: v.nombre || id, unidades: v.unidades, ingresos: v.ingresos }));
    const topUnidades = [...arr].sort((a, b) => b.unidades - a.unidades).slice(0, 5);
    const topIngresos = [...arr].sort((a, b) => b.ingresos - a.ingresos).slice(0, 5);
    return { topUnidades, topIngresos };
  }, [pedidoItems, productos]);

  const categoriasVentas = useMemo(() => {
    const catNombre = Object.fromEntries(categorias.map((c) => [c.id, c.nombre]));
    const prodCat = Object.fromEntries(productos.map((p) => [p.id, p.categoria_id]));
    const byCat: Record<string, { unidades: number; ingresos: number; nombre: string }> = {};
    pedidoItems.forEach((it) => {
      const pid = it.producto_id;
      const catId = prodCat[pid];
      if (!catId) return;
      const nombre = catNombre[catId] || "Sin categoría";
      const qty = Number(it.cantidad ?? 0);
      const price = Number((it as any).precio ?? 0);
      const c = byCat[catId] || { unidades: 0, ingresos: 0, nombre };
      c.unidades += qty;
      c.ingresos += qty * price;
      byCat[catId] = c;
    });
    return Object.values(byCat).sort((a, b) => b.unidades - a.unidades).slice(0, 6);
  }, [pedidoItems, productos, categorias]);

  const cuponMetrics = useMemo(() => {
    const total = cupones.length;
    const activos = cupones.filter((c) => c.activo).length;
    const inactivos = total - activos;
    const now = Date.now();
    const expirados = cupones.filter((c) => c.fecha_fin && new Date(c.fecha_fin).getTime() < now).length;
    const usosPorCupon: Record<string, number> = {};
    usosCupones.forEach((u) => {
      const id = u.cupon_id || "unknown";
      usosPorCupon[id] = (usosPorCupon[id] || 0) + 1;
    });
    const porcentajeUso = Object.entries(usosPorCupon).map(([id, count]) => ({ id, count, pct: total ? Math.round((count / usosCupones.length) * 100) : 0 }));
    const usosPorFechaMap: Record<string, number> = {};
    usosCupones.forEach((u) => {
      const d = u.creado_en ? new Date(u.creado_en) : null;
      const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "unknown";
      usosPorFechaMap[key] = (usosPorFechaMap[key] || 0) + 1;
    });
    const usosPorFecha = Object.entries(usosPorFechaMap).filter(([k]) => k !== "unknown").sort(([a], [b]) => (a < b ? -1 : 1)).map(([mes, total]) => ({ mes, total }));
    return { total, activos, inactivos, expirados, porcentajeUso, usosPorFecha };
  }, [cupones, usosCupones]);

  const cuponImpact = useMemo(() => {
    const by: Record<string, { pedidos: number; ingresos: number }> = {};
    pedidos.forEach((p) => {
      const id = (p as any).cupon_id || null;
      if (!id) return;
      const v = by[id] || { pedidos: 0, ingresos: 0 };
      v.pedidos += 1;
      v.ingresos += Number(p.total ?? 0);
      by[id] = v;
    });
    const arr = Object.entries(by).map(([id, v]) => ({ id, pedidos: v.pedidos, ingresos: v.ingresos }));
    const ordersTop = [...arr].sort((a, b) => b.pedidos - a.pedidos).slice(0, 6);
    const revenueTop = [...arr].sort((a, b) => b.ingresos - a.ingresos).slice(0, 6);
    return { ordersTop, revenueTop };
  }, [pedidos]);

  const productosAtributos = useMemo(() => {
    const precios = productos.map((p) => Number(p.precio ?? 0));
    const rango = (min: number, max: number) => precios.filter((v) => v >= min && v < max).length;
    const count = (arr: Producto[], key: keyof Producto) => {
      const m: Record<string, number> = {};
      arr.forEach((p) => {
        const raw = p?.[key];
        const v = typeof raw === "string" ? raw.trim() : raw ?? "";
        const k = v && String(v).length > 0 ? String(v) : "Sin dato";
        m[k] = (m[k] || 0) + 1;
      });
      return Object.entries(m)
        .map(([valor, total]) => ({ valor, total }))
        .sort((a, b) => b.total - a.total);
    };
    return {
      menos20: rango(0, 20),
      entre20y50: rango(20, 50),
      mas50: precios.filter((v) => v >= 50).length,
      total: productos.length,
      porColor: count(productos, "color").slice(0, 6),
      porTamano: count(productos, "tamano").slice(0, 6),
      porFragancia: count(productos, "fragancia").slice(0, 6),
      porCera: count(productos, "tipo_cera").slice(0, 6),
      porMecha: count(productos, "material_mecha").slice(0, 6),
    };
  }, [productos]);

  const clientes = useMemo(() => {
    const byUser: Record<string, { total: number; firstDate?: Date }> = {};
    pedidos.forEach((p) => {
      const uid = p.usuario_id || "guest";
      const d = p.creado_en ? new Date(p.creado_en) : undefined;
      const v = byUser[uid] || { total: 0, firstDate: d };
      v.total += Number(p.total ?? 0);
      if (!v.firstDate || (d && d < v.firstDate)) v.firstDate = d;
      byUser[uid] = v;
    });
    const totalClientes = Object.keys(byUser).filter((k) => k !== "guest").length;
    const recurrentes = Object.values(byUser).filter((v) => v.total > 0).length - 1; // aproximado
    const firstByMonth: Record<string, number> = {};
    Object.values(byUser).forEach((v) => {
      if (v.firstDate) {
        const d = v.firstDate;
        const key = `${d!.getFullYear()}-${String(d!.getMonth() + 1).padStart(2, "0")}`;
        firstByMonth[key] = (firstByMonth[key] || 0) + 1;
      }
    });
    const nuevosPorMes = Object.entries(firstByMonth).sort(([a], [b]) => (a < b ? -1 : 1)).map(([mes, total]) => ({ mes, total }));
    const topClientes = Object.entries(byUser)
      .filter(([uid]) => uid !== "guest")
      .map(([uid, v]) => ({ uid, total: v.total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((t) => {
        const perfil = perfiles.find((p: any) => p.user_id === t.uid);
        return { nombre: perfil ? `${perfil.nombre} ${perfil.apellido}` : t.uid, total: t.total };
      });
    const ciudadesMap: Record<string, number> = {};
    perfiles.forEach((p: any) => {
      const c = p.ciudad || "Sin ciudad";
      ciudadesMap[c] = (ciudadesMap[c] || 0) + 1;
    });
    const ciudades = Object.entries(ciudadesMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([ciudad, total]) => ({ ciudad, total }));
    return { totalClientes, nuevosPorMes, recurrentes, topClientes, ciudades };
  }, [pedidos, perfiles]);

  const newsletter = useMemo(() => {
    const total = subs.length;
    const byMonth: Record<string, number> = {};
    subs.forEach((s) => {
      const d = s.created_at ? new Date(s.created_at) : null;
      const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "unknown";
      byMonth[key] = (byMonth[key] || 0) + 1;
    });
    const porMes = Object.entries(byMonth).filter(([k]) => k !== "unknown").sort(([a], [b]) => (a < b ? -1 : 1)).map(([mes, total]) => ({ mes, total }));
    const origenMap: Record<string, number> = {};
    subs.forEach((s) => {
      const src = s.source || "";
      let key = src || "Desconocido";
      try {
        const u = new URL(src);
        key = u.pathname || u.hostname || key;
      } catch {}
      origenMap[key] = (origenMap[key] || 0) + 1;
    });
    const origenes = Object.entries(origenMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([origen, total]) => ({ origen, total }));
    return { total, porMes, origenes };
  }, [subs]);

  const mensajes = useMemo(() => {
    const total = contactos.length;
    const byDay: Record<string, number> = {};
    contactos.forEach((m) => {
      const d = m.created_at ? new Date(m.created_at) : null;
      const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "unknown";
      byDay[key] = (byDay[key] || 0) + 1;
    });
    const porDia = Object.entries(byDay).filter(([k]) => k !== "unknown").sort(([a], [b]) => (a < b ? -1 : 1)).map(([fecha, total]) => ({ fecha, total }));
    const origenMap: Record<string, number> = {};
    contactos.forEach((c) => {
      const src = c.source || "";
      let key = src || "Desconocido";
      try {
        const u = new URL(src);
        key = u.pathname || u.hostname || key;
      } catch {}
      origenMap[key] = (origenMap[key] || 0) + 1;
    });
    const origenes = Object.entries(origenMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([origen, total]) => ({ origen, total }));
    return { total, porDia, origenes };
  }, [contactos]);

  const reseñas = useMemo(() => {
    const total = reviews.length;
    const byProduct: Record<string, { count: number; avg: number }> = {};
    reviews.forEach((r: any) => {
      const pid = r.product_id || "unknown";
      const val = Number(r.rating ?? 0);
      const v = byProduct[pid] || { count: 0, avg: 0 };
      v.count += 1;
      v.avg = (v.avg * (v.count - 1) + val) / v.count;
      byProduct[pid] = v;
    });
    const topRated = Object.entries(byProduct)
      .filter(([id]) => id !== "unknown")
      .map(([id, v]) => ({ id, avg: v.avg, count: v.count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
    const origenMap: Record<string, number> = {};
    reviews.forEach((r) => {
      const src = r.source || "";
      let key = src || "Desconocido";
      try {
        const u = new URL(src);
        key = u.pathname || u.hostname || key;
      } catch {}
      origenMap[key] = (origenMap[key] || 0) + 1;
    });
    const origenes = Object.entries(origenMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([origen, total]) => ({ origen, total }));
    return { total, topRated, origenes };
  }, [reviews]);

  if (loading) {
    return (
      <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#6366f1", "#22c55e"];
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const axisTickColor = isDark ? "#cbd5e1" : "#374151";
  const gridColor = isDark ? "#334155" : "#e5e7eb";
  const tooltipStyle = { backgroundColor: isDark ? "#0b0b0d" : "#ffffff", border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`, color: isDark ? "#e5e7eb" : "#111827" } as any;

  return (
    <div className="pt-16 w-full px-8 pb-32">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <BarChart3 className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-amber-600" /> Total de pedidos</p>
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Pedidos registrados en el período visible</TooltipContent></Tooltip></TooltipProvider>
          </div>
          <p className="text-3xl font-semibold mt-2">{ventas.totalPedidos}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600" /> Ingresos totales</p>
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Suma de total en pedidos</TooltipContent></Tooltip></TooltipProvider>
          </div>
          <p className="text-3xl font-semibold mt-2">{formatMoney(ventas.totalIngresos)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600" /> Ticket promedio</p>
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Ingresos / total de pedidos</TooltipContent></Tooltip></TooltipProvider>
          </div>
          <p className="text-3xl font-semibold mt-2">{formatMoney(ventas.ticketPromedio)}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-display text-amber-700 mb-3 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Pedidos e Ingresos por fecha</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ventas.pedidosPorFecha}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="fecha" tick={{ fill: axisTickColor }} />
              <YAxis yAxisId="left" allowDecimals={false} tick={{ fill: axisTickColor }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={formatMoney as any} tick={{ fill: axisTickColor }} />
              <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="pedidos" stroke="#f59e0b" name="Pedidos" />
              <Line yAxisId="right" type="monotone" dataKey="ingresos" stroke="#10b981" name="Ingresos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-display text-amber-700 mb-3 flex items-center gap-2"><PieChart className="w-5 h-5" /> Estados de pedido</h2>
          <ResponsiveContainer width="100%" height={240}>
            <ChartPie>
              <Pie data={Object.entries(ventas.estados).map(([label, value]) => ({ label, value }))} dataKey="value" nameKey="label" innerRadius={40} outerRadius={80}>
                {Object.keys(ventas.estados).map((_, i) => (
                  <Cell key={`e-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
              <Legend />
            </ChartPie>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Productos vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-display text-amber-700 mb-3 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Top productos por unidades</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productosVendidos.topUnidades}>
              <XAxis dataKey="nombre" hide={false} tick={{ fill: axisTickColor }} />
              <YAxis allowDecimals={false} tick={{ fill: axisTickColor }} />
              <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
              <Bar dataKey="unidades" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-display text-amber-700 mb-3 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Top productos por ingresos</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productosVendidos.topIngresos}>
              <XAxis dataKey="nombre" hide={false} tick={{ fill: axisTickColor }} />
              <YAxis tickFormatter={formatMoney as any} tick={{ fill: axisTickColor }} />
              <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
              <Bar dataKey="ingresos" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categorías */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow mb-12">
        <h2 className="text-lg font-display text-amber-700 mb-3 flex items-center gap-2"><Tag className="w-5 h-5" /> Ventas por categoría</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={categoriasVentas}>
            <XAxis dataKey="nombre" tick={{ fill: axisTickColor }} />
            <YAxis tickFormatter={formatMoney as any} tick={{ fill: axisTickColor }} />
            <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
            <Bar dataKey="unidades" fill="#f97316" name="Unidades" />
            <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cupones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-display text-amber-700 mb-3">Cupones</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{cuponMetrics.total}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Activos</p>
              <p className="text-2xl font-semibold">{cuponMetrics.activos}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expirados</p>
              <p className="text-2xl font-semibold">{cuponMetrics.expirados}</p>
            </div>
          </div>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={cuponMetrics.usosPorFecha}>
                <XAxis dataKey="mes" tick={{ fill: axisTickColor }} />
                <YAxis allowDecimals={false} tick={{ fill: axisTickColor }} />
                <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
                <Bar dataKey="total" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <h2 className="text-lg font-display text-amber-700 mb-3">Impacto de cupones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              {cuponImpact.ordersTop.map((c) => (
                <div key={`o-${c.id}`} className="flex items-center justify-between border rounded-lg p-3">
                  <span className="text-sm">{c.id}</span>
                  <span className="text-sm text-muted-foreground">{c.pedidos} pedidos</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {cuponImpact.revenueTop.map((c) => (
                <div key={`r-${c.id}`} className="flex items-center justify-between border rounded-lg p-3">
                  <span className="text-sm">{c.id}</span>
                  <span className="text-sm text-muted-foreground">{formatMoney(c.ingresos)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground">Productos totales</p>
          <p className="text-3xl font-semibold">{productosAtributos.total}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground">Precio &lt; $20</p>
          <p className="text-3xl font-semibold">{productosAtributos.menos20}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground">$20 – $50</p>
          <p className="text-3xl font-semibold">{productosAtributos.entre20y50}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground">≥ $50</p>
          <p className="text-3xl font-semibold">{productosAtributos.mas50}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-display text-amber-700 mb-3">Productos por color</h2>
          {productosAtributos.porColor.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos</p>
          ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productosAtributos.porColor}>
              <XAxis dataKey="valor" tick={{ fill: axisTickColor }} />
              <YAxis allowDecimals={false} tick={{ fill: axisTickColor }} />
              <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
              <Bar dataKey="total" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-display text-amber-700 mb-3">Productos por tamaño</h2>
          {productosAtributos.porTamano.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos</p>
          ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productosAtributos.porTamano}>
              <XAxis dataKey="valor" tick={{ fill: axisTickColor }} />
              <YAxis allowDecimals={false} tick={{ fill: axisTickColor }} />
              <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
              <Bar dataKey="total" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-display text-amber-700 mb-3">Productos por fragancia</h2>
          {productosAtributos.porFragancia.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos</p>
          ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productosAtributos.porFragancia}>
              <XAxis dataKey="valor" tick={{ fill: axisTickColor }} />
              <YAxis allowDecimals={false} tick={{ fill: axisTickColor }} />
              <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
              <Bar dataKey="total" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-display text-amber-700 mb-3">Productos por tipo de cera</h2>
          {productosAtributos.porCera.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos</p>
          ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productosAtributos.porCera}>
              <XAxis dataKey="valor" tick={{ fill: axisTickColor }} />
              <YAxis allowDecimals={false} tick={{ fill: axisTickColor }} />
              <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
              <Bar dataKey="total" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <h2 className="text-lg font-display text-amber-700 mb-3">Productos por material de mecha</h2>
          {productosAtributos.porMecha.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos</p>
          ) : (
          <ResponsiveContainer width="100%" height={240}>
              <BarChart data={productosAtributos.porMecha}>
                <XAxis dataKey="valor" tick={{ fill: axisTickColor }} />
                <YAxis allowDecimals={false} tick={{ fill: axisTickColor }} />
                <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
                <Bar dataKey="total" fill="#64748b" />
              </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-display text-amber-700 mb-3">Clientes</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{clientes.totalClientes}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recurrentes (aprox)</p>
              <p className="text-2xl font-semibold">{clientes.recurrentes}</p>
            </div>
          </div>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={clientes.nuevosPorMes}>
                <XAxis dataKey="mes" tick={{ fill: axisTickColor }} />
                <YAxis allowDecimals={false} tick={{ fill: axisTickColor }} />
                <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
                <Bar dataKey="total" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-display text-amber-700 mb-3">Top clientes por gasto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clientes.topClientes.map((c, i) => (
              <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                <span className="text-sm">{c.nombre}</span>
                <span className="text-sm text-muted-foreground">${Number(c.total).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <h3 className="text-sm font-medium mt-4 mb-2">Ciudades principales</h3>
          <div className="grid grid-cols-3 gap-3">
            {clientes.ciudades.map((c, i) => (
              <div key={i} className="border rounded-lg p-3 text-sm flex items-center justify-between">
                <span>{c.ciudad}</span>
                <span className="text-muted-foreground">{c.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marketing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-display text-amber-700 mb-3 flex items-center gap-2"><Mail className="w-5 h-5" /> Newsletter</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Suscriptores</p>
              <p className="text-2xl font-semibold">{newsletter.total}</p>
            </div>
          </div>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={newsletter.porMes}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="mes" tick={{ fill: axisTickColor }} />
                <YAxis allowDecimals={false} tick={{ fill: axisTickColor }} />
                <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <h3 className="text-sm font-medium mt-4 mb-2">Origen de suscripción</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {newsletter.origenes.map((o, i) => (
              <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                <span className="text-sm truncate max-w-[70%]">{o.origen}</span>
                <span className="text-sm text-muted-foreground">{o.total}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-display text-amber-700 mb-3 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Mensajes de contacto</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{mensajes.total}</p>
            </div>
          </div>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={mensajes.porDia}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="fecha" tick={{ fill: axisTickColor }} />
                <YAxis allowDecimals={false} tick={{ fill: axisTickColor }} />
                <ChartTooltip contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} />
                <Line type="monotone" dataKey="total" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <h3 className="text-sm font-medium mt-4 mb-2">Origen de mensajes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mensajes.origenes.map((o, i) => (
              <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                <span className="text-sm truncate max-w-[70%]">{o.origen}</span>
                <span className="text-sm text-muted-foreground">{o.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-lg font-display text-amber-700 mb-3 flex items-center gap-2"><Star className="w-5 h-5" /> Reseñas</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold">{reseñas.total}</p>
          </div>
        </div>
        <h3 className="text-sm font-medium mt-4 mb-2">Top productos mejor valorados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reseñas.topRated.map((r, i) => (
            <div key={i} className="border rounded-lg p-3 text-sm flex items-center justify-between">
              <span>Producto {r.id}</span>
              <span className="text-muted-foreground">{r.avg.toFixed(2)} ⭐ ({r.count})</span>
            </div>
          ))}
        </div>
        <h3 className="text-sm font-medium mt-4 mb-2">Origen de reseñas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reseñas.origenes.map((o, i) => (
            <div key={i} className="flex items-center justify-between border rounded-lg p-3">
              <span className="text-sm truncate max-w-[70%]">{o.origen}</span>
              <span className="text-sm text-muted-foreground">{o.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
  const formatMoney = (v: number) => `$${Number(v).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
