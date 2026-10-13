import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { ModeloIA, PrediccionIA } from "@/lib/api/ia";

import { porcentaje } from "./formato";

const ANCHO = 520;
const IZQUIERDA = 150;
const DERECHA = 64;
const FILA = 34;

/**
 * Exactitud de cada modelo como puntos sobre una escala, con la base como línea.
 * Es una gráfica de puntos (no de barras) porque las diferencias son de pocos
 * puntos: unas barras desde cero las esconderían, y cortarlas engañaría.
 */
export function GraficaExactitud({ modelos, comite }: { modelos: readonly ModeloIA[]; comite: ModeloIA }) {
  const todos = [comite, ...modelos];
  const base = comite.metricas.base;
  const valores = [...todos.map((m) => m.metricas.exactitud), base];
  const min = Math.floor(Math.min(...valores) * 20) / 20 - 0.05;
  const max = Math.ceil(Math.max(...valores) * 20) / 20 + 0.05;
  const x = (v: number) => IZQUIERDA + ((v - min) / (max - min)) * (ANCHO - IZQUIERDA - DERECHA);
  const alto = todos.length * FILA + 40;
  const marcas = Array.from({ length: Math.round((max - min) / 0.05) + 1 }, (_, i) => min + i * 0.05);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm text-texto-secundario">
        Exactitud en las {comite.metricas.muestras} velas de prueba. La línea es la base: decir siempre lo que
        más pasó ({porcentaje(base)}).
      </figcaption>
      {/* En el teléfono no se encoge por debajo de 460 px: se desliza, así el texto se sigue leyendo. */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${ANCHO} ${alto}`}
          className="w-full min-w-[460px]"
          role="img"
          aria-label={`Exactitud: ${todos.map((m) => `${m.nombre} ${porcentaje(m.metricas.exactitud)}`).join(", ")}; base ${porcentaje(base)}`}
        >
          {marcas.map((v) => (
            <g key={v}>
              <line x1={x(v)} x2={x(v)} y1={8} y2={alto - 24} stroke="var(--grafica-rejilla)" />
              <text x={x(v)} y={alto - 8} textAnchor="middle" fontSize={11} fill="var(--texto-atenuado)">
                {porcentaje(v)}
              </text>
            </g>
          ))}
          <line
            x1={x(base)}
            x2={x(base)}
            y1={4}
            y2={alto - 24}
            stroke="var(--grafica-neutra)"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          {todos.map((m, i) => {
            const y = 22 + i * FILA;
            const gana = m.metricas.ventaja > 0;
            return (
              <g key={m.nombre}>
                <text
                  x={IZQUIERDA - 12}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={13}
                  fill="var(--texto)"
                >
                  {m.nombre}
                </text>
                <line
                  x1={x(base)}
                  x2={x(m.metricas.exactitud)}
                  y1={y}
                  y2={y}
                  stroke="var(--borde-fuerte)"
                  strokeWidth={2}
                />
                <circle
                  cx={x(m.metricas.exactitud)}
                  cy={y}
                  r={7}
                  fill={gana ? "var(--grafica-sube)" : "var(--superficie)"}
                  stroke={gana ? "var(--grafica-sube)" : "var(--grafica-baja)"}
                  strokeWidth={2.5}
                />
                <text
                  x={ANCHO - DERECHA + 8}
                  y={y}
                  dominantBaseline="central"
                  fontSize={12}
                  fill="var(--texto-secundario)"
                >
                  {porcentaje(m.metricas.exactitud)} {gana ? "▲" : "▼"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-texto-atenuado">
        Punto relleno ▲: le ganó a la base. Punto hueco ▼: no le ganó.
      </p>
    </figure>
  );
}

/** Cada vela de prueba: ¿acertó el comité? Cuadro relleno con ✓ si sí, hueco con ✕ si no. */
export function HistorialPrueba({ prueba }: { prueba: PrediccionIA["prueba"] }) {
  const aciertos = prueba.filter((p) => p.probabilidad >= 0.5 === p.subio).length;
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm text-texto-secundario">
        Lo que dijo el comité en cada vela de prueba, de la más vieja a la más reciente: acertó{" "}
        <span className="cifra text-texto">
          {aciertos} de {prueba.length}
        </span>
        .
      </figcaption>
      <ol
        className="flex flex-wrap gap-[3px]"
        role="img"
        aria-label={`El comité acertó ${aciertos} de ${prueba.length} velas de prueba`}
      >
        {prueba.map((p) => {
          const acerto = p.probabilidad >= 0.5 === p.subio;
          return (
            <li
              key={p.tiempo}
              title={`${acerto ? "Acertó" : "Falló"}: dijo ${porcentaje(p.probabilidad)} de que suba y ${p.subio ? "subió" : "no subió"}`}
              className={`grid size-3.5 place-items-center rounded-[3px] text-[8px] leading-none ${
                acerto ? "bg-grafica-sube text-fondo" : "border border-grafica-baja text-grafica-baja"
              }`}
            >
              {acerto ? "✓" : "✕"}
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

export function TarjetaEvaluacion({ prediccion }: { prediccion: PrediccionIA }) {
  return (
    <Tarjeta titulo="¿Cómo le fue con datos que no vio?">
      <p className="mb-4 text-sm text-texto-secundario">
        Los modelos aprendieron con las {prediccion.muestrasEntrenamiento} velas más viejas y se midieron con
        las {prediccion.muestrasPrueba} más recientes, sin mezclarlas: así se simula usarlos de verdad, solo
        con el pasado.
      </p>
      <div className="flex flex-col gap-6">
        <GraficaExactitud modelos={prediccion.modelos} comite={prediccion.comite} />
        <HistorialPrueba prueba={prediccion.prueba} />
      </div>
    </Tarjeta>
  );
}
