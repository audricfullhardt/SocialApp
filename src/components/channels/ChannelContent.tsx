import { Channel, Publication } from "@/types";
import { ChannelHeader } from "./ChannelHeader";
import { PublicationsList } from "./PublicationsList";
import { PublicationForm } from "./PublicationForm";

interface ChannelContentProps {
  channel: Channel | undefined;
  publications: Publication[];
  loading: boolean;
  error: Error | null;
  onSubmitPublication: (title: string, body: string) => Promise<void>;
  isSubmitting: boolean;
}

export function ChannelContent({
  channel,
  publications,
  loading,
  error,
  onSubmitPublication,
  isSubmitting,
}: ChannelContentProps) {
  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Sélectionnez un channel pour voir les publications
        </p>
      </div>
    );
  }

  return (
    <>
      <ChannelHeader
        channelName={channel.name}
        publicationsCount={publications.length}
      />

      <div className="flex-1 overflow-y-auto p-4">
        <PublicationsList
          publications={publications}
          loading={loading}
          error={error}
        />
      </div>

      <PublicationForm
        onSubmit={onSubmitPublication}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
