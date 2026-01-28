"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/services/api";
import { Member } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface UseCurrentUserReturn {
  user: Member | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer et gérer l'utilisateur connecté
 */
export function useCurrentUser(): UseCurrentUserReturn {
  const { isLogin, token } = useAuth();
  const [user, setUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    if (!isLogin || !token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erreur lors de la récupération de l'utilisateur"));
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, token]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}
