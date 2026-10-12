/** Páginas que se ven sin sesión. Todo lo demás es privado. */
export const RUTAS_PUBLICAS = ["/iniciar-sesion", "/registro"] as const;

/** Nombres posibles de la cookie de sesión del backend (con HTTPS lleva el prefijo __Host-). */
export const COOKIES_DE_SESION = ["sesion", "__Host-sesion"] as const;

export function esRutaPublica(ruta: string): boolean {
  return RUTAS_PUBLICAS.some((publica) => ruta === publica || ruta.startsWith(`${publica}/`));
}

/**
 * Revisión rápida (sin consultar al backend): si una página privada se pide sin
 * cookie de sesión, a dónde mandarla. Devuelve null si puede seguir.
 *
 * No decide nada más: una cookie vencida pasa esta revisión, y la página la
 * detecta al preguntar al backend (`/api/cuentas/yo`) y manda a iniciar sesión.
 */
export function redireccionSinSesion(ruta: string, consulta: string, tieneCookie: boolean): string | null {
  if (tieneCookie || esRutaPublica(ruta)) return null;
  const destino = ruta === "/" ? "" : `?siguiente=${encodeURIComponent(ruta + consulta)}`;
  return `/iniciar-sesion${destino}`;
}
