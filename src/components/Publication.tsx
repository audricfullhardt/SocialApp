"use client";

import { useState } from "react";
import { Publication as PublicationType } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import { addReactionToPublication } from "@/services/api";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Heart, ThumbsUp, MessageCircle } from "lucide-react";

interface PublicationCardProps {
  publication: PublicationType;
  onReactionAdded?: () => void;
}

/**
 * Composant pour afficher une publication
 */
export default function PublicationCard({ 
  publication, 
  onReactionAdded 
}: PublicationCardProps) {
  const [isAddingReaction, setIsAddingReaction] = useState(false);
  const toast = useToast();

  // Récupère l'auteur (peut être dans author ou auteur, et peut être un objet ou une string IRI)
  const author = typeof publication.author === 'object' ? publication.author : publication.auteur;

  /**
   * Ajoute une réaction à la publication
   */
  const handleAddReaction = async (type: "like" | "love") => {
    if (!publication["@id"]) {
      toast.error("Impossible d'ajouter une réaction : publication invalide");
      return;
    }

    setIsAddingReaction(true);

    try {
      await addReactionToPublication(publication["@id"], type);
      
      // Afficher un message de succès
      toast.success(`Réaction ${type === "like" ? "👍" : "❤️"} ajoutée !`);
      
      // Notifier le parent pour rafraîchir les données si nécessaire
      if (onReactionAdded) {
        onReactionAdded();
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout de la réaction:", err);
      toast.error(
        err instanceof Error 
          ? err.message 
          : "Erreur lors de l'ajout de la réaction"
      );
    } finally {
      setIsAddingReaction(false);
    }
  };

  /**
   * Formate la date de manière relative ou absolue
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  /**
   * Génère les initiales pour l'avatar fallback
   */
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card 
      className="p-4 hover:bg-accent/50 transition-colors" 
      data-testid={`publication-${publication["@id"]}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar>
          <AvatarImage 
            src={author?.avatar} 
            alt={author?.displayName || "Utilisateur"} 
          />
          <AvatarFallback>
            {author?.displayName 
              ? getInitials(author.displayName)
              : "??"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">
            {author?.displayName || "Utilisateur inconnu"}
          </p>
          <p className="text-sm text-muted-foreground" title={new Date(publication.createdAt).toLocaleString("fr-FR")}>
            {formatDate(publication.createdAt)}
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="mb-3">
        <h2 className="font-bold text-lg mb-2">{publication.title}</h2>
        <p className="text-sm whitespace-pre-wrap break-words">{publication.body}</p>
      </div>

      {/* Actions & Réactions */}
      <div className="flex items-center gap-2 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAddReaction("like")}
          disabled={isAddingReaction}
          className="gap-1"
          aria-label="Aimer"
          data-testid={`reaction-like-${publication["@id"]}`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="text-xs">Like</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAddReaction("love")}
          disabled={isAddingReaction}
          className="gap-1"
          aria-label="Adorer"
          data-testid={`reaction-love-${publication["@id"]}`}
        >
          <Heart className="w-4 h-4" />
          <span className="text-xs">Love</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          aria-label="Commenter"
          disabled
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">Commenter</span>
        </Button>
      </div>
    </Card>
  );
}

