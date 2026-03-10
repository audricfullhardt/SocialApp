import { useState } from "react";
import { useChannels, usePublications } from "@/hooks";
import { useOrder } from "@/hooks/useOrder";
import { createPublication, createChannel, getAllComments, getUsers } from "@/services/api";
import { Channel, Comment, User } from "@/types";
import { useEffect } from "react";

const POLLING_INTERVAL = 5000;

export function useChannelsPage() {
  const { channels, loading: loadingChannels, error: errorChannels, refetch: refetchChannels } = useChannels();
  const [selectedChannelSlug, setSelectedChannelSlug] = useState<string | null>(null);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const publicationOrder = useOrder<void>({
    successMessage: "Publication créée avec succès !",
    errorMessage: "Erreur lors de la création de la publication",
  });

  const channelOrder = useOrder<Channel>({
    showSuccessToast: true,
    showErrorToast: true,
  });

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

  const allPublications = channels.flatMap((c) => c.publications || []);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [commentsData, usersData] = await Promise.all([
          getAllComments(),
          getUsers(),
        ]);
        setAllComments(commentsData);
        setAllUsers(usersData);
      } catch {
        // silently fail for search data
      }
    };
    fetchSearchData();
  }, []);

  const handleChannelSelect = (slug: string) => {
    setSelectedChannelSlug((current) => (current === slug ? null : slug));
  };

  const handleSubmitPublication = async (title: string, body: string) => {
    if (!selectedChannelSlug) {
      return;
    }

    await publicationOrder.execute(async () => {
      await createPublication(selectedChannelSlug, title, body);
      await refetch();
    });
  };

  const handleCreateChannel = async (name: string, slug: string) => {
    const result = await channelOrder.execute(
      async () => {
        const newChannel = await createChannel(name, slug);
        await refetchChannels();
        return newChannel;
      },
      {
        successMessage: `Channel "${name}" créé avec succès !`,
      }
    );

    if (result) {
      setSelectedChannelSlug(result.slug);
    }
  };

  return {
    channels,
    selectedChannel,
    selectedChannelSlug,
    publications,
    allPublications,
    allComments,
    allUsers,
    loadingChannels,
    loadingPublications,
    errorChannels,
    errorPublications,
    isSubmitting: publicationOrder.isLoading,
    isCreatingChannel: channelOrder.isLoading,
    handleChannelSelect,
    handleSubmitPublication,
    handleCreateChannel,
    refetchPublications: refetch,
  };
}
