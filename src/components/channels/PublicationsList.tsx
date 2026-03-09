"use client";

import { Publication, Reaction, Comment, ApiPlatformCollection } from "@/types";
import PublicationCard from "@/components/Publication";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "antd";
import { getReactions, getAllComments } from "@/services/api";
import { useEffect, useState, useMemo } from "react";

interface PublicationsListProps {
  publications: Publication[];
  loading: boolean;
  error: Error | null;
}

export function PublicationsList({
  publications,
  loading,
  error,
}: PublicationsListProps) {
  const [reactions, setReactions] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingReactions, setLoadingReactions] = useState(true);
  
  const fetchReactions = async () => {
    try {
      const data = await getReactions();
      setReactions(data as ApiPlatformCollection<Reaction>);
    } catch (err) {
      console.error("Erreur lors de la récupération des réactions:", err);
    } finally {
      setLoadingReactions(false);
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
  
  useEffect(() => {
    fetchReactions();
    fetchComments();
  }, []);
  
  const handleReactionAdded = () => {
    fetchReactions();
  };

  const handleCommentAdded = () => {
    fetchComments();
  };
  
  const publicationReactionsMap = useMemo(() => {
    const map = new Map<string, "like" | "love" | null>();
    
    const reactionsData = reactions as ApiPlatformCollection<Reaction> | null;
    if (!reactionsData?.member) return map;
    
    const sortedReactions = [...reactionsData.member].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    sortedReactions.forEach((reaction) => {
      const pubId = reaction.publication;
      if (pubId && !map.has(pubId)) {
        map.set(pubId, reaction.type as "like" | "love");
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

  return (
    <div
      className="flex flex-col gap-4 max-w-4xl mx-auto"
      data-testid="publications-list"
    >
      {sortedPublications.map((publication) => {
        const lastReactionType = publicationReactionsMap.get(publication["@id"]);
        const publicationComments = publicationCommentsMap.get(publication["@id"]) || [];
        return (
          <PublicationCard 
            key={publication["@id"]} 
            publication={publication}
            isLiked={lastReactionType === "like"}
            isLoved={lastReactionType === "love"}
            onReactionAdded={handleReactionAdded}
            comments={publicationComments}
            onCommentAdded={handleCommentAdded}
          />
        );
      })}
    </div>
  );
}
