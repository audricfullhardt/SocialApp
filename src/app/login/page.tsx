"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, LoginResponse, updateUser, getUsers } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@/components/ui/alert";
import { useOrder } from "@/hooks/useOrder";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { User } from "@/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetValidationError, setResetValidationError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const loginOrder = useOrder<LoginResponse>({
    showSuccessToast: false,
    showErrorToast: true,
  });

  const resetOrder = useOrder<User>({
    successMessage: "Mot de passe modifié avec succès ! Vous pouvez maintenant vous connecter.",
    showErrorToast: true,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) return;

    const result = await loginOrder.execute(async () => {
      const data = await apiLogin(email, password);
      await login(data.token);
      return data;
    });

    if (result) {
      router.push("/channels");
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetValidationError(null);

    if (!resetEmail || !newPassword || !confirmNewPassword) {
      setResetValidationError("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetValidationError("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      setResetValidationError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    const result = await resetOrder.execute(async () => {
      const allUsers = await getUsers();
      const targetUser = allUsers.find(
        (u) => u.email.toLowerCase() === resetEmail.toLowerCase(),
      );

      if (!targetUser) {
        throw new Error("Aucun compte trouvé avec cet email");
      }

      return await updateUser({
        ...targetUser,
        password: newPassword,
      });
    });

    if (result) {
      setShowResetPassword(false);
      setResetEmail("");
      setNewPassword("");
      setConfirmNewPassword("");
      setEmail(resetEmail);
    }
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <form
          className="flex flex-col gap-4 p-6 border rounded shadow-md w-full max-w-sm"
          onSubmit={handleResetPassword}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowResetPassword(false);
                setResetValidationError(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            Entrez votre email et choisissez un nouveau mot de passe.
          </p>

          {resetValidationError && (
            <Alert variant="destructive">{resetValidationError}</Alert>
          )}

          {resetOrder.isError && resetOrder.error && (
            <Alert variant="destructive">{resetOrder.error.message}</Alert>
          )}

          <Input
            placeholder="Email du compte"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            disabled={resetOrder.isLoading}
            required
            aria-label="Email"
          />

          <Input
            placeholder="Nouveau mot de passe"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={resetOrder.isLoading}
            required
            minLength={6}
            aria-label="Nouveau mot de passe"
          />

          <Input
            placeholder="Confirmer le nouveau mot de passe"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            disabled={resetOrder.isLoading}
            required
            minLength={6}
            aria-label="Confirmer le nouveau mot de passe"
          />

          <Button type="submit" disabled={resetOrder.isLoading}>
            {resetOrder.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Modification...
              </>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        className="flex flex-col gap-4 p-6 border rounded shadow-md w-full max-w-sm"
        onSubmit={handleSubmit}
        data-testid="login-form"
      >
        <h1 className="text-2xl font-bold text-center">Connexion</h1>

        {loginOrder.isError && loginOrder.error && (
          <Alert variant="destructive" data-testid="login-error">
            {loginOrder.error.message}
          </Alert>
        )}

        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loginOrder.isLoading}
          required
          aria-label="Email"
          data-testid="login-email"
        />

        <Input
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loginOrder.isLoading}
          required
          aria-label="Mot de passe"
          data-testid="login-password"
        />

        <Button
          type="submit"
          disabled={loginOrder.isLoading}
          data-testid="login-submit"
        >
          {loginOrder.isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connexion...
            </>
          ) : (
            "Se connecter"
          )}
        </Button>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowResetPassword(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Mot de passe oublié ?
          </button>
          <Link href="/register">
            <Button variant="link" size="sm">
              Créer un compte
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
