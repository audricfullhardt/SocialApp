"use client";

import Link from "next/link";
import { Button } from "../components/ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Moon, Sun, Monitor, User, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isLogin } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchClick = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true }),
    );
  };

  const renderIcon = () => {
    if (!mounted) return <Monitor />;
    if (theme === "dark") return <Moon />;
    if (theme === "light") return <Sun />;
    return <Monitor />;
  };

  return (
    <nav className="w-full h-16 flex items-center justify-between px-6">
      <Link href="/">
        <span className="font-bold text-xl">Mini réseau social</span>
      </Link>
      <div className="flex items-center gap-4">
        {isLogin && (
          <button
            onClick={handleSearchClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Rechercher...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              ⌘K
            </kbd>
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              {renderIcon()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col items-center">
            <DropdownMenuItem onSelect={() => setTheme("light")}>
              Clair <Sun />
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme("dark")}>
              Sombre <Moon />
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme("system")}>
              Système <Monitor />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isLogin && <Link href="/channels">Channels</Link>}

        {isLogin ? (
          <Link href="/profile">
            <User />
          </Link>
        ) : (
          <Link href="/login">
            <Button size="sm">Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
