/** Números de la página de IA al estilo es-CO. */

const PORCENTAJE = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

/** 0,5263 → "52,6 %". */
export function porcentaje(fraccion: number): string {
  return `${PORCENTAJE.format(fraccion * 100)} %`;
}

/** Diferencia de exactitud en puntos: 0,021 → "▲ 2,1 puntos"; −0,05 → "▼ 5 puntos". */
export function puntos(diferencia: number): string {
  const valor = PORCENTAJE.format(Math.abs(diferencia) * 100);
  if (Math.abs(diferencia) < 0.0005) return "● 0 puntos";
  return `${diferencia > 0 ? "▲" : "▼"} ${valor} punto${valor === "1" ? "" : "s"}`;
}

/** Valor de una característica según su tipo (rendimientos y distancias en %, el RSI tal cual). */
export function valorCaracteristica(nombre: string, valor: number): string {
  if (nombre.startsWith("RSI")) return PORCENTAJE.format(valor);
  const signo = valor > 0 ? "+" : valor < 0 ? "−" : "";
  return `${signo}${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(Math.abs(valor) * 100)} %`;
}
