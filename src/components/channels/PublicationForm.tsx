import { useState, FormEvent, KeyboardEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface PublicationFormProps {
  onSubmit: (title: string, body: string) => Promise<void>;
  isSubmitting: boolean;
}

export function PublicationForm({
  onSubmit,
  isSubmitting,
}: PublicationFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim() || !body.trim()) return;

    await onSubmit(title.trim(), body.trim());

    setTitle("");
    setBody("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
            data-testid="create-publication-form"
          >
            <Input
              placeholder="Titre de la publication (Entrée pour publier)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              disabled={isSubmitting}
              required
              maxLength={200}
              aria-label="Titre"
              data-testid="publication-title"
            />

            <div className="relative">
              <textarea
                className="flex min-h-[50px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Contenu de la publication (Ctrl+Entrée pour publier)..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
                required
                maxLength={5000}
                aria-label="Contenu"
                data-testid="publication-body"
              />
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
