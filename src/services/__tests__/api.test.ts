import {
  login,
  register,
  getCurrentUser,
  updateUser,
  getChannels,
  createChannel,
  getChannelBySlug,
  getPublicationsByChannel,
  createPublication,
  updatePublication,
  deletePublication,
  getAllComments,
  createComment,
  deleteComment,
  addReactionToPublication,
  deleteReaction,
  getUsers,
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "../api";
import { ApiPlatformCollection, Channel, User, Comment, Reaction } from "@/types";

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("login", () => {
    it("devrait authentifier un utilisateur avec succès", async () => {
      const mockResponse = { token: "fake-jwt-token" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await login("test@example.com", "password123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/login"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        }),
      );

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem("token")).toBe("fake-jwt-token");
    });

    it("devrait gérer une erreur 401", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ message: "Identifiants invalides" }),
      } as Response);

      await expect(
        login("test@example.com", "wrong-password"),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("ne devrait pas inclure le header Authorization pour login", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "tok" }),
      } as Response);

      await login("a@b.com", "pass");

      const calledHeaders = (mockFetch.mock.calls[0][1]?.headers ?? {}) as Record<string, string>;
      expect(calledHeaders["Authorization"]).toBeUndefined();
    });
  });

  describe("register", () => {
    it("devrait créer un compte avec succès", async () => {
      const mockUser: Partial<User> = {
        id: 1,
        displayName: "Test User",
        email: "test@example.com",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await register("Test User", "test@example.com", "password123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/register"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            displayName: "Test User",
            email: "test@example.com",
            password: "password123",
          }),
        }),
      );

      expect(result).toEqual(mockUser);
    });

    it("devrait gérer une erreur lors de l'inscription", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ message: "Email déjà utilisé" }),
      } as Response);

      await expect(
        register("Test", "existing@test.com", "pass"),
      ).rejects.toThrow(ApiError);
    });
  });

  describe("getCurrentUser", () => {
    it("devrait récupérer l'utilisateur courant", async () => {
      const mockUser: Partial<User> = {
        id: 1,
        displayName: "Test User",
        email: "test@test.fr",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await getCurrentUser();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/me"),
        expect.any(Object),
      );
      expect(result).toEqual(mockUser);
    });

    it("devrait lever UnauthorizedError si non connecté", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ message: "Token invalide" }),
      } as Response);

      await expect(getCurrentUser()).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("updateUser", () => {
    it("devrait mettre à jour un utilisateur", async () => {
      const user: User = {
        id: 1,
        displayName: "Updated",
        email: "test@test.fr",
        prenom: "",
        nom: "",
        createdAt: "",
        password: "newpassword",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => user,
      } as Response);

      const result = await updateUser(user);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/1"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            displayName: "Updated",
            email: "test@test.fr",
            password: "newpassword",
          }),
        }),
      );
      expect(result).toEqual(user);
    });
  });

  describe("getUsers", () => {
    it("devrait récupérer la liste des utilisateurs", async () => {
      const mockUsers: Partial<User>[] = [
        { id: 1, displayName: "User1" },
        { id: 2, displayName: "User2" },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          member: mockUsers,
        }),
      } as Response);

      const result = await getUsers();
      expect(result).toEqual(mockUsers);
    });

    it("devrait supporter le format hydra:member", async () => {
      const mockUsers: Partial<User>[] = [{ id: 1, displayName: "User1" }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ "hydra:member": mockUsers }),
      } as Response);

      const result = await getUsers();
      expect(result).toEqual(mockUsers);
    });

    it("devrait retourner un tableau vide si member est undefined", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const result = await getUsers();
      expect(result).toEqual([]);
    });
  });

  describe("getChannels", () => {
    it("devrait récupérer la liste des channels", async () => {
      const mockChannels: Channel[] = [
        { id: 1, name: "General", slug: "general" },
        { id: 2, name: "Random", slug: "random" },
      ];

      const mockResponse: ApiPlatformCollection<Channel> = {
        "@context": "/api/contexts/Channel",
        "@id": "/api/channels",
        "@type": "hydra:Collection",
        member: mockChannels,
        totalItems: 2,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await getChannels();
      expect(result).toEqual(mockChannels);
    });

    it("devrait gérer le format hydra:member", async () => {
      const mockChannels: Channel[] = [
        { id: 1, name: "General", slug: "general" },
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockResponse: any = {
        "@context": "/api/contexts/Channel",
        "@id": "/api/channels",
        "@type": "hydra:Collection",
        "hydra:member": mockChannels,
        "hydra:totalItems": 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await getChannels();
      expect(result).toEqual(mockChannels);
    });

    it("devrait gérer une erreur 404", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ message: "Channels non trouvés" }),
      } as Response);

      await expect(getChannels()).rejects.toThrow(NotFoundError);
    });

    it("devrait retourner un tableau vide si member est undefined", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockResponse: any = {
        "@context": "/api/contexts/Channel",
        "@id": "/api/channels",
        "@type": "hydra:Collection",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await getChannels();
      expect(result).toEqual([]);
    });
  });

  describe("createChannel", () => {
    it("devrait créer un channel avec succès", async () => {
      const mockChannel: Channel = { id: 3, name: "Dev", slug: "dev" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannel,
      } as Response);

      const result = await createChannel("Dev", "dev");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/channels"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Dev", slug: "dev" }),
        }),
      );
      expect(result).toEqual(mockChannel);
    });
  });

  describe("getChannelBySlug", () => {
    it("devrait récupérer un channel par son slug", async () => {
      const mockChannel: Channel = { id: 1, name: "General", slug: "general" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannel,
      } as Response);

      const result = await getChannelBySlug("general");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/channels/general"),
        expect.any(Object),
      );
      expect(result).toEqual(mockChannel);
    });

    it("devrait lever NotFoundError si le channel n'existe pas", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ message: "Channel non trouvé" }),
      } as Response);

      await expect(getChannelBySlug("unknown")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getPublicationsByChannel", () => {
    it("devrait récupérer les publications d'un channel", async () => {
      const mockPublications = [
        { "@id": "/pub/1", title: "Test", body: "Body", createdAt: "", updatedAt: "" },
      ];
      const mockChannel = {
        id: 1,
        name: "General",
        slug: "general",
        publications: mockPublications,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannel,
      } as Response);

      const result = await getPublicationsByChannel("general");
      expect(result).toEqual(mockPublications);
    });

    it("devrait retourner un tableau vide si pas de publications", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Empty", slug: "empty" }),
      } as Response);

      const result = await getPublicationsByChannel("empty");
      expect(result).toEqual([]);
    });
  });

  describe("createPublication", () => {
    it("devrait créer une publication", async () => {
      const mockPub = {
        "@id": "/pub/1",
        title: "New Post",
        body: "Content",
        createdAt: "",
        updatedAt: "",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPub,
      } as Response);

      const result = await createPublication("general", "New Post", "Content");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/publications"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"title":"New Post"'),
        }),
      );
      expect(result).toEqual(mockPub);
    });
  });

  describe("updatePublication", () => {
    it("devrait modifier une publication", async () => {
      const mockPub = {
        "@id": "/pub/1",
        title: "Updated",
        body: "Updated body",
        createdAt: "",
        updatedAt: "",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPub,
      } as Response);

      const result = await updatePublication(1, "Updated", "Updated body");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/publications/1"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ title: "Updated", body: "Updated body" }),
        }),
      );
      expect(result).toEqual(mockPub);
    });
  });

  describe("deletePublication", () => {
    it("devrait supprimer une publication", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await deletePublication(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/publications/1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("getAllComments", () => {
    it("devrait récupérer tous les commentaires", async () => {
      const mockComments: Partial<Comment>[] = [
        { id: 1, body: "Comment 1" },
        { id: 2, body: "Comment 2" },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ member: mockComments }),
      } as Response);

      const result = await getAllComments();
      expect(result).toEqual(mockComments);
    });

    it("devrait supporter hydra:member pour les commentaires", async () => {
      const mockComments: Partial<Comment>[] = [{ id: 1, body: "Comment" }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ "hydra:member": mockComments }),
      } as Response);

      const result = await getAllComments();
      expect(result).toEqual(mockComments);
    });
  });

  describe("createComment", () => {
    it("devrait créer un commentaire", async () => {
      const mockComment: Partial<Comment> = { id: 1, body: "New comment" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      } as Response);

      const result = await createComment(42, "New comment");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/comments"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"body":"New comment"'),
        }),
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe("deleteComment", () => {
    it("devrait supprimer un commentaire", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await deleteComment(5);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/comments/5"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("addReactionToPublication", () => {
    it("devrait ajouter une réaction like", async () => {
      const mockReaction: Partial<Reaction> = { id: 1, type: "like" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReaction,
      } as Response);

      const result = await addReactionToPublication("/api/publications/1", "like");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/reactions"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ type: "like", publication: "/api/publications/1" }),
        }),
      );
      expect(result).toEqual(mockReaction);
    });

    it("devrait ajouter une réaction love", async () => {
      const mockReaction: Partial<Reaction> = { id: 2, type: "love" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReaction,
      } as Response);

      const result = await addReactionToPublication("/api/publications/1", "love");
      expect(result.type).toBe("love");
    });
  });

  describe("deleteReaction", () => {
    it("devrait supprimer une réaction", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await deleteReaction(10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/reactions/10"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("Error classes", () => {
    it("ApiError devrait avoir les bonnes propriétés", () => {
      const error = new ApiError(500, "Server Error", "Erreur interne");
      expect(error.status).toBe(500);
      expect(error.statusText).toBe("Server Error");
      expect(error.message).toBe("Erreur interne");
      expect(error.name).toBe("ApiError");
      expect(error).toBeInstanceOf(Error);
    });

    it("UnauthorizedError devrait être un ApiError 401", () => {
      const error = new UnauthorizedError();
      expect(error.status).toBe(401);
      expect(error.name).toBe("UnauthorizedError");
      expect(error).toBeInstanceOf(ApiError);
    });

    it("ForbiddenError devrait être un ApiError 403", () => {
      const error = new ForbiddenError();
      expect(error.status).toBe(403);
      expect(error.name).toBe("ForbiddenError");
      expect(error).toBeInstanceOf(ApiError);
    });

    it("NotFoundError devrait être un ApiError 404", () => {
      const error = new NotFoundError();
      expect(error.status).toBe(404);
      expect(error.name).toBe("NotFoundError");
      expect(error).toBeInstanceOf(ApiError);
    });

    it("ForbiddenError devrait avoir un message personnalisé", () => {
      const error = new ForbiddenError("Accès refusé");
      expect(error.message).toBe("Accès refusé");
    });
  });

  describe("Error Handling", () => {
    it("devrait gérer les erreurs réseau", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
      await expect(getChannels()).rejects.toThrow(ApiError);
    });

    it("devrait gérer les erreurs réseau avec le bon message", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
      await expect(getChannels()).rejects.toThrow(
        "Erreur réseau - impossible de joindre l'API",
      );
    });

    it("devrait gérer les erreurs de parsing JSON", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as unknown as Response);

      await expect(getChannels()).rejects.toThrow(ApiError);
    });

    it("devrait lever ForbiddenError pour un 403", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ message: "Interdit" }),
      } as Response);

      await expect(getChannels()).rejects.toThrow(ForbiddenError);
    });

    it("devrait gérer les erreurs inconnues", async () => {
      mockFetch.mockRejectedValueOnce("unexpected string error");
      await expect(getChannels()).rejects.toThrow(ApiError);
    });
  });
});
