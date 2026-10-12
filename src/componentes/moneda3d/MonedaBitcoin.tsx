"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { decidirCalidad, leerDispositivo, type Calidad } from "./calidad";
import { MonedaEstatica } from "./MonedaEstatica";

// Three.js pesa: se descarga aparte y solo en el navegador; mientras tanto se ve la moneda fija.
const EscenaMoneda = dynamic(() => import("./EscenaMoneda"), {
  ssr: false,
  loading: () => <MonedaEstatica className="size-full" />,
});

interface PropsMoneda {
  className?: string;
  /** Para pruebas o vistas previas: fuerza una calidad en vez de detectarla. */
  calidadForzada?: Calidad;
}

/**
 * La moneda de la pantalla de inicio de sesión. Elige según el dispositivo:
 * escena 3D completa, liviana, o la imagen fija si no hay WebGL o se pidió menos movimiento.
 */
export function MonedaBitcoin({ className = "", calidadForzada }: PropsMoneda) {
  const [calidad, setCalidad] = useState<Calidad | null>(calidadForzada ?? null);

  useEffect(() => {
    if (calidadForzada) return;
    const consulta = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const actualizar = () => setCalidad(decidirCalidad(leerDispositivo()));
    actualizar();
    consulta?.addEventListener("change", actualizar);
    return () => consulta?.removeEventListener("change", actualizar);
  }, [calidadForzada]);

  return (
    <div role="img" aria-label="Moneda de Bitcoin dorada girando" className={`relative ${className}`}>
      {calidad === null || calidad === "estatica" ? (
        <MonedaEstatica className="size-full" />
      ) : (
        <EscenaMoneda calidad={calidad} />
      )}
    </div>
  );
}
