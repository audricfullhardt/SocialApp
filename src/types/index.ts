export interface ApiPlatformCollection<T> {
  "@context": string;
  "@id": string;
  "@type": string;
  member?: T[];
  "hydra:member"?: T[];
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

export interface Media {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}

export interface Reaction {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: number;
  type: string;
  author: string | Member;
  createdAt: string;
  publication?: string;
}

export interface Comment {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: number;
  publication?: string;
  author: string | Member;
  auteur?: Member;
  body: string;
  createdAt: string;
  updatedAt: string;
  reactions?: Reaction[];
  media?: Media[];
}

export interface Publication {
  "@context"?: string;
  "@id": string;
  "@type"?: string;
  id?: number;
  workspace?: Record<string, unknown>;
  author?: string | Member;
  auteur?: Member;
  channel?: Channel | string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  reactions?: Reaction[];
  media?: Media[];
}

export interface User {
  "@id"?: string;
  "@type"?: string;
  id: number;
  displayName: string;
  prenom: string;
  nom: string;
  email: string;
  dateAnniversaire?: string;
  avatar?: Media;
  username?: string;
  createdAt: string;
  password?: string;
}