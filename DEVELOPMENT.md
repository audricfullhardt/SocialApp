# 🛠 Guide de Développement

Ce document contient toutes les informations nécessaires pour développer sur ce projet.

## 📐 Architecture & Principes

### Clean Architecture

Le projet suit les principes de Clean Architecture pour garantir la maintenabilité et la testabilité :

```
┌─────────────────────────────────────────────┐
│             UI Layer (Components)            │
│  - Affichage uniquement                     │
│  - Pas de logique métier                    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Application Layer (Hooks)           │
│  - Logique métier                           │
│  - Gestion d'état local                     │
│  - Orchestration                            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        Domain Layer (Services/Types)         │
│  - Accès API                                │
│  - Types métier                             │
│  - Règles de gestion                        │
└─────────────────────────────────────────────┘
```

### Règles d'or

1. **Un composant = une responsabilité**
   - Les composants UI n'appellent JAMAIS l'API directement
   - Ils utilisent des hooks pour la logique

2. **Types explicites partout**
   ```typescript
   // ❌ Mauvais
   function getData(id) {
     return fetch(`/api/${id}`);
   }

   // ✅ Bon
   async function getData(id: number): Promise<User> {
     return fetchAPI<User>(`/api/${id}`);
   }
   ```

3. **Gestion d'erreurs systématique**
   ```typescript
   // ✅ Toujours dans un try/catch
   try {
     const data = await apiCall();
     // ...
   } catch (err) {
     setError(err instanceof Error ? err : new Error("Unknown"));
   }
   ```

## 🧩 Ajouter une nouvelle fonctionnalité

### Exemple : Ajouter un système de "favoris"

#### 1. Définir les types

```typescript
// src/types/index.ts
export interface Favorite {
  id: number;
  user: Member;
  publication: Publication;
  createdAt: string;
}
```

#### 2. Créer le service API

```typescript
// src/services/api.ts
export async function addFavorite(publicationId: number): Promise<Favorite> {
  return fetchAPI<Favorite>(`/${API_SLUG}/favorites`, {
    method: "POST",
    body: JSON.stringify({
      publication: `/api/${API_SLUG}/publications/${publicationId}`,
    }),
  });
}

export async function getFavorites(): Promise<Favorite[]> {
  const data = await fetchAPI<ApiPlatformCollection<Favorite>>(
    `/${API_SLUG}/favorites`
  );
  return data.member || data["hydra:member"] || [];
}
```

#### 3. Créer un hook personnalisé

```typescript
// src/hooks/useFavorites.ts
import { useState, useEffect } from "react";
import { getFavorites } from "@/services/api";
import { Favorite } from "@/types";

interface UseFavoritesReturn {
  favorites: Favorite[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erreur"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return { favorites, loading, error, refetch: fetchFavorites };
}
```

#### 4. Utiliser dans un composant

```typescript
// src/components/FavoriteButton.tsx
"use client";

import { useState } from "react";
import { addFavorite } from "@/services/api";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "./ui/button";
import { Star } from "lucide-react";

interface FavoriteButtonProps {
  publicationId: number;
  onFavoriteAdded?: () => void;
}

export function FavoriteButton({ publicationId, onFavoriteAdded }: FavoriteButtonProps) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleClick = async () => {
    setLoading(true);
    try {
      await addFavorite(publicationId);
      toast.success("Ajouté aux favoris !");
      onFavoriteAdded?.();
    } catch (err) {
      toast.error("Erreur lors de l'ajout aux favoris");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant="ghost"
      size="sm"
      aria-label="Ajouter aux favoris"
    >
      <Star className="w-4 h-4" />
    </Button>
  );
}
```

#### 5. Écrire les tests

```typescript
// src/hooks/__tests__/useFavorites.test.tsx
import { renderHook, waitFor } from "@testing-library/react";
import { useFavorites } from "../useFavorites";
import * as api from "@/services/api";

jest.mock("@/services/api");
const mockedApi = api as jest.Mocked<typeof api>;

describe("useFavorites", () => {
  it("devrait charger les favoris", async () => {
    const mockFavorites = [{ id: 1, /* ... */ }];
    mockedApi.getFavorites.mockResolvedValueOnce(mockFavorites);

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.favorites).toEqual(mockFavorites);
  });
});
```

## 🎨 Conventions de Style

### Composants

```typescript
// ✅ Bon
interface MyComponentProps {
  title: string;
  count: number;
  onAction?: () => void;
}

export function MyComponent({ title, count, onAction }: MyComponentProps) {
  return <div>{title}</div>;
}

// ❌ Mauvais (pas de types, export default)
export default function MyComponent(props) {
  return <div>{props.title}</div>;
}
```

### Nommage

- **Composants** : PascalCase (`UserProfile.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useAuth.ts`)
- **Services** : camelCase (`api.ts`)
- **Types** : PascalCase (`User`, `Publication`)
- **Fonctions** : camelCase (`fetchData`)
- **Constantes** : SCREAMING_SNAKE_CASE (`API_URL`)

### Organisation des imports

```typescript
// 1. Imports React
import { useState, useEffect } from "react";

// 2. Imports externes
import { useRouter } from "next/navigation";

// 3. Imports internes (avec @/)
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User } from "@/types";

// 4. Imports relatifs
import { helper } from "./utils";
```

## 🧪 Écrire des Tests

### Tests Unitaires (Hooks)

```typescript
// Template de test pour un hook
describe("useMyHook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait avoir un état initial correct", () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it("devrait charger les données", async () => {
    mockedApi.getData.mockResolvedValueOnce(mockData);
    const { result } = renderHook(() => useMyHook());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockData);
  });

  it("devrait gérer les erreurs", async () => {
    const error = new Error("Test error");
    mockedApi.getData.mockRejectedValueOnce(error);
    
    const { result } = renderHook(() => useMyHook());
    await waitFor(() => expect(result.current.error).toEqual(error));
  });
});
```

### Tests E2E (Playwright)

```typescript
// Template de test E2E
test.describe("Ma fonctionnalité", () => {
  test.beforeEach(async ({ page }) => {
    // Setup : aller sur la page, se connecter, etc.
    await page.goto("/");
  });

  test("devrait accomplir l'action principale", async ({ page }) => {
    // Arrange : préparer l'environnement
    await page.getByTestId("my-button").click();

    // Act : effectuer l'action
    await page.getByTestId("my-input").fill("test");
    await page.getByRole("button", { name: /submit/i }).click();

    // Assert : vérifier le résultat
    await expect(page.getByTestId("success-message")).toBeVisible();
  });
});
```

## 🚀 Workflow de Développement

### 1. Créer une branche

```bash
git checkout -b feature/nom-de-la-feature
```

### 2. Développer avec tests

- Écrire les types
- Créer le service API
- Créer le hook
- Créer le composant
- Écrire les tests unitaires
- Écrire les tests E2E si nécessaire

### 3. Vérifier la qualité

```bash
# Linter
npm run lint

# Tests unitaires
npm run test:ci

# Tests E2E
npm run test:e2e

# Build
npm run build
```

### 4. Commit

```bash
git add .
git commit -m "feat: ajouter système de favoris"
```

**Convention de commits** :
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `refactor:` refactoring sans changement de comportement
- `test:` ajout ou modification de tests
- `docs:` documentation
- `style:` formatage, style

## 🐛 Debugging

### React DevTools

- Installer l'extension Chrome/Firefox
- Inspecter les composants et leurs props
- Voir les re-renders

### Network Tab

- Vérifier les requêtes API
- Voir les headers (token JWT)
- Inspecter les réponses

### Console Logs

```typescript
// Pour le dev uniquement
if (process.env.NODE_ENV === "development") {
  console.log("Debug:", data);
}
```

### Breakpoints

- Utiliser `debugger;` dans le code
- Mettre des breakpoints dans Chrome DevTools

## 📚 Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Jest](https://jestjs.io/docs/getting-started)
- [Playwright](https://playwright.dev/docs/intro)

## ❓ FAQ

**Q: Pourquoi utiliser des hooks au lieu de mettre la logique dans les composants ?**  
A: Séparation des responsabilités, réutilisabilité, testabilité.

**Q: Pourquoi TypeScript strict ?**  
A: Éviter les bugs, meilleure autocomplétion, documentation vivante.

**Q: Pourquoi ne pas utiliser Redux ?**  
A: Pour ce projet, Context + hooks suffisent. Redux serait overkill.

**Q: Comment tester un composant qui utilise useAuth ?**  
A: Mocker le contexte ou utiliser un wrapper de test.

---

**Bon développement ! 🚀**
