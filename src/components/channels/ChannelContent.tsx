import { Channel, Publication } from "@/types";
import { ChannelHeader } from "./ChannelHeader";
import { PublicationsList } from "./PublicationsList";
import { PublicationForm } from "./PublicationForm";
import { Skeleton } from "antd";
import { Menu } from "lucide-react";

interface ChannelContentProps {
  channel: Channel | undefined;
  publications: Publication[];
  loading: boolean;
  error: Error | null;
  onSubmitPublication: (title: string, body: string, file?: File) => Promise<void>;
  isSubmitting: boolean;
  onPublicationDeleted?: () => void;
  onOpenSidebar?: () => void;
}

export function ChannelContent({
  channel,
  publications,
  loading,
  error,
  onSubmitPublication,
  isSubmitting,
  onPublicationDeleted,
  onOpenSidebar,
}: ChannelContentProps) {
  if (loading && !channel) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b p-3 sm:p-4">
          <Skeleton active title={false} paragraph={{ rows: 1, width: "40%" }} />
        </div>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
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
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="md:hidden flex items-center gap-2 px-4 py-2 rounded-md border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Menu className="w-4 h-4" />
            Voir les channels
          </button>
        )}
        <p className="text-muted-foreground text-center">
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
        onOpenSidebar={onOpenSidebar}
      />

      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
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
