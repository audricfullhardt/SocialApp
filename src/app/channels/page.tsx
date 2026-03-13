"use client";

import { useState } from "react";
import { useChannelsPage } from "@/hooks";
import { ChannelsSidebar, ChannelContent } from "@/components/channels";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import SearchModal from "@/components/SearchModal";

export default function ChannelsPage() {
  const {
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
    isSubmitting,
    isCreatingChannel,
    handleChannelSelect,
    handleSubmitPublication,
    handleCreateChannel,
    refetchPublications,
  } = useChannelsPage();

  const { isLogin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isLogin) {
    return redirect("/");
  }

  const handleChannelSelectMobile = (slug: string) => {
    handleChannelSelect(slug);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] relative" data-testid="channels-page">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ChannelsSidebar
        channels={channels}
        selectedChannelSlug={selectedChannelSlug}
        onChannelSelect={handleChannelSelectMobile}
        loadingChannels={loadingChannels}
        errorChannels={errorChannels}
        onCreateChannel={handleCreateChannel}
        isCreatingChannel={isCreatingChannel}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <ChannelContent
          channel={selectedChannel}
          publications={publications}
          loading={loadingPublications}
          error={errorPublications}
          onSubmitPublication={handleSubmitPublication}
          isSubmitting={isSubmitting}
          onPublicationDeleted={refetchPublications}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </main>

      <SearchModal
        channels={channels}
        publications={allPublications}
        comments={allComments}
        users={allUsers}
        onSelectChannel={handleChannelSelectMobile}
      />
    </div>
  );
}
