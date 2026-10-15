"use client";

import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { leerMonto } from "@/componentes/ordenes/calculos";
import { Boton } from "@/componentes/ui/Boton";
import { Campo } from "@/componentes/ui/Campo";
import { CampoDinero } from "@/componentes/ui/CampoDinero";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { calcularSiHubiera, type SiHubiera as Resultado } from "@/lib/api/liga";
import { btc, conSigno, sentido, usdt, variacion } from "@/lib/formato";

/** "15 de enero de 2024" (las velas diarias abren a medianoche UTC). */
function dia(milisegundos: number): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(milisegundos);
}

function ResultadoSiHubiera({ r }: { r: Resultado }) {
  const s = sentido(r.ganancia);
  const color = s === "sube" ? "text-sube" : s === "baja" ? "text-baja" : "text-texto";
  return (
    <div aria-live="polite" className="flex flex-col gap-4">
      <div className="rounded-2xl border border-oro/30 bg-oro/5 p-5">
        <p className="text-sm text-texto-secundario">
          Con {usdt(r.monto)} USDT el {dia(r.vela.tiempoApertura)} habrías comprado{" "}
          <span className="cifra text-texto">{btc(r.btc)} BTC</span> a {usdt(r.vela.apertura)}. Hoy valdrían:
        </p>
        <p className="cifra mt-1 text-3xl font-semibold text-texto">{usdt(r.valorHoy)} USDT</p>
        <p className={`cifra text-lg font-semibold ${color}`}>
          {conSigno(r.ganancia)} ({variacion(r.rentabilidad)})
        </p>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-borde p-3">
          <dt className="text-texto-atenuado">Mejor momento para haber vendido</dt>
          <dd className="cifra text-texto">
            <span className="text-sube">▲</span> {usdt(r.mejor.precio)} el {dia(r.mejor.tiempo)}
          </dd>
        </div>
        <div className="rounded-xl border border-borde p-3">
          <dt className="text-texto-atenuado">Peor momento</dt>
          <dd className="cifra text-texto">
            <span className="text-baja">▼</span> {usdt(r.peor.precio)} el {dia(r.peor.tiempo)}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-texto-atenuado">
        Un árbol AVL indexó {r.velasIndexadas} velas diarias en solo {r.alturaArbol} niveles: encontró ese día
        en unos {r.alturaArbol} pasos y luego recorrió las {r.velasRecorridas} velas siguientes. Es un cálculo
        con datos reales del pasado; no dice nada del futuro.
      </p>
    </div>
  );
}

/** ¿Y si hubiera invertido? Cuánto valdría hoy una compra hecha en una fecha del pasado. */
export function SiHubiera() {
  const [fecha, setFecha] = useState("2025-01-01");
  const [texto, setTexto] = useState("1000");
  const [error, setError] = useState<string | null>(null);
  const calculo = useMutation({
    mutationFn: ({ f, m }: { f: string; m: number }) => calcularSiHubiera(f, m),
  });

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const monto = leerMonto(texto);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return setError("Elige una fecha.");
    if (!(monto > 0 && monto <= 1_000_000)) return setError("El monto va de 1 a 1.000.000 USDT.");
    setError(null);
    calculo.mutate({ f: fecha, m: monto });
  };

  return (
    <Tarjeta id="si-hubiera" titulo="¿Y si hubiera invertido?" className="scroll-mt-24">
      <form onSubmit={enviar} noValidate className="mb-5 flex flex-wrap items-start gap-3">
        <Campo
          etiqueta="Día de la compra"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="[&_input]:min-h-12"
        />
        <CampoDinero
          etiqueta="¿Cuánto habrías invertido?"
          valor={texto}
          alCambiar={setTexto}
          lectura={(m) => `= ${usdt(m)} USDT`}
          className="w-full sm:w-60"
        />
        <Boton type="submit" cargando={calculo.isPending} className="min-h-12 sm:mt-[1.625rem]">
          Calcular
        </Boton>
      </form>
      {(error ?? calculo.error) && (
        <p role="alert" className="mb-4 text-sm font-medium text-error">
          {error ?? calculo.error?.message}
        </p>
      )}
      {calculo.data && !error ? (
        <ResultadoSiHubiera r={calculo.data} />
      ) : (
        !calculo.isPending && (
          <p className="text-sm text-texto-secundario">
            Elige un día del pasado (hasta unos 1000 días atrás) y mira qué habría pasado con datos reales.
          </p>
        )
      )}
    </Tarjeta>
  );
}
