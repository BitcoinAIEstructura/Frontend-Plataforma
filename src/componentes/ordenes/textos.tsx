import type { Orden } from "@/lib/api/simulacion";
import { usdt } from "@/lib/formato";

/** Estado con ícono y palabra (nunca solo color). */
const ESTADOS: Record<Orden["estado"], { icono: string; palabra: string; clase: string }> = {
  PENDIENTE: { icono: "◷", palabra: "En la cola", clase: "border-oro/40 text-oro" },
  PROCESANDO: { icono: "↻", palabra: "Ejecutando", clase: "border-violeta/50 text-violeta" },
  EJECUTADA: { icono: "✓", palabra: "Ejecutada", clase: "border-exito/40 text-exito" },
  CANCELADA: { icono: "✕", palabra: "Cancelada", clase: "border-borde-fuerte text-texto-atenuado" },
  RECHAZADA: { icono: "!", palabra: "Rechazada", clase: "border-error/50 text-error" },
};

export function EtiquetaEstado({ estado }: { estado: Orden["estado"] }) {
  const e = ESTADOS[estado];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${e.clase}`}
    >
      <span aria-hidden>{e.icono}</span>
      {e.palabra}
    </span>
  );
}

/** "▲ Compra" / "▼ Venta" con su color. */
export function TipoOrden({ tipo }: { tipo: Orden["tipo"] }) {
  return tipo === "COMPRA" ? (
    <span className="font-semibold text-sube">▲ Compra</span>
  ) : (
    <span className="font-semibold text-baja">▼ Venta</span>
  );
}

/** "500,00 USDT" o "todo el BTC". */
export function montoOrden(orden: Orden): string {
  return orden.todo || orden.monto == null ? "todo el BTC" : `${usdt(orden.monto)} USDT`;
}

/** De dónde vino la orden, en palabras ("manual" → "Tú"). */
export function origenOrden(motivo: string): string {
  if (motivo === "manual") return "Tú";
  if (motivo.startsWith("señal del bot")) return "El bot";
  if (motivo.startsWith("stop-loss")) return "Stop-loss";
  if (motivo.startsWith("take-profit")) return "Take-profit";
  return motivo;
}
