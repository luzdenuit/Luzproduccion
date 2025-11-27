import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface RatingStarsProps {
  rating: number;
  onChange?: (value: number) => void;
  size?: number;
  autoSave?: {
    productId: string;
    existingReviewId?: string | null;
    onDone?: () => void;
  };
}

export default function RatingStars({ rating, onChange, size = 28, autoSave }: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [localRating, setLocalRating] = useState<number>(rating);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setLocalRating(rating);
  }, [rating]);

  const displayValue = hovered !== null ? hovered : localRating ?? rating;
  const editable = !!onChange || !!autoSave;

  const fillColor = "hsl(var(--primary))";     // ⭐ Terracota boho
  const emptyColor = "hsl(var(--muted-foreground))"; // gris cálido
  const transition = "transition-all duration-200 ease-out";

  const handleClick = async (value: number) => {
    if (!editable) return;

    if (autoSave) {
      if (saving) return;
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes iniciar sesión para calificar.");
        setSaving(false);
        return;
      }

      let reviewId = autoSave.existingReviewId ?? null;

      if (!reviewId) {
        const { data: existing } = await supabase
          .from("product_reviews")
          .select("id")
          .eq("product_id", autoSave.productId)
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();
        reviewId = existing?.id ?? null;
      }

      if (reviewId) {
        const { error } = await supabase
          .from("product_reviews")
          .update({ rating: value })
          .eq("id", reviewId);
        if (error) {
          toast.error("Error actualizando reseña");
          setSaving(false);
          return;
        }
      } else {
        const { error } = await supabase
          .from("product_reviews")
          .insert({
            product_id: autoSave.productId,
            user_id: user.id,
            rating: value,
            comment: null,
            source: window.location.href,
            user_agent: navigator.userAgent,
          });
        if (error) {
          toast.error("Error creando reseña");
          setSaving(false);
          return;
        }
      }

      setLocalRating(value);
      toast.success("Calificación guardada");
      autoSave.onDone?.();
      setSaving(false);
    }

    onChange?.(value);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          onMouseEnter={() => editable && setHovered(value)}
          onMouseLeave={() => editable && setHovered(null)}
          onClick={() => handleClick(value)}
          className={`${transition} cursor-pointer 
            ${value <= displayValue ? "text-[hsl(var(--primary))] fill-[hsl(var(--primary))]" 
            : "text-[hsl(var(--muted-foreground))]"} 
            ${editable ? "hover:scale-110" : ""}`}
        />
      ))}
    </div>
  );
}
