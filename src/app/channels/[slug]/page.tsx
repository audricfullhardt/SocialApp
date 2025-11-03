"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicationsByChannel } from "../../../services/api";
import { Publication } from "../../../types";
import PublicationCard from "../../../components/Publication";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChannelPage() {
  const { slug } = useParams();
  const [publications, setPublications] = useState<Publication[]>([]);

  useEffect(() => {
    if (slug) getPublicationsByChannel(slug).then(setPublications);
  }, [slug]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Channel: {slug}</h1>
      <Link href={`/channels`}>
      <ArrowLeft className="mb-4" />
      </Link>
      <div className="flex flex-col gap-4">
        {publications.map((pub) => (
          <PublicationCard key={pub.id} publication={pub} />
        ))}
      </div>
    </div>
  );
}
