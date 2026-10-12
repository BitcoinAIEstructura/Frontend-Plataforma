/**
 * Cara de la moneda dibujada con un canvas 2D (no se descarga ninguna imagen ni
 * fuente externa). WebGL no entiende variables CSS, así que los colores se leen
 * de la paleta en tiempo de ejecución.
 */

export interface ColoresMoneda {
  oroClaro: string;
  oro: string;
  oroProfundo: string;
  bitcoin: string;
  sobreOro: string;
}

const RESPALDO: ColoresMoneda = {
  oroClaro: "#f3dc9a",
  oro: "#d9b65c",
  oroProfundo: "#a8822e",
  bitcoin: "#f7931a",
  sobreOro: "#1a1406",
};

/** Lee los colores de la paleta (globals.css); si no hay documento, usa los del tema oscuro. */
export function coloresDeLaPaleta(): ColoresMoneda {
  if (typeof document === "undefined") return RESPALDO;
  const estilo = getComputedStyle(document.documentElement);
  const leer = (variable: string, respaldo: string) => estilo.getPropertyValue(variable).trim() || respaldo;
  return {
    oroClaro: leer("--oro-claro", RESPALDO.oroClaro),
    oro: leer("--oro", RESPALDO.oro),
    oroProfundo: leer("--oro-profundo", RESPALDO.oroProfundo),
    bitcoin: leer("--bitcoin", RESPALDO.bitcoin),
    sobreOro: leer("--sobre-oro", RESPALDO.sobreOro),
  };
}

const LEYENDA = "NEXABIT · TRADING CON IA · SIN DINERO REAL · ";

/**
 * Dibuja la cara: degradado dorado, anillos grabados, la leyenda alrededor y el ₿ en relieve.
 * @returns el canvas, o null si el navegador no puede dibujar (por ejemplo, en pruebas).
 */
export function dibujarCara(colores: ColoresMoneda, tamano = 1024): HTMLCanvasElement | null {
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = tamano;
  const ctx = lienzo.getContext("2d");
  if (!ctx) return null;
  const c = tamano / 2;

  const fondo = ctx.createRadialGradient(c * 0.7, c * 0.6, tamano * 0.05, c, c, c);
  fondo.addColorStop(0, colores.oroClaro);
  fondo.addColorStop(0.55, colores.oro);
  fondo.addColorStop(1, colores.oroProfundo);
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, tamano, tamano);

  // Anillos grabados.
  ctx.strokeStyle = colores.oroProfundo;
  for (const [radio, grosor] of [
    [0.94, 10],
    [0.8, 4],
    [0.62, 3],
  ] as const) {
    ctx.lineWidth = grosor;
    ctx.beginPath();
    ctx.arc(c, c, c * radio, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Leyenda alrededor, letra por letra.
  ctx.fillStyle = colores.oroProfundo;
  ctx.font = `600 ${Math.round(tamano * 0.045)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const letras = [...LEYENDA.repeat(2)];
  letras.forEach((letra, i) => {
    const angulo = (i / letras.length) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.translate(c + Math.cos(angulo) * c * 0.87, c + Math.sin(angulo) * c * 0.87);
    ctx.rotate(angulo + Math.PI / 2);
    ctx.fillText(letra, 0, 0);
    ctx.restore();
  });

  // ₿ en relieve: sombra oscura abajo y luz arriba.
  ctx.font = `800 ${Math.round(tamano * 0.5)}px system-ui, sans-serif`;
  ctx.fillStyle = colores.oroProfundo;
  ctx.fillText("₿", c + tamano * 0.008, c + tamano * 0.012);
  ctx.fillStyle = colores.oroClaro;
  ctx.fillText("₿", c - tamano * 0.006, c - tamano * 0.008);
  ctx.fillStyle = colores.oro;
  ctx.fillText("₿", c, c);
  return lienzo;
}
