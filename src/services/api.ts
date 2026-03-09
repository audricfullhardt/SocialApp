import {
  Channel,
  Publication,
  Comment,
  ApiPlatformCollection,
  Member,
  Reaction,
  User,
} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_SLUG = process.env.NEXT_PUBLIC_API_SLUG;

if (!API_URL || !API_SLUG) {
  throw new Error(
    "API_URL and API_SLUG must be defined in environment variables",
  );
}
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Non autorisé - veuillez vous reconnecter") {
    super(401, "Unauthorized", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Accès interdit") {
    super(403, "Forbidden", message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Ressource non trouvée") {
    super(404, "Not Found", message);
    this.name = "NotFoundError";
  }
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function buildHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/ld+json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...buildHeaders(
          !endpoint.includes("/login") && !endpoint.includes("/register"),
        ),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {}

      switch (response.status) {
        case 401:
          throw new UnauthorizedError(errorMessage);
        case 403:
          throw new ForbiddenError(errorMessage);
        case 404:
          throw new NotFoundError(errorMessage);
        default:
          throw new ApiError(
            response.status,
            response.statusText,
            errorMessage,
          );
      }
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        0,
        "Network Error",
        "Erreur réseau - impossible de joindre l'API",
      );
    }

    throw new ApiError(
      500,
      "Unknown Error",
      "Une erreur inattendue s'est produite",
    );
  }
}

export interface LoginResponse {
  token: string;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const data = await fetchAPI<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (typeof window !== "undefined" && data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

export async function register(
  displayName: string,
  email: string,
  password: string,
): Promise<User> {
  return fetchAPI<User>(`/${API_SLUG}/register`, {
    method: "POST",
    body: JSON.stringify({ displayName, email, password }),
  });
}

export async function getCurrentUser(): Promise<User> {
  return fetchAPI<User>(`/${API_SLUG}/users/me`);
}

export async function updateUser(user: User): Promise<User> {
  return fetchAPI<User>(`/${API_SLUG}/users/${user.id}`, {
    method: "PUT",
    body: JSON.stringify({
      displayName: user.displayName,
      email: user.email,
      password: user.password,
    }),
  });
}

export async function getChannels(): Promise<Channel[]> {
  const data = await fetchAPI<ApiPlatformCollection<Channel>>(
    `/${API_SLUG}/channels`,
  );
  return data.member || data["hydra:member"] || [];
}

export async function createChannel(
  name: string,
  slug: string,
): Promise<Channel> {
  return fetchAPI<Channel>(`/${API_SLUG}/channels`, {
    method: "POST",
    body: JSON.stringify({ name, slug }),
  });
}

export async function getChannelBySlug(channelSlug: string): Promise<Channel> {
  return fetchAPI<Channel>(`/${API_SLUG}/channels/${channelSlug}`);
}

export async function getPublicationsByChannel(
  channelSlug: string,
): Promise<Publication[]> {
  const channel = await fetchAPI<Channel>(
    `/${API_SLUG}/channels/${channelSlug}`,
  );
  return channel.publications || [];
}

export async function createPublication(
  channelSlug: string,
  title: string,
  body: string,
): Promise<Publication> {
  return fetchAPI<Publication>(`/${API_SLUG}/publications`, {
    method: "POST",
    body: JSON.stringify({
      channel: `/api/${API_SLUG}/channels/${channelSlug}`,
      title,
      body,
    }),
  });
}

export async function getPublicationById(
  publicationId: number,
): Promise<Publication> {
  return fetchAPI<Publication>(`/${API_SLUG}/${publicationId}`);
}

export async function getAllComments(): Promise<Comment[]> {
  const data = await fetchAPI<ApiPlatformCollection<Comment>>(
    `/${API_SLUG}/comments`,
  );
  return data.member || data["hydra:member"] || [];
}

export async function createComment(
  publicationId: number,
  body: string,
): Promise<Comment> {
  return fetchAPI<Comment>(`/${API_SLUG}/comments`, {
    method: "POST",
    body: JSON.stringify({
      publication: `/api/${API_SLUG}/publications/${publicationId}`,
      body,
    }),
  });
}

export async function addReactionToPublication(
  publicationIri: string,
  type: "like" | "love",
): Promise<Reaction> {
  return fetchAPI<Reaction>(`/${API_SLUG}/reactions`, {
    method: "POST",
    body: JSON.stringify({
      type,
      publication: publicationIri,
    }),
  });
}

export async function addReactionToComment(
  commentIri: string,
  type: "like" | "love",
): Promise<Reaction> {
  const commentId = commentIri.split("/").pop();

  return fetchAPI<Reaction>(`/${API_SLUG}/comments/${commentId}/reactions`, {
    method: "POST",
    body: JSON.stringify({
      type,
    }),
  });
}

export async function deleteReaction(reactionId: number): Promise<void> {
  return fetchAPI<void>(`/${API_SLUG}/reactions/${reactionId}`, {
    method: "DELETE",
  });
}

export async function getReactions() {
  return fetchAPI<Reaction>(`/${API_SLUG}/reactions`);
}
