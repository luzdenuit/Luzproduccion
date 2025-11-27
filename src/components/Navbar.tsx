import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, CircleUser, Heart, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

// Dropdown (only for desktop)
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// ❤️ Favoritos
import { useFavoritos } from "@/hooks/useFavoritos";

// 🛒 Carrito
import { useCart } from "@/context/CartContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) return null;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const { user, role, loading } = useAuth();
  const { favoritos, fetchFavoritos } = useFavoritos();
  const { total: cartCount } = useCart();

  const favCount = favoritos.length;

  // Load favoritos
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) fetchFavoritos(user.id);
    };
    load();
  }, []);

  // 🌙 Theme handler
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Colecciones", path: "/coleccion" },
    { name: "Blog", path: "/blog" },
    { name: "Nosotros", path: "/nosotros" },
    { name: "Contacto", path: "/contacto" },
  ];

  // ---- Animations ---- //
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent/40 backdrop-blur-lg ">
      <nav className="container mx-auto px-4 py-1">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center">
            <img
              src="https://fnsxwtmuoxyxhptzefsy.supabase.co/storage/v1/object/public/public-assets/Logo_nuit.svg"
              alt="Luz de Nuit Logo"
              className="h-[120px] w-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className="text-white/80 hover:text-primary transition-colors text-sm font-medium"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* RIGHT ICONS */}
          <div className="flex items-center space-x-3">

            {/* Carrito visible siempre */}
            <Button
              variant="unstyled"
              size="icon"
              className="relative"
              onClick={() => navigate("/carrito")}
            >
              <ShoppingCart className="text-white hover:text-primary h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white rounded-full text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* ICONOS SOLO DESKTOP */}
            <div className="hidden md:flex items-center space-x-3">

              {/* Theme */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="h-5 w-5 text-white" /> : <Sun className="h-5 w-5 text-white" />}
              </Button>

              {/* Favoritos */}
              <Button variant="unstyled" size="icon" className="relative" onClick={() => navigate("/favoritos")}>
                <Heart className="text-white hover:text-rose-400 h-5 w-5" />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Button>

              {/* Usuario */}
              {!loading && (
                user ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <CircleUser className="h-5 w-5 text-white" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="end" sideOffset={8} className="w-56 p-2">
                      <div className="px-2 py-1.5 text-sm font-semibold">{user.email}</div>
                      <div className="-mx-2 my-1 h-px bg-muted" />
                      <button
                        className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent"
                        onClick={() => navigate("/pedidos")}
                      >
                        Pedidos
                      </button>
                      {role === "admin" && (
                        <button
                          className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent"
                          onClick={() => navigate("/admin")}
                        >
                          Panel Admin
                        </button>
                      )}
                      <div className="-mx-2 my-1 h-px bg-muted" />
                      <button
                        className="w-full text-left px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-accent"
                        onClick={handleLogout}
                      >
                        Cerrar sesión
                      </button>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Link to="/login">
                    <Button variant="ghost" size="icon">
                      <CircleUser className="h-5 w-5 text-white" />
                    </Button>
                  </Link>
                )
              )}
            </div>

            {/* Mobile Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </Button>

          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-3 border-t border-border pt-3 pb-4 "
            >
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col space-y-3"
              >

                {/* LINKS animados */}
                {navLinks.map((link) => (
                  <motion.li key={link.name} variants={itemVariants}>
                    <Link
                      to={link.path}
                      className="block text-white/90 hover:text-primary py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}

                {/* Divider */}
                <motion.div variants={itemVariants} className="border-t border-border pt-4 mb-2" />

                {/* ❤️ Favoritos */}
                <motion.button
                  variants={itemVariants}
                  className="flex items-center gap-2 text-white/90 hover:text-primary text-base"
                  onClick={() => { navigate("/favoritos"); setMobileMenuOpen(false); }}
                >
                  <Heart className="h-5 w-5" /> Favoritos
                </motion.button>

                {/* 👤 Usuario */}
                {!loading && (
                  user ? (
                    <>
                      <motion.button
                        variants={itemVariants}
                        className="flex items-center gap-2 text-white/90 hover:text-primary text-base"
                        onClick={() => { navigate("/pedidos"); setMobileMenuOpen(false); }}
                      >
                        <CircleUser className="h-5 w-5" /> Pedidos
                      </motion.button>

                      {role === "admin" && (
                        <motion.button
                          variants={itemVariants}
                          className="flex items-center gap-2 text-white/90 hover:text-primary text-base"
                          onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                        >
                          <CircleUser className="h-5 w-5" /> Panel Admin
                        </motion.button>
                      )}

                      <motion.button
                        variants={itemVariants}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 text-base mt-2"
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      >
                        <CircleUser className="h-5 w-5" /> Cerrar sesión
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      variants={itemVariants}
                      className="flex items-center gap-2 text-white/90 hover:text-primary text-base"
                      onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                    >
                      <CircleUser className="h-5 w-5" /> Iniciar sesión
                    </motion.button>
                  )
                )}

                {/* 🌙 Tema */}
                <motion.button
                  variants={itemVariants}
                  className="flex items-center gap-2 text-white/90 hover:text-primary text-base mt-3"
                  onClick={toggleTheme}
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="h-5 w-5" /> Activar modo oscuro
                    </>
                  ) : (
                    <>
                      <Sun className="h-5 w-5" /> Activar modo claro
                    </>
                  )}
                </motion.button>

              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>
    </header>
  );
};

export default Navbar;
