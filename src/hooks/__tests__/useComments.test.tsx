import { renderHook, waitFor, act } from "@testing-library/react";
import { useComments } from "../useComments";
import * as api from "@/services/api";
import { Comment } from "@/types";

jest.mock("@/services/api");

const mockedApi = api as jest.Mocked<typeof api>;

describe("useComments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockComments: Comment[] = [
    {
      id: 1,
      body: "Premier commentaire",
      author: "user1",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 2,
      body: "Deuxième commentaire",
      author: "user2",
      createdAt: "2024-01-02",
      updatedAt: "2024-01-02",
    },
  ];

  it("devrait charger les commentaires avec succès", async () => {
    mockedApi.getAllComments.mockResolvedValueOnce(mockComments);

    const { result } = renderHook(() => useComments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual(mockComments);
    expect(result.current.error).toBeNull();
    expect(mockedApi.getAllComments).toHaveBeenCalledTimes(1);
  });

  it("devrait gérer les erreurs", async () => {
    const mockError = new Error("Erreur réseau");
    mockedApi.getAllComments.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useComments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual([]);
    expect(result.current.error).toEqual(mockError);
  });

  it("devrait permettre de refetch les commentaires", async () => {
    mockedApi.getAllComments.mockResolvedValue(mockComments);

    const { result } = renderHook(() => useComments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApi.getAllComments).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedApi.getAllComments).toHaveBeenCalledTimes(2);
  });

  it("devrait retourner un tableau vide en cas d'erreur", async () => {
    mockedApi.getAllComments.mockRejectedValueOnce(new Error("Error"));

    const { result } = renderHook(() => useComments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual([]);
  });

  it("devrait convertir une erreur non-Error en Error", async () => {
    mockedApi.getAllComments.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useComments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("commentaires");
  });
});
