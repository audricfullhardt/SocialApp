import { Publication } from "@/types";
import PublicationCard from "@/components/Publication";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "antd";

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
      <Alert>
        <p className="text-muted-foreground">
          Aucune publication dans ce channel. Soyez le premier à publier !
        </p>
      </Alert>
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
      {sortedPublications.map((publication) => (
        <PublicationCard key={publication["@id"]} publication={publication} />
      ))}
    </div>
  );
}
