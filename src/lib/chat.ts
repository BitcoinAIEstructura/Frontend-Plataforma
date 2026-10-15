/**
 * Abrir el chat con el bot desde cualquier parte (la búsqueda, un botón de ayuda…).
 * Es un evento del navegador: el lanzador del chat lo escucha.
 */
export const EVENTO_ABRIR_CHAT = "nexabit:abrir-chat";

export function abrirChat(pregunta?: string): void {
  window.dispatchEvent(new CustomEvent<string | undefined>(EVENTO_ABRIR_CHAT, { detail: pregunta }));
}

/** Las rutas de la búsqueda que abren el chat en vez de cambiar de página. */
export function esRutaDelChat(ruta: string): boolean {
  return ruta.endsWith("#chat");
}
