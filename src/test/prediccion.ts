/** Una predicción de ejemplo para las pruebas de la página de IA. */
import type { ModeloIA, PrediccionIA } from "@/lib/api/ia";

export function modelo(nombre: string, probabilidad: number, ventaja: number, peso: number | null): ModeloIA {
  return {
    nombre,
    probabilidad,
    direccion: probabilidad >= 0.5 ? "SUBE" : "BAJA",
    confianza: Math.abs(probabilidad - 0.5) * 2,
    peso,
    explicacion: {
      resumen: `Resumen de ${nombre}.`,
      factores: [
        { nombre: "RSI 14", peso: 0.4 },
        { nombre: "Rendimiento de 5 velas", peso: -0.2 },
      ],
      pasos: [`Paso de ${nombre}.`],
    },
    metricas: {
      muestras: 190,
      exactitud: 0.51 + ventaja,
      base: 0.51,
      ventaja,
      precisionSube: 0.55,
      vecesDijoSube: 120,
    },
  };
}

export const PREDICCION: PrediccionIA = {
  simbolo: "BTCUSDT",
  intervalo: "1h",
  tiempoVela: 1791820800000,
  entrenadoEn: 1791824400000,
  muestrasEntrenamiento: 759,
  muestrasPrueba: 190,
  comite: modelo("Comité", 0.62, -0.03, null),
  modelos: [
    modelo("Regresión logística", 0.53, -0.05, 0.27),
    modelo("Árbol de decisión", 0.66, 0.02, 0.46),
    modelo("k vecinos", 0.4, -0.09, 0.27),
  ],
  caracteristicas: [
    { nombre: "Rendimiento de la última vela", valor: -0.0012 },
    { nombre: "RSI 14", valor: 31.2 },
  ],
  arbol: {
    hoja: false,
    caracteristica: "RSI 14",
    umbral: 31.9,
    muestras: 759,
    probabilidad: 0.51,
    enCamino: true,
    si: { hoja: true, muestras: 80, probabilidad: 0.66, enCamino: true },
    no: { hoja: true, muestras: 679, probabilidad: 0.49, enCamino: false },
  },
  prueba: [
    { tiempo: 1, probabilidad: 0.6, subio: true },
    { tiempo: 2, probabilidad: 0.6, subio: false },
    { tiempo: 3, probabilidad: 0.4, subio: false },
  ],
  aviso: "Predicción hecha con datos reales del pasado. No es asesoría financiera.",
};
