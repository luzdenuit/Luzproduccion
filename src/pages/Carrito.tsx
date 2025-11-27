import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Carrito() {
  const { cart, removeFromCart, addToCart, clearCart, total } = useCart();

  // calcular total en dinero
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.precio * item.qty,
    0
  );
  const totalSavings = cart.reduce(
    (sum, item) => {
      const original = Number(item.precio_original ?? item.precio);
      const current = Number(item.precio);
      const savePerUnit = Math.max(original - current, 0);
      return sum + savePerUnit * Number(item.qty);
    },
    0
  );

  return (
    <div className="pt-24 min-h-screen">
      <Navbar />

      <main className="pt-28 pb-20 container mx-auto px-4">
        <h1 className="font-display text-4xl md:text-5xl mb-10 flex items-center gap-2">
          Tu Carrito
           <ShoppingCart className="w-10 h-10" />
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">Tu carrito está vacío.</p>
            <Link to="/coleccion">
              <Button className="mt-6 bg-primary hover:bg-primary/90">
                Ver productos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LISTA DE PRODUCTOS */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-6 border border-border rounded-xl p-4 bg-card text-card-foreground shadow"
                >
                  {/* Imagen */}
                  <Link to={`/producto/${item.id}`}>
                    <img
                      src={item.imagen_principal}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1">
                    <Link to={`/producto/${item.id}`}>
                      <h3 className="font-semibold text-lg">{item.nombre}</h3>
                    </Link>

                    {item.fragancia && (
                      <p className="text-sm text-muted-foreground">
                        {item.fragancia}
                      </p>
                    )}

                    {item.descuento_pct ? (
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm text-muted-foreground line-through">
                          ${Number(item.precio_original ?? item.precio).toFixed(2)}
                        </span>
                        <span className="text-primary font-semibold">
                          ${Number(item.precio).toFixed(2)}
                        </span>
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          -{Number(item.descuento_pct)}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-primary font-semibold mt-1">
                        ${Number(item.precio).toFixed(2)}
                      </p>
                    )}

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => item.qty > 1 && addToCart(item, -1)}
                        disabled={item.qty <= 1}
                        className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="font-medium">{item.qty}</span>

                      <button
                        onClick={() => addToCart(item, 1)}
                        className="p-2 border rounded-lg hover:bg-muted"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Total: ${Number(item.precio * item.qty).toFixed(2)}
                    </p>
                    {item.descuento_pct ? (
                      <p className="text-xs text-green-700 mt-1">
                        Ahorras ${((Number(item.precio_original ?? item.precio) - Number(item.precio)) * Number(item.qty)).toFixed(2)}
                      </p>
                    ) : null}
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* RESUMEN */}
            <div className="border border-border rounded-xl p-6 bg-card text-card-foreground shadow h-fit sticky top-32">
              <h2 className="font-semibold text-2xl mb-6">Resumen de Compra</h2>

              <div className="flex justify-between mb-2">
                <p className="text-muted-foreground">Productos ({total})</p>
                <p className="font-semibold">${totalPrice.toFixed(2)}</p>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between mb-2 text-green-700">
                  <p>Ahorro</p>
                  <p>- ${totalSavings.toFixed(2)}</p>
                </div>
              )}

              <div className="border-t my-4"></div>

              <Link to="/checkout">
                <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                  Proceder al pago
                </Button>
              </Link>

              <Link to="/coleccion" className="block mt-3">
                <Button variant="outline" className="w-full">
                  Seguir comprando
                </Button>
              </Link>


              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={clearCart}
              >
                Vaciar carrito
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
