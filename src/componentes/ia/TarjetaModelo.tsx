import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { ModeloIA } from "@/lib/api/ia";

import { porcentaje, puntos } from "./formato";

/** Barras de los factores: con signo, a la derecha empuja a subir (▲) y a la izquierda a bajar (▼). */
export function Factores({ modelo }: { modelo: ModeloIA }) {
  // Qué miden los factores depende del modelo: lo dice el backend.
  const que = { titulo: modelo.descripcion.tituloFactores, conSigno: modelo.descripcion.factoresConSigno };
  const factores = modelo.explicacion.factores.slice(0, 5);
  const mayor = Math.max(1e-9, ...factores.map((f) => Math.abs(f.peso)));
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-xs font-medium tracking-wide text-texto-atenuado uppercase">
        {que.titulo}
      </figcaption>
      <ul className="flex flex-col gap-1.5">
        {factores.map((f) => {
          const ancho = `${(Math.abs(f.peso) / mayor) * 100}%`;
          const positivo = f.peso >= 0;
          return (
            <li key={f.nombre} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-xs">
              <span className="truncate text-texto-secundario">{f.nombre}</span>
              <span className="cifra text-right text-texto">
                {que.conSigno
                  ? `${positivo ? "▲" : "▼"} ${Math.abs(f.peso).toFixed(2).replace(".", ",")}`
                  : porcentaje(f.peso)}
              </span>
              <span className="col-span-2 h-1.5 rounded-full bg-superficie-alta">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: ancho,
                    background: !que.conSigno
                      ? "var(--grafica-serie-1)"
                      : positivo
                        ? "var(--grafica-sube)"
                        : "var(--grafica-baja)",
                  }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/** Un modelo: qué dice, cómo le fue en la prueba y por qué decide. */
export function TarjetaModelo({ modelo }: { modelo: ModeloIA }) {
  const sube = modelo.direccion === "SUBE";
  const m = modelo.metricas;
  return (
    <Tarjeta titulo={modelo.nombre} className="flex flex-col">
      <p className="mb-3 text-sm text-texto-secundario">{modelo.descripcion.idea}</p>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={`text-xl font-semibold ${sube ? "text-sube" : "text-baja"}`}>
          <span aria-hidden>{sube ? "▲" : "▼"}</span> {sube ? "Sube" : "Baja"}
          <span className="cifra ml-2 text-sm font-normal text-texto-secundario">
            {porcentaje(modelo.probabilidad)} de que suba
          </span>
        </p>
        {modelo.peso !== null && (
          <span className="cifra rounded-full border border-violeta/50 px-2 py-0.5 text-xs text-violeta">
            Peso en el comité: {porcentaje(modelo.peso)}
          </span>
        )}
      </div>

      <dl className="my-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-superficie-alta/60 p-2">
          <dt className="text-[11px] text-texto-atenuado">Acertó</dt>
          <dd className="cifra font-semibold text-texto">{porcentaje(m.exactitud)}</dd>
        </div>
        <div className="rounded-xl bg-superficie-alta/60 p-2">
          <dt className="text-[11px] text-texto-atenuado">Base</dt>
          <dd className="cifra font-semibold text-texto-secundario">{porcentaje(m.base)}</dd>
        </div>
        <div className="rounded-xl bg-superficie-alta/60 p-2">
          <dt className="text-[11px] text-texto-atenuado">Frente a la base</dt>
          <dd className={`cifra font-semibold ${m.ventaja > 0 ? "text-sube" : "text-baja"}`}>
            {puntos(m.ventaja)}
          </dd>
        </div>
      </dl>

      <p className="mb-3 text-sm text-texto">{modelo.explicacion.resumen}</p>
      <Factores modelo={modelo} />
      <details className="mt-3 rounded-xl border border-borde px-3 py-2 text-sm">
        <summary className="cursor-pointer font-medium text-oro">Paso a paso</summary>
        <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-texto-secundario">
          {modelo.explicacion.pasos.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </details>
    </Tarjeta>
  );
}
