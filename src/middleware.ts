import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Routes publiques qui ne nécessitent pas d'authentification
 */
const PUBLIC_ROUTES = ["/login", "/register"];

/**
 * Routes qui nécessitent une authentification
 */
const PROTECTED_ROUTES = ["/channels", "/profile"];

/**
 * Middleware Next.js pour protéger les routes
 * 
 * Vérifie si l'utilisateur a un token valide pour accéder aux routes protégées.
 * Si non authentifié, redirige vers /login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si la route est publique
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Vérifier si la route est protégée
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Récupérer le token depuis le cookie ou depuis un header custom
  // Note: Pour l'instant, on ne peut pas accéder à localStorage dans le middleware
  // Donc cette vérification est limitée. Dans une vraie appli, on utiliserait
  // des cookies HTTP-only.
  const token = request.cookies.get("token")?.value;

  // Si route protégée et pas de token, rediriger vers login
  if (isProtectedRoute && !token) {
    // Pour l'instant, on laisse passer car le token est dans localStorage
    // Dans une version future avec cookies, décommenter:
    // const loginUrl = new URL("/login", request.url);
    // loginUrl.searchParams.set("redirect", pathname);
    // return NextResponse.redirect(loginUrl);
  }

  // Si authentifié et essaie d'accéder à login/register, rediriger vers channels
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/channels", request.url));
  }

  return NextResponse.next();
}

/**
 * Configuration du middleware
 * Définit sur quelles routes le middleware doit s'exécuter
 */
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     * - Assets publics (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
