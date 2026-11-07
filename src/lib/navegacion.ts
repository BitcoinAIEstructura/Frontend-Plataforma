/**
 * Configuración de navegación compartida.
 *
 * Centraliza la ruta de inicio de la app y la validación de destinos internos
 * para que login, proxy y layouts apliquen las mismas reglas.
 */
export const INICIO_APP = "/panel";

/**
 * A dónde ir después de iniciar sesión, según `?siguiente=`.
 *
 * Solo se aceptan rutas internas ("/cartera"). Cualquier otra cosa ("https://otro.sitio",
 * "//otro.sitio", "javascript:…", "/\otro") lleva al panel: así un enlace malicioso
 * no puede usar el inicio de sesión para mandar a la persona a otro sitio (open redirect).
 */
export function destinoSeguro(siguiente: string | null | undefined): string {
  if (!siguiente || !siguiente.startsWith("/") || siguiente.startsWith("//") || siguiente.includes("\\")) {
    return INICIO_APP;
  }
  try {
    const url = new URL(siguiente, "https://nexabit.local");
    if (url.origin !== "https://nexabit.local") return INICIO_APP;
    if (url.pathname === "/iniciar-sesion" || url.pathname === "/registro") return INICIO_APP;
    return url.pathname + url.search + url.hash;
  } catch {
    return INICIO_APP;
  }
}
