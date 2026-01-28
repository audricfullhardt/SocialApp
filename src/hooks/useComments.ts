"use client";

import { useState, useEffect, useCallback } from "react";
import { getCommentsByPublication } from "@/services/api";
import { Comment } from "@/types";

interface UseCommentsOptions {
  publicationId: number | null;
  pollingInterval?: number;
}

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer et gérer les commentaires d'une publication
 */
export function useComments({
  publicationId,
  pollingInterval = 0,
}: UseCommentsOptions): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async (isInitialLoad = false) => {
    if (!publicationId) {
      setComments([]);
      setLoading(false);
      return;
    }

    if (isInitialLoad) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getCommentsByPublication(publicationId);
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erreur lors de la récupération des commentaires"));
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [publicationId]);

  useEffect(() => {
    fetchComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicationId]);

  // Polling (si activé)
  useEffect(() => {
    if (pollingInterval <= 0 || !publicationId) return;

    const intervalId = setInterval(() => {
      fetchComments();
    }, pollingInterval);

    return () => clearInterval(intervalId);
  }, [pollingInterval, publicationId, fetchComments]);

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
  };
}
