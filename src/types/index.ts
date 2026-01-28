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
  publications?: string[];
  workspace?: string[];
}

export interface Publication {
  channelSlug: string;
  id: number;
  auteur: Member;
  channel: Channel;
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
