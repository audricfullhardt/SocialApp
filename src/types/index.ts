export interface ApiPlatformCollection<T> {
  "@context": string;
  "@id": string;
  "@type": string;
  member?: T[];
  "hydra:member"?: T[]; // API Platform utilise parfois hydra:member
  totalItems?: number;
  "hydra:totalItems"?: number;
}

export interface Member {
  id: number;
  displayName: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Channel {
  id: number;
  name: string;
  slug: string;
  publications?: Publication[];
  workspace?: string[];
}

export interface Publication {
  "@id": string; // IRI de la publication (ex: /api/ws-k/publications/11)
  "@type"?: string;
  id?: number; // ID numérique (peut ne pas être retourné par l'API)
  author?: string | Member; // Peut être un IRI (string) ou un objet Member
  auteur?: Member; // Alias pour author
  channel?: Channel | string; // Peut être un objet Channel ou un IRI (string)
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  auteur: Member;
  publication: Publication;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: number;
  type: "like" | "love";
  auteur: Member;
  publication?: Publication;
  comment?: Comment;
  createdAt: string;
}
