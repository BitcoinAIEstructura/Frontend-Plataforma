/**
 * Conversión de los datos del backend al formato de Lightweight Charts y lectura de
 * los colores de la paleta (WebGL/canvas no entienden variables CSS).
 */
import type { CandlestickData, HistogramData, LineData, UTCTimestamp } from "lightweight-charts";

import type { Punto, Vela } from "@/lib/api/mercado";

/** Colombia está en UTC−5 todo el año (sin horario de verano). */
const DESFASE_BOGOTA_S = -5 * 3600;

/**
 * Lightweight Charts muestra las horas en UTC. Se corre cada tiempo a la hora de
 * Bogotá para que los ejes digan la hora local.
 */
export function aTiempoGrafica(milisegundos: number): UTCTimestamp {
  return (Math.floor(milisegundos / 1000) + DESFASE_BOGOTA_S) as UTCTimestamp;
}

export function aVelasGrafica(velas: readonly Vela[]): CandlestickData<UTCTimestamp>[] {
  return velas.map((v) => ({
    time: aTiempoGrafica(v.tiempoApertura),
    open: v.apertura,
    high: v.maximo,
    low: v.minimo,
    close: v.cierre,
  }));
}

export function aVolumenGrafica(
  velas: readonly Vela[],
  sube: string,
  baja: string,
): HistogramData<UTCTimestamp>[] {
  return velas.map((v) => ({
    time: aTiempoGrafica(v.tiempoApertura),
    value: v.volumen,
    color: v.cierre >= v.apertura ? sube : baja,
  }));
}

export function aLineaGrafica(puntos: readonly Punto[]): LineData<UTCTimestamp>[] {
  return puntos.map((p) => ({ time: aTiempoGrafica(p.tiempo), value: p.valor }));
}

export interface ColoresGrafica {
  sube: string;
  baja: string;
  serie1: string;
  serie2: string;
  neutra: string;
  rejilla: string;
  texto: string;
  textoAtenuado: string;
  superficie: string;
}

const RESPALDO: ColoresGrafica = {
  sube: "#17a093",
  baja: "#d9506b",
  serie1: "#b58f3a",
  serie2: "#5b82e0",
  neutra: "#7a705e",
  rejilla: "#26211a",
  texto: "#cdc1aa",
  textoAtenuado: "#a0937c",
  superficie: "#17140f",
};

/** Colores actuales de la paleta (cambian con el tema). */
export function leerColoresGrafica(): ColoresGrafica {
  if (typeof document === "undefined") return RESPALDO;
  const estilo = getComputedStyle(document.documentElement);
  const leer = (variable: string, respaldo: string) => estilo.getPropertyValue(variable).trim() || respaldo;
  return {
    sube: leer("--grafica-sube", RESPALDO.sube),
    baja: leer("--grafica-baja", RESPALDO.baja),
    serie1: leer("--grafica-serie-1", RESPALDO.serie1),
    serie2: leer("--grafica-serie-2", RESPALDO.serie2),
    neutra: leer("--grafica-neutra", RESPALDO.neutra),
    rejilla: leer("--grafica-rejilla", RESPALDO.rejilla),
    texto: leer("--texto-secundario", RESPALDO.texto),
    textoAtenuado: leer("--texto-atenuado", RESPALDO.textoAtenuado),
    superficie: leer("--superficie", RESPALDO.superficie),
  };
}

/** Color con transparencia ("#rrggbb" + alfa 0–1), para el volumen y los rellenos. */
export function conAlfa(hex: string, alfa: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  return `${hex}${Math.round(alfa * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

/**
 * La rueda del ratón baja la página en vez de hacer zoom (si no, la gráfica "atrapa"
 * el scroll). El zoom sigue con pellizco o arrastrando el eje.
 */
export const INTERACCION = {
  handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
  handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: true },
} as const;

/** Una orden ejecutada dibujada sobre la vela en que ocurrió. */
export interface MarcaOrden {
  /** Tiempo de apertura de la vela que contiene la ejecución. */
  tiempoVela: number;
  tipo: "COMPRA" | "VENTA";
  /** Cuántas órdenes de ese tipo cayeron en esa vela. */
  cantidad: number;
}

/**
 * Ubica cada orden ejecutada en su vela (dos punteros: ambas listas van en orden de tiempo).
 * Las que caen fuera de las velas visibles se omiten. Complejidad: O(velas + órdenes · log).
 */
export function marcasEnVelas(
  velas: readonly Vela[],
  ejecuciones: readonly { tiempo: number; tipo: "COMPRA" | "VENTA" }[],
): MarcaOrden[] {
  const ordenadas = [...ejecuciones].sort((a, b) => a.tiempo - b.tiempo);
  const porClave = new Map<string, MarcaOrden>();
  let v = 0;
  for (const e of ordenadas) {
    while (v < velas.length && velas[v]!.tiempoCierre < e.tiempo) v++;
    const vela = velas[v];
    if (!vela || e.tiempo < vela.tiempoApertura) continue;
    const clave = `${vela.tiempoApertura}:${e.tipo}`;
    const actual = porClave.get(clave);
    porClave.set(clave, {
      tiempoVela: vela.tiempoApertura,
      tipo: e.tipo,
      cantidad: (actual?.cantidad ?? 0) + 1,
    });
  }
  return [...porClave.values()].sort((a, b) => a.tiempoVela - b.tiempoVela);
}
