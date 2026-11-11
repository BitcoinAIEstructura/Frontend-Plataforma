/** Secciones de la app. `lista: false` = llega en una fase próxima (se muestra como "Pronto"). */
export interface Seccion {
  ruta: string;
  titulo: string;
  /** Nombre del icono SVG (ver `Iconos.tsx`). */
  icono: string;
  lista: boolean;
  /** Aparece en la barra inferior del teléfono (máximo 4; las demás están en «Más»). */
  enTelefono: boolean;
  /** Una frase sencilla bajo el título: para qué sirve la página. */
  descripcion: string;
}

export const SECCIONES: readonly Seccion[] = [
  {
    ruta: "/panel",
    titulo: "Panel",
    icono: "panel",
    lista: true,
    enTelefono: true,
    descripcion: "Tu resumen: cuánto tienes, el precio del Bitcoin ahora y qué opina la estrategia.",
  },
  {
    ruta: "/mercado",
    titulo: "Mercado",
    icono: "mercado",
    lista: true,
    enTelefono: true,
    descripcion: "El precio del Bitcoin en velas, con indicadores que ayudan a leerlo, y tus alertas.",
  },
  {
    ruta: "/ordenes",
    titulo: "Órdenes",
    icono: "ordenes",
    lista: true,
    enTelefono: true,
    descripcion: "Aquí compras y vendes Bitcoin con dinero de práctica.",
  },
  {
    ruta: "/cartera",
    titulo: "Cartera",
    icono: "cartera",
    lista: true,
    enTelefono: false,
    descripcion: "Cuánto dinero simulado tienes, en qué está y todo lo que ha pasado.",
  },
  {
    ruta: "/bot",
    titulo: "Bot",
    icono: "bot",
    lista: true,
    enTelefono: true,
    descripcion: "Un robot que compra y vende solo, siguiendo reglas que tú ajustas.",
  },
  {
    ruta: "/liga",
    titulo: "Liga",
    icono: "liga",
    lista: true,
    enTelefono: false,
    descripcion: "Compárate con otros inversores y mira qué habría pasado si invertías en el pasado.",
  },
  {
    ruta: "/ia",
    titulo: "Predicciones IA",
    icono: "ia",
    lista: true,
    enTelefono: false,
    descripcion: "Modelos que aprenden del pasado e intentan decir si el precio subirá o bajará.",
  },
  {
    ruta: "/como-funciona",
    titulo: "Cómo funciona",
    icono: "como-funciona",
    lista: true,
    enTelefono: false,
    descripcion: "Las estructuras de datos que hacen funcionar Nexabit, en vivo.",
  },
  {
    ruta: "/seguridad",
    titulo: "Seguridad",
    icono: "seguridad",
    lista: true,
    enTelefono: false,
    descripcion: "Protege tu cuenta: verificación en dos pasos, contraseña y dispositivos conectados.",
  },
];

export function seccionActiva(ruta: string): Seccion | undefined {
  return SECCIONES.find((s) => ruta === s.ruta || ruta.startsWith(`${s.ruta}/`));
}
