import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Gracias() {
  const { id } = useParams();

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 text-center container mx-auto px-4">
        <h1 className="text-4xl font-display mb-6">¡Gracias por tu compra!</h1>
        <p className="text-muted-foreground mb-4">
          Tu pedido ha sido registrado con el número:
        </p>

        <p className="text-2xl font-semibold text-primary mb-10">{id}</p>

        <Link to="/">
          <Button className="bg-primary hover:bg-primary/90">
            Volver al inicio
          </Button>
        </Link>
      </main>

      <Footer />
    </div>
  );
}
