import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  component: React.ComponentType;
  adminOnly?: boolean;
}

export function ProtectedRoute({ component: Component, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user || (adminOnly && !isAdmin)) {
      navigate("/");
    }
  }, [user, loading, isAdmin, adminOnly, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (adminOnly && !isAdmin)) return null;

  return <Component />;
}
