"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register as apiRegister } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!displayName || !email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiRegister(displayName, email, password);
      
      // Après l'inscription réussie, on connecte l'utilisateur automatiquement
      const loginModule = await import("@/services/api");
      const loginData = await loginModule.login(email, password);
      await login(loginData.token);
      
      router.push("/channels");
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Erreur lors de l'inscription"
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
        data-testid="register-form"
      >
        <h1 className="text-2xl font-bold text-center">Inscription</h1>

        {error && (
          <Alert variant="destructive" data-testid="register-error">
            {error}
          </Alert>
        )}

        <Input
          placeholder="Nom d'affichage"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
          required
          aria-label="Nom d'affichage"
          data-testid="register-displayname"
        />

        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          aria-label="Email"
          data-testid="register-email"
        />

        <Input
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          minLength={6}
          aria-label="Mot de passe"
          data-testid="register-password"
        />

        <Input
          placeholder="Confirmer le mot de passe"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          required
          minLength={6}
          aria-label="Confirmer le mot de passe"
          data-testid="register-confirm-password"
        />

        <Button 
          type="submit" 
          disabled={loading}
          data-testid="register-submit"
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </Button>

        <Link href="/login">
          <Button variant="link" size="sm">
            Déjà un compte ? Connectez-vous
          </Button>
        </Link>
      </form>
    </div>
  );
}
