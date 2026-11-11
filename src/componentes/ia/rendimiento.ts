/**
 * ¿Cuánto habría ganado alguien que siguiera a la IA en las velas de prueba (que no vio al
 * entrenar), frente a comprar y guardar? Se parte de 100 USDT en los dos casos.
 *
 * - Siguiendo a la IA: si el comité dice que sube (≥ 50 %), se tiene BTC durante la vela
 *   siguiente; si dice que baja, se queda en USDT. Cada cambio de posición paga 0,1 % de comisión.
 * - Comprar y guardar: se compra al principio (una comisión) y no se toca.
 */
import type { PrediccionIA } from "@/lib/api/ia";
import type { Punto } from "@/lib/api/mercado";

export const COMISION = 0.001;

export interface Curvas {
  ia: Punto[];
  guardar: Punto[];
  /** Cuántas veces la IA cambió de opinión (cada vez paga comisión). */
  operaciones: number;
}

export function curvasRendimiento(prueba: PrediccionIA["prueba"], inicial = 100): Curvas {
  let ia = inicial;
  let guardar = inicial * (1 - COMISION);
  let dentro = false;
  let operaciones = 0;
  const curvaIa: Punto[] = [];
  const curvaGuardar: Punto[] = [];
  for (const p of prueba) {
    const quiere = p.probabilidad >= 0.5;
    if (quiere !== dentro) {
      ia *= 1 - COMISION;
      dentro = quiere;
      operaciones++;
    }
    if (dentro) ia *= 1 + p.rendimiento;
    guardar *= 1 + p.rendimiento;
    curvaIa.push({ tiempo: p.tiempo, valor: ia });
    curvaGuardar.push({ tiempo: p.tiempo, valor: guardar });
  }
  return { ia: curvaIa, guardar: curvaGuardar, operaciones };
}
