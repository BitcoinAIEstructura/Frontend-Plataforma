import { NextResponse, type NextRequest } from "next/server";

import { COOKIES_DE_SESION, redireccionSinSesion } from "@/lib/acceso";

/**
 * Revisión rápida en cada página: sin cookie de sesión, las páginas privadas
 * mandan a iniciar sesión. No consulta al backend (la documentación de Next.js
 * recomienda solo revisiones "optimistas" aquí); la verdad la dice /api/cuentas/yo.
 */
export function proxy(peticion: NextRequest) {
  const { pathname, search } = peticion.nextUrl;
  const tieneCookie = COOKIES_DE_SESION.some((nombre) => peticion.cookies.has(nombre));
  const destino = redireccionSinSesion(pathname, search, tieneCookie);
  return destino ? NextResponse.redirect(new URL(destino, peticion.url)) : NextResponse.next();
}

export const config = {
  // Todo menos la API (la reenvía next.config.ts), los archivos de Next, los íconos y lo
  // que la app instalable (PWA) necesita sin sesión: el manifest, el service worker y la
  // página "Sin conexión". Si se redirigieran, el navegador no podría instalarla.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|manifest.webmanifest|sw.js|sin-conexion.html|iconos/).*)",
  ],
};
