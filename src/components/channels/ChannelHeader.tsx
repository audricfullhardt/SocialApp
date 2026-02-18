import { Hash } from "lucide-react";

interface ChannelHeaderProps {
  channelName: string;
  publicationsCount: number;
}

export function ChannelHeader({
  channelName,
  publicationsCount,
}: ChannelHeaderProps) {
  return (
    <div className="border-b p-4 bg-background">
      <div className="flex items-center gap-2">
        <Hash className="w-5 h-5" />
        <h1 className="text-xl font-bold">{channelName}</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {publicationsCount} publication{publicationsCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
