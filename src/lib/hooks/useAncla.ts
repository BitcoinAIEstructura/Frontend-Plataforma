"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Enlaces como /mercado#alertas: la página privada primero muestra «Abriendo tu cuenta…»
 * y las secciones aparecen cuando llegan los datos, así que el navegador no encuentra el
 * ancla al cargar. Aquí se espera a que aparezca (hasta `limiteMs`) y se baja hasta ella.
 */
export function useDesplazarAlAncla(listo: boolean, limiteMs = 5000): void {
  const ruta = usePathname();
  useEffect(() => {
    if (!listo) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || id === "contenido") return;
    const inicio = Date.now();
    const buscar = setInterval(() => {
      const destino = document.getElementById(id);
      if (destino) {
        clearInterval(buscar);
        destino.scrollIntoView({ block: "start" });
      } else if (Date.now() - inicio > limiteMs) {
        clearInterval(buscar);
      }
    }, 100);
    return () => clearInterval(buscar);
  }, [listo, ruta, limiteMs]);
}
