import { Hash, Menu } from "lucide-react";

interface ChannelHeaderProps {
  channelName: string;
  publicationsCount: number;
  onOpenSidebar?: () => void;
}

export function ChannelHeader({
  channelName,
  publicationsCount,
  onOpenSidebar,
}: ChannelHeaderProps) {
  return (
    <div className="border-b p-3 sm:p-4 bg-background">
      <div className="flex items-center gap-2">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Ouvrir les channels"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Hash className="w-5 h-5" />
        <h1 className="text-lg sm:text-xl font-bold truncate">{channelName}</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1 ml-0 md:ml-0">
        {publicationsCount} publication{publicationsCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
