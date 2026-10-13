"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Boton } from "@/componentes/ui/Boton";
import { useCerrarSesion } from "@/lib/hooks/useSesion";

/** Sin tocar nada durante 25 minutos aparece el aviso; si nadie responde en 60 s, se cierra la sesión. */
export const INACTIVO_MS = 25 * 60_000;
export const SEGUNDOS_AVISO = 60;

const EVENTOS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

interface Props {
  inactivoMs?: number;
  segundosAviso?: number;
}

/**
 * Cierra la sesión si la pestaña queda abierta sin usarse (por ejemplo, en un computador
 * compartido). El backend no lo nota solo: la página sigue pidiendo datos en vivo y eso
 * cuenta como actividad. Por eso se mira si la persona toca algo.
 */
export function AvisoInactividad({ inactivoMs = INACTIVO_MS, segundosAviso = SEGUNDOS_AVISO }: Props) {
  const router = useRouter();
  const cerrar = useCerrarSesion();
  const ultima = useRef(0);
  const [restante, setRestante] = useState<number | null>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const avisando = restante !== null;

  // Cualquier toque o tecla cuenta como actividad (mientras no esté el aviso).
  useEffect(() => {
    if (avisando) return;
    ultima.current = Date.now();
    const anotar = () => {
      ultima.current = Date.now();
    };
    for (const e of EVENTOS) window.addEventListener(e, anotar, { passive: true });
    const revisar = setInterval(() => {
      if (Date.now() - ultima.current >= inactivoMs) setRestante(segundosAviso);
    }, 1000);
    return () => {
      for (const e of EVENTOS) window.removeEventListener(e, anotar);
      clearInterval(revisar);
    };
  }, [avisando, inactivoMs, segundosAviso]);

  // La cuenta regresiva del aviso; al llegar a 0 se cierra la sesión.
  useEffect(() => {
    if (!avisando) return;
    boton.current?.focus();
    const cuenta = setInterval(() => setRestante((r) => (r === null ? null : r - 1)), 1000);
    return () => clearInterval(cuenta);
  }, [avisando]);

  useEffect(() => {
    if (restante !== null && restante <= 0) {
      void cerrar
        .mutateAsync()
        .catch(() => undefined)
        .then(() => router.replace("/iniciar-sesion?motivo=inactividad"));
    }
    // Solo cuando la cuenta llega a cero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restante]);

  if (!avisando) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-fondo/80 px-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="inactividad-titulo"
        aria-describedby="inactividad-texto"
        className="vidrio borde-oro flex max-w-sm flex-col gap-4 rounded-3xl p-6 text-center"
      >
        <h2 id="inactividad-titulo" className="text-xl font-semibold">
          ¿Sigues ahí?
        </h2>
        <p id="inactividad-texto" className="text-texto-secundario">
          Por tu seguridad, la sesión se cerrará en{" "}
          <span className="cifra font-semibold text-texto">{Math.max(0, restante)} s</span> si no respondes.
        </p>
        <Boton ref={boton} onClick={() => setRestante(null)} anchoCompleto>
          Sí, sigo aquí
        </Boton>
      </div>
    </div>
  );
}
