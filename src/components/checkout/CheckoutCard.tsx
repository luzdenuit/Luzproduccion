import { motion } from "framer-motion";

export default function CheckoutCard({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className={`
        glass shadow-crystal hover-glow
        rounded-2xl p-6 backdrop-blur-xl
        transition-all cursor-default
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
