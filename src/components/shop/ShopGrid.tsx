import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type GridProduct = {
  id: string;
  imagen_principal: string | null;
  nombre: string;
  fragancia: string | null;
  precio: number;
  categoria_nombre: string | null;
};

type Props = {
  loading: boolean;
  products: GridProduct[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  clearFilters: () => void;
};

export default function ShopGrid({ loading, products, totalPages, currentPage, setCurrentPage, clearFilters }: Props) {
  if (loading) return <p className="text-center text-muted-foreground">Cargando productos...</p>;
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No se encontraron productos con estos filtros.</p>
        <Button variant="outline" className="mt-4" onClick={clearFilters}>Limpiar filtros</Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {products.map((product, index) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
            <ProductCard
              id={product.id}
              image={product.imagen_principal ?? ""}
              name={product.nombre}
              fragrance={product.fragancia ?? ""}
              price={product.precio}
              category={product.categoria_nombre ?? ""}
            />
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1} className="cursor-pointer">
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}