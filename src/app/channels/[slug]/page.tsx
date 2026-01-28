"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePublications } from "@/hooks";
import { useToast } from "@/contexts/ToastContext";
import { createPublication } from "@/services/api";
import PublicationCard from "@/components/Publication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Send } from "lucide-react";

const POLLING_INTERVAL = 5000; // 5 secondes

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.slug ? parseInt(params.slug.toString(), 10) : null;
  const toast = useToast();

  // Hooks
  const { publications, loading, error, refetch } = usePublications({
    channelId,
    pollingInterval: POLLING_INTERVAL,
  });

  // États pour le formulaire de création
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Soumet une nouvelle publication
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!channelId) return;
    if (!title.trim() || !body.trim()) {
      toast.warning("Le titre et le contenu sont requis");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPublication(channelId, title.trim(), body.trim());
      
      // Réinitialiser le formulaire
      setTitle("");
      setBody("");
      
      // Afficher un message de succès
      toast.success("Publication créée avec succès !");
      
      // Rafraîchir les publications
      await refetch();
    } catch (err) {
      console.error("Erreur lors de la création de la publication:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de la publication"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion du cas où l'ID n'est pas valide
  if (!channelId) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <p className="font-semibold">Erreur</p>
          <p>Channel invalide</p>
        </Alert>
        <Link href="/channels">
          <Button className="mt-4" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux channels
          </Button>
        </Link>
      </div>
    );
  }

  // Loading initial
  if (loading && publications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" aria-label="Chargement" />
          <p className="text-muted-foreground">Chargement des publications...</p>
        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive" data-testid="channel-error">
          <p className="font-semibold">Erreur</p>
          <p>{error.message}</p>
        </Alert>
        <Link href="/channels">
          <Button className="mt-4" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux channels
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="channel-page">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/channels">
          <Button variant="outline" size="icon" aria-label="Retour">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {publications[0]?.channel?.name || `Channel #${channelId}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {publications.length} publication{publications.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Formulaire de création */}
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Nouvelle publication</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="create-publication-form">
          <Input
            placeholder="Titre de la publication"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
            maxLength={200}
            aria-label="Titre"
            data-testid="publication-title"
          />

          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            placeholder="Contenu de la publication..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSubmitting}
            required
            maxLength={5000}
            aria-label="Contenu"
            data-testid="publication-body"
          />

          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !body.trim()}
            className="self-end"
            data-testid="publication-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Publier
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Liste des publications */}
      {publications.length === 0 ? (
        <Alert>
          <p className="text-muted-foreground">
            Aucune publication dans ce channel. Soyez le premier à publier !
          </p>
        </Alert>
      ) : (
        <div className="flex flex-col gap-4" data-testid="publications-list">
          {publications
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((publication) => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
        </div>
      )}
    </div>
  );
}

