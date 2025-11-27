import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient"; // 👈 import Supabase

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // 👇 LOGIN REAL
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success("Sesión iniciada correctamente 🌙");
        navigate("/");
      } else {
        // 👇 REGISTRO REAL
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { name: formData.name },
          },
        });
        if (error) throw error;
        toast.success("Cuenta creada exitosamente ✨");
        navigate("/");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <Card className="texture-paper shadow-xl">
              <CardHeader className="text-center pb-8">
                <Link to="/" className="inline-block mb-4">
                  <h1 className="font-display text-3xl text-primary">Luz de Nuit</h1>
                </Link>
                <CardTitle className="font-display text-2xl text-foreground">
                  {isLogin ? "Iniciar sesión" : "Crear cuenta"}
                </CardTitle>
                <p className="text-muted-foreground text-sm mt-2">
                  {isLogin
                    ? "Bienvenido de vuelta a tu espacio de luz"
                    : "Únete a nuestra comunidad luminosa"}
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <div>
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required={!isLogin}
                        className="mt-2"
                        placeholder="Tu nombre"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-2"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="mt-2"
                      placeholder="••••••••"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {loading
                      ? "Procesando..."
                      : isLogin
                      ? "Iniciar sesión"
                      : "Crear cuenta"}
                  </Button>

                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary hover:underline font-medium"
                      >
                        {isLogin ? "Crear una" : "Inicia sesión"}
                      </button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                ← Volver al inicio
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
