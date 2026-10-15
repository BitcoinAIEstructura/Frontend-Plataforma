import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { ModeloIA } from "@/lib/api/ia";

import { porcentaje, puntos } from "./formato";

const ARCO = "M 20 100 A 80 80 0 0 1 180 100";

/** Medio círculo con la probabilidad de que suba (0 a 100 %). */
export function ArcoProbabilidad({ probabilidad, nombre }: { probabilidad: number; nombre: string }) {
  const valor = Math.round(Math.min(1, Math.max(0, probabilidad)) * 100);
  const sube = probabilidad >= 0.5;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 112" className="w-full max-w-[240px]" aria-hidden>
        <path d={ARCO} fill="none" stroke="var(--grafica-rejilla)" strokeWidth="14" strokeLinecap="round" />
        <path
          d={ARCO}
          fill="none"
          stroke={sube ? "var(--grafica-sube)" : "var(--grafica-baja)"}
          strokeWidth="14"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${valor} 100`}
          className="motion-safe:transition-[stroke-dasharray] motion-safe:duration-700"
        />
        <line x1="100" y1="14" x2="100" y2="28" stroke="var(--texto-atenuado)" strokeWidth="2" />
      </svg>
      <div
        role="meter"
        aria-label={`Probabilidad de que suba según ${nombre}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valor}
        aria-valuetext={`${porcentaje(probabilidad)} de que suba`}
        className="-mt-14 flex flex-col items-center"
      >
        <span className={`text-2xl font-semibold ${sube ? "text-sube" : "text-baja"}`}>
          <span aria-hidden>{sube ? "▲" : "▼"}</span> {sube ? "Sube" : "Baja"}
        </span>
        {/* El mismo redondeo que el resto de la página (50,7 %, no 51 %). */}
        <span className="cifra text-sm text-texto-secundario">{porcentaje(probabilidad)} de que suba</span>
      </div>
    </div>
  );
}

/** Lo honesto: si en la prueba no le ganó a "decir siempre lo que más pasó", se dice claro. */
export function Veredicto({ modelo }: { modelo: ModeloIA }) {
  const m = modelo.metricas;
  if (m.ventaja > 0) {
    return (
      <p className="rounded-xl border border-exito/40 bg-exito/10 px-4 py-3 text-sm text-texto-secundario">
        <span className="font-semibold text-exito">✓ Le ganó a la base.</span> En las últimas {m.muestras}{" "}
        velas (que no vio al aprender) acertó el{" "}
        <span className="cifra text-texto">{porcentaje(m.exactitud)}</span>, frente al{" "}
        <span className="cifra">{porcentaje(m.base)}</span> de decir siempre lo que más pasó:{" "}
        {puntos(m.ventaja)} a favor.
      </p>
    );
  }
  return (
    <p className="rounded-xl border border-bitcoin/50 bg-bitcoin/10 px-4 py-3 text-sm text-texto-secundario">
      <span className="font-semibold text-bitcoin">⚠ Ojo: no le ganó a la base.</span> En las últimas{" "}
      {m.muestras} velas acertó el <span className="cifra text-texto">{porcentaje(m.exactitud)}</span>, y
      decir siempre lo que más pasó habría acertado el <span className="cifra">{porcentaje(m.base)}</span>.
      Tómalo como un experimento, no como una señal para operar.
    </p>
  );
}

/** El comité: la predicción que junta a los tres modelos. */
export function TarjetaComite({ comite, velas }: { comite: ModeloIA; velas: string }) {
  return (
    <Tarjeta titulo="Lo que cree el comité" destacada>
      <div className="grid gap-5 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-2">
          <ArcoProbabilidad probabilidad={comite.probabilidad} nombre="el comité" />
          <p className="text-center text-sm text-texto-secundario">Para la próxima vela de {velas}.</p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-texto">{comite.explicacion.resumen}</p>
          <ul className="flex flex-col gap-1 text-sm text-texto-secundario">
            {comite.explicacion.pasos.map((p) => (
              <li key={p} className="flex gap-2">
                <span aria-hidden className="text-violeta">
                  ✦
                </span>
                {p}
              </li>
            ))}
          </ul>
          <Veredicto modelo={comite} />
        </div>
      </div>
    </Tarjeta>
  );
}
