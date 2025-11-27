import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  startIndex: number;
  itemsPerPage: number;
  totalCount: number;
  sortBy: string;
  onChangeSort: (val: string) => void;
  pageSize: number;
  onChangePageSize: (val: number) => void;
};

export default function ShopTopBar({ startIndex, itemsPerPage, totalCount, sortBy, onChangeSort, pageSize, onChangePageSize }: Props) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <p className="text-muted-foreground">
        Mostrando {totalCount === 0 ? 0 : `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalCount)}`} de {totalCount} productos
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Select value={sortBy} onValueChange={onChangeSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Predeterminado</SelectItem>
              <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="newest">Más recientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Por página:</span>
          <Select value={String(pageSize)} onValueChange={(v) => onChangePageSize(Number(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Cantidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9">9</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="16">16</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}