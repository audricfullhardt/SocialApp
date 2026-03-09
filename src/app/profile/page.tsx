"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUser } from "@/services/api";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "antd";
import { Alert } from "@/components/ui/alert";

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  {getInitials(user.username || "")}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h2 className="text-xl font-semibold">{user.username}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
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

            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              className="mt-4"
            >
              Se déconnecter
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
