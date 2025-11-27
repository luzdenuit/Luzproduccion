import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import Navbar from "@/components/Navbar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SmartSelect from "@/components/admin/SmartSelect";
import ColorPickerSelect from "@/components/admin/ColorPickerSelect";
import { ImagePlus, Move, Upload, X, Package } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { toast } from "sonner";
import { motion } from "framer-motion";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewPrincipal, setPreviewPrincipal] = useState<string | null>(null);

  const [categorias, setCategorias] = useState<any[]>([]);

  const [valoresBD, setValoresBD] = useState({
    tipo_cera: [] as string[],
    material_mecha: [] as string[],
    tamano: [] as string[],
    color: [] as string[],
    fragancia: [] as string[],
  });

  const [galeriaPreviews, setGaleriaPreviews] = useState<string[]>([]);
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fragancia: "",
    categoria_id: "",
    precio: "",
    peso_gramos: "",
    duracion_horas: "",
    stock: "",
    tipo_cera: "",
    material_mecha: "",
    tamano: "",
    color: "",
    ecológica: false,
    activa: true,
  });

  /* -----------------------------------------
     🔍 Cargar categorías
  ------------------------------------------*/
  const fetchCategorias = async () => {
    const { data, error } = await supabase.from("categorias").select("*").order("nombre");

    if (error) toast.error("Error cargando categorías");

    setCategorias(data || []);
  };

  /* -----------------------------------------
     🔍 Cargar producto existente
  ------------------------------------------*/
  const fetchProducto = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("No se pudo cargar el producto");
      navigate("/admin/productos");
      return;
    }

    setFormData({
      nombre: data.nombre ?? "",
      descripcion: data.descripcion ?? data.descripcion_larga ?? data.descripcion_corta ?? "",
      fragancia: data.fragancia ?? "",
      categoria_id: data.categoria_id ?? "",
      precio: data.precio ?? "",
      peso_gramos: data.peso_gramos ?? "",
      duracion_horas: data.duracion_horas ?? "",
      stock: data.stock ?? "",
      tipo_cera: data.tipo_cera ?? "",
      material_mecha: data.material_mecha ?? "",
      tamano: data.tamano ?? "",
      color: data.color ?? "",
      ecológica: Boolean(data.ecológica),
      activa: data.activa ?? true,
    });

    setPreviewPrincipal(data.imagen_principal ?? null);
    setGaleriaPreviews(Array.isArray(data.galeria_imagenes) ? data.galeria_imagenes : []);

    setLoading(false);
  };

  /* -----------------------------------------
     🖼 Subir imagen opcional
  ------------------------------------------*/
  const uploadImage = async () => {
    if (!imageFile) return formData.imagen_principal; // Mantener la actual

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `producto_${Date.now()}.${fileExt}`;
    const filePath = `productos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes")
      .upload(filePath, imageFile);

    if (uploadError) {
      toast.error("Error subiendo la imagen");
      return formData.imagen_principal; // Mantener la anterior
    }

    const { data } = supabase.storage.from("imagenes").getPublicUrl(filePath);

    return data.publicUrl;
  };

  const uploadGalleryFiles = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of galeriaFiles) {
      const ext = file.name.split(".").pop();
      const fileName = `producto_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `productos/${fileName}`;
      const { error } = await supabase.storage.from("imagenes").upload(filePath, file);
      if (!error) {
        const { data } = supabase.storage.from("imagenes").getPublicUrl(filePath);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  /* -----------------------------------------
     💾 Guardar cambios
  ------------------------------------------*/
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setSaving(true);

    const nuevaImagen = await uploadImage();
    const nuevasGalerias = await uploadGalleryFiles();

    const { error } = await supabase
      .from("productos")
      .update({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fragancia: formData.fragancia,
        precio: parseFloat(formData.precio),
        peso_gramos: parseFloat(formData.peso_gramos),
        duracion_horas: parseFloat(formData.duracion_horas),
        stock: parseInt(formData.stock),
        imagen_principal: nuevaImagen,
        categoria_id: formData.categoria_id,
        tipo_cera: formData.tipo_cera,
        material_mecha: formData.material_mecha,
        tamano: formData.tamano,
        color: formData.color,
        ecológica: formData.ecológica,
        activa: formData.activa,
        galeria_imagenes: [...galeriaPreviews, ...nuevasGalerias],
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Error guardando cambios");
    } else {
      toast.success("Producto actualizado");
      navigate("/admin/productos");
    }

    setSaving(false);
  };

  /* -----------------------------------------
     🔄 Inicialización
  ------------------------------------------*/
  useEffect(() => {
    fetchCategorias();
    fetchProducto();
    loadDistinctValues();
  }, []);

  const loadDistinctValues = async () => {
    const campos = ["tipo_cera", "material_mecha", "tamano", "color", "fragancia"];
    const result: any = {};
    for (let campo of campos) {
      const { data, error } = await supabase
        .from("productos")
        .select(campo)
        .not(campo, "is", null);
      if (!error && data) {
        const values = Array.from(new Set(data.map((p: any) => p[campo]).filter(Boolean).map((v: string) => v.trim())));
        result[campo] = values;
      } else {
        result[campo] = [];
      }
    }
    setValoresBD(result);
  };

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCheckbox = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.checked });

  const reorder = (arr: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(arr);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const moveGaleriaItem = (from: number, to: number) => {
    setGaleriaPreviews((arr) => reorder(arr, from, to));
  };

  const removeGaleriaItem = (index: number) => {
    setGaleriaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setGaleriaFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  /* -----------------------------------------
     🖌 UI
  ------------------------------------------*/
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16 w-full px-4 md:px-8 pb-32">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-10"
        >
          <Package className="h-10 w-10 text-amber-700 dark:text-amber-300" />
          Editar producto
        </motion.h1>

        {loading ? (
          <p className="text-muted-foreground">Cargando información...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-foreground mb-4">Información general</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Nombre *</Label>
                    <Input name="nombre" value={formData.nombre} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea name="descripcion" rows={4} value={formData.descripcion} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-foreground mb-4">Imagen principal</h2>
                <div className={`border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer ${isDragActive ? "border-primary bg-muted/60" : "bg-muted/40"}`}>
                  {previewPrincipal ? (
                    <img src={previewPrincipal} className="rounded-xl w-full max-h-64 object-cover" />
                  ) : (
                    <>
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Arrastra o selecciona una imagen</p>
                    </>
                  )}
                  <Input type="file" accept="image/*" className="mt-4" onChange={(e) => {
                    const file = e.target.files?.[0];
                    setImageFile(file ?? null);
                    if (file) setPreviewPrincipal(URL.createObjectURL(file));
                  }} />
                </div>
              </div>

              <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-foreground mb-4">Atributos del producto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SmartSelect label="Fragancia" name="fragancia" value={formData.fragancia} onChange={(name, val) => setFormData({ ...formData, [name]: val })} options={valoresBD.fragancia} />
                  <SmartSelect label="Tipo de cera" name="tipo_cera" value={formData.tipo_cera} onChange={(n, v) => setFormData({ ...formData, [n]: v })} options={valoresBD.tipo_cera} />
                  <SmartSelect label="Material de mecha" name="material_mecha" value={formData.material_mecha} onChange={(n, v) => setFormData({ ...formData, [n]: v })} options={valoresBD.material_mecha} />
                  <SmartSelect label="Tamaño" name="tamano" value={formData.tamano} onChange={(n, v) => setFormData({ ...formData, [n]: v })} options={valoresBD.tamano} />
                  <ColorPickerSelect label="Color" name="color" value={formData.color} onChange={(n, v) => setFormData({ ...formData, [n]: v })} options={valoresBD.color} />
                  <div>
                    <Label>Categoría *</Label>
                    <Select value={formData.categoria_id} onValueChange={(val) => setFormData({ ...formData, categoria_id: val })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-foreground mb-4">Precios y stock</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Precio *</Label>
                    <Input type="number" name="precio" value={formData.precio} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input type="number" name="stock" value={formData.stock} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Peso (g)</Label>
                    <Input type="number" name="peso_gramos" value={formData.peso_gramos} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Duración (horas)</Label>
                    <Input type="number" name="duracion_horas" value={formData.duracion_horas} onChange={handleChange} />
                  </div>
                  <div className="flex flex-col gap-2 pt-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="ecológica" checked={formData.ecológica} onChange={handleCheckbox} />
                      Ecológica
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="activa" checked={formData.activa} onChange={handleCheckbox} />
                      Activa
                    </label>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-foreground mb-4">Galería adicional</h2>
                <div {...getRootProps()} className={`border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer ${isDragActive ? "border-primary bg-muted/60" : "bg-muted/40"}`}>
                  <input {...getInputProps()} />
                  <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Arrastra imágenes nuevas o haz clic aquí</p>
                </div>

                {galeriaPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
                    {galeriaPreviews.map((src, index) => (
                      <div key={index} className="relative group border rounded-lg overflow-hidden">
                        <img src={src} className="h-28 w-full object-cover" />
                        {index > 0 && (
                          <button type="button" onClick={() => moveGaleriaItem(index, index - 1)} className="absolute top-2 left-2 bg-background/80 rounded-full p-1 shadow">
                            <Move className="h-4 w-4" />
                          </button>
                        )}
                        {index < galeriaPreviews.length - 1 && (
                          <button type="button" onClick={() => moveGaleriaItem(index, index + 1)} className="absolute top-2 right-2 bg-background/80 rounded-full p-1 shadow">
                            <Move className="h-4 w-4 rotate-180" />
                          </button>
                        )}
                        <button type="button" onClick={() => removeGaleriaItem(index)} className="absolute bottom-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow opacity-60 hover:opacity-100">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-3 rounded-xl text-lg">
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
