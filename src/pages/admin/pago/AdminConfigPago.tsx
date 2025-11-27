import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { UploadCloud, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function AdminConfigPago() {
  const [config, setConfig] = useState<any>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const MAX_FILE_BYTES = 5 * 1024 * 1024;

  const cargarConfig = async () => {
    const { data, error } = await supabase
      .from("configuracion_pago")
      .select("*")
      .limit(1)
      .single();

    if (error) toast.error("Error cargando configuración");
    else setConfig(data);
  };

  useEffect(() => {
    cargarConfig();
  }, []);

  const guardarCambios = async () => {
    let qrUrl = config.qr_url;

    if (qrFile) {
      const fileName = `qr/${Date.now()}-${qrFile.name}`;
      await supabase.storage.from("public-assets").upload(fileName, qrFile);

      const { data } = supabase.storage
        .from("public-assets")
        .getPublicUrl(fileName);

      qrUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("configuracion_pago")
      .update({
        banco: config.banco,
        cuenta: config.cuenta,
        titular: config.titular,
        qr_url: qrUrl,
        updated_at: new Date(),
      })
      .eq("id", config.id);

    if (error) toast.error("No se pudieron guardar los cambios");
    else toast.success("Configuración actualizada");
  };

  const onFileSelected = (file: File | null) => {
    setQrFile(file);
    if (file) setQrPreview(URL.createObjectURL(file));
    else setQrPreview(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Solo imágenes para el QR");
    }
    if (file.size > MAX_FILE_BYTES) {
      return toast.error("Archivo demasiado grande (máx 5MB)");
    }

    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  if (!config)
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-16 w-full px-4 md:px-8 pb-32">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 w-full px-4 md:px-8 pb-32">

        <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-6">
          <CreditCard className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Configuración de pago
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* IZQUIERDA — FORMULARIO + DROPZONE */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">

            <div>
              <Label>Banco</Label>
              <Input
                value={config.banco}
                onChange={(e) => setConfig({ ...config, banco: e.target.value })}
              />
            </div>

            <div>
              <Label>Número de cuenta</Label>
              <Input
                value={config.cuenta}
                onChange={(e) => setConfig({ ...config, cuenta: e.target.value })}
              />
            </div>

            <div>
              <Label>Titular</Label>
              <Input
                value={config.titular}
                onChange={(e) => setConfig({ ...config, titular: e.target.value })}
              />
            </div>

            {/* ⭐ DROPZONE AQUÍ ADENTRO ⭐ */}
           <div
  role="button"
  tabIndex={0}
  onClick={() =>
    document.getElementById("qr-input-hidden")?.click()
  }
  onDragEnter={handleDragOver}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  className={`
    group relative w-56 h-56
    rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer
    flex items-center justify-center overflow-hidden

    ${
      dragActive
        ? "border-amber-500 bg-amber-500/10 shadow-lg"
        : "border-border bg-muted/40 hover:border-amber-400 hover:bg-muted/60"
    }
  `}
>
  {qrPreview ? (
    <img src={qrPreview} className="w-full h-full object-contain" />
  ) : (
    <div className="flex flex-col items-center gap-3 text-center">
      <UploadCloud
        className={`w-10 h-10 transition-all
        ${
          dragActive
            ? "text-amber-500 scale-110"
            : "text-muted-foreground group-hover:scale-105"
        }`}
      />
      <p className="text-sm text-muted-foreground">Arrastra tu QR</p>
      <p className="text-xs text-muted-foreground opacity-70">
        PNG o JPG — Máx 5MB
      </p>
    </div>
  )}
</div>


            <div className="pt-4 flex justify-end">
              <Button
                onClick={guardarCambios}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Guardar cambios
              </Button>
            </div>
          </div>

          {/* DERECHA — SOLO PREVIEW */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <Label>Vista previa</Label>

            <div className="mt-3 w-full aspect-square bg-muted/30 rounded-xl flex items-center justify-center overflow-hidden">
              {qrPreview || config.qr_url ? (
                <img
                  src={qrPreview ?? config.qr_url}
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Sin QR cargado</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
