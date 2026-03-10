import { renderHook, waitFor, act } from "@testing-library/react";
import { useChannels } from "../useChannels";
import * as api from "@/services/api";
import { Channel } from "@/types";

jest.mock("@/services/api");

const mockedApi = api as jest.Mocked<typeof api>;

describe("useChannels", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait charger les channels avec succès", async () => {
    const mockChannels: Channel[] = [
      { id: 1, name: "General", slug: "general" },
      { id: 2, name: "Random", slug: "random" },
    ];

    mockedApi.getChannels.mockResolvedValueOnce(mockChannels);

    const { result } = renderHook(() => useChannels());

    expect(result.current.loading).toBe(true);
    expect(result.current.channels).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.channels).toEqual(mockChannels);
    expect(result.current.error).toBeNull();
    expect(mockedApi.getChannels).toHaveBeenCalledTimes(1);
  });

  it("devrait gérer les erreurs", async () => {
    const mockError = new Error("Erreur réseau");
    mockedApi.getChannels.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.channels).toEqual([]);
    expect(result.current.error).toEqual(mockError);
  });

  it("devrait permettre de rafraîchir les channels", async () => {
    const mockChannels: Channel[] = [
      { id: 1, name: "General", slug: "general" },
    ];

    mockedApi.getChannels.mockResolvedValue(mockChannels);

    const { result } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApi.getChannels).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedApi.getChannels).toHaveBeenCalledTimes(2);
  });

  it("devrait retourner un tableau vide en cas d'erreur", async () => {
    mockedApi.getChannels.mockRejectedValueOnce(new Error("Error"));

    const { result } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.channels).toEqual([]);
  });
});
