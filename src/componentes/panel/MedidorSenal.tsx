"use client";

import Link from "next/link";

import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { Decision, Senal } from "@/lib/api/mercado";
import { usdt } from "@/lib/formato";
import { useSenal } from "@/lib/hooks/useDatos";

/** Cada señal con su ícono y su palabra: el color nunca va solo. */
const ASPECTO: Record<
  Decision["senal"],
  { icono: string; palabra: string; trazo: string; texto: string; explicacion: string }
> = {
  COMPRAR: {
    icono: "▲",
    palabra: "Comprar",
    trazo: "var(--grafica-sube)",
    texto: "text-sube",
    explicacion: "Los indicadores apuntan a que el precio podría subir.",
  },
  VENDER: {
    icono: "▼",
    palabra: "Vender",
    trazo: "var(--grafica-baja)",
    texto: "text-baja",
    explicacion: "Los indicadores apuntan a que el precio podría bajar.",
  },
  MANTENER: {
    icono: "●",
    palabra: "Mantener",
    trazo: "var(--grafica-neutra)",
    texto: "text-texto",
    explicacion: "Los indicadores no se ponen de acuerdo: mejor esperar.",
  },
};

/** Arco de medio círculo (de izquierda a derecha por arriba). */
const ARCO = "M 20 100 A 80 80 0 0 1 180 100";

/** Medidor de la señal de la estrategia combinada (la que sigue el bot): qué haría y con cuánta confianza. Las predicciones de los modelos de IA están en /ia. */
export function MedidorSenal({ senal }: { senal: Senal }) {
  const { decision, pronostico } = senal;
  const aspecto = ASPECTO[decision.senal];
  const porcentaje = Math.round(Math.min(1, Math.max(0, decision.confianza)) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 112" className="w-full max-w-[260px]" aria-hidden>
          <path d={ARCO} fill="none" stroke="var(--grafica-rejilla)" strokeWidth="14" strokeLinecap="round" />
          <path
            d={ARCO}
            fill="none"
            stroke={aspecto.trazo}
            strokeWidth="14"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${porcentaje} 100`}
            className="motion-safe:transition-[stroke-dasharray] motion-safe:duration-700"
          />
        </svg>
        <div
          role="meter"
          aria-label="Confianza de la señal de la estrategia"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={porcentaje}
          aria-valuetext={`${aspecto.palabra}, ${porcentaje} % de confianza`}
          className="-mt-14 flex flex-col items-center"
        >
          <span className={`text-2xl font-semibold ${aspecto.texto}`}>
            <span aria-hidden>{aspecto.icono}</span> {aspecto.palabra}
          </span>
          <span className="cifra text-sm text-texto-secundario">{porcentaje} % de confianza</span>
        </div>
      </div>

      <p className="text-center text-sm text-texto-secundario">
        {aspecto.explicacion} Analizó {senal.velasAnalizadas} velas; precio de referencia{" "}
        <span className="cifra text-texto">{usdt(decision.precio)}</span> USDT.
      </p>

      <details className="group rounded-xl border border-borde px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium text-oro marker:text-oro">¿Por qué?</summary>
        <ul className="mt-3 flex flex-col gap-2 text-texto-secundario">
          {pronostico.justificacion.map((razon) => (
            <li key={razon} className="flex gap-2">
              <span aria-hidden className="text-violeta">
                ✦
              </span>
              {razon}
            </li>
          ))}
        </ul>
      </details>

      <p className="text-xs text-texto-atenuado">{pronostico.aviso}</p>
    </div>
  );
}

/** Tarjeta del panel con la señal de la estrategia combinada en velas de 1 h. */
export function TarjetaSenal() {
  const senal = useSenal("1h");
  return (
    <Tarjeta
      titulo="Señal de la estrategia"
      extra={
        <Link href="/ordenes" className="text-sm font-medium text-oro hover:underline">
          Ir a Órdenes →
        </Link>
      }
    >
      <p className="mb-3 text-sm leading-relaxed text-texto-secundario">
        Es lo que haría tu bot ahora, según tres indicadores. Las predicciones de los modelos de IA están en{" "}
        <Link href="/ia" className="font-medium text-oro hover:underline">
          Predicciones IA
        </Link>
        .
      </p>
      {senal.data ? (
        <MedidorSenal senal={senal.data} />
      ) : senal.isError ? (
        <p role="alert" className="text-error">
          {senal.error.message}
        </p>
      ) : (
        <p role="status" className="py-16 text-center text-texto-secundario">
          La estrategia está analizando el mercado…
        </p>
      )}
    </Tarjeta>
  );
}
