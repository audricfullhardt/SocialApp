"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register as apiRegister, LoginResponse } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@/components/ui/alert";
import { useOrder } from "@/hooks/useOrder";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  const registerOrder = useOrder<LoginResponse>({
    showSuccessToast: false,
    showErrorToast: true,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!displayName || !email || !password || !confirmPassword) {
      setValidationError("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setValidationError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setValidationError(null);

    const result = await registerOrder.execute(async () => {
      await apiRegister(displayName, email, password);
      
      const loginModule = await import("@/services/api");
      const loginData = await loginModule.login(email, password);
      await login(loginData.token);
      return loginData;
    });

    if (result) {
      router.push("/channels");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        className="flex flex-col gap-4 p-5 sm:p-6 border rounded shadow-md w-full max-w-sm"
        onSubmit={handleSubmit}
        data-testid="register-form"
      >
        <h1 className="text-2xl font-bold text-center">Inscription</h1>

        {validationError && (
          <Alert variant="destructive" data-testid="register-error">
            {validationError}
          </Alert>
        )}

        {registerOrder.isError && registerOrder.error && (
          <Alert variant="destructive" data-testid="register-error">
            {registerOrder.error.message}
          </Alert>
        )}

        <Input
          placeholder="Nom d'affichage"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={registerOrder.isLoading}
          required
          aria-label="Nom d'affichage"
          data-testid="register-displayname"
        />

        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={registerOrder.isLoading}
          required
          aria-label="Email"
          data-testid="register-email"
        />

        <Input
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={registerOrder.isLoading}
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
          disabled={registerOrder.isLoading}
          required
          minLength={6}
          aria-label="Confirmer le mot de passe"
          data-testid="register-confirm-password"
        />

        <Button 
          type="submit" 
          disabled={registerOrder.isLoading}
          data-testid="register-submit"
        >
          {registerOrder.isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Inscription...
            </>
          ) : (
            "S'inscrire"
          )}
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
