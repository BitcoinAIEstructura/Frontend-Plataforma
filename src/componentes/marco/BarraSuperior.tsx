"use client";

import type { ReactNode } from "react";

import { PaletaBusqueda } from "@/componentes/busqueda/PaletaBusqueda";
import { BotonChat } from "@/componentes/chat/LanzadorChat";
import { SimboloNexabit } from "@/componentes/marca/Logo";
import { InterruptorTema } from "@/componentes/ui/InterruptorTema";
import type { Usuario } from "@/lib/api/cuentas";
import { sentido, usdt, variacion } from "@/lib/formato";
import { useBot, useCartera, usePrecio, useVelas } from "@/lib/hooks/useDatos";
import { useEstadoConexion } from "@/lib/tiempoReal";

import { MenuUsuario } from "./MenuUsuario";

const COLOR: Record<ReturnType<typeof sentido>, string> = {
  sube: "text-sube",
  baja: "text-baja",
  igual: "text-texto-atenuado",
};

/** Un dato de la barra: rótulo pequeño, cifra y, si hay, la variación con ▲▼. */
function Dato({
  etiqueta,
  valor,
  cambio,
  className = "",
  antes,
}: {
  etiqueta: string;
  valor: string;
  cambio?: number | null;
  className?: string;
  antes?: ReactNode;
}) {
  return (
    <div className={`flex items-baseline gap-1.5 whitespace-nowrap sm:gap-2 ${className}`}>
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-texto-atenuado uppercase">
        {antes}
        {/* En el teléfono el rótulo se lee solo con lector de pantalla: el espacio es para la cifra. */}
        <span className="sr-only sm:not-sr-only">{etiqueta}</span>
      </dt>
      <dd className="cifra text-[13px] font-semibold text-texto sm:text-sm">{valor}</dd>
      {cambio !== undefined && cambio !== null && (
        <dd className={`cifra text-[11px] font-medium sm:text-xs ${COLOR[sentido(cambio)]}`}>
          {variacion(cambio)}
        </dd>
      )}
    </div>
  );
}

/** Cotizaciones de la barra: precio en vivo (siempre), cartera y bot (cuando hay espacio). */
function Cotizaciones() {
  const precio = usePrecio().data?.precio;
  // Variación de 24 h: la apertura de la primera de 24 velas de 1 h (la misma consulta del panel).
  const apertura = useVelas("1h", 24).data?.[0]?.apertura;
  const cartera = useCartera().data;
  const bot = useBot().data;
  const enVivo = useEstadoConexion() === "en-vivo";
  const cambio = precio !== undefined && apertura ? (precio - apertura) / apertura : null;

  return (
    <dl aria-label="Cotizaciones" className="flex min-w-0 items-center gap-5">
      <Dato
        etiqueta="BTC/USDT"
        valor={precio !== undefined ? usdt(precio) : "—"}
        cambio={cambio}
        antes={
          <span
            aria-hidden
            title={enVivo ? "En vivo" : "Conectando"}
            className={`size-1.5 rounded-full ${enVivo ? "bg-exito" : "bg-bitcoin"}`}
          />
        }
      />
      {cartera && (
        <Dato
          etiqueta="Cartera"
          valor={usdt(cartera.valorTotal)}
          cambio={cartera.rentabilidad}
          className="hidden md:flex"
        />
      )}
      {bot && (
        <div className="hidden items-baseline gap-2 whitespace-nowrap xl:flex">
          <dt className="text-[11px] font-semibold tracking-wider text-texto-atenuado uppercase">Bot</dt>
          <dd className="flex items-center gap-1.5 text-sm font-medium text-texto">
            <span
              aria-hidden
              className={`size-1.5 rounded-full ${bot.activo ? "bg-exito" : "bg-borde-fuerte"}`}
            />
            {bot.activo ? "Encendido" : "Apagado"}
            {bot.activo && (
              <span className="text-texto-atenuado">
                · {bot.configuracion.modo === "ia" ? "piloto IA" : "reglas"}
              </span>
            )}
          </dd>
        </div>
      )}
    </dl>
  );
}

/**
 * Barra superior fija, como la de una plataforma de trading: la sección, las cotizaciones
 * en vivo y las herramientas (buscar, asistente, tema y la cuenta). En el teléfono solo
 * deja el precio con su ▲▼.
 */
export function BarraSuperior({ titulo, usuario }: { titulo: string; usuario: Usuario }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-borde bg-superficie px-3 sm:gap-3 sm:px-4 lg:px-6">
      <span className="lg:hidden">
        <SimboloNexabit tamano={26} />
      </span>
      <h1 className="sr-only shrink-0 text-[15px] font-semibold text-texto sm:not-sr-only">{titulo}</h1>
      <span aria-hidden className="hidden h-5 w-px shrink-0 bg-borde sm:block" />
      <Cotizaciones />
      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <PaletaBusqueda />
        <BotonChat />
        <InterruptorTema />
        <MenuUsuario usuario={usuario} />
      </div>
    </header>
  );
}
