import { useState, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) return;

    await onSubmit(title.trim(), body.trim());

    setTitle("");
    setBody("");
  };

  const isFormValid = title.trim() && body.trim();

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
              className="flex min-h-[50px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
              disabled={isSubmitting || !isFormValid}
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
      </div>
    </div>
  );
}
