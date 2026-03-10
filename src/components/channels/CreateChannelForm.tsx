import { useState, FormEvent } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateChannelFormProps {
  onSubmit: (name: string, slug: string) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateChannelForm({ onSubmit, isSubmitting }: CreateChannelFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    try {
      await onSubmit(name.trim(), slug.trim());
      setName("");
      setSlug("");
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur lors de la création du channel:", error);
    }
  };

  const handleCancel = () => {
    setName("");
    setSlug("");
    setIsOpen(false);
  };

  const generateSlug = (channelName: string) => {
    return channelName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full justify-start gap-2"
        data-testid="create-channel-button"
      >
        <Plus className="w-4 h-4" />
        Créer un channel
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-muted/30 rounded-md">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Nouveau channel</h3>
        <button
          type="button"
          onClick={handleCancel}
          className="text-muted-foreground hover:text-foreground"
          disabled={isSubmitting}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <label htmlFor="channel-name" className="text-xs font-medium">
            Nom
          </label>
          <Input
            id="channel-name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex: général"
            disabled={isSubmitting}
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="channel-slug" className="text-xs font-medium">
            Slug
          </label>
          <Input
            id="channel-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Ex: general"
            disabled={isSubmitting}
            required
            pattern="[a-z0-9-]+"
            title="Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !name.trim() || !slug.trim()}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            "Créer"
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
