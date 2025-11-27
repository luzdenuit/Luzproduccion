import { useCheckout } from "@/context/CheckoutContext";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient"; // ✔ IMPORT CORRECTO

export default function ComprobanteUpload() {
  const { pago, comprobante, setComprobante } = useCheckout();

  if (pago !== "transferencia") return null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop();
    const path = `comprobantes/${crypto.randomUUID()}.${ext}`;

    // 📤 Subir archivo a Supabase Storage
    const { error } = await supabase.storage
      .from("comprobantes")
      .upload(path, file);

    if (error) {
      console.error("Error subiendo comprobante:", error);
      return;
    }

    // 🔗 Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("comprobantes").getPublicUrl(path);

    setComprobante(publicUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-xl p-6 space-y-3"
    >
      <h3 className="font-semibold text-lg">Sube tu comprobante</h3>

      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFile}
        className="hidden"
        id="comprobante-input"
      />

      <Button
        variant="outline"
        onClick={() =>
          document.getElementById("comprobante-input")?.click()
        }
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Subir comprobante
      </Button>

      {comprobante && (
        <p className="text-green-600 text-sm">
          ✔ Comprobante subido correctamente
        </p>
      )}
    </motion.div>
  );
}
