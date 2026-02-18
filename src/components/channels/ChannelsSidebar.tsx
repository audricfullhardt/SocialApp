import { Channel } from "@/types";
import { Badge, Skeleton } from "antd";
import { Hash } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { CreateChannelForm } from "./CreateChannelForm";

interface ChannelsSidebarProps {
  channels: Channel[];
  selectedChannelSlug: string | null;
  onChannelSelect: (slug: string) => void;
  loadingChannels: boolean;
  errorChannels?: Error | null;
  onCreateChannel: (name: string, slug: string) => Promise<void>;
  isCreatingChannel: boolean;
}

export function ChannelsSidebar({
  channels,
  selectedChannelSlug,
  onChannelSelect,
  loadingChannels,
  errorChannels,
  onCreateChannel,
  isCreatingChannel,
}: ChannelsSidebarProps) {
  return (
    <aside className="w-64 border-r bg-muted/10 overflow-y-auto flex flex-col">
      <div className="p-4 flex-1">
        <h2 className="text-lg font-bold mb-4">Channels</h2>
        <nav className="flex flex-col gap-1">
          {loadingChannels ? (
            <Skeleton active />
          ) : errorChannels ? (
            <Alert variant="destructive" data-testid="channels-error">
              <p className="font-semibold text-sm">Erreur</p>
              <p className="text-xs">{errorChannels.message}</p>
            </Alert>
          ) : channels.length === 0 ? (
            <Alert>
              <p className="text-xs text-muted-foreground">
                Aucun channel disponible pour le moment.
              </p>
            </Alert>
          ) : (
            channels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isSelected={selectedChannelSlug === channel.slug}
                onSelect={() => onChannelSelect(channel.slug)}
              />
            ))
          )}
        </nav>
      </div>
      
      <div className="p-4 border-t bg-background">
        <CreateChannelForm 
          onSubmit={onCreateChannel} 
          isSubmitting={isCreatingChannel}
        />
      </div>
    </aside>
  );
}

interface ChannelItemProps {
  channel: Channel;
  isSelected: boolean;
  onSelect: () => void;
}

function ChannelItem({ channel, isSelected, onSelect }: ChannelItemProps) {
  const publicationsCount = channel.publications?.length || 0;

  return (
    <button
      onClick={onSelect}
      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-left transition-colors ${
        isSelected
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      }`}
      data-testid={`channel-item-${channel.id}`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Hash className="w-4 h-4 flex-shrink-0" />
        <span className="truncate font-medium">{channel.name}</span>
      </div>
      {publicationsCount > 0 && (
        <Badge count={publicationsCount} size="small" className="ml-2" />
      )}
    </button>
  );
}
