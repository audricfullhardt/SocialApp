# 🚀 Mini Réseau Social

Un réseau social moderne type **Slack/Discord** construit avec Next.js, React 19, TypeScript et Tailwind CSS.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Scripts Disponibles](#-scripts-disponibles)
- [Tests](#-tests)
- [Structure du Projet](#-structure-du-projet)
- [API](#-api)

## ✨ Fonctionnalités

### Authentification
- ✅ Login / Logout avec JWT
- ✅ Gestion de session sécurisée
- ✅ Protection des routes privées (middleware)
- ✅ Récupération des informations utilisateur

### Channels
- ✅ Liste des channels disponibles
- ✅ Navigation entre channels
- ✅ Interface claire et moderne

### Publications
- ✅ Affichage des publications par channel
- ✅ Création de nouvelles publications
- ✅ Tri par date (plus récentes en premier)
- ✅ Polling automatique (temps réel simulé, 5s)
- ✅ Formulaire de création avec validation

### Réactions
- ✅ Ajout de réactions (👍 Like, ❤️ Love)
- ✅ Affichage des réactions
- ✅ Feedback utilisateur (toasts)

### UX/UI
- ✅ Dark / Light mode avec persistance
- ✅ Design moderne et responsive
- ✅ Loaders et états de chargement
- ✅ Gestion d'erreurs complète
- ✅ Notifications toast (succès, erreur, warning, info)
- ✅ États vides clairs
- ✅ Accessibilité (aria-labels, data-testid)

### Tests
- ✅ Tests unitaires (Jest + React Testing Library)
- ✅ Tests E2E (Playwright)
- ✅ Coverage

## 🛠 Stack Technique

### Frontend
- **Framework** : Next.js 15 (App Router)
- **React** : 19.1.0
- **TypeScript** : Strict mode activé
- **Styling** : Tailwind CSS 4 + shadcn/ui
- **Icons** : Lucide React
- **Thème** : next-themes

### Backend (API)
- **API Platform** : REST API
- **Authentification** : JWT (Bearer token)
- **Relations** : IRI API Platform

### Tests
- **Unitaires** : Jest + React Testing Library
- **E2E** : Playwright
- **Linting** : ESLint

## 🏗 Architecture

### Clean Architecture Frontend

```
src/
├── app/              # Pages Next.js (App Router)
├── components/       # Composants UI réutilisables
├── contexts/         # Contextes React (Auth, Toast)
├── hooks/            # Hooks personnalisés
├── services/         # Services API
├── types/            # Types TypeScript
└── lib/              # Utilitaires
```

### Principes respectés

1. **Séparation des responsabilités**
   - UI Components → Affichage uniquement
   - Hooks → Logique métier
   - Services → Accès API
   - Contexts → État partagé

2. **TypeScript strict**
   - Aucun `any` implicite
   - Types explicites partout
   - Interfaces bien définies

3. **Gestion d'erreurs robuste**
   - Classes d'erreurs personnalisées
   - Try/catch systématiques
   - Feedback utilisateur clair

4. **Tests**
   - Hooks testés
   - Services testés
   - Scénarios E2E

## 📦 Installation

### Prérequis
- Node.js >= 18
- npm ou yarn

### Étapes

1. **Cloner le projet**
```bash
git clone <repo-url>
cd social-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine :

```env
NEXT_PUBLIC_API_URL=https://wra506d.davidannebicque.ovh/api
NEXT_PUBLIC_API_SLUG=votre-slug
NEXT_PUBLIC_API_CODE=votre-code
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

## 📜 Scripts Disponibles

### Développement
```bash
npm run dev          # Démarre le serveur de dev avec Turbopack
npm run build        # Build de production
npm run start        # Démarre le serveur de production
npm run lint         # Lint le code
```

### Tests
```bash
npm run test              # Tests unitaires en mode watch
npm run test:ci           # Tests unitaires en CI
npm run test:coverage     # Tests avec coverage

npm run test:e2e          # Tests E2E
npm run test:e2e:ui       # Tests E2E avec interface
npm run test:e2e:headed   # Tests E2E avec navigateur visible
```

## 🧪 Tests

### Tests Unitaires

Les tests unitaires couvrent :
- **Services API** : Gestion d'erreurs, parsing de réponses
- **Hooks** : useChannels, usePublications, etc.

```bash
npm run test
```

**Exemple de test (useChannels)** :
```typescript
it('devrait charger les channels avec succès', async () => {
  const mockChannels = [{ id: 1, name: "General", slug: "general" }];
  mockedApi.getChannels.mockResolvedValueOnce(mockChannels);

  const { result } = renderHook(() => useChannels());

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.channels).toEqual(mockChannels);
});
```

### Tests E2E

Les tests E2E couvrent :
- **Login** : Navigation, validation de formulaire
- **Channels** : Listing, navigation
- **Publications** : Création (nécessite auth)

```bash
npm run test:e2e
```

**Exemple de test E2E** :
```typescript
test('devrait naviguer vers la page de login', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /se connecter/i }).click();
  await expect(page).toHaveURL('/login');
});
```

## 📁 Structure du Projet

```
social-app/
├── e2e/                    # Tests E2E (Playwright)
│   ├── login.spec.ts
│   └── channels.spec.ts
├── src/
│   ├── app/                # Pages Next.js
│   │   ├── channels/
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/         # Composants UI
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Navbar.tsx
│   │   ├── Publication.tsx
│   │   └── ToastContainer.tsx
│   ├── contexts/           # Contextes React
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks/              # Hooks personnalisés
│   │   ├── __tests__/
│   │   ├── useChannels.ts
│   │   ├── usePublications.ts
│   │   ├── useComments.ts
│   │   ├── useCurrentUser.ts
│   │   └── index.ts
│   ├── services/           # Services API
│   │   ├── __tests__/
│   │   └── api.ts
│   ├── types/              # Types TypeScript
│   │   └── index.ts
│   └── lib/                # Utilitaires
│       └── utils.ts
├── jest.config.js          # Config Jest
├── jest.setup.js           # Setup Jest
├── playwright.config.ts    # Config Playwright
├── package.json
└── README.md
```

## 🌐 API

### Base URL
```
https://wra506d.davidannebicque.ovh/api/{SLUG}/
```

### Endpoints

#### Authentification
```
POST /login
Body: { email, password }
Response: { token }
```

#### Utilisateur
```
GET /{slug}/users/me
Headers: Authorization: Bearer {token}
Response: { id, displayName, email, avatar, createdAt }
```

#### Channels
```
GET /{slug}/channels
Headers: Authorization: Bearer {token}
Response: { member: Channel[] }
```

#### Publications
```
GET /{slug}/channels/{id}/publications
POST /{slug}/publications
Body: { channel: IRI, title, body }
```

#### Commentaires
```
GET /{slug}/publications/{id}/comments
POST /{slug}/comments
Body: { publication: IRI, body }
```

#### Réactions
```
POST /{slug}/reactions
Body: { publication: IRI, type: "like" | "love" }
```

## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Token stocké dans localStorage (à migrer vers cookies HTTP-only)
- ✅ Middleware de protection des routes
- ✅ Validation côté client et serveur
- ⚠️ TODO : Migrer vers cookies HTTP-only pour plus de sécurité

## 🚀 Améliorations Futures

- [ ] Migrer le token vers des cookies HTTP-only
- [ ] Ajouter système de commentaires complet
- [ ] Implémenter WebSockets pour le vrai temps réel
- [ ] Ajouter upload d'images
- [ ] Implémenter les notifications push
- [ ] Ajouter pagination sur les publications
- [ ] Système de mentions (@user)
- [ ] Recherche globale
- [ ] Profils utilisateurs détaillés

## 👨‍💻 Développement

### Conventions de code
- TypeScript strict
- Composants fonctionnels uniquement
- Hooks pour la logique
- Props interfaces explicites
- JSDoc pour les fonctions complexes

### Workflow Git
1. Créer une branche feature
2. Développer + tests
3. Pull request avec review
4. Merge dans main

## 📝 License

Projet éducatif - BUTS5 MMI

---

**Auteur** : Projet d'évaluation universitaire  
**Date** : Janvier 2026
