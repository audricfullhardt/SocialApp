"use client";

import { useState, useEffect, useCallback } from "react";
import { getPublicationsByChannel } from "@/services/api";
import { Publication } from "@/types";

interface UsePublicationsOptions {
  channelSlug: string | null;
  pollingInterval?: number; // Intervalle de polling en ms (0 = désactivé)
}

interface UsePublicationsReturn {
  publications: Publication[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer et gérer les publications d'un channel
 * Supporte le polling automatique pour simuler le temps réel
 */
export function usePublications({
  channelSlug,
  pollingInterval = 0,
}: UsePublicationsOptions): UsePublicationsReturn {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPublications = useCallback(async (isInitialLoad = false) => {
    if (!channelSlug) {
      setPublications([]);
      setLoading(false);
      return;
    }

    // Ne pas afficher le loader lors du polling (pour éviter les clignotements)
    if (isInitialLoad) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getPublicationsByChannel(channelSlug);
      setPublications(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erreur lors de la récupération des publications"));
      setPublications([]);
    } finally {
      setLoading(false);
    }
  }, [channelSlug]);

  // Fetch initial
  useEffect(() => {
    fetchPublications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelSlug]);

  // Polling (si activé)
  useEffect(() => {
    if (pollingInterval <= 0 || !channelSlug) return;

    const intervalId = setInterval(() => {
      fetchPublications();
    }, pollingInterval);

    return () => clearInterval(intervalId);
  }, [pollingInterval, channelSlug, fetchPublications]);

  return {
    publications,
    loading,
    error,
    refetch: fetchPublications,
  };
}
