import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";

/** Títulos: ancha y geométrica, con aire futurista. */
export const fuenteTitulo = Unbounded({ subsets: ["latin"], variable: "--fuente-titulo", display: "swap" });

/** Texto general: legible en pantallas pequeñas. */
export const fuenteTexto = Manrope({ subsets: ["latin"], variable: "--fuente-texto", display: "swap" });

/** Cifras: monoespaciada, para que precios y cantidades queden alineados. */
export const fuenteCifras = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--fuente-cifras",
  display: "swap",
});

export const variablesDeFuentes = `${fuenteTitulo.variable} ${fuenteTexto.variable} ${fuenteCifras.variable}`;
