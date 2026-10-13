/**
 * Encabezados de seguridad de todas las páginas (los usa next.config.ts).
 *
 * La política de contenido (CSP) solo deja cargar cosas de este mismo sitio:
 * - `connect-src 'self'`: el navegador solo habla con /api (y /api/stream) del mismo origen.
 * - `frame-ancestors 'none'`: nadie puede meter Nexabit en un iframe (clickjacking).
 * - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.
 * - Los scripts necesitan 'unsafe-inline' porque Next.js hidrata con scripts en línea
 *   (y el del tema evita el destello); con nonces todas las páginas serían dinámicas.
 *   En desarrollo hace falta además 'unsafe-eval' para la recarga en caliente.
 */
export interface Encabezado {
  key: string;
  value: string;
}

export function politicaDeContenido(desarrollo: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${desarrollo ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${desarrollo ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function encabezadosSeguridad(desarrollo: boolean): Encabezado[] {
  return [
    { key: "Content-Security-Policy", value: politicaDeContenido(desarrollo) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    },
  ];
}
