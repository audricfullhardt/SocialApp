"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUser, updateUser } from "@/services/api";
import { useToast } from "@/contexts/ToastContext";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "antd";
import { Alert } from "@/components/ui/alert";
import { Pencil, Loader2, X } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { logout, refreshUser } = useAuth();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement du profil",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleStartEdit = () => {
    if (!user) return;
    setEditDisplayName(user.displayName || "");
    setEditEmail(user.email || "");
    setEditPassword("");
    setEditConfirmPassword("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditPassword("");
    setEditConfirmPassword("");
  };

  const handleSaveEdit = async () => {
    if (!user) return;

    if (!editDisplayName.trim() || !editEmail.trim()) {
      toast.error("Le nom d'affichage et l'email sont requis.");
      return;
    }

    if (editPassword && editPassword !== editConfirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    if (editPassword && editPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setSaving(true);
    try {
      const updatedData: User = {
        ...user,
        displayName: editDisplayName.trim(),
        email: editEmail.trim(),
      };

      if (editPassword) {
        updatedData.password = editPassword;
      }

      const updatedUser = await updateUser(updatedData);
      setUser(updatedUser);
      setIsEditing(false);
      setEditPassword("");
      setEditConfirmPassword("");
      toast.success("Profil mis à jour avec succès !");
      await refreshUser();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour du profil",
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="flex flex-col gap-6 p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center">Mon Profil</h1>

        {loading && (
          <div className="space-y-4">
            <Skeleton active avatar paragraph={{ rows: 3 }} />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <p className="font-semibold">Erreur</p>
            <p>{error}</p>
          </Alert>
        )}

        {!loading && !error && user && (
          <>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar?.path} alt={user.displayName} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.displayName || user.username || "")}
                </AvatarFallback>
              </Avatar>

              {!isEditing ? (
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{user.displayName || user.username}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div>
                    <label htmlFor="edit-displayName" className="text-sm font-medium mb-1 block">
                      Nom d&apos;affichage
                    </label>
                    <input
                      id="edit-displayName"
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      disabled={saving}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-email" className="text-sm font-medium mb-1 block">
                      Email
                    </label>
                    <input
                      id="edit-email"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      disabled={saving}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-password" className="text-sm font-medium mb-1 block">
                      Nouveau mot de passe
                    </label>
                    <input
                      id="edit-password"
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      disabled={saving}
                      placeholder="Laisser vide pour ne pas changer"
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  {editPassword && (
                    <div>
                      <label htmlFor="edit-confirm-password" className="text-sm font-medium mb-1 block">
                        Confirmer le mot de passe
                      </label>
                      <input
                        id="edit-confirm-password"
                        type="password"
                        value={editConfirmPassword}
                        onChange={(e) => setEditConfirmPassword(e.target.value)}
                        disabled={saving}
                        placeholder="Confirmez le nouveau mot de passe"
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ID:</span>
                <span className="text-sm font-medium">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Membre depuis:
                </span>
                <span className="text-sm font-medium">
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Enregistrer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleStartEdit}
                  className="gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Modifier le profil
                </Button>
              )}

              <Button
                type="button"
                variant="destructive"
                onClick={handleLogout}
              >
                Se déconnecter
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
