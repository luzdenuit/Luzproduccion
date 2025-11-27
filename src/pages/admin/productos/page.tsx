import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Package,
  Leaf,
  Tag,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  fragancia: string | null;
  imagen_principal: string | null;
  stock: number;
  activa: boolean;
  categoria_id: string | null;
  categorias?: { nombre: string | null };
  ecológica: boolean | null;
  tamano: string | null;
  tipo_cera: string | null;
  color: string | null;
  creado_en: string;
};

const STOCK_LOW_THRESHOLD = 5;
const STOCK_CRITICAL_THRESHOLD = 1;

const COLORS = ["#d97706", "#0f766e", "#6366f1", "#f97316", "#22c55e", "#e11d48", "#636363"];

export default function ListaProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProductos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("productos")
      .select(
        `
        id,
        nombre,
        precio,
        fragancia,
        imagen_principal,
        stock,
        activa,
        categoria_id,
        ecológica,
        tamano,
        tipo_cera,
        color,
        creado_en,
        categorias (nombre)
      `
      )
      .order("creado_en", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Error cargando productos");
    } else {
      setProductos(
        (data as any[]).map((p) => ({
          ...p,
          precio: Number(p.precio),
          stock: p.stock ?? 0,
        }))
      );
    }

    setLoading(false);
  };

  const eliminarProducto = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id", deleteId);

    if (error) {
      console.error(error);
      toast.error("Error al eliminar el producto");
    } else {
      toast.success("Producto eliminado");
      fetchProductos();
    }

    setDeleteId(null);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // ---------- MÉTRICAS Y DATOS PARA GRÁFICOS ----------
  const analytics = useMemo(() => {
    if (productos.length === 0) {
      return {
        total: 0,
        activos: 0,
        inactivos: 0,
        stockBajo: 0,
        stockAgotado: 0,
        precioPromedio: 0,
        precioMin: 0,
        precioMax: 0,
        ecoCount: 0,
        ecoPercent: 0,
        categoriasData: [] as { categoria: string; total: number }[],
        fraganciasData: [] as { fragancia: string; total: number }[],
        stockHealthData: [] as { label: string; value: number }[],
        ecoData: [] as { label: string; value: number }[],
        createdByMonthData: [] as { mes: string; total: number }[],
      };
    }

    const total = productos.length;
    const activos = productos.filter((p) => p.activa).length;
    const inactivos = total - activos;
    const stockBajo = productos.filter(
      (p) => p.stock > 0 && p.stock <= STOCK_LOW_THRESHOLD
    ).length;
    const stockAgotado = productos.filter((p) => p.stock <= 0).length;
    const ecoCount = productos.filter((p) => p.ecológica).length;

    const precioLista = productos.map((p) => p.precio);
    const precioPromedio =
      precioLista.reduce((a, b) => a + b, 0) / (precioLista.length || 1);
    const precioMin = Math.min(...precioLista);
    const precioMax = Math.max(...precioLista);

    const ecoPercent = total > 0 ? Math.round((ecoCount / total) * 100) : 0;

    // Productos por categoría
    const categoriasMap: Record<string, number> = {};
    for (const p of productos) {
      const cat = p.categorias?.nombre || "Sin categoría";
      categoriasMap[cat] = (categoriasMap[cat] || 0) + 1;
    }
    const categoriasData = Object.entries(categoriasMap)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);

    // Fragancias
    const fragMap: Record<string, number> = {};
    for (const p of productos) {
      const frag = p.fragancia || "Sin fragancia";
      fragMap[frag] = (fragMap[frag] || 0) + 1;
    }
    const fraganciasData = Object.entries(fragMap)
      .map(([fragancia, total]) => ({ fragancia, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);

    // Salud de stock
    const stockNormal =
      total - stockBajo - stockAgotado >= 0
        ? total - stockBajo - stockAgotado
        : 0;
    const stockHealthData = [
      { label: "Normal", value: stockNormal },
      { label: "Bajo", value: stockBajo },
      { label: "Agotado", value: stockAgotado },
    ];

    // Eco vs no eco
    const ecoData = [
      { label: "Ecológicas", value: ecoCount },
      { label: "No ecológicas", value: total - ecoCount },
    ];

    // Productos creados por mes
    const monthMap: Record<string, number> = {};
    for (const p of productos) {
      const d = new Date(p.creado_en);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthMap[m] = (monthMap[m] || 0) + 1;
    }
    const createdByMonthData = Object.entries(monthMap)
      .map(([mes, total]) => ({ mes, total }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    return {
      total,
      activos,
      inactivos,
      stockBajo,
      stockAgotado,
      precioPromedio,
      precioMin,
      precioMax,
      ecoCount,
      ecoPercent,
      categoriasData,
      fraganciasData,
      stockHealthData,
      ecoData,
      createdByMonthData,
    };
  }, [productos]);

  return (
    <div className="w-full">
      <Navbar />

      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <Package className="h-10 w-10 text-amber-700 dark:text-amber-300" />
              Productos
            </h1>
            <p className="text-muted-foreground mt-1">
              Administra todos los productos y visualiza el estado del
              inventario.
            </p>
          </div>

          <Link to="/admin/productos/crear">
            <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20">
              <PlusCircle className="h-5 w-5" />
              Nuevo producto
            </Button>
          </Link>
        </div>

        {/* LOADING PLACEHOLDERS */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-muted animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}

        {/* ESTADO VACÍO */}
        {!loading && productos.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="mx-auto h-12 w-12 opacity-40" />
            <p className="mt-4 text-lg">No hay productos registrados aún.</p>
            <Link to="/admin/productos/crear">
              <Button className="mt-6 bg-amber-600 hover:bg-amber-700">
                Crear primer producto
              </Button>
            </Link>
          </div>
        )}

        {/* DASHBOARD + LISTADO */}
        {!loading && productos.length > 0 && (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-card border border-border rounded-xl shadow-sm"
              >
                <p className="text-sm text-muted-foreground">
                  Total productos
                </p>
                <p className="text-3xl font-display text-amber-700 dark:text-amber-300 mt-1">
                  {analytics.total}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-card border border-border rounded-xl shadow-sm"
              >
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-3xl text-green-600 dark:text-green-300 font-display mt-1">
                  {analytics.activos}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(
                    (analytics.activos / analytics.total) *
                    100
                  ).toFixed(0)}
                  % del catálogo
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-card border border-border rounded-xl shadow-sm"
              >
                <p className="text-sm text-muted-foreground">Stock bajo</p>
                <p className="text-3xl text-red-600 dark:text-red-400 font-display mt-1">
                  {analytics.stockBajo}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Incluye productos por debajo de {STOCK_LOW_THRESHOLD} unidades
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-card border border-border rounded-xl shadow-sm"
              >
                <p className="text-sm text-muted-foreground">
                  Precio promedio
                </p>
                <p className="text-3xl font-display text-amber-700 dark:text-amber-300 mt-1">
                  ${analytics.precioPromedio.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mín: ${analytics.precioMin.toFixed(0)} – Máx: $
                  {analytics.precioMax.toFixed(0)}
                </p>
              </motion.div>
            </div>

            {/* INSIGHTS RÁPIDOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="p-4 bg-amber-500/10 border border-border rounded-xl text-amber-700 dark:text-amber-300 text-sm">
                <p className="font-semibold">🌱 Catálogo ecológico</p>
                <p className="mt-1">
                  {analytics.ecoCount} productos ecológicos (
                  {analytics.ecoPercent}% del catálogo).
                </p>
              </div>
              <div className="p-4 bg-rose-500/10 border border-border rounded-xl text-rose-700 dark:text-rose-300 text-sm">
                <p className="font-semibold">⚠️ Reposición sugerida</p>
                <p className="mt-1">
                  {analytics.stockBajo + analytics.stockAgotado} productos con
                  stock bajo o agotado.
                </p>
              </div>
              <div className="p-4 bg-emerald-500/10 border border-border rounded-xl text-emerald-700 dark:text-emerald-300 text-sm">
                <p className="font-semibold">🏷️ Diversidad de catálogo</p>
                <p className="mt-1">
                  {analytics.categoriasData.length} categorías activas y{" "}
                  {analytics.fraganciasData.length} fragancias destacadas.
                </p>
              </div>
            </div>

            {/* GRÁFICOS PRINCIPALES */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
              {/* Productos por categoría */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-display text-amber-700 mb-3">
                  Productos por categoría
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.categoriasData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="categoria" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="total"
                      fill="#d97706"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Salud del stock */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-display text-amber-700 mb-3">
                  Salud del stock
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={analytics.stockHealthData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {analytics.stockHealthData.map((entry, index) => (
                        <Cell
                          key={entry.label}
                          fill={
                            entry.label === "Normal"
                              ? "#22c55e"
                              : entry.label === "Bajo"
                              ? "#f97316"
                              : "#dc2626"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Eco vs No Eco */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-display text-amber-700 mb-3">
                  Velas ecológicas
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={analytics.ecoData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {analytics.ecoData.map((entry, index) => (
                        <Cell
                          key={entry.label}
                          fill={entry.label === "Ecológicas" ? "#16a34a" : "#6b7280"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRÁFICOS SECUNDARIOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Fragancias más usadas */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-display text-amber-700 mb-3">
                  Fragancias destacadas
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.fraganciasData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="fragancia" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="total"
                      radius={[8, 8, 0, 0]}
                      fill="#0f766e"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Productos creados por mes */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-display text-amber-700 mb-3">
                  Evolución del catálogo
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={analytics.createdByMonthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#d97706"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRID DE PRODUCTOS */}
            <h2 className="text-2xl font-display text-amber-700 dark:text-amber-300 mb-4">
              Listado de productos
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Vista detallada de cada producto para editar, activar o eliminar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productos.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="group bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition p-4"
                >
                  {/* Imagen */}
                  <div className="relative">
                    <img
                      src={p.imagen_principal || ""}
                      alt={p.nombre}
                      className="rounded-lg w-full h-52 object-cover"
                    />

                    {/* Estado activo/inactivo */}
                    {!p.activa && (
                      <span className="absolute top-2 left-2 px-3 py-1 text-xs bg-red-500/90 dark:bg-red-600 text-white rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>

                  {/* Nombre */}
                  <h3 className="text-xl font-semibold mt-4">{p.nombre}</h3>

                  {/* Fragancia */}
                  {p.fragancia && (
                    <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                      <Leaf className="w-4 h-4" /> {p.fragancia}
                    </p>
                  )}

                  {/* Categoría */}
                  {p.categorias?.nombre && (
                    <p className="text-xs mt-1 flex items-center gap-1 text-amber-700 dark:text-amber-300">
                      <Tag className="w-4 h-4" /> {p.categorias.nombre}
                    </p>
                  )}

                  {/* Precio */}
                  <p className="text-amber-700 dark:text-amber-300 font-display text-xl mt-3">
                    ${p.precio}
                  </p>

                  {/* Stock */}
                  <p
                    className={`mt-1 text-sm ${
                      p.stock <= STOCK_LOW_THRESHOLD
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    Stock: {p.stock}
                  </p>

                  {/* Acciones */}
                  <div className="flex justify-between mt-5">
                    <Link to={`/admin/productos/editar/${p.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Pencil className="h-4 w-4" /> Editar
                      </Button>
                    </Link>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(p.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>



      {/* Modal de eliminación */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
          </AlertDialogHeader>

          <p className="text-muted-foreground">
            Esta acción no se puede deshacer.
          </p>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={eliminarProducto}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
