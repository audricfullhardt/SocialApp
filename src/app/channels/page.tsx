"use client";

import Link from "next/link";
import { useChannels } from "@/hooks";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function ChannelsPage() {
  const { channels, loading, error } = useChannels();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" aria-label="Chargement" />
          <p className="text-muted-foreground">Chargement des channels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive" data-testid="channels-error">
          <p className="font-semibold">Erreur</p>
          <p>{error.message}</p>
        </Alert>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Channels</h1>
        <Alert>
          <p className="text-muted-foreground">
            Aucun channel disponible pour le moment.
          </p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="channels-page">
      <h1 className="text-2xl font-bold mb-4">Channels</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <Link
            key={channel.id}
            href={`/channels/${channel.slug}`}
            data-testid={`channel-card-${channel.id}`}
          >
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold">{channel.name}</h2>
              {channel.slug && (
                <p className="text-sm text-muted-foreground mt-1">
                  #{channel.slug}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

