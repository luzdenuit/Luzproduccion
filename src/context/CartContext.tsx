import { createContext, useContext, useEffect, useState } from "react";

export const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<any[]>([]);

  // cargar carrito
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // guardar carrito
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 🟢 Añadir o modificar cantidad
  const addToCart = (producto: any, qty = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === producto.id);

      if (existing) {
        const newQty = existing.qty + qty;

        // eliminar si llega a cero
        if (newQty <= 0) {
          return current.filter((i) => i.id !== producto.id);
        }

        // actualizar cantidad
        return current.map((i) =>
          i.id === producto.id ? { ...i, qty: newQty } : i
        );
      }

      // si no existe → agregar nuevo
      return [...current, { ...producto, qty }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((c) => c.filter((i) => i.id !== id));
  };

  // 🧹 ARREGLADO: limpiar carrito completamente
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        total: cart.reduce((sum, i) => sum + i.qty, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
