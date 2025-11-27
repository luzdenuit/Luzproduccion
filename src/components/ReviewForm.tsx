import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RatingStars from "@/components/RatingStars";
import { motion } from "framer-motion";
import { Trash } from "lucide-react";

const REVIEW_URL =
  "https://fnsxwtmuoxyxhptzefsy.supabase.co/functions/v1/product-review";

type Props = {
  productId: string;
  existingReview?: { id: string; rating: number; comment?: string | null };
  onDone: () => void;
};

export default function ReviewForm({ productId, existingReview, onDone }: Props) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [comment, setComment] = useState<string>(existingReview?.comment || "");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Debes iniciar sesión para dejar una reseña.");
      setLoading(false);
      return;
    }

    try {
      const body = {
        product_id: productId,
        user_id: user.id,
        rating,
        comment: comment.trim() === "" ? null : comment.trim(),
        review_id: existingReview?.id || null,
        source: window.location.href,
        user_agent: navigator.userAgent,
      };

      const res = await fetch(REVIEW_URL, {
        method: existingReview ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(existingReview ? "Reseña actualizada" : "¡Gracias por tu reseña!");
      onDone();
    } catch (err) {
      toast.error("Error enviando reseña.");
    }

    setLoading(false);
  };

  const deleteReview = async () => {
    if (!existingReview) return;
    if (!confirm("¿Eliminar tu reseña?")) return;

    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", existingReview.id);

    if (error) {
      toast.error("Error eliminando reseña");
      return;
    }

    toast.success("Reseña eliminada");
    onDone();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-8 pt-4"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl">
          {existingReview ? "Tu reseña" : "Deja una reseña"}
        </h3>

        {existingReview && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Eliminar reseña"
            onClick={deleteReview}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-10 items-start">
        <div>
          <label className="text-sm">Tu calificación</label>
          <div className="mt-3">
            <RatingStars
              rating={rating}
              onChange={(value) => setRating(value)}
              size={40}
              autoSave={{
                productId,
                existingReviewId: existingReview?.id ?? null,
                onDone,
              }}
            />
          </div>
        </div>

        <div>
          <label className="text-sm">Comentario (opcional)</label>
          <Textarea
            rows={6}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia: aroma, duración, ritual…"
            className="mt-3 w-full"
          />

          {comment.trim() !== "" && (
            <Button disabled={loading} className="mt-4 bg-primary hover:bg-primary/90" size="lg">
              {loading
                ? "Guardando..."
                : existingReview
                ? "Actualizar reseña"
                : "Enviar reseña"}
            </Button>
          )}
        </div>
      </div>
    </motion.form>
  );
}
