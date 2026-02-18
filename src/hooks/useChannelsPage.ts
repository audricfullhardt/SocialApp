import { useState } from "react";
import { useChannels, usePublications } from "@/hooks";
import { useToast } from "@/contexts/ToastContext";
import { createPublication, createChannel } from "@/services/api";

const POLLING_INTERVAL = 5000;

export function useChannelsPage() {
  const { channels, loading: loadingChannels, error: errorChannels, refetch: refetchChannels } = useChannels();
  const [selectedChannelSlug, setSelectedChannelSlug] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const toast = useToast();

  const {
    publications,
    loading: loadingPublications,
    error: errorPublications,
    refetch,
  } = usePublications({
    channelSlug: selectedChannelSlug,
    pollingInterval: POLLING_INTERVAL,
  });

  const selectedChannel = channels.find((c) => c.slug === selectedChannelSlug);

  const handleChannelSelect = (slug: string) => {
    setSelectedChannelSlug((current) => (current === slug ? null : slug));
  };

  const handleSubmitPublication = async (title: string, body: string) => {
    if (!selectedChannelSlug) {
      toast.warning("Aucun channel sélectionné");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPublication(selectedChannelSlug, title, body);
      toast.success("Publication créée avec succès !");
      await refetch();
    } catch (err) {
      console.error("Erreur lors de la création de la publication:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de la publication"
      );
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateChannel = async (name: string, slug: string) => {
    setIsCreatingChannel(true);

    try {
      const newChannel = await createChannel(name, slug);
      toast.success(`Channel "${name}" créé avec succès !`);
      await refetchChannels();
      setSelectedChannelSlug(newChannel.slug);
    } catch (err) {
      console.error("Erreur lors de la création du channel:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création du channel"
      );
      throw err;
    } finally {
      setIsCreatingChannel(false);
    }
  };

  return {
    channels,
    selectedChannel,
    selectedChannelSlug,
    publications,
    loadingChannels,
    loadingPublications,
    errorChannels,
    errorPublications,
    isSubmitting,
    isCreatingChannel,
    handleChannelSelect,
    handleSubmitPublication,
    handleCreateChannel,
  };
}
