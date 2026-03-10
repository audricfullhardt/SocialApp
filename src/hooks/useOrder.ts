"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/contexts/ToastContext";

export type OrderState = "idle" | "loading" | "success" | "error";

interface UseOrderOptions {
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

interface UseOrderReturn<T> {
  execute: (
    apiCall: () => Promise<T>,
    runtimeOptions?: { successMessage?: string; errorMessage?: string }
  ) => Promise<T | null>;
  state: OrderState;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

export function useOrder<T = void>(
  options: UseOrderOptions = {}
): UseOrderReturn<T> {
  const {
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const [state, setState] = useState<OrderState>("idle");
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const execute = useCallback(
    async (
      apiCall: () => Promise<T>,
      runtimeOptions?: { successMessage?: string; errorMessage?: string }
    ): Promise<T | null> => {
      setState("loading");
      setError(null);

      try {
        const result = await apiCall();
        setState("success");

        const finalSuccessMessage = runtimeOptions?.successMessage || successMessage;
        if (showSuccessToast && finalSuccessMessage) {
          toast.success(finalSuccessMessage);
        }

        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error("Une erreur est survenue");
        setState("error");
        setError(errorObj);

        const finalErrorMessage = runtimeOptions?.errorMessage || errorMessage || errorObj.message;
        if (showErrorToast) {
          toast.error(finalErrorMessage);
        }

        return null;
      }
    },
    [successMessage, errorMessage, showSuccessToast, showErrorToast, toast]
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return {
    execute,
    state,
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError: state === "error",
    error,
    reset,
  };
}
