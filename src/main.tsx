import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/context/AuthContext"; // 👈 importa tu contexto
import { CartProvider } from "@/context/CartContext";

createRoot(document.getElementById("root")!).render(
<CartProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</CartProvider>
);
