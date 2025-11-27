import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopHero from "@/components/shop/ShopHero";
import ShopFiltersSidebar from "@/components/shop/ShopFiltersSidebar";
import ShopTopBar from "@/components/shop/ShopTopBar";
import ShopGrid from "@/components/shop/ShopGrid";

import { Select } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  peso_gramos: number | null;
  duracion_horas: number | null;
  fragancia: string | null;
  tamano: string | null;
  color: string | null;
  tipo_cera: string | null;
  material_mecha: string | null;
  ecológica: boolean | null;
  imagen_principal: string | null;
  categoria_id: string | null;
  categoria_nombre?: string | null;
}

const DEFAULT_ITEMS_PER_PAGE = 12;

const Shop = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [selectedFragancia, setSelectedFragancia] = useState<string>("todas");
  const [selectedTamano, setSelectedTamano] = useState<string>("todos");
  const [selectedCera, setSelectedCera] = useState<string>("todas");
  const [ecoOnly, setEcoOnly] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState<string>("default");
  const [priceRange, setPriceRange] = useState<number[]>([0, 200]);
  const [selectedColor, setSelectedColor] = useState<string>("todos");
  const [selectedMateriales, setSelectedMateriales] = useState<string[]>([]);
  const [duracionRange, setDuracionRange] = useState<number[]>([0, 100]);
  const [pesoRange, setPesoRange] = useState<number[]>([0, 2000]);
  const [ratingMin, setRatingMin] = useState<number>(0);
  const [soloDescuento, setSoloDescuento] = useState<boolean>(false);

  const [discountedIds, setDiscountedIds] = useState<Set<string>>(new Set());
  const [ratingsAvg, setRatingsAvg] = useState<Record<string, number>>({});
  

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(DEFAULT_ITEMS_PER_PAGE);

  // -----------------------------------
  // 1. Cargar productos desde Supabase
  // -----------------------------------
  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("productos")
        .select(
          `
          id,
          nombre,
          descripcion,
          precio,
          stock,
          peso_gramos,
          duracion_horas,
          fragancia,
          tamano,
          color,
          tipo_cera,
          material_mecha,
          ecológica,
          imagen_principal,
          categoria_id,
          categorias (nombre)
        `
        )
        .eq("activa", true)
        .order("creado_en", { ascending: false });

      if (error) {
        console.error("Error al cargar productos:", error);
        setProductos([]);
        setLoading(false);
        return;
      }

      const mapped: Producto[] =
        (data || []).map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: Number(p.precio),
          stock: p.stock ?? 0,
          peso_gramos: p.peso_gramos,
          duracion_horas: p.duracion_horas,
          fragancia: p.fragancia,
          tamano: p.tamano,
          color: p.color,
          tipo_cera: p.tipo_cera,
          material_mecha: p.material_mecha,
          ecológica: p.ecológica,
          imagen_principal: p.imagen_principal,
          categoria_id: p.categoria_id,
          categoria_nombre: p.categorias?.nombre ?? null,
        })) || [];

      setProductos(mapped);

      // Ajustar rango de precio al rango real
      if (mapped.length > 0) {
        const precios = mapped.map((p) => p.precio);
        const min = Math.floor(Math.min(...precios));
        const max = Math.ceil(Math.max(...precios));
        setPriceRange([min, max]);

        const duraciones = mapped.map((p) => Number(p.duracion_horas ?? 0));
        const pesos = mapped.map((p) => Number(p.peso_gramos ?? 0));
        const minDur = Math.floor(Math.min(...duraciones));
        const maxDur = Math.ceil(Math.max(...duraciones));
        const minPeso = Math.floor(Math.min(...pesos));
        const maxPeso = Math.ceil(Math.max(...pesos));
        setDuracionRange([minDur, maxDur]);
        setPesoRange([minPeso, maxPeso]);
      }

      setLoading(false);
    };

    fetchProductos();
  }, []);

  // -----------------------------------
  // 2. Opciones dinámicas de filtros
  // -----------------------------------
  const {
    categories,
    fragancias,
    tamanos,
    ceras,
    colores,
    materiales,
    minPrecio,
    maxPrecio,
    minDuracion,
    maxDuracion,
    minPeso,
    maxPeso,
  } = useMemo(() => {
    if (productos.length === 0) {
      return {
        categories: [{ id: "todas", name: "Todas las velas" }],
        fragancias: ["todas"],
        tamanos: ["todos"],
        ceras: ["todas"],
        colores: ["todos"],
        materiales: [],
        minPrecio: 0,
        maxPrecio: 200,
        minDuracion: 0,
        maxDuracion: 100,
        minPeso: 0,
        maxPeso: 2000,
      };
    }

    const uniq = <T,>(arr: (T | null | undefined)[]) =>
      Array.from(new Set(arr.filter(Boolean) as T[]));

    const catSet = uniq(
      productos.map((p) => p.categoria_nombre || "Sin categoría")
    ).map((name) => ({
      id: name,
      name,
    }));

    const fragSet = ["todas", ...uniq(productos.map((p) => p.fragancia))];
    const tamSet = ["todos", ...uniq(productos.map((p) => p.tamano))];
    const ceraSet = ["todas", ...uniq(productos.map((p) => p.tipo_cera))];
    const colorSet = ["todos", ...uniq(productos.map((p) => p.color))];
    const materialesSet = uniq(productos.map((p) => p.material_mecha));

    const precios = productos.map((p) => p.precio);
    const min = Math.floor(Math.min(...precios));
    const max = Math.ceil(Math.max(...precios));

    const duraciones = productos.map((p) => Number(p.duracion_horas ?? 0));
    const pesos = productos.map((p) => Number(p.peso_gramos ?? 0));
    const minDur = Math.floor(Math.min(...duraciones));
    const maxDur = Math.ceil(Math.max(...duraciones));
    const minPeso = Math.floor(Math.min(...pesos));
    const maxPeso = Math.ceil(Math.max(...pesos));

    return {
      categories: [{ id: "todas", name: "Todas las velas" }, ...catSet],
      fragancias: fragSet,
      tamanos: tamSet,
      ceras: ceraSet,
      colores: colorSet,
      materiales: materialesSet,
      minPrecio: min,
      maxPrecio: max,
      minDuracion: minDur,
      maxDuracion: maxDur,
      minPeso,
      maxPeso,
    };
  }, [productos]);

  // clamp para que el slider no se salga del rango real
  const clampedPriceRange: [number, number] = [
    Math.max(priceRange[0], minPrecio),
    Math.min(priceRange[1], maxPrecio),
  ];
  const clampedDuracionRange: [number, number] = [
    Math.max(duracionRange[0], minDuracion),
    Math.min(duracionRange[1], maxDuracion),
  ];
  const clampedPesoRange: [number, number] = [
    Math.max(pesoRange[0], minPeso),
    Math.min(pesoRange[1], maxPeso),
  ];

  useEffect(() => {
    const loadDiscounts = async () => {
      const ids = productos.map((p) => p.id);
      if (ids.length === 0) {
        setDiscountedIds(new Set());
        return;
      }
      const { data } = await supabase
        .from("descuentos_productos")
        .select("*")
        .in("producto_id", ids)
        .eq("activo", true);
      const now = Date.now();
      const set = new Set<string>();
      (data || []).forEach((d: any) => {
        const ini = d.fecha_inicio ? new Date(d.fecha_inicio).getTime() : null;
        const fin = d.fecha_fin ? new Date(d.fecha_fin).getTime() : null;
        const okIni = ini === null || ini <= now;
        const okFin = fin === null || fin >= now;
        if (okIni && okFin && d.producto_id) set.add(String(d.producto_id));
      });
      setDiscountedIds(set);
    };
    loadDiscounts();
  }, [productos]);

  useEffect(() => {
    const loadRatings = async () => {
      const ids = productos.map((p) => p.id);
      if (ids.length === 0) {
        setRatingsAvg({});
        return;
      }
      const { data } = await supabase
        .from("product_reviews")
        .select("product_id, rating")
        .in("product_id", ids);
      const agg: Record<string, { sum: number; count: number }> = {};
      (data || []).forEach((r: any) => {
        const id = String(r.product_id);
        const val = Number(r.rating);
        if (!agg[id]) agg[id] = { sum: 0, count: 0 };
        if (!Number.isNaN(val)) {
          agg[id].sum += val;
          agg[id].count += 1;
        }
      });
      const avg: Record<string, number> = {};
      Object.entries(agg).forEach(([id, a]) => {
        avg[id] = a.count > 0 ? a.sum / a.count : 0;
      });
      setRatingsAvg(avg);
    };
    loadRatings();
  }, [productos]);

  // -----------------------------------
  // 3. Filtros + orden
  // -----------------------------------
  const filteredProducts = useMemo(() => {
    let list = productos.filter((product) => {
      const matchesCategory =
        selectedCategory === "todas" ||
        product.categoria_nombre === selectedCategory;

      const matchesPrice =
        product.precio >= clampedPriceRange[0] &&
        product.precio <= clampedPriceRange[1];

      const matchesFragancia =
        selectedFragancia === "todas" ||
        product.fragancia === selectedFragancia;

      const matchesTamano =
        selectedTamano === "todos" || product.tamano === selectedTamano;

      const matchesCera =
        selectedCera === "todas" || product.tipo_cera === selectedCera;

      const matchesEco = !ecoOnly || Boolean(product.ecológica);
      const matchesStock = !inStock || product.stock > 0;
      const matchesColor = selectedColor === "todos" || product.color === selectedColor;
      const matchesMateriales = selectedMateriales.length === 0 || (product.material_mecha && selectedMateriales.includes(product.material_mecha));
      const matchesDuracion = typeof product.duracion_horas === "number"
        ? product.duracion_horas >= clampedDuracionRange[0] && product.duracion_horas <= clampedDuracionRange[1]
        : true;
      const matchesPeso = typeof product.peso_gramos === "number"
        ? product.peso_gramos >= clampedPesoRange[0] && product.peso_gramos <= clampedPesoRange[1]
        : true;
      const matchesRating = ratingMin <= 0 || (ratingsAvg[product.id] ?? 0) >= ratingMin;
      const matchesDescuento = !soloDescuento || discountedIds.has(product.id);

      return (
        matchesCategory &&
        matchesPrice &&
        matchesFragancia &&
        matchesTamano &&
        matchesCera &&
        matchesColor &&
        matchesMateriales &&
        matchesDuracion &&
        matchesPeso &&
        matchesEco &&
        matchesStock &&
        matchesRating &&
        matchesDescuento
      );
    });

    // Sorting
    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.precio - b.precio);
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.precio - a.precio);
    } else if (sortBy === "newest") {
      // ya vienen por creado_en desc, solo clonamos
      list = [...list];
    }

    return list;
  }, [
    productos,
    selectedCategory,
    clampedPriceRange,
    selectedFragancia,
    selectedTamano,
    selectedCera,
    selectedColor,
    selectedMateriales,
    clampedDuracionRange,
    clampedPesoRange,
    ecoOnly,
    inStock,
    ratingMin,
    soloDescuento,
    ratingsAvg,
    discountedIds,
    sortBy,
  ]);

  // reset de página cuando cambien filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    clampedPriceRange[0],
    clampedPriceRange[1],
    selectedFragancia,
    selectedTamano,
    selectedCera,
    ecoOnly,
    inStock,
  ]);

  // -----------------------------------
  // 4. Paginación
  // -----------------------------------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, itemsPerPage]);

  const clearFilters = () => {
    setSelectedCategory("todas");
    setSelectedFragancia("todas");
    setSelectedTamano("todos");
    setSelectedCera("todas");
    setEcoOnly(false);
    setInStock(false);
    setPriceRange([minPrecio, maxPrecio]);
    setSelectedColor("todos");
    setSelectedMateriales([]);
    setDuracionRange([minDuracion, maxDuracion]);
    setPesoRange([minPeso, maxPeso]);
    setRatingMin(0);
    setSoloDescuento(false);
    setSortBy("default");
    setCurrentPage(1);
  };

  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <div className="min-h-screen">
      <Navbar />

      <ShopHero title="Nuestra Colección" subtitle="Cada aroma cuenta una historia. Encuentra la luz que habita en ti." />

      {/* Filters & Products */}
      <section className="py-12 container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <ShopFiltersSidebar
            categories={categories}
            fragancias={fragancias}
            tamanos={tamanos}
            ceras={ceras}
            minPrecio={minPrecio}
            maxPrecio={maxPrecio}
            clampedPriceRange={clampedPriceRange}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedFragancia={selectedFragancia}
            setSelectedFragancia={setSelectedFragancia}
            selectedTamano={selectedTamano}
            setSelectedTamano={setSelectedTamano}
            selectedCera={selectedCera}
            setSelectedCera={setSelectedCera}
            ecoOnly={ecoOnly}
            setEcoOnly={(v) => setEcoOnly(Boolean(v))}
            inStock={inStock}
            setInStock={(v) => setInStock(Boolean(v))}
            setPriceRange={setPriceRange}
            colores={colores}
            materiales={materiales}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedMecha={""}
            setSelectedMecha={() => {}}
            selectedMateriales={selectedMateriales}
            setSelectedMateriales={setSelectedMateriales}
            minDuracion={minDuracion}
            maxDuracion={maxDuracion}
            duracionRange={clampedDuracionRange}
            setDuracionRange={setDuracionRange}
            minPeso={minPeso}
            maxPeso={maxPeso}
            pesoRange={clampedPesoRange}
            setPesoRange={setPesoRange}
            ratingMin={ratingMin}
            setRatingMin={setRatingMin}
            soloDescuento={soloDescuento}
            setSoloDescuento={(b) => setSoloDescuento(Boolean(b))}
            clearFilters={clearFilters}
          />

          <div className="flex-1">
            <ShopTopBar
              startIndex={startIndex}
              itemsPerPage={itemsPerPage}
              totalCount={filteredProducts.length}
              sortBy={sortBy}
              onChangeSort={setSortBy}
              pageSize={itemsPerPage}
              onChangePageSize={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
            <ShopGrid
              loading={loading}
              products={paginatedProducts as any}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={(p) => setCurrentPage(p)}
              clearFilters={clearFilters}
            />
          </div>
        </div>
      </section>

      {/* Beneficios removidos */}

      <Footer />
    </div>
  );
};

export default Shop;
