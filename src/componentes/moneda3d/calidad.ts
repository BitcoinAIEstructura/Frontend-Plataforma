/**
 * Qué tan rica puede ser la escena 3D en este dispositivo.
 *
 * - "estatica": sin WebGL, o la persona pidió menos movimiento → imagen fija de la moneda.
 * - "liviana": teléfono modesto o ahorro de datos → menos partículas, sin reflejos ni sombras.
 * - "completa": reflejos de estudio, sombra en el piso y polvo dorado.
 */
export type Calidad = "estatica" | "liviana" | "completa";

export interface Dispositivo {
  webgl: boolean;
  menosMovimiento: boolean;
  nucleos?: number;
  memoriaGb?: number;
  ahorroDatos?: boolean;
  anchoPantalla: number;
}

export function decidirCalidad(d: Dispositivo): Calidad {
  if (!d.webgl || d.menosMovimiento) return "estatica";
  const modesto =
    (d.nucleos !== undefined && d.nucleos <= 4) ||
    (d.memoriaGb !== undefined && d.memoriaGb <= 4) ||
    d.ahorroDatos;
  return modesto || d.anchoPantalla < 640 ? "liviana" : "completa";
}

export interface Ajustes {
  particulas: number;
  reflejos: boolean;
  /** Resolución máxima de render (px del dispositivo por px CSS). */
  dprMaximo: number;
}

export const AJUSTES: Record<Exclude<Calidad, "estatica">, Ajustes> = {
  liviana: { particulas: 18, reflejos: false, dprMaximo: 1.5 },
  completa: { particulas: 48, reflejos: true, dprMaximo: 2 },
};

/** Lee el dispositivo real (solo en el navegador). */
export function leerDispositivo(): Dispositivo {
  const navegador = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let webgl = false;
  try {
    const lienzo = document.createElement("canvas");
    webgl = Boolean(lienzo.getContext("webgl2") ?? lienzo.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return {
    webgl,
    menosMovimiento: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    nucleos: navegador.hardwareConcurrency,
    memoriaGb: navegador.deviceMemory,
    ahorroDatos: navegador.connection?.saveData,
    anchoPantalla: window.innerWidth,
  };
}
