import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";

type Category = { id: string; name: string };

type Props = {
  categories: Category[];
  fragancias: string[];
  tamanos: string[];
  ceras: string[];
  minPrecio?: number;
  maxPrecio?: number;
  clampedPriceRange?: [number, number];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  selectedFragancia: string;
  setSelectedFragancia: (val: string) => void;
  selectedTamano: string;
  setSelectedTamano: (val: string) => void;
  selectedCera: string;
  setSelectedCera: (val: string) => void;
  ecoOnly: boolean;
  setEcoOnly: (val: boolean) => void;
  inStock: boolean;
  setInStock: (val: boolean) => void;
  setPriceRange: (range: number[]) => void;

  colores?: string[];
  materiales?: string[];
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  selectedMecha: string;
  setSelectedMecha: (c: string) => void;
  selectedMateriales: string[];
  setSelectedMateriales: (arr: string[]) => void;

  minDuracion?: number;
  maxDuracion?: number;
  duracionRange?: [number, number];
  setDuracionRange: (r: number[]) => void;

  minPeso?: number;
  maxPeso?: number;
  pesoRange?: [number, number];
  setPesoRange: (r: number[]) => void;

  ratingMin: number;
  setRatingMin: (n: number) => void;

  soloDescuento: boolean;
  setSoloDescuento: (b: boolean) => void;

  clearFilters: () => void;
};

export default function ShopFiltersSidebar(props: Props) {
  const [showFilters, setShowFilters] = useState(false);

  // VALORES SEGUROS SIEMPRE
  const categoriasSafe = props.categories ?? [];
  const fraganciasSafe = props.fragancias ?? [];
  const tamanosSafe = props.tamanos ?? [];
  const cerasSafe = props.ceras ?? [];
  const coloresSafe = props.colores ?? [];
  const materialesSafe = props.materiales ?? [];

  const duracionSafe: [number, number] = props.duracionRange ?? [0, 100];
  const pesoSafe: [number, number] = props.pesoRange ?? [0, 1000];
  const precioSafe: [number, number] = props.clampedPriceRange ?? [0, 9999];

  const minDurSafe = props.minDuracion ?? 0;
  const maxDurSafe = props.maxDuracion ?? 100;

  const minPesoSafe = props.minPeso ?? 0;
  const maxPesoSafe = props.maxPeso ?? 2000;

  const toggleMaterial = (m: string) => {
    if (props.selectedMateriales.includes(m)) {
      props.setSelectedMateriales(props.selectedMateriales.filter(x => x !== m));
    } else {
      props.setSelectedMateriales([...props.selectedMateriales, m]);
    }
  };

  return (
    <div className="lg:w-64 flex-shrink-0">
      <div className="lg:sticky lg:top-24">

        <Button
          variant="outline"
          className="lg:hidden w-full mb-4 rounded-xl py-6 border-border bg-background/60 backdrop-blur-md"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>

        <div
          className={`
            space-y-8 rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 shadow-sm
            ${showFilters ? "block" : "hidden lg:block"}
          `}
        >

          {/* ------------------- CATEGORÍAS ------------------- */}
          <div>
            <h3 className="font-display text-xl mb-4 pb-1 border-b border-border/60">Categorías</h3>

            <div className="space-y-2">
              {categoriasSafe.map((category) => (
                <button
                  key={category.id}
                  onClick={() => props.setSelectedCategory(category.id)}
                  className={`
                    block w-full text-left px-4 py-2 rounded-xl text-sm transition-all
                    ${
                      props.selectedCategory === category.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* ------------------- FRAGANCIA ------------------- */}
          <div>
            <h3 className="font-display text-xl mb-2 pb-1 border-b border-border/60">Fragancia</h3>

            <Select value={props.selectedFragancia} onValueChange={props.setSelectedFragancia}>
              <SelectTrigger className="w-full rounded-xl bg-muted/40 border-border/60">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>

              <SelectContent>
                {fraganciasSafe.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ------------------- TAMAÑO ------------------- */}
          <div>
            <h3 className="font-display text-xl mb-2 pb-1 border-b border-border/60">Tamaño</h3>

            <Select value={props.selectedTamano} onValueChange={props.setSelectedTamano}>
              <SelectTrigger className="w-full rounded-xl bg-muted/40 border-border/60">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>

              <SelectContent>
                {tamanosSafe.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ------------------- TIPO DE CERA ------------------- */}
          <div>
            <h3 className="font-display text-xl mb-2 pb-1 border-b border-border/60">Tipo de cera</h3>

            <Select value={props.selectedCera} onValueChange={props.setSelectedCera}>
              <SelectTrigger className="w-full rounded-xl bg-muted/40 border-border/60">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>

              <SelectContent>
                {cerasSafe.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ------------------- COLOR ------------------- */}
          <div>
            <h3 className="font-display text-xl mb-2 pb-1 border-b border-border/60">Color</h3>

            <Select value={props.selectedColor} onValueChange={props.setSelectedColor}>
              <SelectTrigger className="w-full rounded-xl bg-muted/40 border-border/60">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>

              <SelectContent>
                {coloresSafe.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ------------------- MATERIALES (JOIN) ------------------- */}
          <div>
            <h3 className="font-display text-xl mb-2 pb-1 border-b border-border/60">Materiales</h3>

            <div className="space-y-2">
              {materialesSafe.map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={props.selectedMateriales.includes(m)}
                    onCheckedChange={() => toggleMaterial(m)}
                  />
                  <span className="text-sm">{m}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ------------------- DURACIÓN ------------------- */}
          <div>
            <h3 className="font-display text-xl mb-2 pb-1 border-b border-border/60">Duración (h)</h3>

            <Slider
              min={minDurSafe}
              max={maxDurSafe}
              step={1}
              value={duracionSafe}
              onValueChange={props.setDuracionRange}
            />

            <div className="flex justify-between text-sm mt-2 text-muted-foreground">
              <span>{duracionSafe[0]}h</span>
              <span>{duracionSafe[1]}h</span>
            </div>
          </div>

          {/* ------------------- PESO ------------------- */}
          <div>
            <h3 className="font-display text-xl mb-2 pb-1 border-b border-border/60">Peso (g)</h3>

            <Slider
              min={minPesoSafe}
              max={maxPesoSafe}
              step={1}
              value={pesoSafe}
              onValueChange={props.setPesoRange}
            />

            <div className="flex justify-between text-sm mt-2 text-muted-foreground">
              <span>{pesoSafe[0]}g</span>
              <span>{pesoSafe[1]}g</span>
            </div>
          </div>

          {/* ------------------- RATING ------------------- */}
          <div>
            <h3 className="font-display text-xl mb-2 pb-1 border-b border-border/60">Rating mínimo</h3>

            <Select value={String(props.ratingMin)} onValueChange={(v) => props.setRatingMin(Number(v))}>
              <SelectTrigger className="w-full rounded-xl bg-muted/40 border-border/60">
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="0">Todos</SelectItem>
                <SelectItem value="3">3+ estrellas</SelectItem>
                <SelectItem value="4">4+ estrellas</SelectItem>
                <SelectItem value="5">5 estrellas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ------------------- DESCUENTO ------------------- */}
          <div>
            <h3 className="font-display text-xl mb-2 pb-1 border-b border-border/60">Ofertas</h3>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={props.soloDescuento}
                onCheckedChange={(v) => props.setSoloDescuento(Boolean(v))}
              />
              <span className="text-sm">Solo con descuento</span>
            </label>
          </div>

          {/* ------------------- RESET ------------------- */}
          <Button
            variant="outline"
            className="w-full rounded-xl border-border/60 hover:bg-muted/40 mt-6"
            onClick={props.clearFilters}
          >
            Limpiar filtros
          </Button>
        </div>

      </div>
    </div>
  );
}
