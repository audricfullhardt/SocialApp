"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Erreur page channels:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Une erreur est survenue</AlertTitle>
          <AlertDescription>
            {error.message || "Impossible de charger les channels"}
          </AlertDescription>
        </Alert>

        <div className="mt-4 flex gap-2">
          <Button onClick={reset} className="flex-1">
            Réessayer
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
