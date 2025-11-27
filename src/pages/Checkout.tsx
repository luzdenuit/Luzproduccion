import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutCard from "@/components/checkout/CheckoutCard";

import ClienteForm from "@/components/checkout/ClienteForm";
import DireccionForm from "@/components/checkout/DireccionForm";
import CuponBox from "@/components/checkout/CuponBox";
import EnvioSelector from "@/components/checkout/EnvioSelector";
import ConfirmacionBox from "@/components/checkout/ConfirmacionBox";

import { useCheckout } from "@/context/CheckoutContext";

export default function Checkout() {

  const {
  subtotal,
  iva,
  cupon,
  envio,
  total,
  procesarPedido,
  setEnvio,
  setCupon,
} = useCheckout();

const [authData, setAuthData] = useState(null);

useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    setAuthData(data);
  });
}, []);



  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-24 container mx-auto px-4">
        <h1 className="font-display text-4xl md:text-5xl mb-12 text-foreground drop-shadow">
          Finalizar Compra ✨
        </h1>

        {/* 🟣 BENTO GRID */}
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-3
            gap-8
            auto-rows-[minmax(180px,auto)]
          "
        >
          {/* Columna izquierda */}
          <div className="flex flex-col gap-8 lg:col-span-2">

            <CheckoutCard>
              <ClienteForm />
            </CheckoutCard>

            <CheckoutCard>
              <EnvioSelector />
            </CheckoutCard>

            

            <CheckoutCard>
              <DireccionForm />
            </CheckoutCard>

            

          </div>

          {/* Sidebar derecha */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <CheckoutCard className="h-fit space-y-6">
                <ConfirmacionBox />
                <CuponBox
                  subtotal={subtotal}
                  base={subtotal + iva + (envio?.costo || 0)}
                  userId={authData?.user?.id ?? null}
                  onApply={({ id, codigo, descuento }) => {
                    setCupon({ id, codigo, descuento });
                  }}
                />
              </CheckoutCard>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
