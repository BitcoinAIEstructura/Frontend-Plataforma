"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { LanzadorChat } from "@/componentes/chat/LanzadorChat";
import { SimboloNexabit } from "@/componentes/marca/Logo";
import { AvisoSimulacion } from "@/componentes/ui/AvisoSimulacion";
import { Boton } from "@/componentes/ui/Boton";
import { useDesplazarAlAncla } from "@/lib/hooks/useAncla";
import { useUsuarioActual } from "@/lib/hooks/useSesion";

import { AvisoInactividad } from "./AvisoInactividad";
import { BarraSuperior } from "./BarraSuperior";
import { BarraInferior, BarraLateral } from "./Navegacion";
import { seccionActiva } from "./secciones";

function Cargando() {
  return (
    <div role="status" className="grid min-h-dvh place-items-center bg-fondo">
      <div className="flex flex-col items-center gap-4">
        <SimboloNexabit tamano={64} className="animate-pulse" />
        <p className="text-sm text-texto-secundario">Abriendo tu cuenta…</p>
      </div>
    </div>
  );
}

/**
 * Marco de todas las páginas privadas: pregunta al backend quién está conectado;
 * si la sesión venció, manda a iniciar sesión (recordando la página).
 */
export function MarcoApp({ children }: { children: ReactNode }) {
  const router = useRouter();
  const ruta = usePathname();
  const { usuario, cargando, sinSesion, error } = useUsuarioActual();
  useDesplazarAlAncla(Boolean(usuario));

  useEffect(() => {
    if (sinSesion) router.replace(`/iniciar-sesion?siguiente=${encodeURIComponent(ruta)}`);
  }, [sinSesion, router, ruta]);

  if (error) {
    return (
      <div role="alert" className="grid min-h-dvh place-items-center bg-fondo px-4 text-center">
        <div className="vidrio flex max-w-md flex-col items-center gap-4 rounded-lg p-8">
          <SimboloNexabit tamano={48} />
          <h1 className="text-xl font-semibold">No pudimos conectar con Nexabit</h1>
          <p className="text-texto-secundario">{error.message}</p>
          <Boton onClick={() => window.location.reload()}>Reintentar</Boton>
        </div>
      </div>
    );
  }
  if (cargando || !usuario) return <Cargando />;

  const seccion = seccionActiva(ruta);
  const titulo = seccion?.titulo ?? "Nexabit";
  return (
    // "app-terminal": dentro de la app los títulos van en la letra de texto (la serif queda para la portada).
    <div className="app-terminal min-h-dvh bg-fondo lg:pl-[4.75rem]">
      {/* Lo primero que alcanza el teclado: saltar la navegación e ir directo al contenido. */}
      <a
        href="#contenido"
        className="sr-only z-50 rounded-md bg-oro px-4 py-2 font-semibold text-sobre-oro focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <BarraLateral />
      <BarraSuperior titulo={titulo} usuario={usuario} />
      <div className="flex w-full flex-col gap-4 px-3 pt-4 pb-40 sm:px-4 lg:px-6 lg:pb-8">
        <main id="contenido" tabIndex={-1} className="flex flex-col gap-4 focus:outline-none">
          {children}
        </main>
        <AvisoSimulacion className="border-t border-borde pt-3" />
      </div>
      <BarraInferior />
      <LanzadorChat nombre={usuario.nombre} />
      <AvisoInactividad />
    </div>
  );
}
