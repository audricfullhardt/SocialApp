import { renderHook, act } from "@testing-library/react";
import React, { ReactNode } from "react";
import { useOrder } from "../useOrder";
import { ToastProvider } from "@/contexts/ToastContext";

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe("useOrder", () => {
  it("devrait commencer à l'état idle", () => {
    const { result } = renderHook(() => useOrder(), { wrapper });

    expect(result.current.state).toBe("idle");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("devrait passer en loading puis success", async () => {
    const { result } = renderHook(
      () => useOrder({ successMessage: "OK !", showSuccessToast: true }),
      { wrapper },
    );

    let resolved: unknown;
    await act(async () => {
      resolved = await result.current.execute(async () => "result-data");
    });

    expect(resolved).toBe("result-data");
    expect(result.current.state).toBe("success");
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("devrait passer en error en cas d'échec", async () => {
    const { result } = renderHook(
      () => useOrder({ errorMessage: "Echec", showErrorToast: true }),
      { wrapper },
    );

    const apiCall = async () => {
      throw new Error("Something went wrong");
    };

    let resolved: unknown;
    await act(async () => {
      resolved = await result.current.execute(apiCall);
    });

    expect(resolved).toBeNull();
    expect(result.current.state).toBe("error");
    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toBe("Something went wrong");
  });

  it("devrait convertir les erreurs non-Error", async () => {
    const { result } = renderHook(() => useOrder(), { wrapper });

    await act(async () => {
      await result.current.execute(async () => {
        throw "string error";
      });
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Une erreur est survenue");
  });

  it("devrait utiliser le runtimeOptions pour les messages", async () => {
    const { result } = renderHook(
      () => useOrder({ successMessage: "default" }),
      { wrapper },
    );

    await act(async () => {
      await result.current.execute(async () => "ok", {
        successMessage: "runtime success",
      });
    });

    expect(result.current.isSuccess).toBe(true);
  });

  it("devrait permettre de reset l'état", async () => {
    const { result } = renderHook(() => useOrder(), { wrapper });

    await act(async () => {
      await result.current.execute(async () => "data");
    });

    expect(result.current.state).toBe("success");

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe("idle");
    expect(result.current.error).toBeNull();
  });

  it("ne devrait pas afficher de toast si showSuccessToast est false", async () => {
    const { result } = renderHook(
      () =>
        useOrder({
          successMessage: "pas affiché",
          showSuccessToast: false,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.execute(async () => "ok");
    });

    expect(result.current.isSuccess).toBe(true);
  });

  it("ne devrait pas afficher de toast si showErrorToast est false", async () => {
    const { result } = renderHook(
      () => useOrder({ showErrorToast: false }),
      { wrapper },
    );

    await act(async () => {
      await result.current.execute(async () => {
        throw new Error("fail");
      });
    });

    expect(result.current.isError).toBe(true);
  });
});
