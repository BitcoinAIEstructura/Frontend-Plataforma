/**
 * Iconos de línea de las secciones (24 × 24, trazo de 1,75 con el color del texto).
 * Hechos para Nexabit: se ven igual en todos los sistemas, a diferencia de los
 * símbolos de texto (⚙, ⛨…), que algunos teléfonos dibujan como emoji.
 */
import type { ReactNode } from "react";

const TRAZOS: Record<string, ReactNode> = {
  panel: (
    <>
      <rect x="3.5" y="3.5" width="7" height="8" rx="1.8" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.8" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.8" />
      <rect x="3.5" y="14.5" width="7" height="6" rx="1.8" />
    </>
  ),
  mercado: (
    <>
      <path d="M6 4v3M6 15v5M12 3v4M12 13v4M18 7v3M18 17v3" />
      <rect x="4" y="7" width="4" height="8" rx="1" />
      <rect x="10" y="7" width="4" height="6" rx="1" />
      <rect x="16" y="10" width="4" height="7" rx="1" />
    </>
  ),
  ordenes: <path d="M7 20V5M3.5 8.5 7 5l3.5 3.5M17 4v15M13.5 15.5 17 19l3.5-3.5" />,
  cartera: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17a1 1 0 0 1 1 1v2" />
      <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
      <path d="M20.5 11.5h-4a2 2 0 0 0 0 4h4" />
      <circle cx="16.5" cy="13.5" r="0.6" fill="currentColor" />
    </>
  ),
  bot: (
    <>
      <rect x="4.5" y="8" width="15" height="11" rx="3" />
      <path d="M12 8V4.5M9.5 4.5h5M2.5 12.5v2.5M21.5 12.5v2.5" />
      <circle cx="9.25" cy="13" r="1.1" fill="currentColor" />
      <circle cx="14.75" cy="13" r="1.1" fill="currentColor" />
      <path d="M9.5 16.3h5" />
    </>
  ),
  liga: (
    <>
      <path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0V4Z" />
      <path d="M7.5 6H4.5a3 3 0 0 0 3 4M16.5 6h3a3 3 0 0 1-3 4M12 13.5V17M8.5 20h7M9.5 17h5" />
    </>
  ),
  ia: (
    <>
      <path d="M10 3.5l1.6 4.4 4.4 1.6-4.4 1.6L10 15.5l-1.6-4.4L4 9.5l4.4-1.6L10 3.5Z" />
      <path d="M18 13.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
    </>
  ),
  "como-funciona": (
    <>
      <circle cx="12" cy="5" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="12" cy="12" r="1.6" />
      <path d="M12 7v3.4M10.7 13.2 7.4 16.6M13.3 13.2l3.3 3.4M8 18h8" />
    </>
  ),
  seguridad: (
    <>
      <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.6-7 9-4.1-1.4-7-4.7-7-9V6l7-2.5Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  mas: <path d="M4.5 7h15M4.5 12h15M4.5 17h15" />,
  expandir: <path d="m9.5 6 6 6-6 6" />,
  contraer: <path d="m14.5 6-6 6 6 6" />,
};

/** Un icono por nombre; si no existe, un punto (para secciones futuras sin icono propio). */
export function Icono({
  nombre,
  tamano = 22,
  className = "",
}: {
  nombre: string;
  tamano?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {TRAZOS[nombre] ?? <circle cx="12" cy="12" r="2.5" fill="currentColor" />}
    </svg>
  );
}
