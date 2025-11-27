import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import SmartSelect from "@/components/admin/SmartSelect";
import ColorPickerSelect from "@/components/admin/ColorPickerSelect";

import { X, Upload, ImagePlus, Move, Package } from "lucide-react";

import { useDropzone } from "react-dropzone";


export default function CrearProducto() {
  const navigate = useNavigate();

  // ------------ Loading ------------
  const [loading, setLoading] = useState(false);

  // ------------ Categorías ------------
  const [categorias, setCategorias] = useState<any[]>([]);
  const [rituales, setRituales] = useState<any[]>([]);

  // ------------ Atributos BD ------------
  const [valoresBD, setValoresBD] = useState({
    tipo_cera: [] as string[],
    material_mecha: [] as string[],
    tamano: [] as string[],
    color: [] as string[],
    fragancia: [] as string[],
  });

  

  // ------------ Imagen principal ------------
  const [imagenPrincipalFile, setImagenPrincipalFile] = useState<File | null>(
    null
  );
  const [previewPrincipal, setPreviewPrincipal] = useState<string | null>(null);

  // ------------ Galería (drag & drop sortable) ------------
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([]);
  const [galeriaPreviews, setGaleriaPreviews] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setGaleriaFiles((prev) => [...prev, ...acceptedFiles]);
    setGaleriaPreviews((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => URL.createObjectURL(file)),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const reorder = (arr: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(arr);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const moveGaleriaItem = (from: number, to: number) => {
    setGaleriaFiles((arr) => reorder(arr, from, to));
    setGaleriaPreviews((arr) => reorder(arr, from, to));
  };

  // ------------ Form Data ------------
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fragancia: "",
    categoria_id: "",
    ritual_id: "",
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

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  // ------------ Cargar categorías y atributos BD ------------
  const loadCategorias = async () => {
    const { data, error } = await supabase.from("categorias").select("*");
    if (!error) setCategorias(data);
  };

  const loadRituales = async () => {
    const { data, error } = await supabase.from("rituales").select("*");
    if (!error) setRituales(data || []);
  };

  const loadDistinctValues = async () => {
    const campos = [
      "tipo_cera",
      "material_mecha",
      "tamano",
      "color",
      "fragancia",
    ];

    const result: any = {};

    for (let campo of campos) {
      const { data, error } = await supabase
        .from("productos")
        .select(campo)
        .not(campo, "is", null);

      if (!error && data) {
        const values = Array.from(
          new Set(
            data
              .map((p: any) => p[campo])
              .filter(Boolean)
              .map((value: string) => value.trim())
          )
        );
        result[campo] = values;
      } else {
        result[campo] = [];
      }
    }

    setValoresBD(result);
  };

  useEffect(() => {
    loadCategorias();
    loadRituales();
    loadDistinctValues();
  }, []);

  // ---------------- Imagen principal ----------------
  const handlePrincipalSelect = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagenPrincipalFile(file);
    setPreviewPrincipal(URL.createObjectURL(file));
  };

  // ---------------- Eliminar imagen galería ----------------
  const removeGaleriaItem = (index: number) => {
    setGaleriaFiles((prev) => prev.filter((_, i) => i !== index));
    setGaleriaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------- Subida a Supabase ----------------
  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `produto_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const filePath = `productos/${fileName}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(filePath, file);

    if (error) return null;

    const { data } = supabase.storage.from("imagenes").getPublicUrl(filePath);
    return data.publicUrl;
  };

  // ---------------- Guardar producto ----------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (
      !formData.nombre ||
      !formData.precio ||
      !formData.categoria_id ||
      !imagenPrincipalFile
    ) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setLoading(true);

    try {
      // Subir imagen principal
      const imagen_principal = await uploadImage(imagenPrincipalFile);
      if (!imagen_principal)
        throw new Error("Error subiendo imagen principal");

      // Subir galería
      let galeria_urls: string[] = [];
      for (const img of galeriaFiles) {
        const url = await uploadImage(img);
        if (url) galeria_urls.push(url);
      }

      // Insert
      const { error } = await supabase.from("productos").insert([
        {
          ...formData,
          precio: parseFloat(formData.precio),
          peso_gramos: parseFloat(formData.peso_gramos),
          duracion_horas: parseFloat(formData.duracion_horas),
          stock: parseInt(formData.stock),
          imagen_principal,
          galeria_imagenes: galeria_urls,
        },
      ]);

      if (error) throw error;

      toast.success("Producto creado exitosamente");
      navigate("/admin/productos");
    } catch (err) {
      console.error(err);
      toast.error("Error creando el producto");
    }

    setLoading(false);
  };

  // ---------------- UI ----------------
return (
  <div className="w-full">
    <Navbar />

    <div className="pt-16 w-full px-4 md:px-8 pb-32">

      <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-10">
        <Package className="h-10 w-10 text-amber-700 dark:text-amber-300" />
        Crear nuevo producto
      </h1>

      {/* FORM REAL (invible alrededor) */}
      <form onSubmit={handleSubmit} className="space-y-10">

        {/* BENTO GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ======== INFO GENERAL (2 COLUMNAS DE ANCHO) ======== */}
          <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Información general
            </h2>

            <div className="space-y-4">
              <div>
                <Label>Nombre *</Label>
                <Input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  name="descripcion"
                  rows={4}
                  value={formData.descripcion}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* ======== IMAGEN PRINCIPAL (1 COLUMNA) ======== */}
          <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Imagen principal
            </h2>

            <div
              className={`border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer ${
                isDragActive ? "border-primary bg-muted/60" : "bg-muted/40"
              }`}
            >
              {previewPrincipal ? (
                <img
                  src={previewPrincipal}
                  className="rounded-xl w-full max-h-64 object-cover"
                />
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra o selecciona una imagen
                  </p>
                </>
              )}

              <Input
                type="file"
                accept="image/*"
                className="mt-4"
                onChange={handlePrincipalSelect}
              />
            </div>
          </div>

          {/* ======== ATRIBUTOS (2 COLUMNAS DE ANCHO) ======== */}
          <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Atributos del producto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <SmartSelect
                label="Fragancia"
                name="fragancia"
                value={formData.fragancia}
                onChange={(name, val) =>
                  setFormData({ ...formData, [name]: val })
                }
                options={valoresBD.fragancia}
              />

              <SmartSelect
                label="Tipo de cera"
                name="tipo_cera"
                value={formData.tipo_cera}
                onChange={(name, val) =>
                  setFormData({ ...formData, [name]: val })
                }
                options={valoresBD.tipo_cera}
              />

              <SmartSelect
                label="Material de mecha"
                name="material_mecha"
                value={formData.material_mecha}
                onChange={(name, val) =>
                  setFormData({ ...formData, [name]: val })
                }
                options={valoresBD.material_mecha}
              />

              <SmartSelect
                label="Tamaño"
                name="tamano"
                value={formData.tamano}
                onChange={(name, val) =>
                  setFormData({ ...formData, [name]: val })
                }
                options={valoresBD.tamano}
              />

              <ColorPickerSelect
                label="Color"
                name="color"
                value={formData.color}
                onChange={(name, val) =>
                  setFormData({ ...formData, [name]: val })
                }
                options={valoresBD.color}
              />

              <div>
                <Label>Categoría *</Label>
                <Select
                  value={formData.categoria_id}
                  onValueChange={(val) =>
                    setFormData({ ...formData, categoria_id: val })
                  }
                >
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

              <div>
                <Label>Ritual</Label>
                <Select
                  value={formData.ritual_id}
                  onValueChange={(val) =>
                    setFormData({ ...formData, ritual_id: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {rituales.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ======== PRECIOS Y FLAGS (1 COLUMNA) ======== */}
          <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Precios y stock
            </h2>

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

          {/* ======== GALERÍA (3 COLUMNAS COMPLETAS) ======== */}
          <div className="lg:col-span-3 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Galería adicional
            </h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer ${
                isDragActive ? "border-primary bg-muted/60" : "bg-muted/40"
              }`}
            >
              <input {...getInputProps()} />
              <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Arrastra imágenes o haz clic aquí</p>
            </div>

            {galeriaPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
                {galeriaPreviews.map((src, index) => (
                  <div key={index} className="relative group border rounded-lg overflow-hidden">
                    <img src={src} className="h-28 w-full object-cover" />

                    {/* Arriba-Abajo */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveGaleriaItem(index, index - 1)}
                        className="absolute top-2 left-2 bg-background/80 rounded-full p-1 shadow"
                      >
                        <Move className="h-4 w-4" />
                      </button>
                    )}

                    {index < galeriaPreviews.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveGaleriaItem(index, index + 1)}
                        className="absolute top-2 right-2 bg-background/80 rounded-full p-1 shadow"
                      >
                        <Move className="h-4 w-4 rotate-180" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeGaleriaItem(index)}
                      className="absolute bottom-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow opacity-60 hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pt-6">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-3 rounded-xl text-lg">
            Crear producto
          </Button>
        </div>
      </form>
    </div>
  </div>
);



}
