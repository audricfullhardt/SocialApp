"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Search, Hash, FileText, MessageCircle, X, User } from "lucide-react";
import { Channel, Publication, Comment, User as UserType } from "@/types";

type SearchFilter = "all" | "channels" | "publications" | "comments";

interface SearchResult {
  type: "channel" | "publication" | "comment";
  id: string;
  title: string;
  subtitle: string;
  channelSlug?: string;
  authorName?: string;
}

interface SearchModalProps {
  channels: Channel[];
  publications: Publication[];
  comments: Comment[];
  users: UserType[];
  onSelectChannel: (slug: string) => void;
}

export default function SearchModal({
  channels,
  publications,
  comments,
  users,
  onSelectChannel,
}: SearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setFilter("all");
      setAuthorFilter("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const findUserByIRI = useCallback(
    (iri: string | undefined): UserType | undefined => {
      if (!iri) return undefined;
      return users.find((u) => u["@id"] === iri);
    },
    [users],
  );

  const getAuthorName = useCallback(
    (
      author: string | { displayName?: string; id?: number } | undefined,
      auteur?: { displayName?: string; id?: number },
    ): string => {
      if (typeof author === "object" && author?.displayName)
        return author.displayName;
      if (auteur?.displayName) return auteur.displayName;
      if (typeof author === "string") {
        const user = findUserByIRI(author);
        return user?.displayName || "Inconnu";
      }
      return "Inconnu";
    },
    [findUserByIRI],
  );

  const uniqueAuthors = useMemo(() => {
    const authorsSet = new Map<string, string>();
    publications.forEach((pub) => {
      const name = getAuthorName(pub.author, pub.auteur);
      if (name !== "Inconnu") {
        authorsSet.set(name, name);
      }
    });
    return Array.from(authorsSet.values()).sort();
  }, [publications, getAuthorName]);

  const results = useMemo((): SearchResult[] => {
    const q = query.toLowerCase().trim();
    const items: SearchResult[] = [];

    if (filter === "all" || filter === "channels") {
      channels.forEach((channel) => {
        if (!q || channel.name.toLowerCase().includes(q) || channel.slug.toLowerCase().includes(q)) {
          items.push({
            type: "channel",
            id: `channel-${channel.id}`,
            title: `# ${channel.name}`,
            subtitle: `${channel.publications?.length || 0} publication(s)`,
            channelSlug: channel.slug,
          });
        }
      });
    }

    if (filter === "all" || filter === "publications") {
      publications.forEach((pub) => {
        const pubAuthorName = getAuthorName(pub.author, pub.auteur);

        if (authorFilter && pubAuthorName !== authorFilter) return;

        if (
          !q ||
          pub.title.toLowerCase().includes(q) ||
          pub.body.toLowerCase().includes(q) ||
          pubAuthorName.toLowerCase().includes(q)
        ) {
          const channelSlug =
            typeof pub.channel === "object"
              ? pub.channel?.slug
              : undefined;

          items.push({
            type: "publication",
            id: `pub-${pub["@id"]}`,
            title: pub.title,
            subtitle: `par ${pubAuthorName}`,
            channelSlug,
            authorName: pubAuthorName,
          });
        }
      });
    }

    if (filter === "all" || filter === "comments") {
      comments.forEach((comment) => {
        const commentAuthorName = getAuthorName(comment.author, comment.auteur);

        if (authorFilter && commentAuthorName !== authorFilter) return;

        if (
          !q ||
          comment.body.toLowerCase().includes(q) ||
          commentAuthorName.toLowerCase().includes(q)
        ) {
          items.push({
            type: "comment",
            id: `comment-${comment.id}`,
            title:
              comment.body.length > 80
                ? comment.body.substring(0, 80) + "..."
                : comment.body,
            subtitle: `par ${commentAuthorName}`,
            authorName: commentAuthorName,
          });
        }
      });
    }

    return items.slice(0, 50);
  }, [
    query,
    filter,
    authorFilter,
    channels,
    publications,
    comments,
    getAuthorName,
  ]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filter, authorFilter]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.channelSlug) {
        onSelectChannel(result.channelSlug);
      }
      setIsOpen(false);
    },
    [onSelectChannel],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      }
    },
    [results, selectedIndex, handleSelect],
  );

  useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.children[selectedIndex] as HTMLElement;
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const filterButtons: { label: string; value: SearchFilter; icon: React.ReactNode }[] = [
    { label: "Tout", value: "all", icon: <Search className="w-3 h-3" /> },
    { label: "Channels", value: "channels", icon: <Hash className="w-3 h-3" /> },
    { label: "Publications", value: "publications", icon: <FileText className="w-3 h-3" /> },
    { label: "Commentaires", value: "comments", icon: <MessageCircle className="w-3 h-3" /> },
  ];

  const getResultIcon = (type: string) => {
    switch (type) {
      case "channel":
        return <Hash className="w-4 h-4 text-muted-foreground" />;
      case "publication":
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl">
        <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher des channels, publications, commentaires..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground sm:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 border-b overflow-x-auto">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === btn.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}

            {(filter === "all" ||
              filter === "publications" ||
              filter === "comments") &&
              uniqueAuthors.length > 0 && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <select
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                    className="bg-transparent text-xs outline-none cursor-pointer text-muted-foreground"
                  >
                    <option value="">Tous les auteurs</option>
                    {uniqueAuthors.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
          </div>

          <div
            ref={resultsRef}
            className="max-h-[60vh] overflow-y-auto"
          >
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {query
                  ? "Aucun résultat trouvé"
                  : "Commencez à taper pour rechercher..."}
              </div>
            ) : (
              results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  }`}
                >
                  {getResultIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {result.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.subtitle}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex-shrink-0">
                    {result.type === "channel"
                      ? "Channel"
                      : result.type === "publication"
                        ? "Publication"
                        : "Commentaire"}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-t text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">
                  ↑↓
                </kbd>{" "}
                naviguer
              </span>
              <span>
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">
                  ↵
                </kbd>{" "}
                sélectionner
              </span>
              <span>
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">
                  esc
                </kbd>{" "}
                fermer
              </span>
            </div>
            <span>{results.length} résultat(s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
