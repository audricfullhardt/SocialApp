"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { Member } from "@/types";
import { getCurrentUser } from "@/services/api";

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  token: string | null;
  isLogin: boolean;
  user: Member | null;
  loading: boolean;
  error: Error | null;
  login: (newToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
    router.push("/login");
  };

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'utilisateur:", err);
      setError(err instanceof Error ? err : new Error("Erreur inconnue"));
      
      // Si erreur 401, on déconnecte l'utilisateur
      if (err instanceof Error && err.name === "UnauthorizedError") {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const handleLogin = async (newToken: string): Promise<void> => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    await fetchUser();
  };

  const refreshUser = async (): Promise<void> => {
    if (token) {
      await fetchUser();
    }
  };

  const isLogin = !!token && !!user;

  const value: AuthContextType = {
    token,
    isLogin,
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook pour accéder au contexte d'authentification
 * @throws Error si utilisé en dehors d'un AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

