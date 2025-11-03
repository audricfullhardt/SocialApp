"use client";

import { Publication as PublicationType } from "../types";
import { Card } from "./ui/card";

export default function PublicationCard({ publication }: { publication: PublicationType }) {
  return (
    <Card className="p-4 hover:bg-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <img src={publication.auteur.avatar} alt={publication.auteur.displayName} className="w-8 h-8 rounded-full"/>
        <span className="font-semibold">{publication.auteur.displayName}</span>
        <span className="text-sm text-gray-400">{new Date(publication.createdAt).toLocaleString()}</span>
      </div>
      <h2 className="font-bold">{publication.titre}</h2>
      <p>{publication.body}</p>
    </Card>
  );
}
