"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import { Comment, Publication as PublicationType } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import {
  addReactionToPublication,
  createComment,
} from "@/services/api";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Heart, ThumbsUp, MessageCircle } from "lucide-react";

interface PublicationCardProps {
  publication: PublicationType;
  onReactionAdded?: () => void;
  onCommentAdded?: () => void;
  isLiked?: boolean;
  isLoved?: boolean;
  comments?: Comment[];
}

export default function PublicationCard({
  publication,
  onReactionAdded,
  onCommentAdded,
  isLiked = false,
  isLoved = false,
  comments: initialComments = [],
}: PublicationCardProps) {
  const [isAddingReaction, setIsAddingReaction] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const toast = useToast();
  const [comments, setComments] = useState<Comment[]>(initialComments);

  // Synchroniser les commentaires quand ils changent
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const author =
    typeof publication.author === "object"
      ? publication.author
      : publication.auteur;

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
          : "Erreur lors de l'ajout de la réaction",
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

  const handleAddComment = () => {
    setShowCommentInput(!showCommentInput);
    if (!showCommentInput) {
      setTimeout(() => {
        document.getElementById(`comment-input-${publication["@id"]}`)?.focus();
      }, 100);
    }
  };

  const getPublicationId = (): number | null => {
    let publicationId = publication.id;
    if (!publicationId && publication["@id"]) {
      const match = publication["@id"].match(/\/(\d+)$/);
      if (match) {
        publicationId = parseInt(match[1], 10);
      }
    }
    return publicationId || null;
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }

    const publicationId = getPublicationId();
    if (!publicationId) {
      toast.error("Impossible d'ajouter le commentaire");
      return;
    }

    setIsSubmittingComment(true);

    try {
      const result = await createComment(publicationId, commentText.trim());
      toast.success("Commentaire ajouté !");
      setCommentText("");
      setShowCommentInput(false);
      
      // Notifier le parent pour recharger les commentaires
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout du commentaire",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmitComment();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowCommentInput(false);
      setCommentText("");
    }
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
            {author?.displayName ? getInitials(author.displayName) : "??"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-semibold text-sm truncate">
              {author?.displayName || "Utilisateur inconnu"}
            </p>
            <p
              className="text-xs text-muted-foreground flex-shrink-0"
              title={new Date(publication.createdAt).toLocaleString("fr-FR")}
            >
              {formatDate(publication.createdAt)}
            </p>
          </div>

          <div className="mb-2">
            <h2 className="font-semibold text-base mb-1">
              {publication.title}
            </h2>
            <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
              {publication.body}
            </p>
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
              onClick={handleAddComment}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-xs">Commenter</span>
            </Button>
          </div>
          {comments.length > 0 && (
            <div className="mt-3 pt-3 border-t space-y-2">
              {comments.map((comment) => {
                const commentAuthor = typeof comment.author === 'object' ? comment.author : comment.auteur;
                return (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage
                        src={commentAuthor?.avatar}
                        alt={commentAuthor?.displayName || "Utilisateur"}
                      />
                      <AvatarFallback className="text-xs">
                        {commentAuthor?.displayName ? getInitials(commentAuthor.displayName) : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <p className="font-semibold text-xs mb-0.5">
                          {commentAuthor?.displayName || "Utilisateur inconnu"}
                        </p>
                        <p className="text-sm">{comment.body}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-3">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showCommentInput && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <input
                  id={`comment-input-${publication["@id"]}`}
                  type="text"
                  placeholder={
                    isSubmittingComment
                      ? "Envoi en cours..."
                      : "Ajouter un commentaire... (Entrée pour envoyer, Échap pour annuler)"
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  disabled={isSubmittingComment}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                {isSubmittingComment && (
                  <span className="text-xs text-muted-foreground">
                    Envoi...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
