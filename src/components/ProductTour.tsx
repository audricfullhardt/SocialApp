"use client";

import { useEffect, useState } from "react";
import { Tour } from "antd";
import type { TourStepProps } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  MessageSquare,
  LayoutGrid,
  Search,
  Palette,
  Hash,
  UserCircle,
} from "lucide-react";

const STORAGE_KEY = "product-tour-completed";

function getTarget(selector: string): HTMLElement | null {
  return document.querySelector(`[data-tour="${selector}"]`);
}

function StepCover({
  icon: Icon,
  gradient,
}: {
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-t-[var(--radius)] py-6 ${gradient}`}
    >
      <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
        <Icon className="h-7 w-7 text-white" strokeWidth={1.8} />
      </div>
    </div>
  );
}

export default function ProductTour() {
  const [open, setOpen] = useState(false);
  const { isLogin, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || pathname !== "/") return;

    const alreadySeen = localStorage.getItem(STORAGE_KEY);
    if (alreadySeen) return;

    const timer = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(timer);
  }, [loading, pathname]);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (pathname !== "/") return null;

  const steps: TourStepProps[] = [
    {
      title: "Bienvenue !",
      description:
        "Bienvenue sur Mini Réseau Social. Laissez-nous vous faire un tour rapide des fonctionnalités.",
      cover: (
        <StepCover
          icon={Sparkles}
          gradient="bg-gradient-to-r from-purple-500 to-pink-500"
        />
      ),
      target: () => getTarget("hero-title")!,
    },
    ...(isLogin
      ? [
          {
            title: "Accéder aux channels",
            description:
              "Cliquez ici pour voir tous les channels disponibles et rejoindre des conversations.",
            cover: (
              <StepCover
                icon={MessageSquare}
                gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
              />
            ),
            target: () => getTarget("cta-channels")!,
          },
        ]
      : []),
    {
      title: "Fonctionnalités",
      description:
        "Découvrez les atouts de la plateforme : channels organisés, temps réel, collaboration et sécurité.",
      cover: (
        <StepCover
          icon={LayoutGrid}
          gradient="bg-gradient-to-r from-green-500 to-emerald-500"
        />
      ),
      target: () => getTarget("features")!,
    },
    ...(isLogin
      ? [
          {
            title: "Recherche rapide",
            description:
              "Utilisez la recherche (⌘K) pour trouver rapidement des channels ou des publications.",
            cover: (
              <StepCover
                icon={Search}
                gradient="bg-gradient-to-r from-amber-500 to-orange-500"
              />
            ),
            target: () => getTarget("search")!,
          },
        ]
      : []),
    {
      title: "Thème",
      description:
        "Basculez entre le mode clair, sombre ou automatique selon vos préférences.",
      cover: (
        <StepCover
          icon={Palette}
          gradient="bg-gradient-to-r from-violet-500 to-purple-500"
        />
      ),
      target: () => getTarget("theme")!,
    },
    ...(isLogin
      ? [
          {
            title: "Navigation channels",
            description:
              "Accédez directement à la liste des channels depuis la barre de navigation.",
            cover: (
              <StepCover
                icon={Hash}
                gradient="bg-gradient-to-r from-sky-500 to-blue-500"
              />
            ),
            target: () => getTarget("channels-link")!,
          },
          {
            title: "Votre profil",
            description:
              "Consultez et modifiez votre profil depuis cette icône.",
            cover: (
              <StepCover
                icon={UserCircle}
                gradient="bg-gradient-to-r from-rose-500 to-pink-500"
              />
            ),
            target: () => getTarget("profile")!,
          },
        ]
      : []),
  ];

  return (
    <Tour
      open={open}
      onClose={handleClose}
      onFinish={handleClose}
      steps={steps}
    />
  );
}
