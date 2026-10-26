/** Una predicción de ejemplo para las pruebas de la página de IA. */
import type { FuentesIA, ModeloIA, PrediccionIA } from "@/lib/api/ia";

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
    descripcion: {
      idea: `Idea de ${nombre}.`,
      tituloFactores: `Factores de ${nombre}`,
      factoresConSigno: nombre !== "Árbol de decisión",
    },
    veredicto:
      ventaja > 0
        ? { gana: true, titulo: "✓ Le ganó a la base.", texto: "Acertó más que la base." }
        : { gana: false, titulo: "⚠ Ojo: no le ganó a la base.", texto: "Tómalo como un experimento." },
  };
}

export const PREDICCION: PrediccionIA = {
  simbolo: "BTCUSDT",
  intervalo: "1h",
  nombreIntervalo: "1 h",
  intervalos: [
    { codigo: "15m", nombre: "15 min" },
    { codigo: "1h", nombre: "1 h" },
    { codigo: "4h", nombre: "4 h" },
    { codigo: "1d", nombre: "1 día" },
  ],
  encabezado: { etiqueta: "Hecho a mano", texto: "Tres modelos y un comité." },
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
  fuentesExternas: {
    usadas: [
      { id: "miedo-codicia", nombre: "Índice de miedo y codicia" },
      { id: "dvol", nombre: "Volatilidad esperada (Deribit)" },
    ],
    omitidas: [{ id: "financiacion", nombre: "Financiación de futuros (Binance)", motivo: "No respondió" }],
    comparacion: {
      sinExternos: {
        muestras: 190,
        exactitud: 0.47,
        base: 0.51,
        ventaja: -0.04,
        precisionSube: 0.5,
        vecesDijoSube: 90,
      },
      conExternos: {
        muestras: 190,
        exactitud: 0.52,
        base: 0.51,
        ventaja: 0.01,
        precisionSube: 0.55,
        vecesDijoSube: 95,
      },
      conclusion:
        "Con las fuentes externas acertó más: 52,0 % frente a 47,0 % solo con el precio (+5,0 puntos).",
    },
  },
  aviso: "Predicción hecha con datos reales del pasado. No es asesoría financiera.",
};

export const FUENTES: FuentesIA = {
  lecturas: [
    {
      id: "miedo-codicia",
      nombre: "Miedo y codicia",
      fuente: "alternative.me",
      valor: 50,
      valorTexto: "50 de 100 · neutral",
      explicacion: "Mide el ánimo de la gente con Bitcoin. Hoy está neutral.",
    },
    {
      id: "dvol",
      nombre: "Movimiento esperado",
      fuente: "Deribit (opciones)",
      valor: 38,
      valorTexto: "±0,41 % por vela",
      explicacion: "Dice cuánto se mueve, no hacia dónde.",
    },
  ],
  errores: [{ id: "largos", motivo: "Respondió 500" }],
  actualizadoEn: 1791824400000,
};
