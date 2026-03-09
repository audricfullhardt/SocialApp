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
  isLiked?: boolean;
  isLoved?: boolean;
}

export default function PublicationCard({ 
  publication, 
  onReactionAdded,
  isLiked = false,
  isLoved = false
}: PublicationCardProps) {
  const [isAddingReaction, setIsAddingReaction] = useState(false);
  const toast = useToast();

  const author = typeof publication.author === 'object' ? publication.author : publication.auteur;

  const handleAddReaction = async (type: "like" | "love") => {
    if (!publication["@id"]) {
      toast.error("Impossible d'ajouter une réaction : publication invalide");
      return;
    }

    setIsAddingReaction(true);

    try {
      await addReactionToPublication(publication["@id"], type);
      
      toast.success(`Réaction ${type === "like" ? "👍" : "❤️"} ajoutée !`);



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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    const timeString = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays < 7) return `Il y a ${diffInDays}j • ${timeString}`;
    
    const dateStr = date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
    
    return `${dateStr} • ${timeString}`;
  };

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
      className="p-3 hover:bg-accent/50 transition-colors" 
      data-testid={`publication-${publication["@id"]}`}
    > 
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
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
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-semibold text-sm truncate">
              {author?.displayName || "Utilisateur inconnu"}
            </p>
            <p className="text-xs text-muted-foreground flex-shrink-0" title={new Date(publication.createdAt).toLocaleString("fr-FR")}>
              {formatDate(publication.createdAt)}
            </p>
          </div>

          <div className="mb-2">
            <h2 className="font-semibold text-base mb-1">{publication.title}</h2>
            <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">{publication.body}</p>
          </div>

          <div className="flex items-center gap-1 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddReaction("like")}
              disabled={isAddingReaction}
              className="gap-1 h-7 px-2"
              aria-label="Aimer"
              data-testid={`reaction-like-${publication["@id"]}`}
            >
              <ThumbsUp 
                className="w-3.5 h-3.5" 
                fill={isLiked ? "currentColor" : "none"}
              />
              <span className="text-xs">Like</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddReaction("love")}
              disabled={isAddingReaction}
              className="gap-1 h-7 px-2"
              aria-label="Adorer"
              data-testid={`reaction-love-${publication["@id"]}`}
            >
              <Heart 
                className="w-3.5 h-3.5" 
                fill={isLoved ? "red" : "none"}
                color={isLoved ? "red" : "currentColor"}
              />
              <span className="text-xs">Love</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1 h-7 px-2"
              aria-label="Commenter"
              disabled
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-xs">Commenter</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

