import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: string[];
};

export default function ColorPicker({
  label,
  name,
  value,
  onChange,
  options
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">{label}</Label>

      <div className="flex items-center gap-3">
        {/* SELECTOR NATIVO DE COLOR */}
        <div className="relative">
          <input
            type="color"
            className="w-12 h-10 rounded-lg border shadow-sm cursor-pointer bg-muted/20 transition hover:scale-105"
            value={value.startsWith("#") ? value : "#ffffff"}
            onChange={(e) => onChange(name, e.target.value)}
          />
        </div>

        {/* INPUT DE TEXTO (NOMBRE O HEX) */}
        <div className="relative w-full">
          <Input
            value={value}
            name={name}
            placeholder="Escribe un color (nombre o HEX)…"
            className="pr-10 rounded-lg bg-background/50 backdrop-blur-sm border-border focus-visible:ring-primary"
            onChange={(e) => onChange(name, e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />

          {/* PREVIEW A LA DERECHA */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 right-3 w-5 h-5 rounded-full border shadow-sm transition",
              "bg-white"
            )}
            style={{ background: value }}
          />
        </div>
      </div>

      {/* DROPDOWN DE COLORES DESDE BD */}
      {open && options.length > 0 && (
        <div className="p-3 border rounded-xl bg-card shadow-md grid grid-cols-5 gap-3 max-h-48 overflow-auto animate-in fade-in slide-in-from-top-2">
          {options.map((color) => (
            <button
              key={color}
              type="button"
              onMouseDown={() => {
                onChange(name, color);
                setOpen(false);
              }}
              className="flex flex-col items-center group focus:outline-none"
            >
              <div
                className="w-8 h-8 rounded-full border shadow-sm group-hover:scale-110 transition-transform"
                style={{ background: color }}
              />
              <span className="text-xs mt-1 text-muted-foreground text-center">
                {color}
              </span>
            </button>
          ))}

          {/* Sin coincidencias */}
          {options.length === 0 && (
            <div className="col-span-5 text-center text-sm text-muted-foreground">
              No hay colores registrados
            </div>
          )}
        </div>
      )}
    </div>
  );
}
