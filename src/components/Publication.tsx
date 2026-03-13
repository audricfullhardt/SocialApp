"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import { Comment, Media, Publication as PublicationType, User } from "@/types";
import { useOrder } from "@/hooks/useOrder";
import { useAuth } from "@/contexts/AuthContext";
import {
  addReactionToPublication,
  createComment,
  deleteComment,
  updatePublication,
} from "@/services/api";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Heart,
  ThumbsUp,
  MessageCircle,
  Trash,
  Loader2,
  Pencil,
  Check,
  X,
  FileIcon,
} from "lucide-react";

interface PublicationCardProps {
  publication: PublicationType;
  onDeletePublication?: () => void;
  onReactionAdded?: () => void;
  onCommentAdded?: () => void;
  onPublicationUpdated?: () => void;
  onMediaAdded?: () => void;
  isLiked?: boolean;
  isLoved?: boolean;
  likeCount?: number;
  loveCount?: number;
  comments?: Comment[];
  media?: Media[];
  author?: User | { displayName: string; avatar?: string; id?: number } | null;
  users?: User[];
}

export default function PublicationCard({
  publication,
  onDeletePublication,
  onReactionAdded,
  onCommentAdded,
  onPublicationUpdated,
  isLiked = false,
  isLoved = false,
  likeCount = 0,
  loveCount = 0,
  comments: initialComments = [],
  media: publicationMedia = [],
  author = null,
  users = [],
}: PublicationCardProps) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(publication.title);
  const [editBody, setEditBody] = useState(publication.body);

  const { user: currentUser } = useAuth();

  const apiOrder = useOrder<unknown>({
    showSuccessToast: true,
    showErrorToast: true,
  });

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const extractIdFromIRI = (iri: string): number | null => {
    const match = iri.match(/\/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  };

  const isCurrentUserAuthor = (): boolean => {
    if (!currentUser) return false;

    if (typeof publication.author === "object" && publication.author) {
      return publication.author.id === currentUser.id;
    }
    if (publication.auteur) {
      return publication.auteur.id === currentUser.id;
    }
    if (typeof publication.author === "string") {
      if (currentUser["@id"] && publication.author === currentUser["@id"]) return true;
      const iriId = extractIdFromIRI(publication.author);
      if (iriId !== null && iriId === currentUser.id) return true;
    }
    if (author && "id" in author && author.id === currentUser.id) return true;
    if (author && "email" in author && "email" in currentUser && author.email === currentUser.email) return true;
    return false;
  };

  const isCommentByCurrentUser = (comment: Comment): boolean => {
    if (!currentUser) return false;

    if (typeof comment.author === "object" && comment.author) {
      if (comment.author.id === currentUser.id) return true;
      if ("email" in comment.author && comment.author.email === currentUser.email) return true;
    }
    if (comment.auteur) {
      if (comment.auteur.id === currentUser.id) return true;
      if (comment.auteur.email === currentUser.email) return true;
    }
    if (typeof comment.author === "string") {
      if (currentUser["@id"] && comment.author === currentUser["@id"]) return true;
      const iriId = extractIdFromIRI(comment.author);
      if (iriId !== null && iriId === currentUser.id) return true;
    }
    return false;
  };

  const findUserByIRI = (iri: string | undefined): User | undefined => {
    if (!iri) return undefined;
    return users.find((user) => user["@id"] === iri);
  };

  const handleAddReaction = async (type: "like" | "love") => {
    if (!publication["@id"]) return;

    const result = await apiOrder.execute(
      async () => {
        await addReactionToPublication(publication["@id"], type);
        return { type };
      },
      {
        successMessage:
          type === "like" ? "👍 Like ajouté !" : "❤️ Love ajouté !",
      },
    );

    if (result && onReactionAdded) {
      onReactionAdded();
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const result = await apiOrder.execute(
      async () => {
        await deleteComment(commentId);
      },
      { successMessage: "Commentaire supprimé" },
    );

    if (result !== null && onCommentAdded) {
      onCommentAdded();
    }
  };

  const handleStartEdit = () => {
    setEditTitle(publication.title);
    setEditBody(publication.body);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(publication.title);
    setEditBody(publication.body);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editBody.trim()) return;

    const publicationId = getPublicationId();
    if (!publicationId) return;

    const result = await apiOrder.execute(
      async () => {
        return await updatePublication(
          publicationId,
          editTitle.trim(),
          editBody.trim(),
        );
      },
      { successMessage: "Publication modifiée !" },
    );

    if (result) {
      setIsEditing(false);
      if (onPublicationUpdated) {
        onPublicationUpdated();
      }
    }
  };

  const handleEditKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit();
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
        document
          .getElementById(`comment-input-${publication["@id"]}`)
          ?.focus();
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
    if (!commentText.trim()) return;

    const publicationId = getPublicationId();
    if (!publicationId) return;

    const result = await apiOrder.execute(
      async () => {
        return await createComment(publicationId, commentText.trim());
      },
      {
        successMessage: "Commentaire ajouté !",
        errorMessage: "Erreur lors de l'ajout du commentaire",
      },
    );

    if (result) {
      setCommentText("");
      setShowCommentInput(false);
      if (onCommentAdded) onCommentAdded();
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

  const isAuthor = isCurrentUserAuthor();

  return (
    <Card
      className="p-3 hover:bg-accent/50 transition-colors group"
      data-testid={`publication-${publication["@id"]}`}
    >
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage
            src={
              typeof author?.avatar === "string" ? author.avatar : undefined
            }
            alt={author?.displayName || "Utilisateur"}
          />
          <AvatarFallback>
            {author?.displayName ? getInitials(author.displayName) : "??"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm truncate">
              {author?.displayName || "Utilisateur inconnu"}
            </p>
            <p
              className="text-xs text-muted-foreground flex-shrink-0"
              title={new Date(publication.createdAt).toLocaleString("fr-FR")}
            >
              {formatDate(publication.createdAt)}
            </p>
            {isAuthor && (
              <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0">
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartEdit}
                    aria-label="Modifier la publication"
                    className="h-7 w-7 p-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeletePublication}
                  aria-label="Supprimer la publication"
                  data-testid={`delete-publication-${publication["@id"]}`}
                  className="h-7 w-7 p-0 hover:text-destructive"
                >
                  <Trash className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mb-2 space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleEditKeyDown}
                disabled={apiOrder.isLoading}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-base font-semibold shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                onKeyDown={handleEditKeyDown}
                disabled={apiOrder.isLoading}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={
                    apiOrder.isLoading ||
                    !editTitle.trim() ||
                    !editBody.trim()
                  }
                  className="gap-1 h-7"
                >
                  {apiOrder.isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Enregistrer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={apiOrder.isLoading}
                  className="gap-1 h-7"
                >
                  <X className="w-3.5 h-3.5" />
                  Annuler
                </Button>
                <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">
                  Ctrl+Entrée pour sauvegarder, Échap pour annuler
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-2">
              <h2 className="font-semibold text-base mb-1">
                {publication.title}
              </h2>
              <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
                {publication.body}
              </p>

              {publicationMedia.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {publicationMedia.map((media, idx) => {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
                    const apiSlug = process.env.NEXT_PUBLIC_API_SLUG || "";
                    const baseUrl = apiUrl.replace(/\/api\/?$/, "");
                    const mediaUrl = media.path.startsWith("http")
                      ? media.path
                      : `${baseUrl}/uploads/${apiSlug}/${media.path}`;

                    if (media.mimeType.startsWith("image/")) {
                      return (
                        <a
                          key={media.id ?? idx}
                          href={mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={mediaUrl}
                            alt={media.originalName}
                            className="max-w-full max-h-96 rounded-lg border object-contain"
                          />
                        </a>
                      );
                    }

                    if (media.mimeType.startsWith("video/")) {
                      return (
                        <video
                          key={media.id ?? idx}
                          src={mediaUrl}
                          controls
                          className="max-w-full max-h-96 rounded-lg border"
                        >
                          Votre navigateur ne supporte pas la lecture vidéo.
                        </video>
                      );
                    }

                    return (
                      <a
                        key={media.id ?? idx}
                        href={mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md border bg-muted/50 hover:bg-muted transition-colors w-fit"
                      >
                        <FileIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{media.originalName}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(media.size / 1024).toFixed(1)} Ko)
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddReaction("like")}
              disabled={apiOrder.isLoading}
              className="gap-1 h-7 px-2"
              aria-label="Aimer"
              data-testid={`reaction-like-${publication["@id"]}`}
            >
              {apiOrder.isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ThumbsUp
                  className="w-3.5 h-3.5"
                  fill={isLiked ? "currentColor" : "none"}
                />
              )}
              <span className="text-xs">
                {likeCount > 0 ? likeCount : "Like"}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddReaction("love")}
              disabled={apiOrder.isLoading}
              className="gap-1 h-7 px-2"
              aria-label="Adorer"
              data-testid={`reaction-love-${publication["@id"]}`}
            >
              {apiOrder.isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Heart
                  className="w-3.5 h-3.5"
                  fill={isLoved ? "red" : "none"}
                  color={isLoved ? "red" : "currentColor"}
                />
              )}
              <span className="text-xs">
                {loveCount > 0 ? loveCount : "Love"}
              </span>
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
                const getCommentAuthor = () => {
                  if (typeof comment.author === "object") return comment.author;
                  if (comment.auteur) return comment.auteur;
                  if (typeof comment.author === "string")
                    return findUserByIRI(comment.author);
                  return null;
                };

                const commentAuthor = getCommentAuthor();
                const canDeleteComment = isCommentByCurrentUser(comment);

                return (
                  <div key={comment.id} className="flex gap-2 group/comment">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage
                        src={
                          typeof commentAuthor?.avatar === "string"
                            ? commentAuthor.avatar
                            : undefined
                        }
                        alt={commentAuthor?.displayName || "Utilisateur"}
                      />
                      <AvatarFallback className="text-xs">
                        {commentAuthor?.displayName
                          ? getInitials(commentAuthor.displayName)
                          : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted rounded-lg px-3 py-2 relative">
                        <p className="font-semibold text-xs mb-0.5">
                          {commentAuthor?.displayName || "Utilisateur inconnu"}
                        </p>
                        <p className="text-sm pr-6">{comment.body}</p>
                        {canDeleteComment && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover/comment:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            aria-label="Supprimer le commentaire"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        )}
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
                    apiOrder.isLoading
                      ? "Envoi en cours..."
                      : "Ajouter un commentaire... (Entrée pour envoyer, Échap pour annuler)"
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  disabled={apiOrder.isLoading}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                {apiOrder.isLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
