import { Fraunces, JetBrains_Mono, Manrope } from "next/font/google";

/** Títulos: serif editorial con tamaño óptico (más fina y elegante cuanto más grande). */
export const fuenteTitulo = Fraunces({
  subsets: ["latin"],
  variable: "--fuente-titulo",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

/** Texto general: legible en pantallas pequeñas. */
export const fuenteTexto = Manrope({ subsets: ["latin"], variable: "--fuente-texto", display: "swap" });

/** Cifras: monoespaciada, para que precios y cantidades queden alineados. */
export const fuenteCifras = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--fuente-cifras",
  display: "swap",
});

export const variablesDeFuentes = `${fuenteTitulo.variable} ${fuenteTexto.variable} ${fuenteCifras.variable}`;
