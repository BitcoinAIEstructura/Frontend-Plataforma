"use client";

import Link from "next/link";

import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { ConsejoIA as Consejo } from "@/lib/api/simulacion";
import { useConsejoIA } from "@/lib/hooks/useDatos";

import { porcentaje } from "./formato";

/** Cada acción con su ícono y su palabra: el color nunca va solo. */
export const ACCION: Record<
  Consejo["accion"],
  { icono: string; palabra: string; clase: string; borde: string }
> = {
  COMPRAR: { icono: "▲", palabra: "Comprar", clase: "text-sube", borde: "border-sube/40 bg-sube/10" },
  VENDER: { icono: "▼", palabra: "Vender", clase: "text-baja", borde: "border-baja/40 bg-baja/10" },
  MANTENER: { icono: "◆", palabra: "Mantener", clase: "text-oro", borde: "border-oro/40 bg-oro/10" },
  ESPERAR: {
    icono: "●",
    palabra: "Esperar",
    clase: "text-texto",
    borde: "border-borde-fuerte bg-superficie-alta",
  },
};

/** Barra de 0 a 100 % con la probabilidad de que suba; la marca del medio es el 50 %. */
function BarraProbabilidad({ valor }: { valor: number }) {
  const p = Math.round(Math.min(1, Math.max(0, valor)) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div
        role="meter"
        aria-label="Probabilidad de que el precio suba en la próxima vela, según la IA"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={p}
        aria-valuetext={`${p} % de que suba`}
        className="relative h-2 overflow-hidden rounded-full bg-superficie-alta"
      >
        <div
          className={`h-full rounded-full motion-safe:transition-[width] motion-safe:duration-700 ${
            p >= 50 ? "bg-sube" : "bg-baja"
          }`}
          style={{ width: `${p}%` }}
        />
        <span aria-hidden className="absolute inset-y-0 left-1/2 w-0.5 bg-texto-atenuado" />
      </div>
      <div className="cifra flex justify-between text-[11px] text-texto-atenuado">
        <span>▼ baja</span>
        <span>{p} % de que suba</span>
        <span>sube ▲</span>
      </div>
    </div>
  );
}

function Cifras({ consejo }: { consejo: Consejo }) {
  const d = consejo.decision;
  const filas = [
    { nombre: "Usaría de tu saldo", valor: porcentaje(d.riesgo) },
    { nombre: "Stop-loss", valor: porcentaje(d.stopLoss) },
    { nombre: "Take-profit", valor: porcentaje(d.takeProfit) },
    { nombre: "Acierto en datos no vistos", valor: porcentaje(d.exactitud) },
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
      {filas.map((f) => (
        <div key={f.nombre}>
          <dt className="text-xs text-texto-atenuado">{f.nombre}</dt>
          <dd className="cifra font-semibold text-texto">{f.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

interface Props {
  /** Compacto: para la cartera y las órdenes (sin las cifras del piloto). */
  compacto?: boolean;
}

/**
 * Lo que haría la IA ahora con tu cartera: comprar, vender, mantener o esperar, con la
 * probabilidad del comité y cuánto arriesgaría. Lo calcula el backend (`GET /api/ia/consejo`).
 */
export function ConsejoIA({ compacto = false }: Props) {
  const consejo = useConsejoIA();
  const titulo = (
    <span className="flex items-center gap-2">
      <span aria-hidden className="text-violeta">
        ✦
      </span>
      Consejo de la IA
    </span>
  );
  const enlace = (
    <Link href="/ia" className="text-sm font-medium text-oro hover:underline">
      Ver por qué →
    </Link>
  );

  if (consejo.isPending) {
    return (
      <Tarjeta titulo={titulo} extra={enlace} aria-label="Consejo de la IA">
        <p role="status" className="text-sm text-texto-secundario">
          La IA está analizando el mercado… (la primera vez entrena sus modelos y tarda unos segundos)
        </p>
      </Tarjeta>
    );
  }
  if (consejo.isError) {
    return (
      <Tarjeta titulo={titulo} aria-label="Consejo de la IA">
        <p role="alert" className="text-sm text-texto-secundario">
          La IA no pudo dar un consejo ahora: {consejo.error.message}
        </p>
      </Tarjeta>
    );
  }

  const c = consejo.data;
  const aspecto = ACCION[c.accion];
  return (
    <Tarjeta titulo={titulo} extra={enlace} destacada={!compacto} aria-label="Consejo de la IA">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start gap-4">
          <span
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-lg font-semibold ${aspecto.borde} ${aspecto.clase}`}
          >
            <span aria-hidden>{aspecto.icono}</span> {aspecto.palabra}
          </span>
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="font-semibold text-texto">{c.titulo}</p>
            <p className="mt-1 text-sm leading-relaxed text-texto-secundario">{c.texto}</p>
          </div>
        </div>
        <BarraProbabilidad valor={c.decision.probabilidad} />
        {!compacto && (
          <>
            <Cifras consejo={c} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-texto-atenuado">{c.aviso}</p>
              <Link
                href="/bot"
                className="rounded-lg border border-oro/50 px-3 py-1.5 text-sm font-medium text-oro hover:bg-oro/10"
              >
                Dejar que la IA opere por ti →
              </Link>
            </div>
          </>
        )}
      </div>
    </Tarjeta>
  );
}
