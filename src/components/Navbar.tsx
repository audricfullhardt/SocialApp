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
import { Moon, Sun, Monitor, User, Search, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLogin } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSearchClick = () => {
    setMobileMenuOpen(false);
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
    <nav className="w-full h-16 flex items-center justify-between px-4 sm:px-6 relative z-50">
      <Link href="/" data-tour="logo" onClick={() => setMobileMenuOpen(false)}>
        <span className="font-bold text-lg sm:text-xl">Mini réseau social</span>
      </Link>

      <div className="hidden md:flex items-center gap-4">
        {isLogin && (
          <button
            onClick={handleSearchClick}
            data-tour="search"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Rechercher...</span>
            <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              ⌘K
            </kbd>
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" data-tour="theme">
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

        {isLogin && <Link href="/channels" data-tour="channels-link">Channels</Link>}

        {isLogin ? (
          <Link href="/profile" data-tour="profile">
            <User />
          </Link>
        ) : (
          <Link href="/login">
            <Button size="sm">Login</Button>
          </Link>
        )}
      </div>

      <div className="flex md:hidden items-center gap-2">
        {isLogin && (
          <button
            onClick={handleSearchClick}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Rechercher"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-background/95 backdrop-blur-sm md:hidden z-40">
          <div className="flex flex-col gap-1 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left hover:bg-accent transition-colors">
                  {renderIcon()}
                  <span>Thème</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="flex flex-col items-center">
                <DropdownMenuItem onSelect={() => { setTheme("light"); setMobileMenuOpen(false); }}>
                  Clair <Sun />
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setTheme("dark"); setMobileMenuOpen(false); }}>
                  Sombre <Moon />
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setTheme("system"); setMobileMenuOpen(false); }}>
                  Système <Monitor />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isLogin && (
              <Link
                href="/channels"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
              >
                Channels
              </Link>
            )}

            {isLogin ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Mon profil</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
