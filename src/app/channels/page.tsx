"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getChannels } from "../../services/api";
import { Channel } from "../../types";
import { Card } from "../../components/ui/card";

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);

  console.log(channels)

  useEffect(() => {
    getChannels().then(setChannels);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Channels</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* {channels.map((channel) => (
          <Link key={channel.id} href={`/channels/${channel.slug}`}>
            <Card className="cursor-pointer p-4 hover:bg-gray-700">
              {channel.name}
            </Card>
          </Link>
        ))} */}
      </div>
    </div>
  );
}
