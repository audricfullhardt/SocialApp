import {
  Channel,
  Publication,
  Comment,
  ApiPlatformCollection,
  Member,
  Reaction,
} from "../types";

// ============================================================================
// Configuration
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_SLUG = process.env.NEXT_PUBLIC_API_SLUG;

if (!API_URL || !API_SLUG) {
  throw new Error("API_URL and API_SLUG must be defined in environment variables");
}

// ============================================================================
// Custom Errors
// ============================================================================

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Récupère le token d'authentification depuis le localStorage
 * Note: Cette fonction est temporaire et sera remplacée par une solution cookie
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Construit les headers pour les requêtes authentifiées
 */
function buildHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/ld+json", // API Platform utilise application/ld+json
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Wrapper autour de fetch avec gestion d'erreurs robuste
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...buildHeaders(!endpoint.includes("/login") && !endpoint.includes("/register")),
        ...options.headers,
      },
    });

    // Gestion des erreurs HTTP
    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}: ${response.statusText}`;

      // Tenter de parser le corps de la réponse pour un message d'erreur détaillé
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Si le parsing JSON échoue, on garde le message par défaut
      }

      // Lancer des erreurs spécifiques selon le code de statut
      switch (response.status) {
        case 401:
          throw new UnauthorizedError(errorMessage);
        case 403:
          throw new ForbiddenError(errorMessage);
        case 404:
          throw new NotFoundError(errorMessage);
        default:
          throw new ApiError(response.status, response.statusText, errorMessage);
      }
    }

    // Parser la réponse JSON
    return await response.json();
  } catch (error) {
    // Re-lancer les erreurs ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Gérer les erreurs réseau
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(0, "Network Error", "Erreur réseau - impossible de joindre l'API");
    }

    // Erreur inconnue
    throw new ApiError(500, "Unknown Error", "Une erreur inattendue s'est produite");
  }
}

// ============================================================================
// Authentication
// ============================================================================

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  displayName: string;
}

/**
 * Authentifie un utilisateur
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await fetchAPI<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Stocker le token (temporaire - à remplacer par cookie)
  if (typeof window !== "undefined" && data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

/**
 * Enregistre un nouvel utilisateur
 */
export async function register(
  name: string,
  email: string,
  password: string,
  code: string
): Promise<RegisterResponse> {
  return fetchAPI<RegisterResponse>("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, code }),
  });
}

/**
 * Récupère les informations de l'utilisateur connecté
 */
export async function getCurrentUser(): Promise<Member> {
  return fetchAPI<Member>(`/${API_SLUG}/users/me`);
}

// ============================================================================
// Channels
// ============================================================================

/**
 * Récupère la liste de tous les channels
 */
export async function getChannels(): Promise<Channel[]> {
  const data = await fetchAPI<ApiPlatformCollection<Channel>>(`/${API_SLUG}/channels`);
  return data.member || data["hydra:member"] || [];
}

/**
 * Récupère un channel par son slug
 */
export async function getChannelBySlug(channelSlug: string): Promise<Channel> {
  return fetchAPI<Channel>(`/${API_SLUG}/channels/${channelSlug}`);
}

// ============================================================================
// Publications
// ============================================================================

/**
 * Récupère les publications d'un channel par son slug
 */
export async function getPublicationsByChannel(channelSlug: string): Promise<Publication[]> {
  const channel = await fetchAPI<Channel>(
    `/${API_SLUG}/channels/${channelSlug}`
  );
  return channel.publications || [];
}

/**
 * Crée une nouvelle publication
 */
export async function createPublication(
  channelSlug: string,
  title: string,
  body: string
): Promise<Publication> {
  return fetchAPI<Publication>(`/${API_SLUG}/publications`, {
    method: "POST",
    body: JSON.stringify({
      channel: `/api/${API_SLUG}/channels/${channelSlug}`, // IRI API Platform
      title,
      body,
    }),
  });
}

/**
 * Récupère une publication par son ID
 */
export async function getPublicationById(publicationId: number): Promise<Publication> {
  return fetchAPI<Publication>(`/${API_SLUG}/${publicationId}`);
}

// ============================================================================
// Comments
// ============================================================================

/**
 * Récupère les commentaires d'une publication
 */
export async function getCommentsByPublication(publicationId: number): Promise<Comment[]> {
  const data = await fetchAPI<ApiPlatformCollection<Comment>>(
    `/${API_SLUG}/publications/${publicationId}/comments`
  );
  return data.member || data["hydra:member"] || [];
}

/**
 * Crée un nouveau commentaire
 */
export async function createComment(
  publicationId: number,
  body: string
): Promise<Comment> {
  return fetchAPI<Comment>(`/${API_SLUG}/comments`, {
    method: "POST",
    body: JSON.stringify({
      publication: `/api/${API_SLUG}/publications/${publicationId}`, // IRI API Platform
      body,
    }),
  });
}

// ============================================================================
// Reactions
// ============================================================================

/**
 * Ajoute une réaction à une publication
 * Endpoint: POST /publications/{id}/reactions
 */
export async function addReactionToPublication(
  publicationIri: string,
  type: "like" | "love"
): Promise<Reaction> {
  // Extraire l'ID depuis l'IRI (ex: /api/ws-k/publications/11 -> 11)
  const publicationId = publicationIri.split('/').pop();
  
  return fetchAPI<Reaction>(`/${API_SLUG}/messages/${publicationId}/reactions`, {
    method: "POST",
    body: JSON.stringify({
      type,
    }),
  });
}

/**
 * Ajoute une réaction à un commentaire
 * Endpoint: POST /comments/{id}/reactions
 */
export async function addReactionToComment(
  commentIri: string,
  type: "like" | "love"
): Promise<Reaction> {
  // Extraire l'ID depuis l'IRI (ex: /api/ws-k/comments/5 -> 5)
  const commentId = commentIri.split('/').pop();
  
  return fetchAPI<Reaction>(`/${API_SLUG}/comments/${commentId}/reactions`, {
    method: "POST",
    body: JSON.stringify({
      type,
    }),
  });
}

/**
 * Supprime une réaction
 */
export async function deleteReaction(reactionId: number): Promise<void> {
  return fetchAPI<void>(`/${API_SLUG}/reactions/${reactionId}`, {
    method: "DELETE",
  });
}
