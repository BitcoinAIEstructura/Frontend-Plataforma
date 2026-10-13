/** Secciones de la app. `lista: false` = llega en una fase próxima (se muestra como "Pronto"). */
export interface Seccion {
  ruta: string;
  titulo: string;
  icono: string;
  lista: boolean;
  /** Aparece en la barra inferior del teléfono (máximo 5). */
  enTelefono: boolean;
}

export const SECCIONES: readonly Seccion[] = [
  { ruta: "/panel", titulo: "Panel", icono: "◈", lista: true, enTelefono: true },
  { ruta: "/mercado", titulo: "Mercado", icono: "⌁", lista: true, enTelefono: true },
  { ruta: "/ordenes", titulo: "Órdenes", icono: "⇅", lista: true, enTelefono: true },
  { ruta: "/cartera", titulo: "Cartera", icono: "◎", lista: true, enTelefono: false },
  { ruta: "/bot", titulo: "Bot", icono: "⚙", lista: true, enTelefono: false },
  { ruta: "/liga", titulo: "Liga", icono: "♛", lista: true, enTelefono: false },
  { ruta: "/ia", titulo: "Predicciones IA", icono: "✦", lista: true, enTelefono: true },
  { ruta: "/como-funciona", titulo: "Cómo funciona", icono: "⬡", lista: true, enTelefono: false },
  { ruta: "/seguridad", titulo: "Seguridad", icono: "⛨", lista: true, enTelefono: true },
];

export function seccionActiva(ruta: string): Seccion | undefined {
  return SECCIONES.find((s) => ruta === s.ruta || ruta.startsWith(`${s.ruta}/`));
}
