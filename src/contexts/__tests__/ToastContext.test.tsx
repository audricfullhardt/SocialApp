import { renderHook, act } from "@testing-library/react";
import React, { ReactNode } from "react";
import { ToastProvider, useToast } from "../ToastContext";

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe("ToastContext", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("devrait commencer sans toasts", () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current.toasts).toEqual([]);
  });

  it("devrait ajouter un toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("Hello", "info");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Hello");
    expect(result.current.toasts[0].type).toBe("info");
  });

  it("devrait ajouter un toast success via la méthode raccourci", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.success("Succès !");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("success");
    expect(result.current.toasts[0].message).toBe("Succès !");
  });

  it("devrait ajouter un toast error via la méthode raccourci", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.error("Erreur !");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("error");
  });

  it("devrait ajouter un toast warning via la méthode raccourci", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.warning("Attention !");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("warning");
  });

  it("devrait ajouter un toast info via la méthode raccourci", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.info("Info !");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("info");
  });

  it("devrait supprimer un toast manuellement", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("À supprimer", "info", 0);
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("devrait auto-supprimer un toast après la durée", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("Temporaire", "info", 3000);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("ne devrait pas auto-supprimer si durée est 0", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("Persistent", "info", 0);
    });

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  it("devrait gérer plusieurs toasts simultanés", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.success("Toast 1");
      result.current.error("Toast 2");
      result.current.info("Toast 3");
    });

    expect(result.current.toasts).toHaveLength(3);
  });

  it("devrait lever une erreur si utilisé en dehors du provider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useToast());
    }).toThrow("useToast must be used within a ToastProvider");

    consoleSpy.mockRestore();
  });
});
