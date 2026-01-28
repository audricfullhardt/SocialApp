"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiLogin(email, password);
      await login(data.token);
      router.push("/channels");
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Erreur de connexion - vérifiez vos identifiants"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        className="flex flex-col gap-4 p-6 border rounded shadow-md w-full max-w-sm"
        onSubmit={handleSubmit}
        data-testid="login-form"
      >
        <h1 className="text-2xl font-bold text-center">Connexion</h1>

        {error && (
          <Alert variant="destructive" data-testid="login-error">
            {error}
          </Alert>
        )}

        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          aria-label="Email"
          data-testid="login-email"
        />

        <Input
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          aria-label="Mot de passe"
          data-testid="login-password"
        />

        <Button 
          type="submit" 
          disabled={loading}
          data-testid="login-submit"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}

