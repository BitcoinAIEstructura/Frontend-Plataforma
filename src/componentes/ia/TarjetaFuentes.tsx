import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { FuentesIA, PrediccionIA } from "@/lib/api/ia";
import { haceCuanto } from "@/lib/formato";

import { porcentaje } from "./formato";

/**
 * Otras fuentes además del precio: lo que dicen ahora (el ánimo del mercado, los futuros y
 * las opciones) y si los modelos acertaron más al aprender también de ellas. Todos los
 * textos vienen del backend.
 */
export function TarjetaFuentes({
  fuentes,
  externos,
}: {
  fuentes: FuentesIA | undefined;
  externos: PrediccionIA["fuentesExternas"];
}) {
  const c = externos.comparacion;
  return (
    <Tarjeta titulo="Lo que dicen otras fuentes">
      <p className="mb-4 text-sm leading-relaxed text-texto-secundario">
        Datos públicos de fuera de Nexabit. Los modelos también aprenden de ellos, no solo del precio.
      </p>

      {fuentes === undefined ? (
        <p role="status" className="text-sm text-texto-atenuado">
          Consultando las fuentes…
        </p>
      ) : fuentes.lecturas.length === 0 ? (
        <p className="text-sm text-texto-atenuado">Ahora no hay datos de las fuentes externas.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2" aria-label="Fuentes externas ahora">
          {fuentes.lecturas.map((l) => (
            <li key={l.id} className="flex flex-col gap-1 rounded-md border border-borde p-4">
              <p className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-texto">{l.nombre}</span>
                <span className="text-xs text-texto-atenuado">{l.fuente}</span>
              </p>
              <p className="cifra text-lg font-semibold text-oro">{l.valorTexto}</p>
              <p className="text-sm leading-relaxed text-texto-secundario">{l.explicacion}</p>
            </li>
          ))}
        </ul>
      )}
      {fuentes && fuentes.errores.length > 0 && (
        <p className="mt-2 text-xs text-texto-atenuado">
          Sin respuesta ahora: {fuentes.errores.map((e) => e.id).join(", ")}.
        </p>
      )}

      <div className="mt-5 rounded-md bg-superficie-alta/60 p-4">
        <p className="text-sm font-semibold text-texto">¿Ayudan a acertar?</p>
        {c ? (
          <>
            <dl className="my-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-borde p-2">
                <dt className="text-xs text-texto-atenuado">Solo con el precio</dt>
                <dd className="cifra font-semibold text-texto-secundario">
                  {porcentaje(c.sinExternos.exactitud)}
                </dd>
              </div>
              <div className="rounded-lg border border-oro/40 p-2">
                <dt className="text-xs text-texto-atenuado">Con las fuentes</dt>
                <dd className="cifra font-semibold text-texto">{porcentaje(c.conExternos.exactitud)}</dd>
              </div>
            </dl>
            <p className="text-sm leading-relaxed text-texto-secundario">{c.conclusion}</p>
          </>
        ) : (
          <p className="mt-1 text-sm text-texto-secundario">
            Esta vez los modelos aprendieron solo del precio: ninguna fuente externa pudo entrar (abajo dice
            por qué).
          </p>
        )}
        <p className="mt-2 text-xs text-texto-atenuado">
          {externos.usadas.length > 0 && (
            <>Aprendieron de: {externos.usadas.map((f) => f.nombre).join(", ")}. </>
          )}
          {externos.omitidas.map((f) => `${f.nombre}: ${f.motivo.toLowerCase()}.`).join(" ")}
        </p>
      </div>
      {fuentes?.actualizadoEn && (
        <p className="mt-2 text-xs text-texto-atenuado">
          Datos de las fuentes de {haceCuanto(fuentes.actualizadoEn)}.
        </p>
      )}
    </Tarjeta>
  );
}
