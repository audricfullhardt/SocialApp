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
import { Moon, Sun, Monitor, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isLogin, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

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

        <Link href="/channels">Channels</Link>

        {isLogin ? (
          <>
            <Link href="/profile">
              <User />
            </Link>
            <Button size="sm" variant="outline" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button size="sm">Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
