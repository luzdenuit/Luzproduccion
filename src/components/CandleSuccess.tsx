import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

const CandleSuccess = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch(
      "https://fnsxwtmuoxyxhptzefsy.supabase.co/storage/v1/object/public/public-assets/candle-burning.json"
    )
      .then((res) => res.json())
      .then((json) => setAnimationData(json));
  }, []);

  if (!animationData) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-pulse text-muted-foreground">Cargando animación...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center text-center space-y-6 py-6"
    >
      {/* Lottie Animation */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-64"
      >
        <Lottie
          animationData={animationData}
          loop={false}
          autoplay={true}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-lg text-muted-foreground max-w-xs"
      >
        ¡Tu mensaje ha sido enviado!  
        Gracias por encender un momento con nosotros 🕯✨
      </motion.p>
    </motion.div>
  );
};

export default CandleSuccess;
