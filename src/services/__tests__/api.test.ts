import {
  login,
  getChannels,
  ApiError,
  UnauthorizedError,
  NotFoundError,
} from "../api";
import { ApiPlatformCollection, Channel } from "@/types";

// Mock de fetch
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
        })
      );

      expect(result).toEqual(mockResponse);
      expect(localStorage.setItem).toHaveBeenCalledWith("token", "fake-jwt-token");
    });

    it("devrait gérer une erreur 401", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ message: "Identifiants invalides" }),
      } as Response);

      await expect(login("test@example.com", "wrong-password")).rejects.toThrow(
        UnauthorizedError
      );
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

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/channels"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );

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

  describe("Error Handling", () => {
    it("devrait gérer les erreurs réseau", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      await expect(getChannels()).rejects.toThrow(ApiError);
    });

    it("devrait gérer les erreurs de parsing JSON", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as Response);

      await expect(getChannels()).rejects.toThrow(ApiError);
    });
  });
});
