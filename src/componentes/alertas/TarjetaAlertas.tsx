"use client";

import { useState, type FormEvent } from "react";

import { leerMonto } from "@/componentes/ordenes/calculos";
import { Boton } from "@/componentes/ui/Boton";
import { Campo } from "@/componentes/ui/Campo";
import { Segmentado } from "@/componentes/ui/Segmentado";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import type { Alerta } from "@/lib/api/alertas";
import { haceCuanto, usdt } from "@/lib/formato";
import { useAccionesAlertas, useAlertas, usePrecio } from "@/lib/hooks/useDatos";

const TIPOS = [
  { valor: "SUBE_A" as const, etiqueta: "▲ Cuando suba a" },
  { valor: "BAJA_A" as const, etiqueta: "▼ Cuando baje a" },
];

const SUGERENCIAS: Record<Alerta["tipo"], number[]> = { SUBE_A: [0.02, 0.05], BAJA_A: [-0.02, -0.05] };

/** Lo que dice cada alerta en palabras. */
export function describirAlerta(a: Alerta): string {
  const verbo = a.tipo === "SUBE_A" ? "▲ Suba a" : "▼ Baje a";
  if (a.estado === "DISPARADA") return `${verbo} ${usdt(a.precio)} · se cumplió a ${usdt(a.precioDisparo)}`;
  return `${verbo} ${usdt(a.precio)}`;
}

/** Alertas de precio: avisan (aunque estés en otra página) cuando el BTC llega a un precio. */
export function TarjetaAlertas() {
  const [tipo, setTipo] = useState<Alerta["tipo"]>("SUBE_A");
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const precio = usePrecio();
  const alertas = useAlertas();
  const { crear, cancelar } = useAccionesAlertas();
  const actual = precio.data?.precio;

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const valor = leerMonto(texto);
    if (!(valor > 0)) return setError("Escribe un precio mayor que 0.");
    if (actual !== undefined && (tipo === "SUBE_A" ? valor <= actual : valor >= actual)) {
      return setError(
        tipo === "SUBE_A"
          ? `Debe estar por encima del precio de ahora (${usdt(actual)}).`
          : `Debe estar por debajo del precio de ahora (${usdt(actual)}).`,
      );
    }
    setError(null);
    crear.mutate({ tipo, precio: valor }, { onSuccess: () => setTexto("") });
  };

  const lista = alertas.data?.alertas ?? [];
  const activas = lista.filter((a) => a.estado === "ACTIVA");
  const cumplidas = lista.filter((a) => a.estado === "DISPARADA").slice(0, 5);

  return (
    <Tarjeta
      id="alertas"
      titulo="Alertas de precio"
      className="scroll-mt-24"
      extra={<span className="cifra text-sm text-texto-atenuado">{activas.length} de 20 activas</span>}
    >
      <p className="mb-4 text-sm text-texto-secundario">
        Te avisamos aquí mismo, en cualquier página, cuando el BTC llegue al precio que elijas.
      </p>
      <form onSubmit={enviar} noValidate className="flex flex-col gap-3">
        <Segmentado
          etiqueta="Tipo de alerta"
          opciones={TIPOS}
          valor={tipo}
          alCambiar={(t) => {
            setTipo(t);
            setError(null);
          }}
        />
        <div className="flex flex-wrap items-end gap-2">
          <Campo
            etiqueta="Precio (USDT)"
            inputMode="decimal"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={actual ? usdt(actual) : "0,00"}
            className="w-44"
            error={error ?? (crear.isError ? crear.error.message : null)}
          />
          <Boton type="submit" cargando={crear.isPending}>
            Crear alerta
          </Boton>
        </div>
        {actual !== undefined && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Precios sugeridos">
            {SUGERENCIAS[tipo].map((f) => {
              const sugerido = Math.round(actual * (1 + f));
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTexto(String(sugerido))}
                  className="rounded-full border border-borde px-3 py-1 text-xs text-texto-secundario hover:border-oro/50"
                >
                  {f > 0 ? "+" : "−"}
                  {Math.abs(f * 100)} % ({usdt(sugerido)})
                </button>
              );
            })}
          </div>
        )}
      </form>

      {activas.length > 0 && (
        <ul className="mt-5 flex flex-col divide-y divide-borde" aria-label="Alertas activas">
          {activas.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className={`cifra ${a.tipo === "SUBE_A" ? "text-sube" : "text-baja"}`}>
                {describirAlerta(a)}
              </span>
              <button
                type="button"
                onClick={() => cancelar.mutate(a.id)}
                className="rounded-lg px-2 py-1 text-texto-secundario hover:bg-error/10 hover:text-error"
                aria-label={`Cancelar la alerta: ${describirAlerta(a)}`}
              >
                Cancelar
              </button>
            </li>
          ))}
        </ul>
      )}
      {cumplidas.length > 0 && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium tracking-wide text-texto-atenuado uppercase">Cumplidas</p>
          <ul className="flex flex-col gap-1 text-sm text-texto-secundario" aria-label="Alertas cumplidas">
            {cumplidas.map((a) => (
              <li key={a.id} className="cifra">
                ✓ {describirAlerta(a)} · {haceCuanto(a.disparadaEn ?? a.creadaEn)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Tarjeta>
  );
}
