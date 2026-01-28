"use client";

import { useToast } from "@/contexts/ToastContext";
import { X, CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

/**
 * Composant pour afficher les toasts
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            flex items-start gap-3 p-4 rounded-lg shadow-lg
            border
            animate-in slide-in-from-right-full
            ${
              toast.type === "success"
                ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100"
                : toast.type === "error"
                ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100"
                : toast.type === "warning"
                ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100"
                : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100"
            }
          `}
          role="alert"
          data-testid={`toast-${toast.type}`}
        >
          {/* Icône */}
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === "success" && (
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            )}
            {toast.type === "error" && (
              <XCircle className="w-5 h-5" aria-hidden="true" />
            )}
            {toast.type === "warning" && (
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            )}
            {toast.type === "info" && (
              <Info className="w-5 h-5" aria-hidden="true" />
            )}
          </div>

          {/* Message */}
          <div className="flex-1 text-sm font-medium">{toast.message}</div>

          {/* Bouton fermer */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 w-6 h-6 -mr-1 -mt-1 hover:bg-transparent"
            onClick={() => removeToast(toast.id)}
            aria-label="Fermer la notification"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
