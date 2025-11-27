import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminIVA() {
  const [iva, setIVA] = useState<number>(16);
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadIVA = async () => {
    const { data, error } = await supabase
      .from("configuracion_iva")
      .select("*")
      .single();

    if (error) {
      toast.error("Error cargando IVA");
      return;
    }

    setIVA(Number(data.porcentaje));
    setId(data.id);
    setLoading(false);
  };

  const saveIVA = async () => {
    if (!id) return toast.error("No existe registro de IVA");

    const { error } = await supabase
      .from("configuracion_iva")
      .update({
        porcentaje: iva,
        actualizado_en: new Date(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Error guardando IVA");
      return;
    }

    toast.success("IVA actualizado correctamente");
  };

  useEffect(() => {
    loadIVA();
  }, []);

  if (loading) return <p className="p-6">Cargando configuración...</p>;

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-2xl">Configuración de IVA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <label className="text-sm font-medium">IVA (%)</label>
          <Input
            type="number"
            step="0.01"
            value={iva}
            onChange={(e) => setIVA(parseFloat(e.target.value))}
            className="mt-2"
          />
        </div>

        <Button className="w-full bg-primary" onClick={saveIVA}>
          Guardar
        </Button>
      </CardContent>
    </Card>
  );
}
