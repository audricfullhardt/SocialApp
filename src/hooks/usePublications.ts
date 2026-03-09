"use client";

import { useState, useEffect, useCallback } from "react";
import { getPublicationsByChannel } from "@/services/api";
import { Publication } from "@/types";

interface UsePublicationsOptions {
  channelSlug: string | null;
  pollingInterval?: number;
}

interface UsePublicationsReturn {
  publications: Publication[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

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

  useEffect(() => {
    fetchPublications(true);
  }, [channelSlug]);

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
