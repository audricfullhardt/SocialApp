import { useState, useRef, FormEvent, KeyboardEvent, ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Paperclip, X, FileIcon, Image as ImageIcon } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const ACCEPTED_TYPES = "image/*,video/*,application/pdf";

interface PublicationFormProps {
  onSubmit: (title: string, body: string, file?: File) => Promise<void>;
  isSubmitting: boolean;
}

export function PublicationForm({
  onSubmit,
  isSubmitting,
}: PublicationFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("Le fichier est trop volumineux (max 10 Mo)");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim() || !body.trim()) return;

    await onSubmit(title.trim(), body.trim(), selectedFile || undefined);

    setTitle("");
    setBody("");
    handleRemoveFile();
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
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

            {selectedFile && (
              <div className="flex items-center gap-3 p-2 rounded-md border bg-muted/50">
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Aperçu"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center rounded-md bg-muted">
                    <FileIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="h-8 w-8 p-0 flex-shrink-0"
                  aria-label="Retirer le fichier"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                  aria-label="Ajouter un média"
                  data-testid="publication-media"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="gap-1.5 h-8 text-muted-foreground hover:text-foreground"
                >
                  {selectedFile?.type.startsWith("image/") ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                  <span className="text-xs">
                    {selectedFile ? "Changer le média" : "Ajouter un média"}
                  </span>
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                Ctrl+Entrée pour publier
              </span>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
