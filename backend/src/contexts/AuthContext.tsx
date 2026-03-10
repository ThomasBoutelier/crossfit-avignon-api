import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { authStore } from "@/lib/auth";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaure la session au montage si un token valide existe
  useEffect(() => {
    const init = async () => {
      if (authStore.isAuthenticated()) {
        try {
          const me = await api.auth.me();
          setUser({ id: me.id, email: me.email });
        } catch {
          authStore.removeToken();
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const token = await api.auth.login(email, password);
    authStore.setToken(token);
    const me = await api.auth.me();
    setUser({ id: me.id, email: me.email });
    navigate("/");
  }, [navigate]);

  const logout = useCallback(() => {
    authStore.removeToken();
    setUser(null);
    navigate("/login");
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
