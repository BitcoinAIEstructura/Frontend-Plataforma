/**
 * Cara y canto de la moneda dibujados con un canvas 2D (no se descarga ninguna imagen
 * ni fuente externa). WebGL no entiende variables CSS, así que los colores se leen de
 * la paleta (`--moneda-*` en globals.css) en tiempo de ejecución.
 */

export interface ColoresMoneda {
  /** Brillo del metal. */
  claro: string;
  /** Oro medio. */
  medio: string;
  /** Grabado y sombras. */
  sombra: string;
  /** Filo del canto (naranja Bitcoin). */
  canto: string;
}

const RESPALDO: ColoresMoneda = {
  claro: "#f7e4ae",
  medio: "#d6ab4f",
  sombra: "#7d5a17",
  canto: "#e8962a",
};

/** Lee los colores de la paleta; si no hay documento o falta una variable, usa los del tema oscuro. */
export function coloresDeLaPaleta(): ColoresMoneda {
  if (typeof document === "undefined") return RESPALDO;
  const estilo = getComputedStyle(document.documentElement);
  const leer = (variable: string, respaldo: string) => estilo.getPropertyValue(variable).trim() || respaldo;
  return {
    claro: leer("--moneda-claro", RESPALDO.claro),
    medio: leer("--moneda", RESPALDO.medio),
    sombra: leer("--moneda-sombra", RESPALDO.sombra),
    canto: leer("--moneda-canto", RESPALDO.canto),
  };
}

const LEYENDA = "NEXABIT · BÓVEDA DE PRÁCTICA · SIN DINERO REAL · ";
const SERIF = 'Georgia, "Times New Roman", serif';

function lienzo2d(ancho: number, alto = ancho) {
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  return ctx ? { lienzo, ctx } : null;
}

/**
 * Dibuja la cara como una moneda acuñada: borde en relieve, gráfila de perlas, la
 * leyenda en serif, un campo de guilloché (rosetón de círculos finos) y el ₿ biselado.
 * @returns el canvas, o null si el navegador no puede dibujar (por ejemplo, en pruebas).
 */
export function dibujarCara(colores: ColoresMoneda, tamano = 1024): HTMLCanvasElement | null {
  const base = lienzo2d(tamano);
  if (!base) return null;
  const { lienzo, ctx } = base;
  const c = tamano / 2;

  // Metal: luz arriba a la izquierda, sombra abajo a la derecha.
  const fondo = ctx.createRadialGradient(c * 0.62, c * 0.5, tamano * 0.04, c, c, c);
  fondo.addColorStop(0, colores.claro);
  fondo.addColorStop(0.5, colores.medio);
  fondo.addColorStop(1, colores.sombra);
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, tamano, tamano);

  // Borde en relieve: un anillo con su propio brillo.
  const borde = ctx.createLinearGradient(0, 0, tamano, tamano);
  borde.addColorStop(0, colores.claro);
  borde.addColorStop(0.5, colores.medio);
  borde.addColorStop(1, colores.sombra);
  ctx.lineWidth = c * 0.08;
  ctx.strokeStyle = borde;
  ctx.beginPath();
  ctx.arc(c, c, c * 0.955, 0, Math.PI * 2);
  ctx.stroke();

  // Gráfila de perlas.
  ctx.fillStyle = colores.sombra;
  const perlas = 120;
  for (let i = 0; i < perlas; i++) {
    const a = (i / perlas) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(c + Math.cos(a) * c * 0.875, c + Math.sin(a) * c * 0.875, c * 0.011, 0, Math.PI * 2);
    ctx.fill();
  }

  // Leyenda en serif, letra por letra, con un filo de luz (grabado hundido).
  ctx.font = `600 ${Math.round(tamano * 0.04)}px ${SERIF}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const letras = [...LEYENDA.repeat(2)];
  letras.forEach((letra, i) => {
    const angulo = (i / letras.length) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.translate(c + Math.cos(angulo) * c * 0.78, c + Math.sin(angulo) * c * 0.78);
    ctx.rotate(angulo + Math.PI / 2);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = colores.claro;
    ctx.fillText(letra, 1.5, 1.5);
    ctx.globalAlpha = 1;
    ctx.fillStyle = colores.sombra;
    ctx.fillText(letra, 0, 0);
    ctx.restore();
  });

  // Filetes que encierran el campo.
  ctx.strokeStyle = colores.sombra;
  for (const [radio, grosor] of [
    [0.69, 3],
    [0.665, 1.2],
  ] as const) {
    ctx.lineWidth = grosor;
    ctx.beginPath();
    ctx.arc(c, c, c * radio, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Guilloché: 60 círculos finos desplazados alrededor del centro forman un rosetón.
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, c * 0.655, 0, Math.PI * 2);
  ctx.clip();
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = colores.sombra;
  ctx.globalAlpha = 0.28;
  const vueltas = 60;
  for (let i = 0; i < vueltas; i++) {
    const a = (i / vueltas) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(c + Math.cos(a) * c * 0.2, c + Math.sin(a) * c * 0.2, c * 0.44, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Medallón liso detrás del ₿ para que se lea sobre el grabado.
  const medallon = ctx.createRadialGradient(c * 0.85, c * 0.8, 0, c, c, c * 0.36);
  medallon.addColorStop(0, colores.claro);
  medallon.addColorStop(1, colores.medio);
  ctx.fillStyle = medallon;
  ctx.beginPath();
  ctx.arc(c, c, c * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = colores.sombra;
  ctx.stroke();

  // ₿ biselado: sombra abajo a la derecha, luz arriba a la izquierda y el metal encima.
  ctx.font = `700 ${Math.round(tamano * 0.4)}px ${SERIF}`;
  const y = c + tamano * 0.012;
  ctx.fillStyle = colores.sombra;
  ctx.fillText("₿", c + tamano * 0.01, y + tamano * 0.012);
  ctx.fillStyle = colores.claro;
  ctx.fillText("₿", c - tamano * 0.006, y - tamano * 0.006);
  const letra = ctx.createLinearGradient(c, c - c * 0.3, c, c + c * 0.3);
  letra.addColorStop(0, colores.medio);
  letra.addColorStop(1, colores.sombra);
  ctx.fillStyle = letra;
  ctx.fillText("₿", c, y);

  // Año de acuñación y dos estrellas, como en las monedas de verdad.
  ctx.font = `600 ${Math.round(tamano * 0.034)}px ${SERIF}`;
  ctx.fillStyle = colores.sombra;
  ctx.fillText("MMXXVI", c, c + c * 0.52);
  ctx.fillText("✦", c - c * 0.52, c);
  ctx.fillText("✦", c + c * 0.52, c);
  return lienzo;
}

/**
 * Canto estriado (como las monedas de verdad): rayas verticales de luz y sombra que
 * dan la vuelta al cilindro. @returns el canvas, o null si no se puede dibujar.
 */
export function dibujarCanto(colores: ColoresMoneda, estrias = 160): HTMLCanvasElement | null {
  const ancho = estrias * 8;
  const base = lienzo2d(ancho, 32);
  if (!base) return null;
  const { lienzo, ctx } = base;
  for (let i = 0; i < estrias; i++) {
    const raya = ctx.createLinearGradient(i * 8, 0, i * 8 + 8, 0);
    raya.addColorStop(0, colores.sombra);
    raya.addColorStop(0.5, colores.claro);
    raya.addColorStop(1, colores.sombra);
    ctx.fillStyle = raya;
    ctx.fillRect(i * 8, 0, 8, 32);
  }
  return lienzo;
}
