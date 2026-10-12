"use client";

import { useState } from "react";

import { usdt, variacion } from "@/lib/formato";
import { usePrecio } from "@/lib/hooks/useDatos";
import { useEstadoConexion, type EstadoConexion } from "@/lib/tiempoReal";

const TEXTO_CONEXION: Record<EstadoConexion, string> = {
  "en-vivo": "En vivo",
  conectando: "Conectando…",
  reconectando: "Reconectando…",
};

/** Indicador de la conexión en vivo: punto que late (verde de "en vivo") + texto. */
export function IndicadorConexion() {
  const estado = useEstadoConexion();
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-texto-secundario">
      <span
        aria-hidden
        className={`size-2 rounded-full ${estado === "en-vivo" ? "animate-pulse bg-exito" : "bg-bitcoin"}`}
      />
      {TEXTO_CONEXION[estado]}
    </span>
  );
}

interface Props {
  /** Precio de referencia para la variación (por ejemplo, la apertura del periodo mostrado). */
  referencia?: number;
  textoReferencia?: string;
}

/** Precio de BTCUSDT que se actualiza solo; "late" en turquesa o rosa cuando cambia. */
export function PrecioEnVivo({ referencia, textoReferencia = "en el periodo" }: Props) {
  const { data, isPending, isError } = usePrecio();
  const precio = data?.precio;
  // Sentido del último cambio, para el "latido". Se ajusta durante el render cuando
  // cambia el precio (patrón de React para estado derivado, sin efectos ni refs).
  const [ultimo, setUltimo] = useState<{ precio: number | undefined; latido: string }>({
    precio,
    latido: "",
  });
  if (precio !== ultimo.precio) {
    const latido =
      precio === undefined || ultimo.precio === undefined
        ? ""
        : precio > ultimo.precio
          ? "latido-sube"
          : "latido-baja";
    setUltimo({ precio, latido });
  }
  const latido = ultimo.latido;

  const cambio = precio !== undefined && referencia ? (precio - referencia) / referencia : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-texto-secundario">BTC / USDT</span>
        <IndicadorConexion />
      </div>
      <p
        key={precio}
        className={`text-3xl font-semibold tracking-tight text-texto sm:text-4xl ${latido}`}
        aria-live="polite"
        aria-atomic
      >
        {/* Si un refresco falla, se sigue mostrando el último precio conocido. */}
        {precio !== undefined ? usdt(precio) : isPending ? "…" : isError ? "Sin precio" : "—"}{" "}
        <span className="text-base font-medium text-texto-atenuado">USDT</span>
      </p>
      {cambio !== null && (
        <p className={`cifra text-sm font-semibold ${cambio >= 0 ? "text-sube" : "text-baja"}`}>
          {variacion(cambio)} <span className="font-normal text-texto-atenuado">{textoReferencia}</span>
        </p>
      )}
    </div>
  );
}
