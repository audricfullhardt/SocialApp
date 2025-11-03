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
}

export interface Publication {
  channelSlug: string;
  id: number;
  auteur: Member;
  channel: Channel;
  titre: string;
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
