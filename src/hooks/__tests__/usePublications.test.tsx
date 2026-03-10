import { renderHook, waitFor, act } from "@testing-library/react";
import { usePublications } from "../usePublications";
import * as api from "@/services/api";
import { Publication } from "@/types";

jest.mock("@/services/api");

const mockedApi = api as jest.Mocked<typeof api>;

describe("usePublications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockPublications: Publication[] = [
    {
      "@id": "/pub/1",
      title: "Post 1",
      body: "Body 1",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      "@id": "/pub/2",
      title: "Post 2",
      body: "Body 2",
      createdAt: "2024-01-02",
      updatedAt: "2024-01-02",
    },
  ];

  it("devrait charger les publications d'un channel", async () => {
    mockedApi.getPublicationsByChannel.mockResolvedValueOnce(mockPublications);

    const { result } = renderHook(() =>
      usePublications({ channelSlug: "general" }),
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.publications).toEqual(mockPublications);
    expect(result.current.error).toBeNull();
    expect(mockedApi.getPublicationsByChannel).toHaveBeenCalledWith("general");
  });

  it("devrait retourner un tableau vide si channelSlug est null", async () => {
    const { result } = renderHook(() =>
      usePublications({ channelSlug: null }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.publications).toEqual([]);
    expect(mockedApi.getPublicationsByChannel).not.toHaveBeenCalled();
  });

  it("devrait gérer les erreurs", async () => {
    const mockError = new Error("Erreur serveur");
    mockedApi.getPublicationsByChannel.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() =>
      usePublications({ channelSlug: "general" }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.publications).toEqual([]);
    expect(result.current.error).toEqual(mockError);
  });

  it("devrait recharger les publications lors d'un changement de channel", async () => {
    mockedApi.getPublicationsByChannel.mockResolvedValue(mockPublications);

    const { result, rerender } = renderHook(
      ({ slug }: { slug: string | null }) =>
        usePublications({ channelSlug: slug }),
      { initialProps: { slug: "general" as string | null } },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApi.getPublicationsByChannel).toHaveBeenCalledWith("general");

    rerender({ slug: "random" });

    await waitFor(() => {
      expect(mockedApi.getPublicationsByChannel).toHaveBeenCalledWith("random");
    });
  });

  it("devrait permettre de refetch manuellement", async () => {
    mockedApi.getPublicationsByChannel.mockResolvedValue(mockPublications);

    const { result } = renderHook(() =>
      usePublications({ channelSlug: "general" }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApi.getPublicationsByChannel).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedApi.getPublicationsByChannel).toHaveBeenCalledTimes(2);
  });

  it("devrait activer le polling si un intervalle est défini", async () => {
    mockedApi.getPublicationsByChannel.mockResolvedValue(mockPublications);

    renderHook(() =>
      usePublications({ channelSlug: "general", pollingInterval: 5000 }),
    );

    await waitFor(() => {
      expect(mockedApi.getPublicationsByChannel).toHaveBeenCalledTimes(1);
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockedApi.getPublicationsByChannel).toHaveBeenCalledTimes(2);
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockedApi.getPublicationsByChannel).toHaveBeenCalledTimes(3);
    });
  });

  it("ne devrait pas activer le polling si l'intervalle est 0", async () => {
    mockedApi.getPublicationsByChannel.mockResolvedValue(mockPublications);

    renderHook(() =>
      usePublications({ channelSlug: "general", pollingInterval: 0 }),
    );

    await waitFor(() => {
      expect(mockedApi.getPublicationsByChannel).toHaveBeenCalledTimes(1);
    });

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(mockedApi.getPublicationsByChannel).toHaveBeenCalledTimes(1);
  });

  it("devrait convertir une erreur non-Error en Error", async () => {
    mockedApi.getPublicationsByChannel.mockRejectedValueOnce("string error");

    const { result } = renderHook(() =>
      usePublications({ channelSlug: "general" }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("Erreur lors de la récupération des publications");
  });
});
