"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { PaletaBusqueda } from "@/componentes/busqueda/PaletaBusqueda";
import { LanzadorChat } from "@/componentes/chat/LanzadorChat";
import { Logo, SimboloNexabit } from "@/componentes/marca/Logo";
import { AvisoSimulacion } from "@/componentes/ui/AvisoSimulacion";
import { Boton } from "@/componentes/ui/Boton";
import { InterruptorTema } from "@/componentes/ui/InterruptorTema";
import { useUsuarioActual } from "@/lib/hooks/useSesion";

import { AvisoInactividad } from "./AvisoInactividad";
import { MenuUsuario } from "./MenuUsuario";
import { BarraInferior, BarraLateral } from "./Navegacion";
import { seccionActiva } from "./secciones";

function Cargando() {
  return (
    <div role="status" className="fondo-aurora grid min-h-dvh place-items-center">
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

  useEffect(() => {
    if (sinSesion) router.replace(`/iniciar-sesion?siguiente=${encodeURIComponent(ruta)}`);
  }, [sinSesion, router, ruta]);

  if (error) {
    return (
      <div role="alert" className="fondo-aurora grid min-h-dvh place-items-center px-4 text-center">
        <div className="vidrio flex max-w-md flex-col items-center gap-4 rounded-3xl p-8">
          <SimboloNexabit tamano={48} />
          <h1 className="text-xl font-semibold">No pudimos conectar con Nexabit</h1>
          <p className="text-texto-secundario">{error.message}</p>
          <Boton onClick={() => window.location.reload()}>Reintentar</Boton>
        </div>
      </div>
    );
  }
  if (cargando || !usuario) return <Cargando />;

  const titulo = seccionActiva(ruta)?.titulo ?? "Nexabit";
  return (
    <div className="fondo-aurora min-h-dvh">
      {/* Lo primero que alcanza el teclado: saltar la navegación e ir directo al contenido. */}
      <a
        href="#contenido"
        className="sr-only z-50 rounded-xl bg-oro px-4 py-2 font-semibold text-sobre-oro focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex max-w-[96rem] gap-6 p-3 sm:p-4">
        <BarraLateral />
        <div className="flex min-w-0 flex-1 flex-col gap-5 pb-24 lg:pb-4">
          <header className="flex items-center justify-between gap-3 px-1 pt-1">
            <div className="flex items-center gap-3">
              <span className="lg:hidden">
                <Logo conNombre={false} tamano={32} />
              </span>
              <h1 className="text-xl font-semibold sm:text-2xl">{titulo}</h1>
            </div>
            <div className="flex items-center gap-1">
              <PaletaBusqueda />
              <InterruptorTema />
              <MenuUsuario usuario={usuario} />
            </div>
          </header>
          <main id="contenido" tabIndex={-1} className="flex flex-col gap-5 focus:outline-none">
            {children}
          </main>
          <AvisoSimulacion className="px-1" />
        </div>
      </div>
      <BarraInferior />
      <LanzadorChat nombre={usuario.nombre} />
      <AvisoInactividad />
    </div>
  );
}
