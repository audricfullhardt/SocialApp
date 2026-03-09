"use client";

import { useState, useEffect } from "react";
import { getChannels } from "@/services/api";
import { Channel } from "@/types";

interface UseChannelsReturn {
  channels: Channel[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useChannels(): UseChannelsReturn {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChannels = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getChannels();
      setChannels(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erreur lors de la récupération des channels"));
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  return {
    channels,
    loading,
    error,
    refetch: fetchChannels,
  };
}
