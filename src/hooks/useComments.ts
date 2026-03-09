"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllComments } from "@/services/api";
import { Comment } from "@/types";

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useComments(): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getAllComments();
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erreur lors de la récupération des commentaires"));
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments(true);
  }, []);

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
  };
}
