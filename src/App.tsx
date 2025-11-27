import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// 🌙 Páginas públicas
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ListaPosts from "@/pages/admin/blog/ListaPosts";
import CrearPost from "@/pages/admin/blog/CrearPost";
import EditarPost from "@/pages/admin/blog/EditarPost";
import CrearCategoriaBlog from "@/pages/admin/blog/CrearCategoriaBlog";
import EditarCategoriaBlog from "@/pages/admin/blog/EditarCategoriaBlog";
import ListaCategoriaBlog from "@/pages/admin/blog/ListaCategoriaBlog";

// 🔐 Rutas protegidas
import ProtectedRoute from "@/components/ProtectedRoute";

// 👤 Perfil
import ProfilePage from "@/pages/ProfilePage";

// 🧑‍💼 Admin
import AdminPage from "@/pages/admin/AdminPage";
import AdminLayout from "@/layouts/AdminLayout";

// 🛍 Productos admin

import CrearProducto from "@/pages/admin/productos/CrearProducto";
import EditarProducto from "@/pages/admin/productos/EditarProducto";

// 🏷 Categorías admin
import ListaCategorias from "@/pages/admin/categorias/ListaCategorias";
import CrearCategoria from "@/pages/admin/categorias/CrearCategoria";
import EditarCategoria from "@/pages/admin/categorias/EditarCategoria";

// ❤️ Favoritos
import Favoritos from "@/pages/Favoritos";

// 🛒 Carrito
import Carrito from "@/pages/Carrito";

// 💳 Checkout
import Checkout from "@/pages/Checkout";
import { CheckoutProvider } from "@/context/CheckoutContext";

// 🧾 Pago
import Pago from "@/pages/Pago";

// 🎉 Gracias
import Gracias from "@/pages/Gracias";
// 🧾 Pedidos admin
import ProductosDashboard from "@/pages/admin/productos/page";

import ListaPedidos from "@/pages/admin/pedidos/ListaPedidos";
import DetallePedido from "@/pages/admin/pedidos/DetallePedido";
import AdminConfigPago from "@/pages/admin/pago/AdminConfigPago";

// 🏷 Cupones admin  
import ListaCupones from "@/pages/admin/cupones/ListaCupones";
import CrearCupon from "@/pages/admin/cupones/CrearCupon";
import EditarCupon from "@/pages/admin/cupones/EditarCupon";

// 🚚 Métodos de envío admin
import ListaEnvios from "@/pages/admin/envios/ListaEnvios";
import CrearEnvio from "@/pages/admin/envios/CrearEnvio";
import EditarEnvio from "@/pages/admin/envios/EditarEnvio";
// iva admin
import AdminIVA from "@/pages/admin/iva/AdminIVA";
// rituales admin
import ListaRituales from "@/pages/admin/rituales/ListaRituales";
import CrearRitual from "@/pages/admin/rituales/CrearRitual";
import EditarRitual from "@/pages/admin/rituales/EditarRitual";
// descuentos admin
import ListaDescuentos from "@/pages/admin/descuentos/ListaDescuentos";
import CrearDescuento from "@/pages/admin/descuentos/CrearDescuento";
import EditarDescuento from "@/pages/admin/descuentos/EditarDescuento";
// políticas admin
import ListaPoliticas from "@/pages/admin/politicas/ListaPoliticas";
import CrearPolitica from "@/pages/admin/politicas/CrearPolitica";
import EditarPolitica from "@/pages/admin/politicas/EditarPolitica";
import Politica from "@/pages/Politica";


const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>

          {/* 🌙 RUTAS PÚBLICAS */}
          <Route path="/" element={<Index />} />
          <Route path="/coleccion" element={<Shop />} />
          <Route path="/producto/:id" element={<Product />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/politicas/:slug" element={<Politica />} />
          <Route path="/login" element={<Login />} />

          {/* ❤️ FAVORITOS */}
          <Route path="/favoritos" element={<Favoritos />} />

          {/* 🛒 CARRITO */}
          <Route path="/carrito" element={<Carrito />} />

          {/* 💳 CHECKOUT ENVUELTO EN CONTEXTO */}
          <Route
            path="/checkout"
            element={
              <CheckoutProvider>
                <Checkout />
              </CheckoutProvider>
            }
          />

          {/* 🧾 PROCESO DE PAGO */}
          <Route path="/pago/:id" element={<Pago />} />

          {/* 🎉 GRACIAS */}
          <Route path="/gracias/:id" element={<Gracias />} />

          {/* 👤 PEDIDOS (antes /perfil) */}
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 🧑‍💼 PANEL ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          {/* 🏦 CONFIGURACIÓN DE PAGO */}
<Route
  path="/admin/pago"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminConfigPago />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

          {/* 📦 PRODUCTOS */}
          <Route
            path="/admin/productos"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                 <ProductosDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
       
          <Route
            path="/admin/productos/crear"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <CrearProducto />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/productos/editar/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <EditarProducto />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 🏷 CATEGORÍAS */}
          <Route
            path="/admin/categorias"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <ListaCategorias />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categorias/crear"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <CrearCategoria />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categorias/editar/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <EditarCategoria />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
{/* 🧾 PEDIDOS */}
<Route
  path="/admin/pedidos"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <ListaPedidos />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/pedidos/:id"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <DetallePedido />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

        {/* 📝 BLOG ADMIN */}
<Route
  path="/admin/blog"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <ListaPosts />
      </AdminLayout>
    </ProtectedRoute>
  }
        />

        {/* 🏷 BLOG CATEGORÍAS ADMIN */}
        <Route
          path="/admin/blog/categorias"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <ListaCategoriaBlog />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/categorias/crear"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <CrearCategoriaBlog />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/categorias/editar/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <EditarCategoriaBlog />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* 📄 POLÍTICAS */}
        <Route
          path="/admin/politicas"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <ListaPoliticas />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/politicas/crear"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <CrearPolitica />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/politicas/editar/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <EditarPolitica />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

<Route
  path="/admin/blog/crear"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <CrearPost />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/blog/editar/:id"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <EditarPost />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

{/* 🏷 CUPONES */}
<Route
  path="/admin/cupones"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <ListaCupones />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/cupones/crear"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <CrearCupon />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/cupones/editar/:id"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <EditarCupon />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

{/* 🚚 MÉTODOS DE ENVÍO */}
<Route
  path="/admin/envios"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <ListaEnvios />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/envios/crear"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <CrearEnvio />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/envios/editar/:id"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <EditarEnvio />
      </AdminLayout>
        </ProtectedRoute>
      }
    />

{/* 🕯️ RITUALES */}
<Route
  path="/admin/rituales"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <ListaRituales />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/rituales/crear"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <CrearRitual />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/rituales/editar/:id"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <EditarRitual />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

{/* 🏷️ DESCUENTOS */}
<Route
  path="/admin/descuentos"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <ListaDescuentos />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/descuentos/crear"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <CrearDescuento />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/descuentos/editar/:id"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <EditarDescuento />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

          {/* iva admin */}
          <Route
            path="/admin/iva"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminIVA />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* ❌ 404 */}
          <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
