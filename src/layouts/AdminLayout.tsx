import { NavLink } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  LogOut, 
  Settings,
  Receipt,
  FileText,
  CreditCard,
  TicketPercent,
  Truck, // 👈 ICONO PARA MÉTODOS DE ENVÍO
  Percent,
  ScrollText,
  Menu
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      <aside className="hidden md:flex w-64 bg-card text-card-foreground shadow-lg border-r border-border flex flex-col">
      
        {/* Header */}
        <div className="px-6 py-6 border-b border-border">
          <h1 className="text-2xl font-bold text-amber-700">Admin • Nuit</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6">

          {/* Section: General */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">GENERAL</p>
            <div className="space-y-2">
              <SidebarLink to="/admin" icon={<LayoutDashboard size={18} />}>
                Dashboard
              </SidebarLink>
              <SidebarLink to="/admin/pedidos" icon={<Receipt size={18} />}>
                Pedidos
              </SidebarLink>
            </div>
          </div>

          {/* Section: Gestión */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">GESTIÓN</p>

            <SidebarLink to="/admin/productos" icon={<Package size={18} />}>
              Productos
            </SidebarLink>

            <SidebarLink to="/admin/categorias" icon={<Tags size={18} />}>
              Categorías
            </SidebarLink>

            <SidebarLink to="/admin/blog" icon={<FileText size={18} />}>
              Blog
            </SidebarLink>

            <SidebarLink to="/admin/rituales" icon={<ScrollText size={18} />}>
              Rituales
            </SidebarLink>

            {/* ⭐ Cupón Management */}
            <SidebarLink to="/admin/cupones" icon={<TicketPercent size={18} />}>
              Cupones
            </SidebarLink>

            <SidebarLink to="/admin/descuentos" icon={<TicketPercent size={18} />}>
              Descuentos
            </SidebarLink>
          </div>

          {/* Section: Sistema */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">SISTEMA</p>

            <SidebarLink to="/admin/settings" icon={<Settings size={18} />}>
              Configuración
            </SidebarLink>

            <SidebarLink to="/admin/politicas" icon={<FileText size={18} />}>
              Políticas
            </SidebarLink>

            <SidebarLink to="/admin/pago" icon={<CreditCard size={18} />}>
              Métodos de pago
            </SidebarLink>

            {/* 🚚 Métodos de envío */}
            <SidebarLink to="/admin/envios" icon={<Truck size={18} />}>
              Métodos de envío
            </SidebarLink>

            {/* iva admin */}
            <SidebarLink to="/admin/iva" icon={<Percent size={18} />}>
              IVA
            </SidebarLink>
          </div>

        </nav>

        {/* Logout */}
        <div className="px-4 py-6 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 text-destructive rounded-md hover:bg-destructive/10"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>

      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-card text-card-foreground shadow-lg border-r border-border flex flex-col">
            <div className="px-6 py-6 border-b border-border flex items-center justify-between">
              <h1 className="text-2xl font-bold text-amber-700">Admin • Nuit</h1>
              <button className="rounded-md px-2 py-1 hover:bg-muted/40" onClick={() => setSidebarOpen(false)}>✕</button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">GENERAL</p>
                <div className="space-y-2">
                  <SidebarLink to="/admin" icon={<LayoutDashboard size={18} />}>
                    Dashboard
                  </SidebarLink>
                  <SidebarLink to="/admin/pedidos" icon={<Receipt size={18} />}>
                    Pedidos
                  </SidebarLink>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">GESTIÓN</p>
                <SidebarLink to="/admin/productos" icon={<Package size={18} />}>
                  Productos
                </SidebarLink>
                <SidebarLink to="/admin/categorias" icon={<Tags size={18} />}>
                  Categorías
                </SidebarLink>
                <SidebarLink to="/admin/blog" icon={<FileText size={18} />}>
                  Blog
                </SidebarLink>
                <SidebarLink to="/admin/rituales" icon={<ScrollText size={18} />}>
                  Rituales
                </SidebarLink>
                <SidebarLink to="/admin/cupones" icon={<TicketPercent size={18} />}>
                  Cupones
                </SidebarLink>
                <SidebarLink to="/admin/descuentos" icon={<TicketPercent size={18} />}>
                  Descuentos
                </SidebarLink>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">SISTEMA</p>
                <SidebarLink to="/admin/settings" icon={<Settings size={18} />}>
                  Configuración
                </SidebarLink>
                <SidebarLink to="/admin/politicas" icon={<FileText size={18} />}>
                  Políticas
                </SidebarLink>
                <SidebarLink to="/admin/pago" icon={<CreditCard size={18} />}>
                  Métodos de pago
                </SidebarLink>
                <SidebarLink to="/admin/envios" icon={<Truck size={18} />}>
                  Métodos de envío
                </SidebarLink>
                <SidebarLink to="/admin/iva" icon={<Percent size={18} />}>
                  IVA
                </SidebarLink>
              </div>
            </nav>
            <div className="px-4 py-6 border-t border-border">
              <button onClick={handleLogout} className="w-full flex items-center gap-2 p-2 text-destructive rounded-md hover:bg-destructive/10">
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* CONTENT */}
      <main className="flex-1 overflow-auto">
        <div className="md:hidden sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button aria-label="Abrir menú" onClick={() => setSidebarOpen(true)} className="rounded-md p-2 hover:bg-muted/40">
            <Menu size={20} />
          </button>
          <span className="font-medium">Panel de administración</span>
        </div>
        <div className="px-4 md:px-8 max-w-full">{children}</div>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon, children }: any) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm
        ${
          isActive
            ? "bg-primary/10 text-primary font-medium shadow-sm"
            : "text-muted-foreground hover:bg-muted/40"
        }
      `
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}
