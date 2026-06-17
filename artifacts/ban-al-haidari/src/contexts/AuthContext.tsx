import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthChange } from "@/lib/auth";

const ADMIN_EMAIL = "ban.alhaideri369@gmail.com";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, isAdmin: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
