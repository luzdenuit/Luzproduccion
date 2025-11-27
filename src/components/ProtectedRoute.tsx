import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole?: string;
}) {
  const { user, role, loading } = useAuth();

  if (loading) return <p className="text-center mt-20">Cargando...</p>;

  if (!user) return <Navigate to="/login" replace />;

  // Si se requiere rol pero aún no está cargado, espera
  if (requiredRole && role == null)
    return <p className="text-center mt-20">Cargando autorización...</p>;

  // Una vez que el rol esté disponible, valida acceso
  if (requiredRole && role !== requiredRole)
    return <Navigate to="/" replace />;

  return children;
}
