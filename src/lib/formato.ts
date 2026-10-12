const ZONA = "America/Bogota";

const FECHA_HORA = new Intl.DateTimeFormat("es-CO", {
  timeZone: ZONA,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const RELATIVO = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

/** "12 oct 2026, 09:41 a. m." en hora de Colombia. */
export function fechaHora(milisegundos: number): string {
  return FECHA_HORA.format(milisegundos);
}

/** "hace 5 minutos", "ayer"… (respecto de `ahora`). */
export function haceCuanto(milisegundos: number, ahora: number = Date.now()): string {
  const segundos = Math.round((milisegundos - ahora) / 1000);
  const unidades: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unidad, tamano] of unidades) {
    if (Math.abs(segundos) >= tamano) return RELATIVO.format(Math.round(segundos / tamano), unidad);
  }
  return "justo ahora";
}

/** Nombre corto del navegador y del sistema a partir del User-Agent ("Chrome en Windows"). */
// El orden importa: Edge y Opera también dicen "Chrome", y Chrome también dice "Safari".
const NAVEGADORES: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\//, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];
// Android también dice "Linux", y el iPhone también dice "Mac OS X".
const SISTEMAS: [RegExp, string][] = [
  [/Android/, "Android"],
  [/iPhone|iPad/, "iPhone / iPad"],
  [/Windows/, "Windows"],
  [/Mac OS X/, "macOS"],
  [/Linux/, "Linux"],
];

function primero(tabla: [RegExp, string][], texto: string): string | null {
  return tabla.find(([patron]) => patron.test(texto))?.[1] ?? null;
}

export function describirAgente(agente: string): string {
  const navegador = primero(NAVEGADORES, agente);
  const sistema = primero(SISTEMAS, agente);
  if (navegador && sistema) return `${navegador} en ${sistema}`;
  return navegador ?? sistema ?? "Dispositivo desconocido";
}
