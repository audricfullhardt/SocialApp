"use client";

import { Publication, Reaction, Comment, User, Media, ApiPlatformCollection } from "@/types";
import PublicationCard from "@/components/Publication";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "antd";
import { getReactions, getAllComments, getUsers, getMedia, deletePublication } from "@/services/api";
import { useEffect, useState, useMemo } from "react";
import { useOrder } from "@/hooks/useOrder";

interface PublicationsListProps {
  publications: Publication[];
  loading: boolean;
  error: Error | null;
  onPublicationDeleted?: () => void;
}

export function PublicationsList({
  publications,
  loading,
  error,
  onPublicationDeleted,
}: PublicationsListProps) {
  const [reactions, setReactions] = useState<ApiPlatformCollection<Reaction> | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [mediaList, setMediaList] = useState<Media[]>([]);

  const deleteOrder = useOrder({
    successMessage: "Publication supprimée avec succès",
    errorMessage: "Erreur lors de la suppression de la publication",
  });
  const fetchReactions = async () => {
    try {
      const data = await getReactions();
      setReactions(data as ApiPlatformCollection<Reaction>);
    } catch (err) {
      console.error("Erreur lors de la récupération des réactions:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const allComments = await getAllComments();
      setComments(allComments);
    } catch (err) {
      console.error("Erreur lors de la récupération des commentaires:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const allUsers = await getUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
    }
  };

  const fetchMedia = async () => {
    try {
      const allMedia = await getMedia();
      setMediaList(allMedia);
    } catch (err) {
      console.error("Erreur lors de la récupération des médias:", err);
    }
  };
  
  useEffect(() => {
    fetchReactions();
    fetchComments();
    fetchUsers();
    fetchMedia();
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [publications]);
  
  const handleReactionAdded = () => {
    fetchReactions();
  };

  const handleCommentAdded = () => {
    fetchComments();
  };

  const handleMediaAdded = () => {
    fetchMedia();
  };
  
  const publicationReactionsMap = useMemo(() => {
    const map = new Map<string, { likeCount: number; loveCount: number; isLiked: boolean; isLoved: boolean }>();
    
    const reactionsData = reactions as ApiPlatformCollection<Reaction> | null;
    if (!reactionsData?.member) return map;
    
    reactionsData.member.forEach((reaction) => {
      const pubId = reaction.publication;
      if (!pubId) return;

      if (!map.has(pubId)) {
        map.set(pubId, { likeCount: 0, loveCount: 0, isLiked: false, isLoved: false });
      }
      const entry = map.get(pubId)!;

      if (reaction.type === "like") {
        entry.likeCount++;
      } else if (reaction.type === "love") {
        entry.loveCount++;
      }
    });
    
    return map;
  }, [reactions]);

  const publicationCommentsMap = useMemo(() => {
    const map = new Map<string, Comment[]>();
    
    comments.forEach((comment) => {
      const pubId = comment.publication;
      if (pubId) {
        if (!map.has(pubId)) {
          map.set(pubId, []);
        }
        map.get(pubId)!.push(comment);
      }
    });
    
    return map;
  }, [comments]);

  const publicationMediaMap = useMemo(() => {
    const map = new Map<string, Media[]>();

    mediaList.forEach((media) => {
      const pubIri = media.publication;
      if (pubIri) {
        if (!map.has(pubIri)) {
          map.set(pubIri, []);
        }
        map.get(pubIri)!.push(media);
      }
    });

    return map;
  }, [mediaList]);

  if (error) {
    return (
      <Alert variant="destructive" data-testid="channel-error">
        <p className="font-semibold">Erreur</p>
        <p>{error.message}</p>
      </Alert>
    );
  }

  if (loading && publications.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="p-4 border rounded-md bg-card">
              <Skeleton active paragraph={{ rows: 2 }} title />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (publications.length === 0) {
    return (
        <p className="text-muted-foreground">
          Aucune publication dans ce channel. Soyez le premier à publier !
        </p>
    );
  }

  const sortedPublications = [...publications].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const findUserByIRI = (iri: string | undefined): User | undefined => {
    if (!iri) return undefined;
    return users.find(user => user["@id"] === iri);
  };

  const handleDeletePublication = async (publicationId: string) => {
    const id = parseInt(publicationId.split("/").pop() || "0");
    
    const result = await deleteOrder.execute(async () => {
      await deletePublication(id);
    });

    if (result !== null && onPublicationDeleted) {
      onPublicationDeleted();
    }
  };
  return (
    <div
      className="flex flex-col gap-4 max-w-4xl mx-auto"
      data-testid="publications-list"
    >
      {sortedPublications.map((publication) => {
        const reactionData = publicationReactionsMap.get(publication["@id"]);
        const publicationComments = publicationCommentsMap.get(publication["@id"]) || [];
        const publicationMedia = publicationMediaMap.get(publication["@id"]) || [];
        
        const author = typeof publication.author === "object" 
          ? publication.author 
          : publication.auteur || findUserByIRI(publication.author);
        
        return (
          <PublicationCard 
            key={publication["@id"]} 
            publication={publication}
            isLiked={!!reactionData?.isLiked}
            isLoved={!!reactionData?.isLoved}
            likeCount={reactionData?.likeCount || 0}
            loveCount={reactionData?.loveCount || 0}
            onReactionAdded={handleReactionAdded}
            comments={publicationComments}
            onCommentAdded={handleCommentAdded}
            media={publicationMedia}
            onMediaAdded={handleMediaAdded}
            author={author}
            users={users}
            onDeletePublication={() => handleDeletePublication(publication["@id"])}
            onPublicationUpdated={onPublicationDeleted}
          />
        );
      })}
    </div>
  );
}
