import { useState } from "react";
import { motion } from "framer-motion";
import { useKeenSlider } from "keen-slider/react";

export default function ProductoGallery({ imagenes }: { imagenes: string[] }) {
  const [current, setCurrent] = useState(0);

  const [sliderRef, slider] = useKeenSlider({
    loop: false,
    slideChanged(s) {
      setCurrent(s.track.details.rel);
    },
  });

  return (
    <div>
      {/* SLIDER PRINCIPAL */}
      <div
        ref={sliderRef}
        className="keen-slider rounded-xl overflow-hidden h-[620px] bg-black/5"
      >
        {imagenes.map((src, i) => (
          <div
            key={i}
            className="keen-slider__slide flex items-center justify-center h-full"
          >
            <motion.img
              src={src}
              className="w-full h-full object-cover rounded-xl"
              whileHover={{ scale: 1.12 }}
              transition={{ duration: 0.6 }}
            />
          </div>
        ))}
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-3 mt-4 overflow-x-auto">
        {imagenes.map((src, i) => (
          <button
            key={i}
            onClick={() => slider.current?.moveToIdx(i)}
            className={`h-20 w-20 rounded-lg overflow-hidden border transition ${
              current === i
                ? "border-amber-600"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img src={src} className="object-cover w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
