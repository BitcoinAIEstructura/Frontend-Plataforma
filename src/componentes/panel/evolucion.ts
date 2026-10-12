/**
 * Evolución del valor de la cartera, reconstruida con las órdenes ejecutadas y las velas.
 *
 * El backend da la foto de hoy (`/api/cartera`); la película se arma aquí: se recorren las
 * velas y las órdenes ejecutadas a la vez (dos punteros, O(velas + órdenes)) y en cada
 * vela se valora la cartera con su precio de cierre: USDT + BTC × cierre.
 */
import type { Punto, Vela } from "@/lib/api/mercado";
import type { Orden } from "@/lib/api/simulacion";

interface Posicion {
  usdt: number;
  btc: number;
}

/**
 * Aplica una orden ejecutada a la posición, igual que el backend:
 * comprar gasta `cantidad × precio + comisión` USDT; vender cobra `cantidad × precio − comisión`.
 */
export function aplicarOrden(posicion: Posicion, orden: Orden): Posicion {
  const cantidad = orden.cantidadBtc ?? 0;
  const bruto = cantidad * (orden.precioEjecucion ?? 0);
  const comision = orden.comision ?? 0;
  return orden.tipo === "COMPRA"
    ? { usdt: posicion.usdt - bruto - comision, btc: posicion.btc + cantidad }
    : { usdt: posicion.usdt + bruto - comision, btc: Math.max(0, posicion.btc - cantidad) };
}

/** Un punto por vela con el valor total de la cartera al cierre de esa vela. */
export function evolucionCartera(
  saldoInicial: number,
  ordenes: readonly Orden[],
  velas: readonly Vela[],
): Punto[] {
  const ejecutadas = ordenes
    .filter((o) => o.estado === "EJECUTADA" && o.ejecutadaEn != null)
    .sort((a, b) => a.ejecutadaEn! - b.ejecutadaEn!);

  let posicion: Posicion = { usdt: saldoInicial, btc: 0 };
  let siguiente = 0;
  return velas.map((vela) => {
    // Todas las órdenes ejecutadas hasta el cierre de esta vela (las anteriores a la
    // primera vela también: así el primer punto ya trae la posición de ese momento).
    while (siguiente < ejecutadas.length && ejecutadas[siguiente]!.ejecutadaEn! <= vela.tiempoCierre) {
      posicion = aplicarOrden(posicion, ejecutadas[siguiente]!);
      siguiente++;
    }
    return { tiempo: vela.tiempoApertura, valor: posicion.usdt + posicion.btc * vela.cierre };
  });
}

/**
 * La última vela sigue abierta: su cierre es un precio de hace un rato. El último punto
 * toma el valor de `/api/cartera` (precio de ahora) para que coincida con las cifras.
 */
export function conValorActual(puntos: Punto[], valorActual: number | undefined): Punto[] {
  if (valorActual === undefined || puntos.length === 0) return puntos;
  return [...puntos.slice(0, -1), { ...puntos.at(-1)!, valor: valorActual }];
}

/** ¿Hay al menos una orden ejecutada? Sin ellas la línea es plana y no dice nada. */
export function tieneMovimientos(ordenes: readonly Orden[]): boolean {
  return ordenes.some((o) => o.estado === "EJECUTADA");
}
