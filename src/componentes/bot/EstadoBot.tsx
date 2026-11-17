"use client";

import { ListaEventos } from "@/componentes/cartera/HistorialEventos";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { Decision } from "@/lib/api/mercado";
import type { DecisionPiloto, EstadoBot as Estado, EventoSimulacion } from "@/lib/api/simulacion";
import { haceCuanto, usdt } from "@/lib/formato";

import { TrabajoBot } from "./TrabajoBot";

const SENAL: Record<Decision["senal"], { texto: string; clase: string }> = {
  COMPRAR: { texto: "▲ Comprar", clase: "text-sube" },
  VENDER: { texto: "▼ Vender", clase: "text-baja" },
  MANTENER: { texto: "● Mantener", clase: "text-texto" },
};

/** Eventos que vienen del bot (el resto del historial son órdenes). */
const TIPOS_BOT = new Set([
  "DECISION_BOT",
  "STOP_LOSS",
  "TAKE_PROFIT",
  "BOT_INICIADO",
  "BOT_DETENIDO",
  "ERROR_BOT",
]);

const PORCENTAJE = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
const pct = (fraccion: number) => `${PORCENTAJE.format(fraccion * 100)} %`;

/** Lo que eligió la IA en su último ciclo: no son valores fijos, cambian con su confianza y el mercado. */
export function AjustesPiloto({ piloto }: { piloto: DecisionPiloto }) {
  const filas = [
    { nombre: "Probabilidad de que suba", valor: pct(piloto.probabilidad) },
    { nombre: "Riesgo que usó", valor: pct(piloto.riesgo) },
    { nombre: "Stop-loss elegido", valor: pct(piloto.stopLoss) },
    { nombre: "Take-profit elegido", valor: pct(piloto.takeProfit) },
    { nombre: "Volatilidad por vela", valor: pct(piloto.volatilidad) },
    { nombre: "Acierto del comité", valor: pct(piloto.exactitud) },
  ];
  return (
    <div className="mt-4 rounded-md border border-violeta/40 bg-violeta/5 p-4">
      <p className="text-xs font-medium tracking-wide text-violeta uppercase">Ajustes que eligió la IA</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {filas.map((f) => (
          <div key={f.nombre}>
            <dt className="text-xs text-texto-atenuado">{f.nombre}</dt>
            <dd className="cifra font-semibold text-texto">{f.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function eventosDelBot(eventos: readonly EventoSimulacion[], cuantos = 8): EventoSimulacion[] {
  return eventos.filter((e) => TIPOS_BOT.has(e.tipo)).slice(0, cuantos);
}

/** Si está en marcha (y que está trabajando), cuántas veces revisó, su última decisión y su último error. */
export function EstadoBot({ estado }: { estado: Estado }) {
  const d = estado.ultimaDecision;
  return (
    <Tarjeta
      titulo={estado.configuracion.modo === "ia" ? "Estado del piloto IA" : "Estado del bot"}
      extra={
        estado.activo ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-exito/40 px-2.5 py-0.5 text-xs font-medium text-exito">
            <span aria-hidden className="size-2 animate-pulse rounded-full bg-exito" />
            En marcha
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-borde-fuerte px-2.5 py-0.5 text-xs font-medium text-texto-atenuado">
            <span aria-hidden>■</span> Detenido
          </span>
        )
      }
    >
      <TrabajoBot estado={estado} />
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-texto-atenuado">Veces que revisó el mercado</dt>
          <dd className="cifra text-lg font-semibold text-texto">{estado.ciclos}</dd>
        </div>
        <div>
          <dt className="text-texto-atenuado">Última revisión</dt>
          <dd className="text-lg font-semibold text-texto">
            {estado.ultimoCiclo ? haceCuanto(estado.ultimoCiclo) : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-md border border-borde p-4" aria-live="polite">
        <p className="text-xs font-medium tracking-wide text-texto-atenuado uppercase">Última decisión</p>
        {d ? (
          <>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
              <span className={`text-xl font-semibold ${SENAL[d.senal].clase}`}>{SENAL[d.senal].texto}</span>
              <span className="cifra text-sm text-texto-secundario">
                {Math.round(d.confianza * 100)} % de confianza · a {usdt(d.precio)} USDT
              </span>
            </p>
            <p className="mt-2 text-sm text-texto-secundario">{d.motivo}</p>
          </>
        ) : (
          <p className="mt-1 text-sm text-texto-secundario">
            Aún no ha decidido nada. Al encenderlo, revisa el mercado enseguida y aquí verás qué decidió.
          </p>
        )}
      </div>

      {estado.configuracion.modo === "ia" && estado.piloto && <AjustesPiloto piloto={estado.piloto} />}

      {estado.ultimoError && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
        >
          ⚠ La última revisión falló: {estado.ultimoError}. El bot lo vuelve a intentar en la siguiente.
        </p>
      )}
    </Tarjeta>
  );
}

export function ActividadBot({ eventos }: { eventos: readonly EventoSimulacion[] }) {
  return (
    <Tarjeta titulo="Lo que ha hecho el bot" desplazable>
      <ListaEventos eventos={eventosDelBot(eventos)} />
    </Tarjeta>
  );
}
