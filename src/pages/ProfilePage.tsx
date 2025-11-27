import PedidosUsuario from "@/components/profile/PedidosUsuario";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShoppingBag } from "lucide-react";

export default function ProfilePage() {
  return (
    <>
      <Navbar />

      <main className="pt-36 pb-20 container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-display text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <ShoppingBag className="h-10 w-10 text-amber-700 dark:text-amber-300" />
            Tus pedidos
          </h1>
        </div>

        <PedidosUsuario />
      </main>

      <Footer />
    </>
  );
}
