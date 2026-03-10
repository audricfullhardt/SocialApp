"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Users, Zap, Shield, Loader2 } from "lucide-react";

export default function Home() {
  const { isLogin, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" aria-label="Chargement" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Mini Réseau Social
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connectez-vous avec votre équipe, partagez des idées et collaborez en temps réel.
            Un espace moderne et intuitif pour échanger.
          </p>

          {isLogin && user ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg">
                Bienvenue, <span className="font-semibold">{user.displayName}</span> !
              </p>
              <Link href="/channels">
                <Button size="lg" className="gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Accéder aux channels
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg">Se connecter</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-6 bg-accent/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi utiliser notre plateforme ?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Channels organisés</h3>
              <p className="text-sm text-muted-foreground">
                Organisez vos conversations par thématique avec des channels dédiés.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Temps réel</h3>
              <p className="text-sm text-muted-foreground">
                Recevez les messages instantanément avec notre système de polling.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Réagissez aux publications et commentez pour échanger avec votre équipe.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-500" />
              </div>@
              <h3 className="font-semibold text-lg mb-2">Sécurisé</h3>
              <p className="text-sm text-muted-foreground">
                Authentification JWT et protection des routes pour vos données.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {!isLogin && (
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Rejoignez notre communauté et commencez à échanger dès maintenant.
            </p>
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Créer un compte / Se connecter
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

