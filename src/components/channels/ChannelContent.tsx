import { Channel, Publication } from "@/types";
import { ChannelHeader } from "./ChannelHeader";
import { PublicationsList } from "./PublicationsList";
import { PublicationForm } from "./PublicationForm";
import { Skeleton } from "antd";

interface ChannelContentProps {
  channel: Channel | undefined;
  publications: Publication[];
  loading: boolean;
  error: Error | null;
  onSubmitPublication: (title: string, body: string, file?: File) => Promise<void>;
  isSubmitting: boolean;
  onPublicationDeleted?: () => void;
}

export function ChannelContent({
  channel,
  publications,
  loading,
  error,
  onSubmitPublication,
  isSubmitting,
  onPublicationDeleted,
}: ChannelContentProps) {
  if (loading && !channel) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b p-4">
          <Skeleton active title={false} paragraph={{ rows: 1, width: "40%" }} />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="p-4 border rounded-md bg-card">
                <Skeleton active paragraph={{ rows: 2 }} title />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          onPublicationDeleted={onPublicationDeleted}
        />
      </div>

      <PublicationForm
        onSubmit={onSubmitPublication}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
