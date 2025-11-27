import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: string[];
};

export default function SmartSelect({
  label,
  name,
  value,
  onChange,
  options
}: Props) {
  const [showList, setShowList] = useState(false);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="space-y-1">
      <Label>{label}</Label>

      <div className="relative">
        <Input
          value={value}
          name={name}
          placeholder="Escribe o selecciona…"
          autoComplete="off"
          onFocus={() => setShowList(true)}
          onBlur={() => setTimeout(() => setShowList(false), 120)}
          onChange={(e) => {
            onChange(name, e.target.value);
            setShowList(true);
          }}
        />

        {showList && (
          <div className="absolute z-20 w-full bg-white border rounded-lg shadow-sm mt-1 max-h-48 overflow-auto">
            {filtered.length > 0 ? (
              filtered.map((op) => (
                <div
                  key={op}
                  onMouseDown={() => {
                    onChange(name, op);
                    setShowList(false);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-muted transition"
                >
                  {op}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                (Nuevo valor)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
