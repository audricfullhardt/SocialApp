"use client";

import { useChannelsPage } from "@/hooks";
import { ChannelsSidebar, ChannelContent } from "@/components/channels";

export default function ChannelsPage() {
  const {
    channels,
    selectedChannel,
    selectedChannelSlug,
    publications,
    loadingChannels,
    loadingPublications,
    errorChannels,
    errorPublications,
    isSubmitting,
    handleChannelSelect,
    handleSubmitPublication,
  } = useChannelsPage();

  return (
    <div className="flex h-[calc(100vh-4rem)]" data-testid="channels-page">
      <ChannelsSidebar
        channels={channels}
        selectedChannelSlug={selectedChannelSlug}
        onChannelSelect={handleChannelSelect}
        loadingChannels={loadingChannels}
        errorChannels={errorChannels}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <ChannelContent
          channel={selectedChannel}
          publications={publications}
          loading={loadingPublications}
          error={errorPublications}
          onSubmitPublication={handleSubmitPublication}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  );
}
